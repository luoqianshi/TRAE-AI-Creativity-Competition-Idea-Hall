class ExportService {
    constructor() {
        this.pdfLib = null;
        this.docxLib = null;
    }

    async exportToPDF(book, items) {
        console.log('Starting PDF export...', book.name, items.length);

        let htmlContent = '<!DOCTYPE html><html><head><meta charset="UTF-8">';
        htmlContent += '<title>' + this._escapeHtml(book.name) + '</title>';
        htmlContent += '<style>';
        htmlContent += 'body { font-family: "Microsoft YaHei", "SimHei", Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }';
        htmlContent += 'h1 { color: #007AFF; text-align: center; margin-bottom: 20px; }';
        htmlContent += 'h2 { font-size: 18px; color: #333; margin-bottom: 10px; }';
        htmlContent += 'p { font-size: 14px; line-height: 1.8; color: #555; margin-bottom: 15px; }';
        htmlContent += 'hr { border: 2px solid #007AFF; margin: 30px 0; }';
        htmlContent += '.error-box { background-color: #FFF5F5; padding: 12px; border-radius: 8px; margin-bottom: 15px; }';
        htmlContent += '.annotation-box { background-color: #F0FFF4; padding: 12px; border-radius: 8px; margin-bottom: 15px; }';
        htmlContent += '.image-container { margin-bottom: 15px; }';
        htmlContent += '.image-container img { max-width: 100%; border-radius: 8px; }';
        htmlContent += '</style></head><body>';
        htmlContent += '<h1>' + this._escapeHtml(book.name) + '</h1>';
        htmlContent += '<p style="color: #666; text-align: center; margin-bottom: 30px;">导出时间: ' + new Date().toLocaleString('zh-CN') + '</p>';
        htmlContent += '<hr>';

        items.forEach((item, index) => {
            htmlContent += '<div style="margin-bottom: 40px;">';
            htmlContent += '<h2>题目 ' + (index + 1) + '</h2>';
            htmlContent += '<p>' + this._escapeHtml(item.questionText || '无题目内容') + '</p>';
            htmlContent += '</div>';

            if (item.errorReason && item.errorReason.length > 0) {
                htmlContent += '<div class="error-box">';
                htmlContent += '<strong style="color: #FF3B30;">错误原因:</strong> ' + this._escapeHtml(item.errorReason.join(', '));
                htmlContent += '</div>';
            }

            if (item.annotations && item.annotations.trim()) {
                htmlContent += '<div class="annotation-box">';
                htmlContent += '<strong style="color: #34C759;">批注:</strong> ' + this._escapeHtml(item.annotations);
                htmlContent += '</div>';
            }

            if (item.images && item.images.length > 0) {
                htmlContent += '<div class="image-container">';
                htmlContent += '<img src="' + item.images[0] + '" alt="题目图片">';
                htmlContent += '</div>';
            }

            htmlContent += '<hr>';
        });

        htmlContent += '</body></html>';

        console.log('HTML content length:', htmlContent.length);

        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = book.name + '_错题本.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log('HTML export successful');
        alert('HTML文件已下载！\n\n请用浏览器打开该文件，然后使用打印功能（Ctrl+P）\n在打印对话框中选择"另存为PDF"即可导出为PDF。');
    }

    async exportToDOCX(book, items) {
        if (typeof docx === 'undefined') {
            throw new Error('docx library not loaded');
        }

        const { Document, Packer, Paragraph, TextRun, HeadingLevel, ImageRun, AlignmentType } = docx;

        const children = [
            new Paragraph({
                text: book.name,
                heading: HeadingLevel.HEADING_1,
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 }
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: `导出时间: ${new Date().toLocaleString('zh-CN')}`,
                        color: '666666',
                        size: 20
                    })
                ],
                spacing: { after: 400 }
            })
        ];

        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            children.push(
                new Paragraph({
                    text: `题目 ${i + 1}`,
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 400, after: 200 }
                })
            );

            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: item.questionText,
                            size: 24
                        })
                    ],
                    spacing: { after: 200 }
                })
            );

            if (item.errorReason && item.errorReason.length > 0) {
                children.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: '错误原因: ',
                                bold: true,
                                color: 'FF3B30',
                                size: 22
                            }),
                            new TextRun({
                                text: item.errorReason.join(', '),
                                size: 22
                            })
                        ],
                        spacing: { after: 200 }
                    })
                );
            }

            if (item.annotations && item.annotations.trim()) {
                children.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: '批注: ',
                                bold: true,
                                color: '34C759',
                                size: 22
                            }),
                            new TextRun({
                                text: item.annotations,
                                size: 22
                            })
                        ],
                        spacing: { after: 200 }
                    })
                );
            }

            if (item.images && item.images.length > 0) {
                try {
                    const imgData = await this._loadImage(item.images[0]);
                    children.push(
                        new Paragraph({
                            children: [
                                new ImageRun({
                                    data: imgData.data,
                                    transformation: {
                                        width: 300,
                                        height: (imgData.height * 300) / imgData.width
                                    }
                                })
                            ],
                            spacing: { after: 200 }
                        })
                    );
                } catch (error) {
                    console.error('Failed to add image:', error);
                }
            }

            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: '─'.repeat(50),
                            color: 'CCCCCC'
                        })
                    ],
                    spacing: { after: 400 }
                })
            );
        }

        const doc = new Document({
            sections: [{
                properties: {},
                children: children
            }]
        });

        const blob = await Packer.toBlob(doc);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${book.name}_错题本.docx`;
        a.click();
        URL.revokeObjectURL(url);
    }

    async exportToHTML(book, items) {
        let html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${book.name} - 错题本</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        h1 {
            color: #007AFF;
            text-align: center;
            margin-bottom: 10px;
        }
        .meta {
            text-align: center;
            color: #666;
            margin-bottom: 30px;
            font-size: 14px;
        }
        .question {
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
        }
        .question-title {
            font-size: 18px;
            font-weight: 600;
            color: #333;
            margin-bottom: 15px;
        }
        .question-content {
            font-size: 16px;
            line-height: 1.8;
            color: #555;
            margin-bottom: 15px;
        }
        .error-reason {
            background-color: #FFF5F5;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 15px;
        }
        .error-reason strong {
            color: #FF3B30;
        }
        .annotations {
            background-color: #F0FFF4;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 15px;
        }
        .annotations strong {
            color: #34C759;
        }
        .question-image {
            max-width: 100%;
            border-radius: 8px;
            margin-top: 10px;
        }
        .divider {
            text-align: center;
            color: #ccc;
            margin: 30px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>${book.name}</h1>
        <div class="meta">导出时间: ${new Date().toLocaleString('zh-CN')}</div>
`;

        items.forEach((item, index) => {
            html += `
        <div class="question">
            <div class="question-title">题目 ${index + 1}</div>
            <div class="question-content">${this._escapeHtml(item.questionText)}</div>
`;

            if (item.errorReason && item.errorReason.length > 0) {
                html += `
            <div class="error-reason">
                <strong>错误原因:</strong> ${this._escapeHtml(item.errorReason.join(', '))}
            </div>
`;
            }

            if (item.annotations && item.annotations.trim()) {
                html += `
            <div class="annotations">
                <strong>批注:</strong> ${this._escapeHtml(item.annotations)}
            </div>
`;
            }

            if (item.images && item.images.length > 0) {
                html += `
            <img src="${item.images[0]}" alt="题目图片" class="question-image">
`;
            }

            html += `
        </div>
        <div class="divider">${'─'.repeat(50)}</div>
`;
        });

        html += `
    </div>
</body>
</html>`;

        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${book.name}_错题本.html`;
        a.click();
        URL.revokeObjectURL(url);
    }

    async exportToJSON(book, items) {
        const data = {
            book: book,
            items: items,
            exportTime: new Date().toISOString(),
            version: '1.0'
        };

        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${book.name}_错题本.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    async shareContent(book, items) {
        if (navigator.share) {
            const text = items.map((item, index) => {
                return `题目 ${index + 1}:\n${item.questionText}\n\n错误原因: ${item.errorReason.join(', ')}\n\n批注: ${item.annotations}\n\n`;
            }).join('---\n\n');

            try {
                await navigator.share({
                    title: book.name,
                    text: text
                });
            } catch (error) {
                console.error('Share failed:', error);
                throw error;
            }
        } else {
            throw new Error('Web Share API not supported');
        }
    }

    async _loadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';

            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);

                resolve({
                    data: canvas.toDataURL('image/jpeg', 0.9),
                    width: img.width,
                    height: img.height
                });
            };

            img.onerror = () => {
                reject(new Error('Failed to load image'));
            };

            img.src = url;
        });
    }

    _escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async exportToMarkdown(book, items) {
        let markdown = `# ${book.name}\n\n`;
        markdown += `导出时间: ${new Date().toLocaleString('zh-CN')}\n\n`;
        markdown += `---\n\n`;

        items.forEach((item, index) => {
            markdown += `## 题目 ${index + 1}\n\n`;
            markdown += `${item.questionText}\n\n`;

            if (item.errorReason && item.errorReason.length > 0) {
                markdown += `**错误原因:** ${item.errorReason.join(', ')}\n\n`;
            }

            if (item.annotations && item.annotations.trim()) {
                markdown += `**批注:** ${item.annotations}\n\n`;
            }

            if (item.images && item.images.length > 0) {
                markdown += `![题目图片](${item.images[0]})\n\n`;
            }

            markdown += `---\n\n`;
        });

        const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${book.name}_错题本.md`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

const exportService = new ExportService();