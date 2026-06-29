# AI 图像识别添加题目 — 实施计划

## Context

用户当前的应用是一个纯前端的数据结构错题复习本（[index.html](file:///d:/Desktop/sjjg(1)/sjjg/index.html) + [app.js](file:///d:/Desktop/sjjg(1)/sjjg/app.js) + [style.css](file:///d:/Desktop/sjjg(1)/sjjg/style.css)），所有题目静态存储在 `window.QUESTIONS_DATA`（[questions_data.js](file:///d:/Desktop/sjjg(1)/sjjg/questions_data.js)），不支持运行时新增。

**目标**：新增「AI 添加」功能，让用户上传一张题目截图，调用 DeepSeek API (`https://api.deepseek.com/chat/completions`) 自动提取题目信息（题干 / 选项 / 答案 / 解析），经用户确认后保存到 localStorage 并立刻可用于复习。

**用户硬性要求**：
1. 题目内容必须严格来自图片，禁止 AI 凭空捏造
2. 必须经用户确认才能加入，并支持删除
3. 必须包含「学术解析 & 答案」字段

**已确认的设计决策**：
- 入口：顶栏第 4 个 tab「AI 添加」
- API Key：在设置面板输入并保存到 `localStorage`（不硬编码）
- 支持三种题型：choice（选择题）/ calculation（计算题）/ drawing（绘图题）

---

## 关键文件

| 文件 | 改动 |
|---|---|
| [index.html](file:///d:/Desktop/sjjg(1)/sjjg/index.html) | 新增顶栏第 4 个 tab、设置按钮、`<dialog id="settings-dialog">`、AI 添加视图 section |
| [style.css](file:///d:/Desktop/sjjg(1)/sjjg/style.css) | AI 添加视图布局、设置对话框、文件上传区、结果表单样式；沿用现有 `--primary` / `--surface-*` / `.btn-*` 体系 |
| [app.js](file:///d:/Desktop/sjjg(1)/sjjg/app.js) | 新增模式 `add`、设置对话框逻辑、文件上传 + 预览、DeepSeek API 调用、结果表单、添加 / 删除流程、合并用户题目到 `state.questions` |

无需修改 [questions_data.js](file:///d:/Desktop/sjjg(1)/sjjg/questions_data.js)；用户新增的题目只存在 `localStorage`。

---

## 实施步骤

### Step 1 — HTML 结构调整（[index.html](file:///d:/Desktop/sjjg(1)/sjjg/index.html)）

1. **顶栏** ([index.html:26-40](file:///d:/Desktop/sjjg(1)/sjjg/index.html#L26-L40))：在 `.nav-links` 末尾追加：
   ```html
   <button class="nav-link" data-nav-mode="add">AI 添加</button>
   <button class="nav-icon-btn" id="btn-open-settings" title="设置">⚙</button>
   ```
2. **主工作区**（在 `stats-workspace` 之后）：
   ```html
   <section class="ai-add-workspace" id="ai-add-workspace" style="display: none;">
     <!-- 动态填充 -->
   </section>
   ```
3. **设置对话框**（body 末尾）：
   ```html
   <dialog id="settings-dialog" class="image-dialog">
     <div class="dialog-header">
       <h3>设置</h3>
       <button class="btn-close" id="btn-close-settings">×</button>
     </div>
     <div class="dialog-body">
       <label>DeepSeek API Key</label>
       <input type="password" id="input-api-key" class="text-input" placeholder="sk-...">
       <p class="hint">仅保存在本地浏览器，不会上传。</p>
       <div class="dialog-actions">
         <button class="btn btn-secondary" id="btn-test-api">测试连接</button>
         <button class="btn btn-primary" id="btn-save-settings">保存</button>
       </div>
     </div>
   </dialog>
   ```

### Step 2 — CSS 样式（[style.css](file:///d:/Desktop/sjjg(1)/sjjg/style.css)）

复用现有 token 与组件，新增：

- `.ai-add-workspace` — flex column，占满主区域
- `.upload-zone` — 虚线边框的拖拽上传区（`.surface-soft` 背景，圆角 12px，hover 高亮 `--primary`）
- `.uploaded-image-preview` — 居中显示已上传图片，最大高度 320px
- `.result-form` — 表单栅格（label 在上、输入框在下）
- `.text-input`, `.textarea-input` — 文本输入框（参考 `.calc-input` [style.css:521-540](file:///d:/Desktop/sjjg(1)/sjjg/style.css#L521-L540) 的 focus ring 风格）
- `.option-row` — 选择题选项编辑行（删除按钮 + 文本输入）
- `.nav-icon-btn` — 顶栏图标按钮（透明背景，hover `--surface-soft`）
- `.question-item.added-by-user` 角标 — 侧栏列表中标记用户添加的题目（小型 `+` 图标）
- 暗色模式覆盖：`.wrong-mode-active .upload-zone` 等

### Step 3 — JS 核心逻辑（[app.js](file:///d:/Desktop/sjjg(1)/sjjg/app.js)）

#### 3.1 状态与持久化扩展

在 [app.js:4-17](file:///d:/Desktop/sjjg(1)/sjjg/app.js#L4-L17) 的 `state` 中新增：
```js
addedQuestions: [],   // 用户通过 AI 添加的题目
deepseekApiKey: "",
```

新增 localStorage key：
- `claude_added_questions` → 持久化 `addedQuestions`
- `claude_deepseek_api_key` → 持久化 API Key

扩展 [loadStateFromStorage()](file:///d:/Desktop/sjjg(1)/sjjg/app.js#L96-L115) 与 [saveStateToStorage()](file:///d:/Desktop/sjjg(1)/sjjg/app.js#L117-L125)。

#### 3.2 合并用户题目到 [loadQuestions()](file:///d:/Desktop/sjjg(1)/sjjg/app.js#L48-L93)

在原有加载流程末尾，把 `state.addedQuestions` 合并进 `state.questions`：
- 用户题目追加到尾部（不影响原题序号）
- 重新计算 `display_number`（用户题目延续编号）
- 给用户题目打标 `q._userAdded = true` 用于识别

#### 3.3 新增 `add` 模式

扩展 [switchMode()](file:///d:/Desktop/sjjg(1)/sjjg/app.js#L137-L174)：当 `mode === "add"` 时：
- 隐藏 workspace / stats-workspace
- 显示 `ai-add-workspace`
- 渲染 AI 添加视图（已添加列表 + 上传入口）

#### 3.4 设置对话框

- 点击 `⚙` 按钮 → `document.getElementById('settings-dialog').showModal()`
- 加载时回填已保存的 key
- 保存按钮 → 写 localStorage 并 `alert` 成功
- 「测试连接」按钮 → 调用一次最小请求（`deepseek-chat` 发送 "hi"），返回结果提示

#### 3.5 文件上传与预览

- 监听 `.upload-zone` 的 `dragover` / `drop` 与隐藏 `<input type="file" accept="image/*">` 的 `change`
- 读取文件为 base64 dataURL，渲染到 `<img class="uploaded-image-preview">`
- 状态保存到 `state.pendingImage = { dataURL, filename, size }`

#### 3.6 DeepSeek API 调用

新增 `callDeepseekVision(imageDataURL, userHint)`：

```js
const systemPrompt = `你是严格的数据结构题目提取助手。从图片中**准确提取**题目内容，**严禁凭空捏造**任何信息。

输出严格的 JSON（不要 markdown 代码块、不要任何额外文字）：

{
  "type": "choice" | "calculation" | "drawing",
  "chapter": "第N章 XXX",
  "question": "完整题干（保留换行）",
  "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
  "correct_answer": 0,
  "answer": "完整答案",
  "explanation": "详细学术解析"
}

规则：
1. 图片模糊或无法识别时在 explanation 中注明"图片不清晰"，仅提取能看清的部分
2. 严禁为选择题编造选项
3. 选项 / 题干必须逐字来自图片
4. explanation 可基于已提取的题目自行推导，但逻辑必须正确
5. choice 类型才填 options 和 correct_answer；calculation/drawing 才填 answer`;

const response = await fetch("https://api.deepseek.com/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`
  },
  body: JSON.stringify({
    model: "deepseek-chat",
    messages: [{
      role: "user",
      content: [
        { type: "text", text: systemPrompt + (userHint ? `\n\n用户提示：${userHint}` : "") },
        { type: "image_url", image_url: { url: imageDataURL } }
      ]
    }],
    response_format: { type: "json_object" },
    temperature: 0.1
  })
});
```

返回后用 `JSON.parse` 解析 `choices[0].message.content`，再做字段校验（type 必须三选一；choice 必须有 options 长度 4 和 correct_answer 0-3；非 choice 必须有 answer 字符串）。

#### 3.7 结果确认表单

调用成功后，渲染 `.result-form`（全部可编辑）：
- 章节（`<input>`，自动补全为 `第N章`）
- 题型（三个 `.btn-secondary` 单选，互斥）
- 题干（`<textarea>`，必填）
- 选项区（仅 choice）：4 行 `.option-row`，单选正确项（圆点高亮 `--primary`）
- 答案（仅 calc / draw）：`<textarea>`
- 解析：`<textarea>`，必填
- 操作：「确认添加」「重新识别」「取消」

#### 3.8 确认添加 → 写入 state 与持久化

点击「确认添加」：
1. 校验必填字段（题干、解析、choice 需选项完整 + 正确答案）
2. 生成 id：`ai_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
3. 构造题目对象：
   ```js
   {
     id, filename: imageDataURL, chapter, type, question,
     options, correct_answer, answer, explanation,
     _userAdded: true
   }
   ```
4. 推入 `state.addedQuestions` + `state.questions`，重算 `display_number`
5. 写入 `localStorage` 的 `claude_added_questions`
6. 重新渲染侧栏 + 视图，给出「已添加」toast

#### 3.9 删除用户添加的题目

在 [renderWorkspace()](file:///d:/Desktop/sjjg(1)/sjjg/app.js#L256-L311) 的 action buttons 末尾，若 `question._userAdded === true` 则额外渲染一个 `.btn-wrong-book` 风格的「删除此题」按钮。点击时：
1. 从 `state.addedQuestions` 与 `state.questions` 中 `filter` 掉
2. 清理 `state.userAnswers[questionId]` 与 `state.questionStatuses[questionId]`
3. 持久化
4. 切到下一题（或空状态）

同时在 AI 添加视图中提供「已添加题目列表」面板，每行带「删除」按钮。

---

## 复用现有模式（不要重新造轮子）

- 模态框用原生 `<dialog>` + `.image-dialog` 样式（[style.css:1035-1117](file:///d:/Desktop/sjjg(1)/sjjg/style.css#L1035-L1117)）
- 按钮用 `.btn` / `.btn-primary` / `.btn-secondary`（[style.css:549-606](file:///d:/Desktop/sjjg(1)/sjjg/style.css#L549-L606)）
- 文本框参考 `.calc-input` 的 focus 风格（[style.css:521-540](file:///d:/Desktop/sjjg(1)/sjjg/style.css#L521-L540)）
- 列表项参考 `.question-item`（[style.css:237-261](file:///d:/Desktop/sjjg(1)/sjjg/style.css#L237-L261)）
- localStorage 读写沿用 `claude_*` 前缀（[app.js:98-121](file:///d:/Desktop/sjjg(1)/sjjg/app.js#L98-L121)）
- 题目渲染沿用 `renderSidebar()` / `renderWorkspace()` / `setupInteraction()`，**不要为新增题目改这三处**

---

## 验证步骤

实施完成后，按以下顺序端到端测试：

1. **页面加载** — 双击 `index.html` 用浏览器打开（无需 server），确认无 console 错误，顶栏出现 4 个 tab + 齿轮按钮
2. **设置 API Key** — 点齿轮 → 输入 key → 保存 → 关闭 → 刷新页面 → 重新打开设置确认 key 仍在
3. **测试连接** — 点「测试连接」，应能成功（说明 key 有效 + 网络通 + DeepSeek API 接受浏览器 CORS）
4. **上传并识别选择题**
   - 准备一张包含「第X章 + 4 个选项 A-D + 一道题」的真实截图
   - 切到「AI 添加」→ 拖入图片 → 点「开始识别」
   - 确认返回的题目文字与图片一致（**不允许 AI 改字、漏字、添加额外内容**）
   - 若图片模糊，explanation 应有提示
5. **结果编辑与确认**
   - 修改章节 / 调整某选项文字 / 切换正确答案
   - 点「确认添加」→ 侧栏应出现新题目
6. **做题流程** — 点击新题 → 作答 → 解析正确显示 → 错题本逻辑正常
7. **持久化** — 刷新页面 → 新增的题目仍存在（说明 `claude_added_questions` 工作）
8. **删除** — 在 AI 添加视图的「已添加列表」中点删除 → 侧栏对应项消失；或打开该题在工作区点「删除此题」→ 题目消失
9. **识别计算题 / 绘图题** — 重复步骤 4-7，验证 answer 字段正确
10. **错误处理**
    - 不填 key 直接识别 → 提示先设置
    - key 无效 → API 返回 401 时给出友好错误
    - 网络断开 → 给出重试提示
    - 上传非图片文件 → 拒绝

---

## 风险与注意事项

1. **CORS**：DeepSeek API `https://api.deepseek.com/chat/completions` 是否对浏览器开放 CORS 需在实施时验证。若不支持，需要用户配置代理（可后续追加 `cors_proxy_url` 设置项）
2. **API 配额**：每次识别消耗 token，UI 中需明确「本次识别消耗约 N tokens」的提示（可选优化）
3. **图片大小**：超过 4MB 的图片 base64 编码后可能超过请求体大小限制，建议在客户端将图片压缩到 1920px 长边、quality 0.85 再上传
4. **大图存储**：用户上传的图片以 dataURL 存进 `localStorage`，可能很快填满 5-10MB 配额。需在添加前给出空间估算；超限提示用户删除旧题
5. **删除的范围**：删除用户题目时应一并清理 `userAnswers` / `questionStatuses` / `wrongBookIds` 中相关 id
