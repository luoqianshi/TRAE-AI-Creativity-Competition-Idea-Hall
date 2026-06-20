chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    enabled: true,
    autoStart: false,
    version: '1.0.0',
  });
});

chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, { action: 'togglePanel' }).catch(() => {});
});

function extractAnswerFromText(text) {
  const s = String(text || '').trim();
  if (!s) return '';

  const quoted = s.match(/"answer"\s*:\s*"((?:\\.|[^"\\])*)"/i);
  if (quoted) {
    const unescaped = quoted[1]
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\')
      .trim();
    return JSON.stringify({ answer: unescaped });
  }

  const bare = s.match(/"answer"\s*:\s*(true|false)/i);
  if (bare) return JSON.stringify({ answer: bare[1].toLowerCase() });

  const jsonMatch = s.match(/\{[\s\S]*"answer"[\s\S]*\}/i);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed && parsed.answer != null) return JSON.stringify({ answer: String(parsed.answer).trim() });
    } catch (_) {}
  }

  if (s.length <= 120 && !/\{/.test(s) && !/answer/i.test(s) && !/[\u4e00-\u9fa5]{12,}/.test(s)) {
    return JSON.stringify({ answer: s });
  }

  return '';
}

function extractReplyText(data) {
  const msg = data.choices?.[0]?.message || {};
  const content = String(msg.content || '').trim();
  const reasoning = String(msg.reasoning_content || '').trim();

  const fromContent = extractAnswerFromText(content);
  if (fromContent) return fromContent;

  if (!content && reasoning) {
    const fromReasoning = extractAnswerFromText(reasoning);
    if (fromReasoning) return fromReasoning;
  }

  return '';
}

function extractPlainReplyText(data) {
  const msg = data.choices?.[0]?.message || {};
  const content = String(msg.content || '').trim();
  const reasoning = String(msg.reasoning_content || '').trim();
  return content || reasoning || '';
}

function buildChatBody(payload, stream) {
  const { model, messages, max_tokens, enableThinking, jsonMode } = payload;
  const body = {
    model: model,
    messages: messages,
    max_tokens: max_tokens || 512,
    temperature: 0.2,
    stream: !!stream,
  };

  if (jsonMode) {
    body.response_format = { type: 'json_object' };
  }

  if (enableThinking) {
    body.thinking = { type: 'enabled' };
    body.reasoning_effort = 'high';
  }

  return body;
}

function parseSseDelta(line) {
  const trimmed = line.trim();
  if (!trimmed.startsWith('data:')) return null;
  const data = trimmed.slice(5).trim();
  if (!data || data === '[DONE]') return null;
  try {
    return JSON.parse(data);
  } catch (_) {
    return null;
  }
}

function appendStreamDelta(parsed, state) {
  const delta = parsed?.choices?.[0]?.delta || parsed?.choices?.[0]?.message || {};
  const reasoning =
    delta.reasoning_content != null
      ? String(delta.reasoning_content)
      : delta.reasoning != null
        ? String(delta.reasoning)
        : '';
  const content = delta.content != null ? String(delta.content) : '';

  if (reasoning) {
    state.thinking += reasoning;
    return { kind: 'thinking', delta: reasoning, thinking: state.thinking, content: state.content };
  }
  if (content) {
    state.content += content;
    return { kind: 'content', delta: content, thinking: state.thinking, content: state.content };
  }
  return null;
}

async function chatCompletions(payload) {
  const { url, apiKey, timeout } = payload;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), (timeout || 60) * 1000);
  const keepAlive = setInterval(() => {
    try {
      chrome.runtime.getPlatformInfo(() => {});
    } catch (_) {}
  }, 20000);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + apiKey,
      },
      body: JSON.stringify(buildChatBody(payload, false)),
      signal: controller.signal,
    });

    let data = {};
    try {
      data = await res.json();
    } catch (_) {}

    if (!res.ok) {
      const errMsg =
        data.error?.message || data.message || data.msg || res.statusText || 'HTTP ' + res.status;
      return { ok: false, error: errMsg };
    }

    const msg = data.choices?.[0]?.message || {};
    const thinking = String(msg.reasoning_content || '').trim();
    const contentRaw = String(msg.content || '').trim();
    const reply = payload.plainText ? extractPlainReplyText(data) : extractReplyText(data);
    if (!reply) {
      return { ok: false, error: '模型未返回有效答案' };
    }
    return { ok: true, reply, thinking, contentRaw };
  } catch (err) {
    if (err.name === 'AbortError') {
      return { ok: false, error: '请求超时' };
    }
    return { ok: false, error: err.message || '网络错误' };
  } finally {
    clearTimeout(timer);
    clearInterval(keepAlive);
  }
}

async function chatCompletionsStream(payload, port) {
  const { url, apiKey, timeout } = payload;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), (timeout || 60) * 1000);
  const keepAlive = setInterval(() => {
    try {
      chrome.runtime.getPlatformInfo(() => {});
    } catch (_) {}
  }, 20000);
  const state = { thinking: '', content: '' };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + apiKey,
      },
      body: JSON.stringify(buildChatBody(payload, true)),
      signal: controller.signal,
    });

    if (!res.ok) {
      let errMsg = res.statusText || 'HTTP ' + res.status;
      try {
        const errData = await res.json();
        errMsg = errData.error?.message || errData.message || errData.msg || errMsg;
      } catch (_) {}
      port.postMessage({ type: 'error', error: errMsg });
      return;
    }

    if (!res.body || !res.body.getReader) {
      port.postMessage({ type: 'error', error: '当前环境不支持流式响应' });
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() || '';

      for (const line of lines) {
        const parsed = parseSseDelta(line);
        if (!parsed) continue;
        const chunk = appendStreamDelta(parsed, state);
        if (chunk) {
          port.postMessage(
            Object.assign({ type: chunk.kind }, chunk, {
              ok: true,
            })
          );
        }
      }
    }

    const replySource = {
      choices: [
        {
          message: {
            content: state.content,
            reasoning_content: state.thinking,
          },
        },
      ],
    };
    const reply = payload.plainText ? extractPlainReplyText(replySource) : extractReplyText(replySource);

    if (!reply) {
      port.postMessage({ type: 'error', error: '模型未返回有效答案' });
      return;
    }

    port.postMessage({
      type: 'done',
      ok: true,
      reply: reply,
      thinking: state.thinking,
      contentRaw: state.content,
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      port.postMessage({ type: 'error', error: '请求超时' });
    } else {
      port.postMessage({ type: 'error', error: err.message || '网络错误' });
    }
  } finally {
    clearTimeout(timer);
    clearInterval(keepAlive);
  }
}

chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== 'autoDoChatStream') return;

  port.onMessage.addListener((message) => {
    if (message.action !== 'start' || !message.payload) return;
    chatCompletionsStream(message.payload, port);
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getStatus') {
    sendResponse({ status: 'running', version: '1.0.0' });
    return true;
  }

  if (message.action === 'testModel') {
    const payload = Object.assign(
      {
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Reply with exactly: OK' },
        ],
        max_tokens: 16,
      },
      message.payload
    );
    chatCompletions(payload)
      .then((result) => {
        if (result.ok && result.reply) {
          result.reply = result.reply.slice(0, 100);
        }
        sendResponse(result);
      })
      .catch((err) => sendResponse({ ok: false, error: err.message || '测试失败' }));
    return true;
  }

  if (message.action === 'chatCompletion') {
    chatCompletions(message.payload)
      .then((result) => sendResponse(result))
      .catch((err) => sendResponse({ ok: false, error: err.message || '请求失败' }));
    return true;
  }

  return true;
});
