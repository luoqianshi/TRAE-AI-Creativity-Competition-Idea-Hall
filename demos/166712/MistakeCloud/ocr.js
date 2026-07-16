class OCRService {
    constructor() {
        this.apiEndpoint = 'https://api.ocr.space/parse/image';
        this.apiKey = 'K87457587488957';
        this.stream = null;
        this.videoElement = null;
    }

    async initCamera(videoElement) {
        try {
            this.videoElement = videoElement;
            const constraints = {
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            };

            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            videoElement.srcObject = this.stream;
            videoElement.play();

            return true;
        } catch (error) {
            console.error('Camera initialization failed:', error);
            throw new Error('无法访问相机，请检查权限设置');
        }
    }

    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        if (this.videoElement) {
            this.videoElement.srcObject = null;
        }
    }

    async captureImage(videoElement) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            canvas.width = videoElement.videoWidth;
            canvas.height = videoElement.videoHeight;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('Failed to capture image'));
                }
            }, 'image/jpeg', 0.9);
        });
    }

    async selectFromGallery() {
        return new Promise((resolve, reject) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.multiple = true;

            input.onchange = (event) => {
                const files = Array.from(event.target.files);
                if (files.length > 0) {
                    resolve(files);
                } else {
                    reject(new Error('No file selected'));
                }
            };

            input.oncancel = () => {
                reject(new Error('File selection cancelled'));
            };

            input.click();
        });
    }

    async recognizeText(imageBlob, options = {}) {
        const formData = new FormData();
        formData.append('file', imageBlob);
        formData.append('language', options.language || 'chs');
        formData.append('isOverlayRequired', 'false');
        formData.append('detectOrientation', 'true');
        formData.append('scale', 'true');
        formData.append('OCREngine', '2');

        try {
            const response = await fetch(`${this.apiEndpoint}?apikey=${this.apiKey}`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.IsErroredOnProcessing) {
                const errorMsg = data.ErrorMessage || 'OCR处理失败';
                console.error('OCR Error:', errorMsg);
                throw new Error(errorMsg);
            }

            if (!data.ParsedResults || data.ParsedResults.length === 0) {
                console.warn('No text detected in image');
                return {
                    text: '',
                    confidence: 0,
                    processingTime: 0,
                    source: 'OCRSpace'
                };
            }

            const result = data.ParsedResults[0];
            return {
                text: result.ParsedText || '',
                confidence: result.TextOverlay?.Lines?.[0]?.WordConfidence || 0,
                processingTime: data.ProcessingTime,
                source: 'OCRSpace'
            };
        } catch (error) {
            console.error('OCR recognition failed:', error);
            throw error;
        }
    }

    async recognizeTextWithFallback(imageBlob, options = {}) {
        try {
            return await this.recognizeText(imageBlob, options);
        } catch (error) {
            console.error('OCR recognition failed:', error);
            throw error;
        }
    }

    async preprocessImage(imageBlob) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(imageBlob);

            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                canvas.width = img.width;
                canvas.height = img.height;

                ctx.drawImage(img, 0, 0);

                URL.revokeObjectURL(url);

                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        resolve(imageBlob);
                    }
                }, 'image/jpeg', 0.9);
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                resolve(imageBlob);
            };

            img.src = url;
        });
    }

    formatRecognizedText(text) {
        return text
            .replace(/\s+/g, ' ')
            .replace(/\n\s*\n/g, '\n\n')
            .trim();
    }

    extractQuestions(text) {
        const questionPatterns = [
            /(?:第|Question|Q)\s*\d+[.、．]\s*([^?？!！\n]+)/g,
            /(?:\d+[.、．]\s*)([^?？!！\n]+)/g
        ];

        const questions = [];

        for (const pattern of questionPatterns) {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                if (match[1] && match[1].trim().length > 5) {
                    questions.push(match[1].trim());
                }
            }
        }

        if (questions.length === 0) {
            const sentences = text.split(/[?？!！\n]/);
            sentences.forEach(sentence => {
                if (sentence.trim().length > 10) {
                    questions.push(sentence.trim());
                }
            });
        }

        return questions;
    }
}

const ocrService = new OCRService();