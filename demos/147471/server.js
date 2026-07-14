const express = require('express');
const fs = require('fs');
const path = require('path');

console.log('[INFO] Loading Express...');
const app = express();
const PORT = 3000;

const WORDS_FILE = path.join(__dirname, 'words.json');

console.log('[INFO] Checking words.json file...');
function ensureWordsFileExists() {
    try {
        if (!fs.existsSync(WORDS_FILE)) {
            fs.writeFileSync(WORDS_FILE, JSON.stringify([], null, 2), 'utf8');
            console.log('[INFO] Created empty words.json:', WORDS_FILE);
        } else {
            console.log('[INFO] words.json exists:', WORDS_FILE);
        }
    } catch (err) {
        console.error('[ERROR] Failed to create words.json:', err.message);
        process.exit(1);
    }
}

ensureWordsFileExists();

process.on('uncaughtException', (err) => {
    console.error('[ERROR] Uncaught Exception:', err.message);
    console.error(err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('[ERROR] Unhandled Promise Rejection:', reason);
});

app.use(express.static(__dirname));
app.use(express.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Max-Age', '86400');
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    
    next();
});

function normalizeWordData(item) {
    return {
        id: item.id,
        type: item.type || '单词',
        content: item.content || item.word || '',
        definition_cn: item.definition_cn || '',
        definition_en: item.definition_en || '',
        example_en: item.example_en || '',
        tags: item.tags || [],
        added_at: typeof item.added_at === 'number' ? item.added_at : Date.now()
    };
}

function parseTagsInput(tagsInput) {
    if (!tagsInput) return [];
    if (Array.isArray(tagsInput)) {
        return tagsInput.filter(tag => tag && typeof tag === 'string' && tag.trim());
    }
    if (typeof tagsInput === 'string') {
        return tagsInput.split(/[,，\s]+/).map(tag => tag.trim()).filter(tag => tag);
    }
    return [];
}

app.get('/api/words', (req, res) => {
    fs.readFile(WORDS_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error('[ERROR] Read file failed:', err);
            return res.status(500).json({ error: 'Read words.json failed: ' + err.message });
        }
        
        try {
            const words = JSON.parse(data);
            const normalized = words.map(normalizeWordData);
            console.log('[INFO] GET /api/words: returned', normalized.length, 'records');
            res.json(normalized);
        } catch (e) {
            console.error('[ERROR] JSON parse failed:', e);
            res.status(500).json({ error: 'JSON parse failed: ' + e.message });
        }
    });
});

app.post('/api/words', (req, res) => {
    try {
        const { type, content, definition_cn, definition_en, example_en, tags } = req.body;
        
        if (!content) {
            return res.status(400).json({ error: 'Content cannot be empty' });
        }

        const newWord = {
            id: Date.now(),
            type: type || '单词',
            content: content.trim(),
            definition_cn: (definition_cn || '').trim(),
            definition_en: (definition_en || '').trim(),
            example_en: (example_en || '').trim(),
            tags: parseTagsInput(tags),
            added_at: Date.now()
        };

        fs.readFile(WORDS_FILE, 'utf8', (err, data) => {
            if (err) {
                console.error('[ERROR] Read file failed:', err);
                return res.status(500).json({ error: 'Read words.json failed: ' + err.message });
            }
            
            try {
                const words = JSON.parse(data);
                words.push(newWord);
                
                fs.writeFile(WORDS_FILE, JSON.stringify(words, null, 2), 'utf8', (err) => {
                    if (err) {
                        console.error('[ERROR] Write file failed:', err);
                        return res.status(500).json({ error: 'Write words.json failed: ' + err.message });
                    }
                    console.log('[INFO] POST /api/words: added, ID=', newWord.id, ', content=', newWord.content);
                    res.json(newWord);
                });
            } catch (e) {
                console.error('[ERROR] JSON parse failed:', e);
                res.status(500).json({ error: 'JSON parse failed: ' + e.message });
            }
        });
    } catch (e) {
        console.error('[ERROR] POST handler exception:', e);
        res.status(500).json({ error: 'Request handler failed: ' + e.message });
    }
});

app.put('/api/words/:id', (req, res) => {
    try {
        const wordId = req.params.id;
        console.log('[INFO] PUT /api/words/', wordId);
        
        fs.readFile(WORDS_FILE, 'utf8', (err, data) => {
            if (err) {
                console.error('[ERROR] Read file failed:', err);
                return res.status(500).json({ error: 'Read words.json failed: ' + err.message });
            }
            
            try {
                const words = JSON.parse(data);
                const targetId = String(wordId);
                const index = words.findIndex(item => String(item.id) === targetId);
                
                if (index === -1) {
                    return res.status(404).json({ error: 'Word not found, ID=' + wordId });
                }

                const { type, content, definition_cn, definition_en, example_en, tags } = req.body;
                
                words[index] = {
                    ...words[index],
                    type: type || words[index].type || '单词',
                    content: content ? content.trim() : words[index].content,
                    definition_cn: definition_cn !== undefined ? definition_cn.trim() : words[index].definition_cn,
                    definition_en: definition_en !== undefined ? definition_en.trim() : words[index].definition_en,
                    example_en: example_en !== undefined ? example_en.trim() : words[index].example_en,
                    tags: tags !== undefined ? parseTagsInput(tags) : words[index].tags || []
                };

                fs.writeFile(WORDS_FILE, JSON.stringify(words, null, 2), 'utf8', (err) => {
                    if (err) {
                        console.error('[ERROR] Write file failed:', err);
                        return res.status(500).json({ error: 'Write words.json failed: ' + err.message });
                    }
                    console.log('[INFO] PUT /api/words/', wordId, ': updated');
                    res.json(normalizeWordData(words[index]));
                });
            } catch (e) {
                console.error('[ERROR] JSON parse failed:', e);
                res.status(500).json({ error: 'JSON parse failed: ' + e.message });
            }
        });
    } catch (e) {
        console.error('[ERROR] PUT handler exception:', e);
        res.status(500).json({ error: 'Request handler failed: ' + e.message });
    }
});

app.delete('/api/words/:id', (req, res) => {
    try {
        const wordId = req.params.id;
        console.log('[INFO] DELETE /api/words/', wordId);
        
        fs.readFile(WORDS_FILE, 'utf8', (err, data) => {
            if (err) {
                console.error('[ERROR] Read file failed:', err);
                return res.status(500).json({ error: 'Read words.json failed: ' + err.message });
            }
            
            try {
                const words = JSON.parse(data);
                const targetId = String(wordId);
                const index = words.findIndex(item => String(item.id) === targetId);
                
                if (index === -1) {
                    return res.status(404).json({ error: 'Word not found, ID=' + wordId });
                }

                const deletedWord = words.splice(index, 1)[0];
                
                fs.writeFile(WORDS_FILE, JSON.stringify(words, null, 2), 'utf8', (err) => {
                    if (err) {
                        console.error('[ERROR] Write file failed:', err);
                        return res.status(500).json({ error: 'Write words.json failed: ' + err.message });
                    }
                    console.log('[INFO] DELETE /api/words/', wordId, ': deleted');
                    res.json({ success: true, deleted: normalizeWordData(deletedWord) });
                });
            } catch (e) {
                console.error('[ERROR] JSON parse failed:', e);
                res.status(500).json({ error: 'JSON parse failed: ' + e.message });
            }
        });
    } catch (e) {
        console.error('[ERROR] DELETE handler exception:', e);
        res.status(500).json({ error: 'Request handler failed: ' + e.message });
    }
});

console.log('[INFO] Starting server on port', PORT, '...');
const server = app.listen(PORT, () => {
    console.log('Server started successfully!');
    console.log('Please visit: http://localhost:3000/index.html');
});

server.on('error', (err) => {
    console.error('[ERROR] Server error:', err.message);
    process.exit(1);
});

console.log('[INFO] Server object created, waiting for connections...');