## 1. Architecture Design

```mermaid
flowchart LR
    A[User Browser] --> B[Frontend HTML]
    B --> C[LocalStorage]
```

## 2. Technology Description
- Frontend: Pure HTML + CSS + JavaScript (Vanilla JS)
- Storage: Browser LocalStorage
- CSS Framework: TailwindCSS 3 (CDN)
- Icons: Lucide Icons (CDN)

## 3. Route Definitions
| Route | Purpose |
|-------|---------|
| / | 首页，笔记列表和快速录入 |

## 4. Data Model

### 4.1 Data Model Definition
```mermaid
erDiagram
    NOTE {
        string id PK "唯一标识"
        string content "笔记内容"
        string[] tags "标签数组"
        string image "截图URL(可选)"
        number createdAt "创建时间戳"
        number updatedAt "更新时间戳"
    }
```

### 4.2 Data Structure
```typescript
interface Note {
  id: string;
  content: string;
  tags: string[];
  image?: string;
  createdAt: number;
  updatedAt: number;
}
```

## 5. File Structure
```
/
├── index.html          # 主页面
├── style.css           # 自定义样式
└── script.js           # 核心逻辑
```

## 6. Core Functions
1. **createNote**: 创建新笔记
2. **getNotes**: 获取所有笔记
3. **updateNote**: 更新笔记
4. **deleteNote**: 删除笔记
5. **filterNotes**: 按标签筛选笔记
6. **searchNotes**: 搜索笔记
7. **uploadImage**: 上传截图