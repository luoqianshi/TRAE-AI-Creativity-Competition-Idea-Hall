document.addEventListener('DOMContentLoaded', function() {
    initTabs();
    initImageUpload();
    initColorExtract();
    initAIGenerate();
    initDynamicFields();
    initPreviewTabs();
    initExport();
    initColorSync();
    updatePreview();

    const inputs = document.querySelectorAll('.token-group input, .token-group textarea');
    inputs.forEach(input => {
        input.addEventListener('input', updatePreview);
    });
});

function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const tabId = this.dataset.tab;
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
}

function initImageUpload() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('image-upload');
    const previewImage = document.getElementById('preview-image');
    const placeholder = document.querySelector('.upload-placeholder');

    uploadArea.addEventListener('click', () => fileInput.click());

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    function handleFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('请上传图片文件');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            previewImage.src = e.target.result;
            previewImage.style.display = 'block';
            placeholder.style.display = 'none';
            document.getElementById('extract-colors').disabled = false;
        };
        reader.readAsDataURL(file);
    }
}

function initColorExtract() {
    const extractBtn = document.getElementById('extract-colors');
    extractBtn.addEventListener('click', extractColorsFromImage);
}

function extractColorsFromImage() {
    const image = document.getElementById('preview-image');
    if (!image.src) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.crossOrigin = 'anonymous';
    img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const colors = getDominantColors(ctx, canvas.width, canvas.height);
        updateColorFields(colors);
        updatePreview();
    };
    img.src = image.src;
}

function getDominantColors(ctx, width, height) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    const colorMap = {};
    
    const sampleSize = 10;
    for (let y = 0; y < height; y += sampleSize) {
        for (let x = 0; x < width; x += sampleSize) {
            const index = (y * width + x) * 4;
            const r = pixels[index];
            const g = pixels[index + 1];
            const b = pixels[index + 2];
            const a = pixels[index + 3];
            
            if (a < 128) continue;
            
            const hex = rgbToHex(r, g, b);
            const key = hex;
            colorMap[key] = (colorMap[key] || 0) + 1;
        }
    }
    
    const sortedColors = Object.keys(colorMap)
        .sort((a, b) => colorMap[b] - colorMap[a])
        .slice(0, 6);
    
    return sortedColors;
}

function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

function updateColorFields(colors) {
    const colorList = document.getElementById('color-list');
    const colorNames = ['primary', 'secondary', 'tertiary', 'neutral', 'accent', 'surface'];
    
    colors.forEach((color, index) => {
        let colorItem;
        if (index < colorList.children.length) {
            colorItem = colorList.children[index];
        } else {
            colorItem = createColorItem();
            colorList.appendChild(colorItem);
        }
        
        colorItem.querySelector('.color-name').value = colorNames[index] || `color-${index + 1}`;
        colorItem.querySelector('.color-value').value = color;
        colorItem.querySelector('.color-hex').value = color;
    });
}

function initAIGenerate() {
    const generateBtn = document.getElementById('generate-from-text');
    generateBtn.addEventListener('click', generateFromText);
}

function generateFromText() {
    const description = document.getElementById('design-desc').value;
    if (!description.trim()) {
        alert('请输入设计描述');
        return;
    }

    const mockDesigns = [
        {
            name: 'Modern Blue',
            colors: { primary: '#1e40af', secondary: '#3b82f6', tertiary: '#60a5fa', neutral: '#f3f4f6', accent: '#f59e0b' },
            typography: { h1: { fontFamily: 'Inter', fontSize: '2.5rem' }, body: { fontFamily: 'Inter', fontSize: '1rem' } },
            description: '现代简约风格，以深蓝色为主色调，搭配明亮的蓝色渐变，适合科技类产品。'
        },
        {
            name: 'Warm Earth',
            colors: { primary: '#78350f', secondary: '#92400e', tertiary: '#d97706', neutral: '#fef3c7', accent: '#059669' },
            typography: { h1: { fontFamily: 'Georgia', fontSize: '3rem' }, body: { fontFamily: 'Georgia', fontSize: '1rem' } },
            description: '温暖的大地色系，适合生活类应用，给人亲切舒适的感觉。'
        },
        {
            name: 'Minimal Dark',
            colors: { primary: '#1f2937', secondary: '#374151', tertiary: '#4b5563', neutral: '#ffffff', accent: '#8b5cf6' },
            typography: { h1: { fontFamily: 'SF Pro Display', fontSize: '2.75rem' }, body: { fontFamily: 'SF Pro Text', fontSize: '1rem' } },
            description: '深色极简风格，紫色作为点缀色，适合高端产品设计。'
        },
        {
            name: 'Fresh Green',
            colors: { primary: '#065f46', secondary: '#0d9488', tertiary: '#14b8a6', neutral: '#f0fdf4', accent: '#ef4444' },
            typography: { h1: { fontFamily: 'Roboto', fontSize: '2.5rem' }, body: { fontFamily: 'Roboto', fontSize: '1rem' } },
            description: '清新的绿色调，适合环保、健康类应用，传达自然活力的感觉。'
        }
    ];

    const randomDesign = mockDesigns[Math.floor(Math.random() * mockDesigns.length)];
    
    document.getElementById('design-name').value = randomDesign.name;
    document.getElementById('design-description').value = randomDesign.description;
    
    const colorList = document.getElementById('color-list');
    let colorIndex = 0;
    for (const [name, value] of Object.entries(randomDesign.colors)) {
        let colorItem;
        if (colorIndex < colorList.children.length) {
            colorItem = colorList.children[colorIndex];
        } else {
            colorItem = createColorItem();
            colorList.appendChild(colorItem);
        }
        colorItem.querySelector('.color-name').value = name;
        colorItem.querySelector('.color-value').value = value;
        colorItem.querySelector('.color-hex').value = value;
        colorIndex++;
    }
    
    const typographyList = document.getElementById('typography-list');
    let typoIndex = 0;
    for (const [name, value] of Object.entries(randomDesign.typography)) {
        let typoItem;
        if (typoIndex < typographyList.children.length) {
            typoItem = typographyList.children[typoIndex];
        } else {
            typoItem = createTypographyItem();
            typographyList.appendChild(typoItem);
        }
        typoItem.querySelector('.typography-name').value = name;
        typoItem.querySelector('.font-family').value = value.fontFamily;
        typoItem.querySelector('.font-size').value = value.fontSize;
        typoIndex++;
    }
    
    updatePreview();
    alert('设计令牌已生成！您可以在右侧预览并进行调整。');
}

function initDynamicFields() {
    document.getElementById('add-color').addEventListener('click', addColor);
    document.getElementById('add-typography').addEventListener('click', addTypography);
    document.getElementById('add-component').addEventListener('click', addComponent);
}

function addColor() {
    const colorList = document.getElementById('color-list');
    const item = createColorItem();
    colorList.appendChild(item);
    updatePreview();
}

function createColorItem(name = '', value = '#ffffff') {
    const div = document.createElement('div');
    div.className = 'color-item';
    div.innerHTML = `
        <input type="text" class="color-name" placeholder="颜色名称" value="${name}">
        <input type="color" class="color-value" value="${value}">
        <input type="text" class="color-hex" value="${value}">
        <button class="btn-remove" onclick="removeColor(this)"><i class="fas fa-trash"></i></button>
    `;
    syncColorInputs(div);
    return div;
}

function removeColor(btn) {
    const colorList = document.getElementById('color-list');
    if (colorList.children.length > 1) {
        btn.parentElement.remove();
        updatePreview();
    }
}

function addTypography() {
    const typographyList = document.getElementById('typography-list');
    const item = createTypographyItem();
    typographyList.appendChild(item);
    updatePreview();
}

function createTypographyItem(name = '', fontFamily = '', fontSize = '') {
    const div = document.createElement('div');
    div.className = 'typography-item';
    div.innerHTML = `
        <input type="text" class="typography-name" placeholder="样式名称" value="${name}">
        <input type="text" class="font-family" placeholder="字体" value="${fontFamily || 'Inter'}">
        <input type="text" class="font-size" placeholder="字号" value="${fontSize || '1rem'}">
        <button class="btn-remove" onclick="removeTypography(this)"><i class="fas fa-trash"></i></button>
    `;
    return div;
}

function removeTypography(btn) {
    const typographyList = document.getElementById('typography-list');
    if (typographyList.children.length > 1) {
        btn.parentElement.remove();
        updatePreview();
    }
}

function addComponent() {
    const componentList = document.getElementById('component-list');
    const item = createComponentItem();
    componentList.appendChild(item);
    updatePreview();
}

function createComponentItem(name = '') {
    const div = document.createElement('div');
    div.className = 'component-item';
    div.innerHTML = `
        <input type="text" class="component-name" placeholder="组件名称" value="${name || 'new-component'}">
        <div class="component-props">
            <input type="text" class="prop-key" placeholder="属性" value="backgroundColor">
            <input type="text" class="prop-value" placeholder="值" value="{colors.primary}">
        </div>
        <button class="btn-add-prop" onclick="addProp(this)"><i class="fas fa-plus"></i></button>
        <button class="btn-remove" onclick="removeComponent(this)"><i class="fas fa-trash"></i></button>
    `;
    return div;
}

function addProp(btn) {
    const componentItem = btn.parentElement;
    const propsContainer = componentItem.querySelector('.component-props');
    const newProp = document.createElement('div');
    newProp.className = 'component-props';
    newProp.innerHTML = `
        <input type="text" class="prop-key" placeholder="属性">
        <input type="text" class="prop-value" placeholder="值">
    `;
    componentItem.insertBefore(newProp, btn);
    updatePreview();
}

function removeComponent(btn) {
    const componentList = document.getElementById('component-list');
    if (componentList.children.length > 1) {
        btn.parentElement.remove();
        updatePreview();
    }
}

function initColorSync() {
    const colorItems = document.querySelectorAll('.color-item');
    colorItems.forEach(item => syncColorInputs(item));
}

function syncColorInputs(item) {
    const colorPicker = item.querySelector('.color-value');
    const hexInput = item.querySelector('.color-hex');
    
    colorPicker.addEventListener('input', () => {
        hexInput.value = colorPicker.value;
        updatePreview();
    });
    
    hexInput.addEventListener('input', () => {
        if (/^#[0-9A-Fa-f]{6}$/.test(hexInput.value)) {
            colorPicker.value = hexInput.value;
            updatePreview();
        }
    });
}

function initPreviewTabs() {
    const previewTabBtns = document.querySelectorAll('.preview-tab-btn');
    previewTabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            previewTabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const tabId = this.dataset.previewTab;
            document.querySelectorAll('.preview-tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${tabId}-preview`).classList.add('active');
        });
    });
}

function updatePreview() {
    const designData = collectDesignData();
    updateMarkdownPreview(designData);
    updateJsonPreview(designData);
    updateVisualPreview(designData);
}

function collectDesignData() {
    const colors = {};
    document.querySelectorAll('.color-item').forEach(item => {
        const name = item.querySelector('.color-name').value.trim();
        const value = item.querySelector('.color-hex').value.trim();
        if (name && value) {
            colors[name] = value;
        }
    });

    const typography = {};
    document.querySelectorAll('.typography-item').forEach(item => {
        const name = item.querySelector('.typography-name').value.trim();
        const fontFamily = item.querySelector('.font-family').value.trim();
        const fontSize = item.querySelector('.font-size').value.trim();
        if (name) {
            typography[name] = { fontFamily, fontSize };
        }
    });

    const rounded = {};
    document.querySelectorAll('.token-group:nth-child(4) .dimension-item').forEach(item => {
        const name = item.querySelector('.dim-name').value.trim();
        const value = item.querySelector('.dim-value').value.trim();
        if (name && value) {
            rounded[name] = value;
        }
    });

    const spacing = {};
    document.querySelectorAll('.token-group:nth-child(5) .dimension-item').forEach(item => {
        const name = item.querySelector('.dim-name').value.trim();
        const value = item.querySelector('.dim-value').value.trim();
        if (name && value) {
            spacing[name] = value;
        }
    });

    const components = {};
    document.querySelectorAll('.component-item').forEach(item => {
        const name = item.querySelector('.component-name').value.trim();
        if (name) {
            const props = {};
            item.querySelectorAll('.component-props').forEach(propItem => {
                const key = propItem.querySelector('.prop-key').value.trim();
                const value = propItem.querySelector('.prop-value').value.trim();
                if (key && value) {
                    props[key] = value;
                }
            });
            components[name] = props;
        }
    });

    return {
        version: document.getElementById('design-version').value.trim(),
        name: document.getElementById('design-name').value.trim(),
        description: document.getElementById('design-description').value.trim(),
        colors,
        typography,
        rounded,
        spacing,
        components,
        overview: document.getElementById('design-overview').value.trim(),
        colorsDesc: document.getElementById('design-colors').value.trim(),
        typographyDesc: document.getElementById('design-typography').value.trim()
    };
}

function updateMarkdownPreview(data) {
    let markdown = '---\n';
    
    if (data.version) markdown += `version: "${data.version}"\n`;
    markdown += `name: "${data.name}"\n`;
    if (data.description) markdown += `description: "${data.description}"\n`;
    
    markdown += '\ncolors:\n';
    for (const [name, value] of Object.entries(data.colors)) {
        markdown += `  ${name}: "${value}"\n`;
    }
    
    markdown += '\ntypography:\n';
    for (const [name, value] of Object.entries(data.typography)) {
        markdown += `  ${name}:\n`;
        if (value.fontFamily) markdown += `    fontFamily: "${value.fontFamily}"\n`;
        if (value.fontSize) markdown += `    fontSize: "${value.fontSize}"\n`;
    }
    
    markdown += '\nrounded:\n';
    for (const [name, value] of Object.entries(data.rounded)) {
        markdown += `  ${name}: ${value}\n`;
    }
    
    markdown += '\nspacing:\n';
    for (const [name, value] of Object.entries(data.spacing)) {
        markdown += `  ${name}: ${value}\n`;
    }
    
    if (Object.keys(data.components).length > 0) {
        markdown += '\ncomponents:\n';
        for (const [name, props] of Object.entries(data.components)) {
            markdown += `  ${name}:\n`;
            for (const [propKey, propValue] of Object.entries(props)) {
                markdown += `    ${propKey}: "${propValue}"\n`;
            }
        }
    }
    
    markdown += '---\n\n';
    
    if (data.overview) {
        markdown += `## Overview\n\n${data.overview}\n\n`;
    } else {
        markdown += `## Overview\n\n${data.description || '暂无描述'}\n\n`;
    }
    
    if (data.colorsDesc) {
        markdown += `## Colors\n\n${data.colorsDesc}\n\n`;
    } else {
        markdown += '## Colors\n\n';
        for (const [name, value] of Object.entries(data.colors)) {
            markdown += `- **${name} (${value})**\n`;
        }
        markdown += '\n';
    }
    
    if (data.typographyDesc) {
        markdown += `## Typography\n\n${data.typographyDesc}\n\n`;
    } else {
        markdown += '## Typography\n\n';
        for (const [name, value] of Object.entries(data.typography)) {
            markdown += `- **${name}**: ${value.fontFamily}, ${value.fontSize}\n`;
        }
        markdown += '\n';
    }
    
    markdown += '## Layout\n\n';
    markdown += '## Elevation & Depth\n\n';
    markdown += '## Shapes\n\n';
    
    if (Object.keys(data.components).length > 0) {
        markdown += '## Components\n\n';
        for (const [name, props] of Object.entries(data.components)) {
            markdown += `### ${name}\n\n`;
            for (const [propKey, propValue] of Object.entries(props)) {
                markdown += `- ${propKey}: ${propValue}\n`;
            }
            markdown += '\n';
        }
    }
    
    document.getElementById('preview-text').textContent = markdown;
}

function updateJsonPreview(data) {
    const jsonData = {
        version: data.version,
        name: data.name,
        description: data.description,
        colors: data.colors,
        typography: data.typography,
        rounded: data.rounded,
        spacing: data.spacing,
        components: data.components
    };
    document.getElementById('json-text').textContent = JSON.stringify(jsonData, null, 2);
}

function updateVisualPreview(data) {
    const primaryColor = data.colors.primary || '#6366f1';
    const secondaryColor = data.colors.secondary || '#8b5cf6';
    const tertiaryColor = data.colors.tertiary || '#B8422E';
    const neutralColor = data.colors.neutral || '#ffffff';

    const previewHeaderBar = document.querySelector('.preview-header-bar');
    const previewLogo = document.querySelector('.preview-logo');
    const previewBtn = document.getElementById('preview-btn');
    const cardIcons = document.querySelectorAll('.card-icon');

    previewHeaderBar.style.backgroundColor = neutralColor;
    previewLogo.style.background = `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`;
    previewBtn.style.backgroundColor = tertiaryColor;
    previewBtn.style.color = isDark(tertiaryColor) ? '#ffffff' : '#000000';
    
    cardIcons.forEach((icon, index) => {
        const colors = Object.values(data.colors);
        icon.style.backgroundColor = colors[index % colors.length] || primaryColor;
    });

    const colorSwatchesContainer = document.getElementById('preview-color-swatches');
    colorSwatchesContainer.innerHTML = '';
    
    for (const [name, value] of Object.entries(data.colors)) {
        const swatch = document.createElement('div');
        swatch.className = 'color-swatch';
        swatch.innerHTML = `
            <div class="swatch" style="background-color: ${value}"></div>
            <div class="name">${name}</div>
            <div class="value">${value}</div>
        `;
        colorSwatchesContainer.appendChild(swatch);
    }
}

function isDark(color) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 128;
}

function initExport() {
    document.getElementById('export-md').addEventListener('click', exportMD);
    document.getElementById('export-json').addEventListener('click', exportJSON);
    document.getElementById('export-both').addEventListener('click', exportBoth);
}

function exportMD() {
    const designData = collectDesignData();
    let markdown = '---\n';
    
    if (designData.version) markdown += `version: "${designData.version}"\n`;
    markdown += `name: "${designData.name}"\n`;
    if (designData.description) markdown += `description: "${designData.description}"\n`;
    
    markdown += '\ncolors:\n';
    for (const [name, value] of Object.entries(designData.colors)) {
        markdown += `  ${name}: "${value}"\n`;
    }
    
    markdown += '\ntypography:\n';
    for (const [name, value] of Object.entries(designData.typography)) {
        markdown += `  ${name}:\n`;
        if (value.fontFamily) markdown += `    fontFamily: "${value.fontFamily}"\n`;
        if (value.fontSize) markdown += `    fontSize: "${value.fontSize}"\n`;
    }
    
    markdown += '\nrounded:\n';
    for (const [name, value] of Object.entries(designData.rounded)) {
        markdown += `  ${name}: ${value}\n`;
    }
    
    markdown += '\nspacing:\n';
    for (const [name, value] of Object.entries(designData.spacing)) {
        markdown += `  ${name}: ${value}\n`;
    }
    
    if (Object.keys(designData.components).length > 0) {
        markdown += '\ncomponents:\n';
        for (const [name, props] of Object.entries(designData.components)) {
            markdown += `  ${name}:\n`;
            for (const [propKey, propValue] of Object.entries(props)) {
                markdown += `    ${propKey}: "${propValue}"\n`;
            }
        }
    }
    
    markdown += '---\n\n';
    
    if (designData.overview) {
        markdown += `## Overview\n\n${designData.overview}\n\n`;
    } else {
        markdown += `## Overview\n\n${designData.description || '暂无描述'}\n\n`;
    }
    
    if (designData.colorsDesc) {
        markdown += `## Colors\n\n${designData.colorsDesc}\n\n`;
    } else {
        markdown += '## Colors\n\n';
        for (const [name, value] of Object.entries(designData.colors)) {
            markdown += `- **${name} (${value})**\n`;
        }
        markdown += '\n';
    }
    
    if (designData.typographyDesc) {
        markdown += `## Typography\n\n${designData.typographyDesc}\n\n`;
    } else {
        markdown += '## Typography\n\n';
        for (const [name, value] of Object.entries(designData.typography)) {
            markdown += `- **${name}**: ${value.fontFamily}, ${value.fontSize}\n`;
        }
        markdown += '\n';
    }
    
    markdown += '## Layout\n\n';
    markdown += '## Elevation & Depth\n\n';
    markdown += '## Shapes\n\n';
    
    if (Object.keys(designData.components).length > 0) {
        markdown += '## Components\n\n';
        for (const [name, props] of Object.entries(designData.components)) {
            markdown += `### ${name}\n\n`;
            for (const [propKey, propValue] of Object.entries(props)) {
                markdown += `- ${propKey}: ${propValue}\n`;
            }
            markdown += '\n';
        }
    }

    downloadFile(`${designData.name || 'design'}.md`, markdown, 'text/markdown');
}

function exportJSON() {
    const designData = collectDesignData();
    const jsonData = {
        version: designData.version,
        name: designData.name,
        description: designData.description,
        colors: designData.colors,
        typography: designData.typography,
        rounded: designData.rounded,
        spacing: designData.spacing,
        components: designData.components
    };
    downloadFile(`${designData.name || 'design'}.json`, JSON.stringify(jsonData, null, 2), 'application/json');
}

function exportBoth() {
    exportMD();
    setTimeout(exportJSON, 500);
}

function downloadFile(filename, content, type) {
    const blob = new Blob([content], { type: type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}