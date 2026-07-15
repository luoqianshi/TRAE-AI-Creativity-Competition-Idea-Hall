/**
 * 智页AI - 网页内容解析器
 * 自动提取网页正文、标题、代码块、表格等结构化信息
 */

class WebParser {
  constructor() {
    this.parsed = null;
  }

  /**
   * 解析当前页面
   */
  parseDocument() {
    const doc = document;
    const url = location.href;
    const title = doc.title || '';
    const domain = location.hostname;

    // 提取标题层级
    const headings = this._extractHeadings(doc);

    // 提取正文段落
    const paragraphs = this._extractParagraphs(doc, headings);

    // 提取代码块
    const codeBlocks = this._extractCodeBlocks(doc);

    // 提取表格
    const tables = this._extractTables(doc);

    // 提取列表
    const lists = this._extractLists(doc);

    // 提取元数据
    const meta = this._extractMeta(doc);

    // 生成摘要
    const summary = this._generateSummary(paragraphs, title);

    this.parsed = {
      url,
      title,
      domain,
      headings,
      paragraphs,
      codeBlocks,
      tables,
      lists,
      meta,
      summary,
      timestamp: Date.now()
    };

    return this.parsed;
  }

  _extractHeadings(doc) {
    const elements = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
    return Array.from(elements).map(el => ({
      text: el.textContent.trim(),
      level: parseInt(el.tagName[1]),
      tag: el.tagName.toLowerCase(),
      element: el
    }));
  }

  _extractParagraphs(doc, headings) {
    // 尝试找到主要内容区域
    const article = doc.querySelector('article, main, .content, .post, .article, [role="main"]');
    const container = article || doc.body;

    const elements = container.querySelectorAll('p, section > div:not(:has(p, div))');
    return Array.from(elements)
      .map(el => {
        const text = el.textContent.trim();
        if (text.length < 20) return null;

        // 找到最近的标题
        let afterHeading = null;
        for (let i = headings.length - 1; i >= 0; i--) {
          if (el.compareDocumentPosition(headings[i].element) & Node.DOCUMENT_POSITION_PRECEDING) {
            afterHeading = headings[i].text;
            break;
          }
        }

        return { text, afterHeading, element: el };
      })
      .filter(Boolean);
  }

  _extractCodeBlocks(doc) {
    const blocks = [];

    // pre > code 结构
    const preBlocks = doc.querySelectorAll('pre');
    preBlocks.forEach(el => {
      const codeEl = el.querySelector('code');
      const code = (codeEl || el).textContent.trim();
      if (code.length < 5) return;

      // 推断语言
      let language = '';
      const className = (codeEl?.className || el.className || '').toLowerCase();
      const langMatch = className.match(/language-(\w+)|lang-(\w+)|(python|javascript|js|lua|java|cpp|c\+\+|go|rust|typescript|ts|html|css|json|xml|yaml|sql|bash|shell|powershell)/);
      if (langMatch) language = langMatch[1] || langMatch[2] || langMatch[3];

      blocks.push({ code, language, isInline: false, element: el });
    });

    // inline code
    const inlineCodes = doc.querySelectorAll('code:not(pre code)');
    inlineCodes.forEach(el => {
      const code = el.textContent.trim();
      if (code.length > 2 && code.length < 200) {
        blocks.push({ code, language: '', isInline: true, element: el });
      }
    });

    return blocks;
  }

  _extractTables(doc) {
    const tables = doc.querySelectorAll('table');
    return Array.from(tables).map(el => {
      const caption = el.querySelector('caption')?.textContent.trim() || '';
      const headerRow = el.querySelector('thead tr') || el.querySelector('tr');
      const headers = headerRow
        ? Array.from(headerRow.querySelectorAll('th, td')).map(c => c.textContent.trim())
        : [];

      const rows = [];
      const dataRows = el.querySelectorAll('tbody tr, tr');
      dataRows.forEach(row => {
        const cells = Array.from(row.querySelectorAll('td, th')).map(c => c.textContent.trim());
        if (cells.length && !rows.find(r => JSON.stringify(r) === JSON.stringify(cells))) {
          rows.push(cells);
        }
      });

      // 去重header
      if (rows.length && JSON.stringify(rows[0]) === JSON.stringify(headers)) {
        rows.shift();
      }

      return { headers, rows, caption, element: el };
    }).filter(t => t.rows.length > 0);
  }

  _extractLists(doc) {
    const lists = [];
    doc.querySelectorAll('ul, ol').forEach(el => {
      const items = Array.from(el.querySelectorAll('li'))
        .map(li => li.textContent.trim())
        .filter(t => t.length > 0);
      if (items.length > 0) {
        lists.push({
          items,
          type: el.tagName.toLowerCase(),
          element: el
        });
      }
    });
    return lists;
  }

  _extractMeta(doc) {
    const meta = {};
    doc.querySelectorAll('meta').forEach(m => {
      const name = m.getAttribute('name') || m.getAttribute('property');
      const content = m.getAttribute('content');
      if (name && content) meta[name] = content;
    });
    return meta;
  }

  _generateSummary(paragraphs, title) {
    // 取前3段有实质内容的段落拼接作为摘要
    const meaningful = paragraphs
      .filter(p => p.text.length > 50)
      .slice(0, 3)
      .map(p => p.text.substring(0, 200));
    return meaningful.join('；').substring(0, 400);
  }

  /**
   * 获取纯文本内容
   */
  getFullText() {
    if (!this.parsed) this.parseDocument();
    const parts = [
      this.parsed.title,
      ...this.parsed.headings.map(h => h.text),
      ...this.parsed.paragraphs.map(p => p.text),
      ...this.parsed.codeBlocks.map(c => c.code),
      ...this.parsed.tables.map(t => `Table: ${t.headers.join(' ')} ${t.rows.map(r => r.join(' ')).join(' ')}`),
      ...this.parsed.lists.map(l => l.items.join(' '))
    ];
    return parts.join('\n');
  }

  /**
   * 判断是否为技术文档/API文档页面
   */
  isTechDoc() {
    if (!this.parsed) this.parseDocument();
    const indicators = [
      this.parsed.codeBlocks.length > 2,
      this.parsed.headings.some(h => /api|接口|函数|方法|参数|返回值/i.test(h.text)),
      this.parsed.domain.includes('docs') || this.parsed.domain.includes('api'),
      this.parsed.meta['og:type'] === 'article' && this.parsed.codeBlocks.length > 0
    ];
    return indicators.filter(Boolean).length >= 2;
  }
}

// 全局导出
if (typeof window !== 'undefined') window.WebParser = WebParser;
if (typeof module !== 'undefined') module.exports = WebParser;