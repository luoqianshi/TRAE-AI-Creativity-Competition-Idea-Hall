class App {
    constructor() {
        this.currentBook = null;
        this.currentItem = null;
        this.uploadedImages = [];
        this.recognizedText = '';
        this.score = 0;
        this.practiceQuestions = [];
        this.currentQuestionIndex = 0;
        this.practiceCorrect = 0;
        this.practiceWrong = 0;
        this.practiceScore = 0;
    }

    async init() {
        try {
            await storage.init();
            this.setupEventListeners();
            await this.loadBooks();
            this.loadScore();
        } catch (error) {
            console.error('App initialization failed:', error);
            alert('应用初始化失败，请刷新页面重试');
        }
    }

    setupEventListeners() {
        document.getElementById('searchBtn').addEventListener('click', () => this.toggleSearch());
        document.getElementById('closeSearchBtn').addEventListener('click', () => this.toggleSearch());
        document.getElementById('searchInput').addEventListener('input', (e) => this.handleSearch(e.target.value));
        document.getElementById('addBookBtn').addEventListener('click', () => this.showAddBookModal());
        document.getElementById('quickAddBookBtn').addEventListener('click', () => this.showAddBookModal());
        document.getElementById('addQuestionBtn').addEventListener('click', () => this.showAddQuestionModal());
        document.getElementById('exportBtn').addEventListener('click', () => this.showExportModal());
        document.getElementById('editBookBtn').addEventListener('click', () => this.showEditBookModal());
        document.getElementById('deleteBookBtn').addEventListener('click', () => this.deleteBook());
        document.getElementById('backToBookBtn').addEventListener('click', async () => {
            await this.autoSaveDrawing();
            this.showBookDetail();
        });
        document.getElementById('editQuestionBtn').addEventListener('click', () => this.showEditQuestionModal());
        document.getElementById('deleteQuestionBtn').addEventListener('click', () => this.deleteQuestion());
        document.getElementById('practiceBtn').addEventListener('click', () => this.startPractice());
        document.getElementById('backFromPracticeBtn').addEventListener('click', () => this.exitPractice());
        document.getElementById('submitAnswerBtn').addEventListener('click', () => this.submitAnswer());
        document.getElementById('nextQuestionBtn').addEventListener('click', () => this.nextQuestion());
        document.getElementById('restartPracticeBtn').addEventListener('click', () => this.startPractice());
        document.getElementById('backFromSummaryBtn').addEventListener('click', () => this.exitPractice());

        const modal = document.getElementById('modal');
        modal.querySelector('.close').addEventListener('click', () => this.closeModal());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    async loadBooks() {
        try {
            const books = await storage.getBooks();
            this.renderBookList(books);
        } catch (error) {
            console.error('Failed to load books:', error);
        }
    }

    renderBookList(books) {
        const bookList = document.getElementById('bookList');
        bookList.innerHTML = '';

        if (books.length === 0) {
            bookList.innerHTML = `
                <div class="empty-state">
                    <p>暂无错题本</p>
                    <p>点击上方按钮创建新的错题本</p>
                </div>
            `;
            return;
        }

        books.forEach(book => {
            const bookItem = document.createElement('div');
            bookItem.className = 'book-item';
            bookItem.dataset.id = book.id;

            bookItem.innerHTML = `
                <h3>${this.escapeHtml(book.name)}</h3>
                <p>${new Date(book.createdAt).toLocaleDateString('zh-CN')}</p>
            `;

            bookItem.addEventListener('click', () => this.selectBook(book.id));
            bookList.appendChild(bookItem);
        });
    }

    async selectBook(bookId) {
        try {
            const book = await storage.getBook(bookId);
            this.currentBook = book;

            document.querySelectorAll('.book-item').forEach(item => {
                item.classList.remove('active');
                if (parseInt(item.dataset.id) === bookId) {
                    item.classList.add('active');
                }
            });

            await this.showBookDetail();
        } catch (error) {
            console.error('Failed to select book:', error);
        }
    }

    async showBookDetail() {
        document.getElementById('welcomeScreen').style.display = 'none';
        document.getElementById('questionDetail').style.display = 'none';
        document.getElementById('bookDetail').style.display = 'block';

        document.getElementById('bookTitle').textContent = this.currentBook.name;

        try {
            const items = await storage.getItems(this.currentBook.id);
            this.renderQuestionList(items);
        } catch (error) {
            console.error('Failed to load questions:', error);
        }
    }

    renderQuestionList(items) {
        const questionList = document.getElementById('questionList');
        questionList.innerHTML = '';

        if (items.length === 0) {
            questionList.innerHTML = `
                <div class="empty-state">
                    <h3>暂无题目</h3>
                    <p>点击上方按钮添加题目</p>
                </div>
            `;
            return;
        }

        items.forEach(item => {
            const questionItem = document.createElement('div');
            questionItem.className = 'question-item';

            const previewImage = item.images && item.images.length > 0
                ? `<img src="${item.images[0]}" alt="题目图片" class="question-preview-image">`
                : `<div class="question-preview-image" style="display:flex;align-items:center;justify-content:center;color:#999;">无图片</div>`;

            const errorTags = item.errorReason && item.errorReason.length > 0
                ? item.errorReason.slice(0, 2).map(reason =>
                    `<span class="tag error">${this.escapeHtml(reason)}</span>`
                ).join('')
                : '';

            questionItem.innerHTML = `
                <div class="question-preview">
                    ${previewImage}
                    <div class="question-info">
                        <h4>${this.escapeHtml(item.questionText.substring(0, 50))}${item.questionText.length > 50 ? '...' : ''}</h4>
                        <p>${this.escapeHtml(item.annotations.substring(0, 100))}${item.annotations.length > 100 ? '...' : ''}</p>
                        <div class="question-tags">
                            ${errorTags}
                        </div>
                    </div>
                    <div class="question-actions">
                        <button class="action-btn edit-btn" onclick="event.stopPropagation(); app.showEditQuestionModal(${item.id})">✏️ 编辑</button>
                        <button class="action-btn delete-btn" onclick="event.stopPropagation(); app.handleDeleteQuestion(${item.id})">🗑️ 删除</button>
                    </div>
                </div>
            `;

            questionItem.addEventListener('click', () => this.selectQuestion(item.id));
            questionList.appendChild(questionItem);
        });
    }

    async selectQuestion(itemId) {
        try {
            const item = await storage.getItem(itemId);
            this.currentItem = item;

            document.getElementById('bookDetail').style.display = 'none';
            document.getElementById('questionDetail').style.display = 'block';

            this.renderQuestionDetail(item);
        } catch (error) {
            console.error('Failed to select question:', error);
        }
    }

    renderQuestionDetail(item) {
        const imagesContainer = document.getElementById('questionImages');
        imagesContainer.innerHTML = '';

        if (item.images && item.images.length > 0) {
            item.images.forEach((imageUrl, index) => {
                const container = document.createElement('div');
                container.className = 'image-container';

                const img = document.createElement('img');
                img.src = imageUrl;
                img.alt = '题目图片';
                img.onload = () => {
                    this.initDrawingCanvas(container, img, index, item.drawingData);
                };

                container.appendChild(img);
                imagesContainer.appendChild(container);
            });
        }

        document.getElementById('questionText').textContent = item.questionText;

        const errorReasonTags = document.getElementById('errorReasonTags');
        errorReasonTags.innerHTML = '';

        if (item.errorReason && item.errorReason.length > 0) {
            item.errorReason.forEach(reason => {
                const tag = document.createElement('span');
                tag.className = 'tag error';
                tag.textContent = reason;
                errorReasonTags.appendChild(tag);
            });
        } else {
            errorReasonTags.innerHTML = '<span class="tag">无错误原因</span>';
        }

        document.getElementById('annotationsContent').textContent = item.annotations || '无批注';
        
        const answerContent = document.getElementById('answerContent');
        if (answerContent) {
            answerContent.textContent = item.answer || '无答案';
        }
        
        document.getElementById('questionDate').textContent = `创建时间: ${new Date(item.createdAt).toLocaleString('zh-CN')}`;

        this.setupDrawingTools();
    }

    initDrawingCanvas(container, img, index, drawingData) {
        const canvas = document.createElement('canvas');
        canvas.id = `drawingCanvas_${index}`;
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        canvas.style.width = img.offsetWidth + 'px';
        canvas.style.height = img.offsetHeight + 'px';

        container.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (drawingData && drawingData[index]) {
            const tempImg = new Image();
            tempImg.src = drawingData[index];
            tempImg.onload = () => {
                ctx.drawImage(tempImg, 0, 0);
            };
        }

        let isDrawing = false;
        let lastX = 0;
        let lastY = 0;
        let savedCanvasState = null;

        const getCoordinates = (e) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            
            if (e.touches && e.touches.length > 0) {
                return {
                    x: (e.touches[0].clientX - rect.left) * scaleX,
                    y: (e.touches[0].clientY - rect.top) * scaleY
                };
            }
            return {
                x: (e.clientX - rect.left) * scaleX,
                y: (e.clientY - rect.top) * scaleY
            };
        };

        const drawShape = (startX, startY, endX, endY, color, tool, isPreview = false) => {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.fillStyle = 'transparent';
            ctx.beginPath();

            if (tool === 'line') {
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);
            } else if (tool === 'rect') {
                ctx.rect(startX, startY, endX - startX, endY - startY);
            } else if (tool === 'circle') {
                const radiusX = Math.abs(endX - startX);
                const radiusY = Math.abs(endY - startY);
                const radius = Math.max(radiusX, radiusY);
                ctx.ellipse(startX, startY, radius, radius, 0, 0, Math.PI * 2);
            } else if (tool === 'pen') {
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);
            } else if (tool === 'eraser') {
                ctx.globalCompositeOperation = 'destination-out';
                ctx.lineWidth = 20;
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);
            }

            ctx.stroke();
        };

        const saveState = () => {
            savedCanvasState = ctx.getImageData(0, 0, canvas.width, canvas.height);
        };

        const restoreState = () => {
            if (savedCanvasState) {
                ctx.putImageData(savedCanvasState, 0, 0);
            }
        };

        canvas.addEventListener('mousedown', (e) => {
            isDrawing = true;
            const coords = getCoordinates(e);
            lastX = coords.x;
            lastY = coords.y;
            
            const tool = this.currentDrawingTool || 'pen';
            if (tool === 'line' || tool === 'rect' || tool === 'circle') {
                saveState();
            }
        });

        canvas.addEventListener('mousemove', (e) => {
            if (!isDrawing) return;
            e.preventDefault();

            const coords = getCoordinates(e);
            const color = document.getElementById('drawColor').value;
            const tool = this.currentDrawingTool || 'pen';

            if (tool === 'line' || tool === 'rect' || tool === 'circle') {
                restoreState();
                drawShape(lastX, lastY, coords.x, coords.y, color, tool, true);
            } else {
                drawShape(lastX, lastY, coords.x, coords.y, color, tool);
                lastX = coords.x;
                lastY = coords.y;
            }
        });

        canvas.addEventListener('mouseup', () => {
            isDrawing = false;
            savedCanvasState = null;
        });

        canvas.addEventListener('mouseout', () => {
            isDrawing = false;
            savedCanvasState = null;
        });

        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            isDrawing = true;
            const coords = getCoordinates(e);
            lastX = coords.x;
            lastY = coords.y;
            
            const tool = this.currentDrawingTool || 'pen';
            if (tool === 'line' || tool === 'rect' || tool === 'circle') {
                saveState();
            }
        });

        canvas.addEventListener('touchmove', (e) => {
            if (!isDrawing) return;
            e.preventDefault();

            const coords = getCoordinates(e);
            const color = document.getElementById('drawColor').value;
            const tool = this.currentDrawingTool || 'pen';

            if (tool === 'line' || tool === 'rect' || tool === 'circle') {
                restoreState();
                drawShape(lastX, lastY, coords.x, coords.y, color, tool, true);
            } else {
                drawShape(lastX, lastY, coords.x, coords.y, color, tool);
                lastX = coords.x;
                lastY = coords.y;
            }
        });

        canvas.addEventListener('touchend', () => {
            isDrawing = false;
            savedCanvasState = null;
        });
    }

    setupDrawingTools() {
        this.currentDrawingTool = 'pen';

        const penBtn = document.getElementById('drawPenBtn');
        const lineBtn = document.getElementById('drawLineBtn');
        const rectBtn = document.getElementById('drawRectBtn');
        const circleBtn = document.getElementById('drawCircleBtn');
        const eraserBtn = document.getElementById('drawEraserBtn');
        const clearBtn = document.getElementById('drawClearBtn');
        const saveBtn = document.getElementById('drawSaveBtn');

        const setActiveTool = (tool) => {
            this.currentDrawingTool = tool;
            penBtn.classList.remove('active');
            lineBtn.classList.remove('active');
            rectBtn.classList.remove('active');
            circleBtn.classList.remove('active');
            eraserBtn.classList.remove('active');
            
            if (tool === 'pen') penBtn.classList.add('active');
            else if (tool === 'line') lineBtn.classList.add('active');
            else if (tool === 'rect') rectBtn.classList.add('active');
            else if (tool === 'circle') circleBtn.classList.add('active');
            else if (tool === 'eraser') eraserBtn.classList.add('active');
        };

        penBtn.onclick = () => setActiveTool('pen');
        lineBtn.onclick = () => setActiveTool('line');
        rectBtn.onclick = () => setActiveTool('rect');
        circleBtn.onclick = () => setActiveTool('circle');
        eraserBtn.onclick = () => setActiveTool('eraser');

        clearBtn.onclick = () => {
            if (!confirm('确定要清空所有绘图吗？')) return;
            const canvases = document.querySelectorAll('.question-images canvas');
            canvases.forEach(canvas => {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            });
        };

        saveBtn.onclick = async () => {
            await this.saveDrawingAnnotations();
        };
    }

    async autoSaveDrawing() {
        const canvases = document.querySelectorAll('.question-images canvas');
        let hasDrawing = false;
        
        canvases.forEach(canvas => {
            const ctx = canvas.getContext('2d');
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            for (let i = 3; i < imageData.data.length; i += 4) {
                if (imageData.data[i] !== 0) {
                    hasDrawing = true;
                    break;
                }
            }
        });

        if (hasDrawing && this.currentItem && this.currentItem.id) {
            await this.saveDrawingAnnotations();
        }
    }

    async saveDrawingAnnotations() {
        const canvases = document.querySelectorAll('.question-images canvas');
        const drawingData = [];

        canvases.forEach(canvas => {
            const dataUrl = canvas.toDataURL('image/png');
            drawingData.push(dataUrl);
        });

        if (this.currentItem && this.currentItem.id) {
            this.currentItem.drawingData = drawingData;
            try {
                await storage.updateItem(this.currentItem.id, this.currentItem);
                alert('批注已保存！');
            } catch (error) {
                console.error('Failed to save drawing annotations:', error);
                alert('保存批注失败，请重试');
            }
        }
    }

    showAddBookModal() {
        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <h2>创建错题本</h2>
            <form id="addBookForm" onsubmit="app.handleAddBook(event)">
                <div class="form-group">
                    <label for="bookName">错题本名称</label>
                    <input type="text" id="bookName" required placeholder="请输入错题本名称">
                </div>
                <div class="form-group">
                    <label for="bookDescription">描述（可选）</label>
                    <textarea id="bookDescription" placeholder="请输入描述"></textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="secondary-btn" onclick="app.closeModal()">取消</button>
                    <button type="submit" class="primary-btn">创建</button>
                </div>
            </form>
        `;

        this.openModal();
    }

    async handleAddBook(e) {
        e.preventDefault();
        const nameElement = document.getElementById('bookName');
        const descriptionElement = document.getElementById('bookDescription');

        if (!nameElement || !descriptionElement) {
            alert('表单元素未找到，请重试');
            return;
        }

        const name = nameElement.value.trim();
        const description = descriptionElement.value.trim();

        if (!name) {
            alert('请输入错题本名称');
            return;
        }

        try {
            await storage.addBook({ name, description });
            await this.loadBooks();
            this.closeModal();
        } catch (error) {
            console.error('Failed to add book:', error);
            alert('创建失败，请重试');
        }
    }

    showEditBookModal() {
        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <h2>编辑错题本</h2>
            <form id="editBookForm" onsubmit="app.handleEditBook(event)">
                <div class="form-group">
                    <label for="editBookName">错题本名称</label>
                    <input type="text" id="editBookName" required value="${this.escapeHtml(this.currentBook.name)}">
                </div>
                <div class="form-group">
                    <label for="editBookDescription">描述（可选）</label>
                    <textarea id="editBookDescription" placeholder="请输入描述">${this.escapeHtml(this.currentBook.description || '')}</textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="secondary-btn" onclick="app.closeModal()">取消</button>
                    <button type="submit" class="primary-btn">保存</button>
                </div>
            </form>
        `;

        this.openModal();
    }

    async handleEditBook(e) {
        e.preventDefault();
        const nameElement = document.getElementById('editBookName');
        const descriptionElement = document.getElementById('editBookDescription');

        if (!nameElement || !descriptionElement) {
            alert('表单元素未找到，请重试');
            return;
        }

        const name = nameElement.value.trim();
        const description = descriptionElement.value.trim();

        if (!name) {
            alert('请输入错题本名称');
            return;
        }

        try {
            await storage.updateBook(this.currentBook.id, { name, description });
            this.currentBook.name = name;
            this.currentBook.description = description;
            document.getElementById('bookTitle').textContent = name;
            await this.loadBooks();
            this.closeModal();
        } catch (error) {
            console.error('Failed to edit book:', error);
            alert('保存失败，请重试');
        }
    }

    async deleteBook() {
        if (!confirm('确定要删除这个错题本吗？此操作不可恢复。')) {
            return;
        }

        try {
            await storage.deleteBook(this.currentBook.id);
            this.currentBook = null;
            await this.loadBooks();
            document.getElementById('bookDetail').style.display = 'none';
            document.getElementById('welcomeScreen').style.display = 'flex';
        } catch (error) {
            console.error('Failed to delete book:', error);
            alert('删除失败，请重试');
        }
    }

    async showExportModal() {
        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <h2>导出错题本</h2>
            <div class="form-group">
                <label>选择导出格式</label>
                <div style="display: grid; gap: 12px;">
                    <button type="button" class="secondary-btn export-format" data-format="pdf">
                        📄 PDF 文档
                    </button>
                    <button type="button" class="secondary-btn export-format" data-format="docx">
                        📝 Word 文档
                    </button>
                    <button type="button" class="secondary-btn export-format" data-format="html">
                        🌐 HTML 网页
                    </button>
                    <button type="button" class="secondary-btn export-format" data-format="markdown">
                        📝 Markdown
                    </button>
                    <button type="button" class="secondary-btn export-format" data-format="json">
                        💾 JSON 数据
                    </button>
                </div>
            </div>
            <div class="form-actions">
                <button type="button" class="secondary-btn" onclick="app.closeModal()">取消</button>
            </div>
        `;

        modalBody.querySelectorAll('.export-format').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const format = e.target.dataset.format;
                await this.handleExport(format);
            });
        });

        this.openModal();
    }

    async handleExport(format) {
        try {
            const items = await storage.getItems(this.currentBook.id);

            if (items.length === 0) {
                alert('错题本中没有题目，无法导出');
                return;
            }

            switch (format) {
                case 'pdf':
                    await exportService.exportToPDF(this.currentBook, items);
                    break;
                case 'docx':
                    await exportService.exportToDOCX(this.currentBook, items);
                    break;
                case 'html':
                    await exportService.exportToHTML(this.currentBook, items);
                    break;
                case 'markdown':
                    await exportService.exportToMarkdown(this.currentBook, items);
                    break;
                case 'json':
                    await exportService.exportToJSON(this.currentBook, items);
                    break;
                default:
                    alert('不支持的导出格式');
            }

            this.closeModal();
        } catch (error) {
            console.error('Export failed:', error);
            alert('导出失败: ' + error.message);
        }
    }

    showAddQuestionModal() {
        this.uploadedImages = [];
        this.recognizedText = '';

        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <h2>添加题目</h2>
            <div class="form-group">
                <label>上传图片（可选）</label>
                <div class="image-upload" id="imageUpload">
                    <p>点击或拖拽图片到此处</p>
                    <p style="font-size: 12px; color: #999;">支持 JPG、PNG 格式</p>
                </div>
                <div class="image-preview" id="imagePreview"></div>
            </div>
            <div class="form-group">
                <label>或使用相机拍照</label>
                <button type="button" id="openCameraBtn" class="secondary-btn">打开相机</button>
            </div>
            <div id="cameraSection" style="display: none;">
                <div class="camera-preview">
                    <video id="cameraVideo" autoplay playsinline></video>
                </div>
                <div class="camera-controls">
                    <button type="button" id="captureBtn" class="primary-btn">拍照</button>
                    <button type="button" id="closeCameraBtn" class="secondary-btn">关闭相机</button>
                </div>
            </div>
            <div class="form-group" style="margin-top: 16px;">
                <button type="button" id="recognizeBtn" class="primary-btn" ${this.uploadedImages.length === 0 ? 'disabled' : ''}>📝 识别文字</button>
            </div>
            <div class="form-group">
                <label for="addQuestionText">题目内容</label>
                <textarea id="addQuestionText" class="question-textarea" placeholder="请输入题目内容，或使用上方OCR识别功能自动填充"></textarea>
            </div>
            <div class="form-group">
                <label for="errorReason">错误原因（可多选）</label>
                <select id="errorReason" multiple style="height: 120px;">
                    <option value="计算错误">计算错误</option>
                    <option value="概念不清">概念不清</option>
                    <option value="审题不仔细">审题不仔细</option>
                    <option value="粗心大意">粗心大意</option>
                    <option value="方法不当">方法不当</option>
                    <option value="时间不够">时间不够</option>
                </select>
                <p style="font-size: 12px; color: #999; margin-top: 4px;">按住 Ctrl/Cmd 键可多选</p>
            </div>
            <div class="form-group">
                <label for="answer">答案</label>
                <textarea id="answer" rows="3" placeholder="请输入题目答案"></textarea>
            </div>
            <div class="form-group">
                <label for="annotations">批注</label>
                <textarea id="annotations" rows="4" placeholder="请输入批注内容"></textarea>
            </div>
            <div class="form-actions">
                <button type="button" class="secondary-btn" onclick="app.closeModal()">取消</button>
                <button type="button" id="saveQuestionBtn" class="primary-btn" onclick="app.handleSaveQuestion()">保存</button>
            </div>
        `;

        this.setupImageUpload();
        this.setupCamera();
        this.setupOCR();

        this.openModal();
    }

    setupImageUpload() {
        const imageUpload = document.getElementById('imageUpload');
        const imagePreview = document.getElementById('imagePreview');

        imageUpload.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.multiple = true;

            input.onchange = (e) => {
                const files = Array.from(e.target.files);
                this.handleImageFiles(files);
            };

            input.click();
        });

        imageUpload.addEventListener('dragover', (e) => {
            e.preventDefault();
            imageUpload.classList.add('dragover');
        });

        imageUpload.addEventListener('dragleave', () => {
            imageUpload.classList.remove('dragover');
        });

        imageUpload.addEventListener('drop', (e) => {
            e.preventDefault();
            imageUpload.classList.remove('dragover');
            const files = Array.from(e.dataTransfer.files);
            this.handleImageFiles(files);
        });
    }

    async handleImageFiles(files) {
        for (const file of files) {
            if (file.type.startsWith('image/')) {
                try {
                    const compressedBase64 = await this.compressImage(file);
                    this.uploadedImages.push(compressedBase64);
                    this.updateImagePreview();
                } catch (error) {
                    console.error('Failed to compress image:', error);
                    alert('图片处理失败，请重试');
                }
            }
        }
    }

    async compressImage(file, maxWidth = 800, maxHeight = 800, quality = 0.6) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(file);

            img.onload = () => {
                let width = img.width;
                let height = img.height;

                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                URL.revokeObjectURL(url);

                const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                
                const maxSize = 500 * 1024;
                if (compressedDataUrl.length > maxSize && quality > 0.2) {
                    const retryQuality = Math.max(quality * 0.8, 0.2);
                    const retryCanvas = document.createElement('canvas');
                    retryCanvas.width = Math.round(width * 0.8);
                    retryCanvas.height = Math.round(height * 0.8);
                    const retryCtx = retryCanvas.getContext('2d');
                    retryCtx.drawImage(canvas, 0, 0, retryCanvas.width, retryCanvas.height);
                    resolve(retryCanvas.toDataURL('image/jpeg', retryQuality));
                } else {
                    resolve(compressedDataUrl);
                }
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error('Failed to load image'));
            };

            img.src = url;
        });
    }

    updateImagePreview() {
        const imagePreview = document.getElementById('imagePreview');
        imagePreview.innerHTML = '';

        this.uploadedImages.forEach((imageUrl, index) => {
            const img = document.createElement('img');
            img.src = imageUrl;
            img.onclick = () => {
                this.uploadedImages.splice(index, 1);
                this.updateImagePreview();
            };
            img.title = '点击删除';
            imagePreview.appendChild(img);
        });

        const recognizeBtn = document.getElementById('recognizeBtn');
        if (recognizeBtn) {
            recognizeBtn.disabled = this.uploadedImages.length === 0;
        }
    }

    async setupCamera() {
        const openCameraBtn = document.getElementById('openCameraBtn');
        const cameraSection = document.getElementById('cameraSection');
        const cameraVideo = document.getElementById('cameraVideo');
        const captureBtn = document.getElementById('captureBtn');
        const closeCameraBtn = document.getElementById('closeCameraBtn');

        openCameraBtn.addEventListener('click', async () => {
            try {
                await ocrService.initCamera(cameraVideo);
                cameraSection.style.display = 'block';
                openCameraBtn.disabled = true;
            } catch (error) {
                alert('无法访问相机: ' + error.message);
            }
        });

        captureBtn.addEventListener('click', async () => {
            try {
                const imageBlob = await ocrService.captureImage(cameraVideo);
                const compressedBase64 = await this.compressImage(imageBlob);
                this.uploadedImages.push(compressedBase64);
                this.updateImagePreview();
                ocrService.stopCamera();
                cameraSection.style.display = 'none';
                document.getElementById('openCameraBtn').disabled = false;
            } catch (error) {
                alert('拍照失败: ' + error.message);
            }
        });

        closeCameraBtn.addEventListener('click', () => {
            ocrService.stopCamera();
            cameraSection.style.display = 'none';
            document.getElementById('openCameraBtn').disabled = false;
        });
    }

    setupOCR() {
        const recognizeBtn = document.getElementById('recognizeBtn');

        recognizeBtn.onclick = async () => {
            if (this.uploadedImages.length === 0) {
                alert('请先上传图片');
                return;
            }

            recognizeBtn.textContent = '识别中...';
            recognizeBtn.disabled = true;

            try {
                const response = await fetch(this.uploadedImages[0]);
                const blob = await response.blob();
                const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });

                const result = await ocrService.recognizeTextWithFallback(file);
                console.log('OCR原始结果:', result);
                
                const recognizedText = result.text || '';
                this.recognizedText = ocrService.formatRecognizedText(recognizedText);

                console.log('OCR识别结果:', this.recognizedText);
                console.log('识别结果长度:', this.recognizedText.length);

                setTimeout(() => {
                    const questionTextElement = document.getElementById('addQuestionText');
                    console.log('找到输入框:', questionTextElement);
                    
                    if (questionTextElement) {
                        questionTextElement.value = this.recognizedText;
                        questionTextElement.focus();
                        console.log('已填充到输入框');
                        console.log('输入框当前值:', questionTextElement.value);
                        console.log('输入框当前值长度:', questionTextElement.value.length);
                        
                        if (this.recognizedText.length === 0) {
                            alert('OCR识别结果为空，请尝试上传更清晰的图片');
                        } else {
                            alert('OCR识别成功！已自动填充到输入框');
                        }
                    } else {
                        console.error('未找到输入框');
                        alert('未找到输入框，请重试');
                    }
                }, 100);

                recognizeBtn.textContent = '重新识别';
                recognizeBtn.disabled = false;
            } catch (error) {
                console.error('OCR识别失败:', error);
                alert('识别失败: ' + error.message);
                recognizeBtn.textContent = '识别文字';
                recognizeBtn.disabled = false;
            }
        };
    }

    async handleSaveQuestion() {
        const questionTextElement = document.getElementById('addQuestionText');
        const errorReasonSelect = document.getElementById('errorReason');
        const answerElement = document.getElementById('answer');
        const annotationsElement = document.getElementById('annotations');

        if (!questionTextElement || !errorReasonSelect || !annotationsElement) {
            alert('表单元素未找到，请重试');
            return;
        }

        const questionText = (questionTextElement.value || '').trim();
        const errorReason = Array.from(errorReasonSelect.selectedOptions || []).map(option => option.value);
        const answer = (answerElement.value || '').trim();
        const annotations = (annotationsElement.value || '').trim();

        if (!questionText && this.uploadedImages.length === 0) {
            alert('请输入题目内容或上传图片');
            return;
        }

        try {
            await storage.addItem({
                bookId: this.currentBook.id,
                questionText,
                errorReason,
                answer,
                annotations,
                images: this.uploadedImages
            });

            await this.showBookDetail();
            this.closeModal();
        } catch (error) {
            console.error('Failed to save question:', error);
            alert('保存失败，请重试');
        }
    }

    async showEditQuestionModal(itemId) {
        try {
            const item = await storage.getItem(itemId);
            this.currentItem = item;

            const modalBody = document.getElementById('modalBody');
            const errorReasons = ['计算错误', '概念不清', '审题不仔细', '粗心大意', '方法不当', '时间不够'];

            modalBody.innerHTML = `
                <h2>编辑题目</h2>
                <div class="form-group">
                    <label for="editQuestionText">题目内容</label>
                    <textarea id="editQuestionText" rows="6" class="question-textarea">${this.escapeHtml(item.questionText)}</textarea>
                </div>
                <div class="form-group">
                    <label>错误原因</label>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                        ${errorReasons.map(reason => `
                            <label style="display: flex; align-items: center; gap: 4px; cursor: pointer;">
                                <input type="checkbox" value="${reason}" ${item.errorReason.includes(reason) ? 'checked' : ''}>
                                ${reason}
                            </label>
                        `).join('')}
                    </div>
                </div>
                <div class="form-group">
                    <label for="editAnswer">答案</label>
                    <textarea id="editAnswer" rows="3">${this.escapeHtml(item.answer || '')}</textarea>
                </div>
                <div class="form-group">
                    <label for="editAnnotations">批注</label>
                    <textarea id="editAnnotations" rows="4">${this.escapeHtml(item.annotations)}</textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="secondary-btn" onclick="app.closeModal()">取消</button>
                    <button type="button" id="updateQuestionBtn" class="primary-btn" onclick="app.handleUpdateQuestion()">保存</button>
                </div>
            `;

            this.openModal();
        } catch (error) {
            console.error('Failed to load question for editing:', error);
            alert('加载题目失败');
        }
    }

    async handleDeleteQuestion(itemId) {
        if (!confirm('确定要删除这个题目吗？')) {
            return;
        }

        try {
            await storage.deleteItem(itemId);
            await this.showBookDetail();
        } catch (error) {
            console.error('Failed to delete question:', error);
            alert('删除失败，请重试');
        }
    }

    async handleUpdateQuestion() {
        const questionTextElement = document.getElementById('editQuestionText');
        const answerElement = document.getElementById('editAnswer');
        const annotationsElement = document.getElementById('editAnnotations');

        if (!questionTextElement || !annotationsElement) {
            alert('表单元素未找到，请重试');
            return;
        }

        const questionText = (questionTextElement.value || '').trim();
        const answer = (answerElement.value || '').trim();
        const errorReasonCheckboxes = document.querySelectorAll('input[type="checkbox"]:checked');
        const errorReason = Array.from(errorReasonCheckboxes || []).map(checkbox => checkbox.value);
        const annotations = (annotationsElement.value || '').trim();

        if (!questionText) {
            alert('请输入题目内容');
            return;
        }

        try {
            await storage.updateItem(this.currentItem.id, {
                questionText,
                errorReason,
                answer,
                annotations
            });

            this.currentItem.questionText = questionText;
            this.currentItem.errorReason = errorReason;
            this.currentItem.answer = answer;
            this.currentItem.annotations = annotations;

            this.renderQuestionDetail(this.currentItem);
            this.closeModal();
        } catch (error) {
            console.error('Failed to update question:', error);
            alert('保存失败，请重试');
        }
    }

    async deleteQuestion() {
        if (!confirm('确定要删除这个题目吗？此操作不可恢复。')) {
            return;
        }

        try {
            await storage.deleteItem(this.currentItem.id);
            this.currentItem = null;
            await this.showBookDetail();
        } catch (error) {
            console.error('Failed to delete question:', error);
            alert('删除失败，请重试');
        }
    }

    toggleSearch() {
        const searchContainer = document.getElementById('searchContainer');
        const isHidden = searchContainer.style.display === 'none';
        searchContainer.style.display = isHidden ? 'flex' : 'none';

        if (isHidden) {
            document.getElementById('searchInput').focus();
        } else {
            document.getElementById('searchInput').value = '';
            this.loadBooks();
        }
    }

    async handleSearch(query) {
        if (!query.trim()) {
            await this.loadBooks();
            return;
        }

        try {
            const items = await storage.searchItems(query);
            this.renderSearchResults(items, query);
        } catch (error) {
            console.error('Search failed:', error);
        }
    }

    async renderSearchResults(items, query) {
        const bookList = document.getElementById('bookList');
        bookList.innerHTML = `<h3>搜索结果: "${this.escapeHtml(query)}"</h3>`;

        if (items.length === 0) {
            bookList.innerHTML += `
                <div class="empty-state">
                    <p>未找到相关题目</p>
                </div>
            `;
            return;
        }

        items.forEach(item => {
            const bookItem = document.createElement('div');
            bookItem.className = 'book-item';

            bookItem.innerHTML = `
                <h4>${this.escapeHtml(item.questionText.substring(0, 50))}${item.questionText.length > 50 ? '...' : ''}</h4>
                <p>错题本ID: ${item.bookId}</p>
            `;

            bookItem.addEventListener('click', async () => {
                const book = await storage.getBook(item.bookId);
                this.currentBook = book;
                await this.selectQuestion(item.id);
            });

            bookList.appendChild(bookItem);
        });
    }

    openModal() {
        document.getElementById('modal').style.display = 'block';
    }

    closeModal() {
        document.getElementById('modal').style.display = 'none';
        ocrService.stopCamera();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async loadScore() {
        try {
            const score = localStorage.getItem('mistakeCloudScore');
            this.score = score ? parseInt(score) : 0;
            this.updateScoreDisplay();
        } catch (error) {
            console.error('Failed to load score:', error);
            this.score = 0;
        }
    }

    saveScore() {
        try {
            localStorage.setItem('mistakeCloudScore', this.score.toString());
            this.updateScoreDisplay();
        } catch (error) {
            console.error('Failed to save score:', error);
        }
    }

    updateScoreDisplay() {
        const scoreDisplay = document.getElementById('scoreDisplay');
        if (scoreDisplay) {
            scoreDisplay.textContent = `🏆 积分: ${this.score}`;
        }
    }

    async startPractice() {
        try {
            const books = await storage.getBooks();
            let allQuestions = [];

            for (const book of books) {
                const items = await storage.getItems(book.id);
                const validQuestions = items.filter(item => item.questionText && item.answer);
                allQuestions = allQuestions.concat(validQuestions);
            }

            if (allQuestions.length === 0) {
                alert('没有可用的练习题，请先添加带答案的错题！');
                return;
            }

            this.practiceQuestions = this.shuffleArray(allQuestions);
            this.currentQuestionIndex = 0;
            this.practiceCorrect = 0;
            this.practiceWrong = 0;
            this.practiceScore = 0;

            document.getElementById('welcomeScreen').style.display = 'none';
            document.getElementById('bookDetail').style.display = 'none';
            document.getElementById('questionDetail').style.display = 'none';
            document.getElementById('practiceScreen').style.display = 'block';
            document.getElementById('practiceSummary').style.display = 'none';

            this.renderPracticeQuestion();
        } catch (error) {
            console.error('Failed to start practice:', error);
            alert('开始练习失败，请重试');
        }
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    renderPracticeQuestion() {
        if (this.currentQuestionIndex >= this.practiceQuestions.length) {
            this.showPracticeSummary();
            return;
        }

        const question = this.practiceQuestions[this.currentQuestionIndex];

        document.getElementById('currentQuestionNum').textContent = this.currentQuestionIndex + 1;
        document.getElementById('totalQuestionNum').textContent = this.practiceQuestions.length;

        const practiceImages = document.getElementById('practiceImages');
        practiceImages.innerHTML = '';
        
        if (question.images && question.images.length > 0) {
            question.images.forEach(imageUrl => {
                const img = document.createElement('img');
                img.src = imageUrl;
                img.alt = '题目图片';
                practiceImages.appendChild(img);
            });
        }

        document.getElementById('practiceQuestionText').textContent = question.questionText || '无题目文字';
        document.getElementById('practiceAnswerInput').value = '';
        document.getElementById('practiceAnswerInput').disabled = false;
        document.getElementById('submitAnswerBtn').disabled = false;
        document.getElementById('resultSection').style.display = 'none';
        document.getElementById('resultSection').className = 'result-section';
        document.getElementById('correctAnswer').style.display = 'none';

        document.getElementById('practiceAnswerInput').focus();
    }

    submitAnswer() {
        const answerInput = document.getElementById('practiceAnswerInput');
        const userAnswer = answerInput.value.trim();

        if (!userAnswer) {
            alert('请输入答案');
            return;
        }

        const question = this.practiceQuestions[this.currentQuestionIndex];
        const correctAnswer = question.answer.trim();
        const isCorrect = this.compareAnswers(userAnswer, correctAnswer);

        const resultSection = document.getElementById('resultSection');
        const resultIcon = document.getElementById('resultIcon');
        const resultMessage = document.getElementById('resultMessage');
        const correctAnswerDiv = document.getElementById('correctAnswer');
        const correctAnswerText = document.getElementById('correctAnswerText');

        answerInput.disabled = true;
        document.getElementById('submitAnswerBtn').disabled = true;

        if (isCorrect) {
            resultSection.className = 'result-section correct';
            resultIcon.textContent = '🎉';
            resultMessage.textContent = '回答正确！+5 积分';
            this.practiceCorrect++;
            this.practiceScore += 5;
            this.score += 5;
        } else {
            resultSection.className = 'result-section wrong';
            resultIcon.textContent = '😢';
            resultMessage.textContent = '回答错误！+1 积分';
            correctAnswerDiv.style.display = 'block';
            correctAnswerText.textContent = correctAnswer;
            this.practiceWrong++;
            this.practiceScore += 1;
            this.score += 1;
        }

        resultSection.style.display = 'block';
        this.saveScore();
    }

    compareAnswers(userAnswer, correctAnswer) {
        const normalize = (str) => str.toLowerCase().replace(/\s+/g, '').replace(/[，,。.、]/g, '');
        return normalize(userAnswer) === normalize(correctAnswer);
    }

    nextQuestion() {
        this.currentQuestionIndex++;
        this.renderPracticeQuestion();
    }

    showPracticeSummary() {
        document.getElementById('practiceQuestionCard').style.display = 'none';
        document.getElementById('practiceSummary').style.display = 'block';

        document.getElementById('summaryTotal').textContent = this.practiceQuestions.length;
        document.getElementById('summaryCorrect').textContent = this.practiceCorrect;
        document.getElementById('summaryWrong').textContent = this.practiceWrong;
        document.getElementById('summaryScore').textContent = this.practiceScore;
    }

    exitPractice() {
        document.getElementById('practiceScreen').style.display = 'none';
        document.getElementById('practiceQuestionCard').style.display = 'block';
        
        if (this.currentBook) {
            document.getElementById('bookDetail').style.display = 'block';
        } else {
            document.getElementById('welcomeScreen').style.display = 'flex';
        }
    }
}

const app = new App();

window.addEventListener('error', (event) => {
    event.preventDefault();
    console.error('Global error:', event.error);
    alert('发生错误，请刷新页面重试');
});

window.addEventListener('unhandledrejection', (event) => {
    event.preventDefault();
    console.error('Unhandled promise rejection:', event.reason);
    alert('发生错误，请刷新页面重试');
});

document.addEventListener('DOMContentLoaded', () => {
    app.init();
});