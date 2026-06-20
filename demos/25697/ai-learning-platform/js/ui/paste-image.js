        // ========== Paste Image Listener ==========
        document.addEventListener('paste', function(e) {
            if (state.currentPage !== 'chat') return;
            const items = e.clipboardData && e.clipboardData.items;
            if (!items) return;
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    e.preventDefault();
                    const file = items[i].getAsFile();
                    const reader = new FileReader();
                    reader.onload = function(ev) {
                        state.uploadedImage = ev.target.result;
                        document.getElementById('previewImg').src = ev.target.result;
                        document.getElementById('imagePreview').classList.add('active');
                        // 隐藏文件input，避免遮挡预览图片和删除按钮
                        var imageInput = document.getElementById('imageInput');
                        if (imageInput) imageInput.style.display = 'none';
                        // 切换到图片tab
                        state.inputTab = 'image';
                        document.querySelectorAll('.input-tab').forEach(t => t.classList.remove('active'));
                        document.querySelectorAll('.input-tab')[1].classList.add('active');
                        document.getElementById('textInputWrapper').style.display = 'none';
                        document.getElementById('imageUploadArea').classList.add('active');
                        showToast('success', '图片已粘贴，可直接提交提问');
                    };
                    reader.readAsDataURL(file);
                    break;
                }
            }
        });

