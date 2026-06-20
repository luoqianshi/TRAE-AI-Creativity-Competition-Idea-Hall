        // ========== Real Web Search ==========
        // 本地知识缓存（localStorage 持久化，最多 200 条，FIFO 淘汰，TTL 24小时）
        const KNOWLEDGE_CACHE_KEY = 'ai_learning_knowledge_cache';
        const MAX_CACHE_ENTRIES = 200;
        const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24小时
        const SEARCH_TIMEOUT_MS = 3000; // 每个搜索策略超时3秒
        let searchLogCount = 0; // 搜索日志计数器，限制最多显示3条

        function loadKnowledgeCache() {
            try {
                const raw = localStorage.getItem(KNOWLEDGE_CACHE_KEY);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    // 过滤过期条目
                    const now = Date.now();
                    const valid = parsed.filter(item => item.time && (now - item.time) < CACHE_TTL_MS);
                    if (valid.length !== parsed.length) {
                        saveKnowledgeCache(valid);
                    }
                    return valid;
                }
            } catch (e) {
                console.warn('加载知识缓存失败:', e);
            }
            return [];
        }

        function saveKnowledgeCache(cache) {
            try {
                // FIFO 淘汰：超过上限时移除最早的条目
                while (cache.length > MAX_CACHE_ENTRIES) {
                    cache.shift();
                }
                localStorage.setItem(KNOWLEDGE_CACHE_KEY, JSON.stringify(cache));
            } catch (e) {
                console.warn('保存知识缓存失败:', e);
            }
        }

        function addToKnowledgeCache(query, answer) {
            if (!query || !answer) return;
            const cache = loadKnowledgeCache();
            // 如果已存在相同查询，更新答案并移到末尾
            const idx = cache.findIndex(item => item.query === query);
            if (idx !== -1) {
                cache.splice(idx, 1);
            }
            cache.push({ query, answer, time: Date.now(), ttl: CACHE_TTL_MS });
            saveKnowledgeCache(cache);
        }

        function getLocalKnowledge(query) {
            if (!query) return null;
            const cache = loadKnowledgeCache();
            const now = Date.now();
            // 精确匹配（检查TTL）
            const exact = cache.find(item => item.query === query && item.time && (now - item.time) < CACHE_TTL_MS);
            if (exact) {
                aiLog('本地缓存', `命中精确缓存「${query.substring(0, 30)}...」`);
                return exact.answer;
            }
            // 模糊匹配：检查查询是否包含缓存 key 或缓存 key 包含查询
            const normalized = query.toLowerCase().replace(/\s+/g, '');
            for (let i = cache.length - 1; i >= 0; i--) {
                const cached = cache[i];
                if (!cached.time || (now - cached.time) >= CACHE_TTL_MS) continue;
                const cachedNorm = cached.query.toLowerCase().replace(/\s+/g, '');
                if (normalized.includes(cachedNorm) || cachedNorm.includes(normalized)) {
                    aiLog('本地缓存', `命中模糊缓存「${cached.query.substring(0, 30)}...」`);
                    return cached.answer;
                }
            }
            // 智能匹配：提取查询关键词，与缓存中的关键词进行交叉匹配
            const queryWords = normalized.split(/[,，、\s]+/).filter(w => w.length >= 2);
            if (queryWords.length >= 2) {
                for (let i = cache.length - 1; i >= 0; i--) {
                    const cached = cache[i];
                    if (!cached.time || (now - cached.time) >= CACHE_TTL_MS) continue;
                    const cachedNorm = cached.query.toLowerCase().replace(/\s+/g, '');
                    const cachedWords = cachedNorm.split(/[,，、\s]+/).filter(w => w.length >= 2);
                    let matchCount = 0;
                    for (const qw of queryWords) {
                        if (cachedWords.some(cw => cw.includes(qw) || qw.includes(cw))) {
                            matchCount++;
                        }
                    }
                    if (matchCount >= 2 && matchCount >= queryWords.length * 0.5) {
                        aiLog('本地缓存', `命中智能缓存「${cached.query.substring(0, 30)}...」（匹配度 ${Math.round(matchCount / queryWords.length * 100)}%）`);
                        return cached.answer;
                    }
                }
            }
            return null;
        }

        // ========== 搜索触发条件判断 ==========
        // 只有明确需要网络信息的问题才进行搜索
        function shouldSearchWeb(query) {
            if (!query) return false;
            const q = query.toLowerCase();
            // 需要网络搜索的关键词：最新、新闻、实时、当前、今天、2026等时效性信息
            const webKeywords = /最新|新闻|实时|当前|今天.*发生|今日|202[5-9]|20[3-9]\d|时事|热点|疫情|股市|房价|汇率|天气.*预报|赛事|比分|奥运会|世界杯|诺贝尔奖|奥斯卡/;
            // 基础学科问题直接跳过搜索
            const basicSubjectPattern = /^(计算|解|求|证明|化简|因式分解|展开|求值|积分|导数|极限|解方程|解不等式|几何|三角函数|数列|概率|统计)/;
            const isBasicSubject = basicSubjectPattern.test(q);
            const needsWeb = webKeywords.test(q);
            // 如果是纯基础学科问题且不需要时效性信息，跳过搜索
            if (isBasicSubject && !needsWeb) return false;
            return needsWeb;
        }

        // ========== 带超时的搜索包装器 ==========
        async function searchWithTimeout(searchFn, query, label) {
            return new Promise((resolve) => {
                const timer = setTimeout(() => {
                    resolve(null);
                }, SEARCH_TIMEOUT_MS);
                searchFn(query).then(result => {
                    clearTimeout(timer);
                    resolve(result);
                }).catch(() => {
                    clearTimeout(timer);
                    resolve(null);
                });
            });
        }

        // ========== 限制日志输出 ==========
        function limitedAiLog(category, message) {
            if (searchLogCount < 3) {
                searchLogCount++;
                aiLog(category, message);
            }
        }

        // ========== 中文分词预处理 ==========
        function segmentChineseQuery(query) {
            if (!query) return query;
            // 简单中文分词：基于常见词库和规则
            const commonWords = [
                '数学', '物理', '化学', '生物', '语文', '英语', '历史', '地理', '政治',
                '函数', '方程', '几何', '代数', '概率', '统计', '微积分', '导数', '积分',
                '语法', '词汇', '阅读', '写作', '听力', '口语', '翻译',
                '文言文', '古诗', '作文', '修辞', '成语', '文学',
                '定义', '定理', '公式', '性质', '应用', '例题',
                '什么', '怎么', '为什么', '如何', '怎样', '多少'
            ];
            let segmented = query;
            // 在常见词之间插入空格，便于搜索引擎处理
            for (const word of commonWords) {
                const regex = new RegExp(word, 'g');
                segmented = segmented.replace(regex, ' ' + word + ' ');
            }
            // 清理多余空格
            segmented = segmented.replace(/\s+/g, ' ').trim();
            return segmented;
        }

        // 解析搜索结果 HTML（供 CORS 代理策略使用）
        function parseSearchResults(html, query) {
            const results = [];
            try {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const resultElements = doc.querySelectorAll('.result');
                resultElements.forEach((el, index) => {
                    if (index >= 3) return;
                    const titleEl = el.querySelector('.result__title a');
                    const snippetEl = el.querySelector('.result__snippet');
                    const urlEl = el.querySelector('.result__url');
                    if (titleEl && snippetEl) {
                        results.push({
                            title: titleEl.textContent.trim(),
                            snippet: snippetEl.textContent.trim(),
                            url: urlEl ? urlEl.textContent.trim() : ''
                        });
                    }
                });
                if (results.length === 0) {
                    const links = doc.querySelectorAll('a.result__a');
                    links.forEach((el, index) => {
                        if (index >= 3) return;
                        const title = el.textContent.trim();
                        const snippet = el.closest('.result')?.querySelector('.result__snippet')?.textContent.trim() || '';
                        if (title) {
                            results.push({ title, snippet, url: '' });
                        }
                    });
                }
            } catch (e) {
                console.warn('Parse search results failed:', e);
            }
            return results;
        }

        // 解析 Bing 搜索结果 HTML
        function parseBingResults(html, query) {
            const results = [];
            try {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');

                // Bing 搜索结果的主要容器
                const bingResults = doc.querySelectorAll('#b_results > li.b_algo');
                bingResults.forEach((el, index) => {
                    if (index >= 5) return;
                    const titleEl = el.querySelector('h2 a');
                    const snippetEl = el.querySelector('.b_caption p, .b_caption .b_factrow, .b_caption div');
                    const urlEl = el.querySelector('cite');

                    if (titleEl) {
                        results.push({
                            title: titleEl.textContent.trim(),
                            snippet: snippetEl ? snippetEl.textContent.trim() : '',
                            url: urlEl ? urlEl.textContent.trim() : (titleEl.href || '')
                        });
                    }
                });

                // 备用：尝试其他选择器
                if (results.length === 0) {
                    const organicResults = doc.querySelectorAll('.b_algo');
                    organicResults.forEach((el, index) => {
                        if (index >= 5) return;
                        const titleEl = el.querySelector('h2');
                        const snippetEl = el.querySelector('p');
                        if (titleEl) {
                            results.push({
                                title: titleEl.textContent.trim(),
                                snippet: snippetEl ? snippetEl.textContent.trim() : '',
                                url: ''
                            });
                        }
                    });
                }
            } catch (e) {
                console.warn('解析 Bing 搜索结果失败:', e);
            }
            return results;
        }

        // ========== 搜索结果质量评分 ==========

        function scoreSearchResult(result, query) {
            let score = 0;
            const queryLower = (query || '').toLowerCase();
            const titleLower = (result.title || '').toLowerCase();
            const snippetLower = (result.snippet || '').toLowerCase();

            // 标题精确匹配：+10
            if (titleLower === queryLower) {
                score += 10;
            }

            // 标题部分匹配：+5
            const queryWords = queryLower.split(/[\s,，、]+/).filter(function(w) { return w.length >= 2; });
            for (let i = 0; i < queryWords.length; i++) {
                if (titleLower.includes(queryWords[i])) {
                    score += 5;
                }
            }

            // 摘要精确匹配：+3
            if (snippetLower.includes(queryLower)) {
                score += 3;
            }

            // 摘要部分匹配：每个关键词+1
            for (let i = 0; i < queryWords.length; i++) {
                if (snippetLower.includes(queryWords[i])) {
                    score += 1;
                }
            }

            // 结果长度 > 100 字符：+2（内容更丰富）
            const totalLength = (result.title || '').length + (result.snippet || '').length;
            if (totalLength > 100) {
                score += 2;
            }

            // 有 URL：+1（来源可追溯）
            if (result.url && result.url.length > 5) {
                score += 1;
            }

            return score;
        }

        // ========== 搜索查询优化 ==========

        function refineSearchQuery(query) {
            if (!query || query.trim().length === 0) return query;

            let refined = query.trim();

            // 0. 中文分词预处理
            refined = segmentChineseQuery(refined);

            // 1. 移除不必要的词语
            const unnecessaryWords = [
                '请问', '请教', '帮忙', '帮我', '告诉我', '解释一下',
                '什么是', '什么是', '怎么样', '如何', '怎样',
                'please', 'tell me', 'what is', 'how to', 'explain',
                '的', '呢', '吗', '啊', '吧', '了', '一下'
            ];
            for (let i = 0; i < unnecessaryWords.length; i++) {
                const word = unnecessaryWords[i];
                // 只在开头或独立出现时移除
                if (refined.startsWith(word)) {
                    refined = refined.substring(word.length).trim();
                }
            }

            // 2. 添加学科特定前缀（提升搜索精确度）
            const subjectPrefixes = {
                '数学': ['数学', '公式', '定理', '计算', '方程', '函数', '几何', '概率', '导数', '积分'],
                '英语': ['英语', 'English', '语法', '时态', '从句', '写作', '翻译', '单词', '词汇'],
                '语文': ['语文', '文言文', '古诗', '作文', '阅读', '修辞', '成语', '文学'],
                '物理': ['物理', '力学', '电学', '光学', '热学', '公式', '定律'],
                '化学': ['化学', '反应', '方程式', '元素', '有机', '无机'],
                '生物': ['生物', '细胞', '遗传', '进化', '生态'],
                '历史': ['历史', '朝代', '事件', '人物', '年代'],
                '地理': ['地理', '气候', '地形', '地图', '经纬']
            };

            // 检查是否需要添加学科前缀
            let hasPrefix = false;
            for (const subject in subjectPrefixes) {
                const keywords = subjectPrefixes[subject];
                for (let i = 0; i < keywords.length; i++) {
                    if (refined.includes(keywords[i])) {
                        hasPrefix = true;
                        break;
                    }
                }
                if (hasPrefix) break;
            }

            // 3. 处理中英文混合查询
            // 如果查询中既有中文又有英文，保留两者
            const hasChinese = /[\u4e00-\u9fff]/.test(refined);
            const hasEnglish = /[a-zA-Z]/.test(refined);
            if (hasChinese && hasEnglish) {
                // 中英文混合查询保持不变，搜索引擎通常能处理
            }

            // 4. 清理多余空格
            refined = refined.replace(/\s+/g, ' ').trim();

            // 5. 如果查询过长（超过50字符），截取核心部分
            if (refined.length > 50) {
                // 尝试提取最关键的部分
                const coreMatch = refined.match(/[\u4e00-\u9fff]{2,10}|[a-zA-Z]{2,}/g);
                if (coreMatch && coreMatch.length > 0) {
                    refined = coreMatch.slice(0, 5).join(' ');
                }
            }

            return refined || query;
        }

        // ========== 改进的结果格式化（含来源归因） ==========

        function formatSearchResults(results, query, source) {
            const sourceName = source || '互联网搜索';
            let formatted = '\u3010\u8054\u7f51\u641c\u7d22\u7ed3\u679c - ' + sourceName + '\u3011\n\n';
            formatted += '\u5173\u4e8e\u300c' + query + '\u300d\u7684\u641c\u7d22\u7ed3\u679c\uff1a\n';

            if (!results || results.length === 0) {
                formatted += '\n\u672a\u627e\u5230\u76f8\u5173\u7ed3\u679c\u3002';
                return formatted;
            }

            results.forEach(function(result, index) {
                formatted += '\n' + (index + 1) + '. ' + (result.title || '\u65e0\u6807\u9898');
                if (result.snippet) {
                    const snippet = result.snippet.length > 150 ? result.snippet.substring(0, 150) + '...' : result.snippet;
                    formatted += '\n   ' + snippet;
                }
                if (result.url) {
                    formatted += '\n   \u2192 \u6765\u6e90: ' + result.url;
                }
                if (result.score !== undefined) {
                    formatted += '\n   \u2192 \u76f8\u5173\u5ea6\u8bc4\u5206: ' + result.score + '\u5206';
                }
            });

            formatted += '\n\n\u2764 \u4ee5\u4e0a\u4fe1\u606f\u6765\u81ea' + sourceName + '\uff0c\u4ec5\u4f9b\u53c2\u8003\u3002\u5efa\u8bae\u7ed3\u5408\u591a\u4e2a\u6765\u6e90\u4ea4\u53c9\u9a8c\u8bc1\u3002';
            return formatted;
        }

        // ========== 多策略搜索 ==========

        // 策略1：DuckDuckGo Instant Answer API（快速，无 CORS 问题）
        async function searchViaDuckDuckGoInstant(query) {
            try {
                aiLog('联网搜索', '尝试 DuckDuckGo Instant Answer API');
                const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&no_html=1&skip_disambig=1`;
                const response = await fetch(url, {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' }
                });
                if (!response.ok) throw new Error(`DuckDuckGo Instant API 返回 ${response.status}`);
                const data = await response.json();

                const parts = [];
                // AbstractText（主要摘要）
                if (data.AbstractText) {
                    parts.push(data.AbstractText);
                }
                // AbstractSource
                if (data.AbstractSource) {
                    parts.push(`来源：${data.AbstractSource}`);
                }
                // Heading
                if (data.Heading && !data.AbstractText) {
                    // 如果没有摘要但有标题，尝试从 RelatedTopics 获取信息
                }
                // AnswerType
                if (data.Answer) {
                    parts.push(`答案：${data.Answer}`);
                }
                // Definition
                if (data.Definition) {
                    parts.push(`定义：${data.Definition}`);
                }
                // RelatedTopics（取前3个有文本的）
                if (data.RelatedTopics && data.RelatedTopics.length > 0) {
                    const topics = data.RelatedTopics
                        .filter(t => t.Text)
                        .slice(0, 3)
                        .map(t => t.Text.substring(0, 150));
                    if (topics.length > 0 && parts.length === 0) {
                        parts.push(`相关主题：\n${topics.map(t => '• ' + t).join('\n')}`);
                    }
                }
                // Infobox 数据
                if (data.Infobox && data.Infobox.content && parts.length === 0) {
                    const infoParts = [];
                    for (const key of Object.keys(data.Infobox.content).slice(0, 5)) {
                        infoParts.push(`${key}: ${data.Infobox.content[key]}`);
                    }
                    if (infoParts.length > 0) {
                        parts.push(infoParts.join('\n'));
                    }
                }

                if (parts.length === 0) return null;

                aiLog('联网搜索', 'DuckDuckGo Instant Answer 搜索成功');
                return {
                    source: 'DuckDuckGo Instant',
                    text: `【联网搜索结果 - DuckDuckGo】\n\n关于「${query}」：\n\n${parts.join('\n\n')}\n\n💡 以上信息来自 DuckDuckGo，仅供参考。`,
                    title: data.Heading || '',
                    url: data.AbstractURL || ''
                };
            } catch (e) {
                aiLog('联网搜索', `DuckDuckGo Instant Answer 失败: ${e.message}`);
                return null;
            }
        }

        // 策略2：Wikipedia API 摘要（精确页面查询）
        async function searchViaWikipediaAPI(query) {
            try {
                aiLog('联网搜索', '尝试 Wikipedia 摘要 API');
                const url = `https://zh.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
                const response = await fetch(url, {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' }
                });
                if (!response.ok) throw new Error(`Wikipedia 摘要 API 返回 ${response.status}`);
                const data = await response.json();
                if (data.extract) {
                    aiLog('联网搜索', 'Wikipedia 摘要 API 搜索成功');
                    return {
                        source: 'Wikipedia 摘要',
                        text: `【联网搜索结果 - 维基百科】\n\n关于「${query}」：\n\n${data.title}\n${data.extract.substring(0, 500)}${data.extract.length > 500 ? '...' : ''}\n\n💡 以上信息来自维基百科，仅供参考。`,
                        title: data.title,
                        url: data.content_urls && data.content_urls.desktop ? data.content_urls.desktop.page : ''
                    };
                }
            } catch (e) {
                aiLog('联网搜索', `Wikipedia 摘要 API 失败: ${e.message}`);
            }
            return null;
        }

        // 策略3：Wikipedia 搜索（更广泛的搜索）
        async function searchViaWikipediaSearch(query) {
            try {
                aiLog('联网搜索', '尝试 Wikipedia 搜索 API');
                const url = `https://zh.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=3&format=json&origin=*`;
                const response = await fetch(url, {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' }
                });
                if (!response.ok) throw new Error(`Wikipedia 搜索 API 返回 ${response.status}`);
                const data = await response.json();
                // opensearch 返回 [query, titles[], descriptions[], urls[]]
                const titles = data[1] || [];
                const descriptions = data[2] || [];
                const urls = data[3] || [];

                if (titles.length === 0) return null;

                aiLog('联网搜索', `Wikipedia 搜索成功，找到 ${titles.length} 条结果`);
                let formatted = `【联网搜索结果 - 维基百科搜索】\n\n关于「${query}」的搜索结果：\n`;
                for (let i = 0; i < titles.length; i++) {
                    formatted += `\n${i + 1}. ${titles[i]}`;
                    if (descriptions[i]) {
                        formatted += `\n   ${descriptions[i].substring(0, 150)}${descriptions[i].length > 150 ? '...' : ''}`;
                    }
                    if (urls[i]) {
                        formatted += `\n   ${urls[i]}`;
                    }
                }
                formatted += `\n\n💡 以上信息来自维基百科搜索，仅供参考。`;
                return {
                    source: 'Wikipedia 搜索',
                    text: formatted,
                    title: titles[0] || '',
                    url: urls[0] || ''
                };
            } catch (e) {
                aiLog('联网搜索', `Wikipedia 搜索 API 失败: ${e.message}`);
                return null;
            }
        }

        // 已移除的策略（容易CORS失败）：CORS代理、Bing搜索、Wikipedia详细搜索、DuckDuckGo补充API
        // 只保留最可靠的3个策略：本地缓存 -> DuckDuckGo Instant -> Wikipedia

        // 合并多个搜索源的结果，确保来源多样性
        function combineSearchResults(results) {
            if (!results || results.length === 0) return null;
            if (results.length === 1) return results[0].text;

            // 按来源分组，确保来源多样性
            const sourceGroups = {};
            results.forEach(r => {
                const src = r.source || '未知';
                if (!sourceGroups[src]) sourceGroups[src] = [];
                sourceGroups[src].push(r);
            });

            // 优先从不同来源各取一条
            const diverseResults = [];
            const sources = Object.keys(sourceGroups);
            let round = 0;
            while (diverseResults.length < results.length) {
                let added = false;
                for (const src of sources) {
                    const group = sourceGroups[src];
                    if (group[round]) {
                        diverseResults.push(group[round]);
                        added = true;
                    }
                }
                if (!added) break;
                round++;
            }

            let combined = `【联网搜索结果 - 多源综合】\n\n关于相关问题的搜索结果：\n`;
            const seenTitles = new Set();
            let sourceCount = 0;

            diverseResults.forEach((result, index) => {
                if (!result || !result.text) return;
                // 避免重复标题
                if (result.title && seenTitles.has(result.title)) return;
                if (result.title) seenTitles.add(result.title);

                sourceCount++;
                combined += `\n--- 来源${sourceCount}：${result.source || '未知'} ---\n`;
                // 提取正文部分（去掉标题行）
                const textLines = result.text.split('\n');
                let started = false;
                for (const line of textLines) {
                    if (started || line.startsWith('1.') || line.startsWith('•') || line.startsWith('摘要') || line.startsWith('定义') || line.startsWith('答案')) {
                        started = true;
                        combined += line + '\n';
                    }
                }
                if (result.url) {
                    combined += `链接：${result.url}\n`;
                }
            });

            combined += `\n💡 以上信息综合自 ${sourceCount} 个搜索源，仅供参考。建议结合多个来源交叉验证。`;
            return combined;
        }

        // 主搜索函数：优先查缓存，然后依次尝试3种可靠策略，带超时控制
        async function performWebSearch(query) {
            if (!state.settings.webSearch) return null;

            // 重置日志计数器
            searchLogCount = 0;

            // 检查是否需要网络搜索
            if (!shouldSearchWeb(query)) {
                limitedAiLog('联网搜索', '基础学科问题，跳过网络搜索');
                return null;
            }

            limitedAiLog('联网搜索', `正在搜索「${query.substring(0, 30)}...」`);

            // 0. 先查本地缓存
            const cached = getLocalKnowledge(query);
            if (cached) {
                return cached + '\n\n💡 以上信息来自本地缓存。';
            }

            // 0.5 优化搜索查询
            const refinedQuery = refineSearchQuery(query);
            if (refinedQuery !== query) {
                limitedAiLog('联网搜索', `查询优化：「${query.substring(0, 20)}」→「${refinedQuery.substring(0, 20)}」`);
            }
            const searchQuery = refinedQuery;

            const allResults = [];

            // 策略1：DuckDuckGo Instant Answer API（快速，无 CORS 问题）
            const result1 = await searchWithTimeout(searchViaDuckDuckGoInstant, searchQuery, 'DuckDuckGo');
            if (result1) {
                allResults.push(result1);
                addToKnowledgeCache(query, result1.text);
                limitedAiLog('联网搜索', 'DuckDuckGo 搜索成功');
            }

            // 策略2：Wikipedia API 摘要（精确页面查询）
            const result2 = await searchWithTimeout(searchViaWikipediaAPI, searchQuery, 'Wikipedia摘要');
            if (result2) {
                allResults.push(result2);
                addToKnowledgeCache(query, result2.text);
                limitedAiLog('联网搜索', 'Wikipedia 搜索成功');
            }

            // 如果已获取到高质量结果，直接返回
            if (allResults.length > 0) {
                if (allResults.length === 1) {
                    return allResults[0].text;
                }
                return combineSearchResults(allResults);
            }

            // 策略3：Wikipedia 搜索（更广泛的搜索）
            const result3 = await searchWithTimeout(searchViaWikipediaSearch, searchQuery, 'Wikipedia搜索');
            if (result3) {
                allResults.push(result3);
                addToKnowledgeCache(query, result3.text);
                limitedAiLog('联网搜索', 'Wikipedia 广泛搜索成功');
            }

            if (allResults.length > 0) {
                return allResults.length === 1 ? allResults[0].text : combineSearchResults(allResults);
            }

            // 所有策略均失败，快速回退到本地知识，不再重试
            limitedAiLog('联网搜索', '所有搜索策略均失败，使用本地知识回答');
            return null; // 返回null让调用方使用本地知识回答
        }
