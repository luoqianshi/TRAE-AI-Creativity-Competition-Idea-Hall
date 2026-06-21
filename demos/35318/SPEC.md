# LinguaFlow - 多语种沉浸式学习平台

## 1. Concept & Vision

LinguaFlow 是一款融合东方美学与现代交互的沉浸式语言学习平台。设计灵感来自日本浮世绘的流动感、韩国现代设计的活力、以及西方教育的系统性。整体体验如同在一座精心设计的语言图书馆中探索——宁静而专注，每一处细节都传递着对学习的尊重。

## 2. Design Language

### Aesthetic Direction
**"Digital Zen"** — 东方极简主义与西方功能性的融合。大量留白，呼吸感强，但通过精致的动效和色彩注入活力。每个语言专区有独特的视觉个性。

### Color Palette
```css
:root {
  /* Core */
  --bg-primary: #0D0D0F;
  --bg-secondary: #16161A;
  --bg-tertiary: #1E1E24;
  --bg-card: #252530;

  /* Text */
  --text-primary: #F5F5F7;
  --text-secondary: #A1A1A6;
  --text-muted: #6B6B70;

  /* Language Accents */
  --english: #FF6B4A;      /* 活力橙红 */
  --japanese: #FF69B4;     /* 樱花粉 */
  --korean: #4ECDC4;       /* 清新青绿 */

  /* System */
  --accent: #A78BFA;       /* 紫罗兰 - 全局强调 */
  --success: #34D399;
  --warning: #FBBF24;
  --error: #F87171;

  /* Gradients */
  --gradient-hero: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  --gradient-card: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%);
}
```

### Typography
- **Display**: "Playfair Display" (英语) - 优雅衬线，用于标题
- **UI/Body**: "Noto Sans" (多语言) - 清晰易读，支持中日韩
- **Japanese Accent**: "Shippori Mincho" - 教科书般的优雅
- **Korean Accent**: "Noto Serif KR" - 文化质感

### Spatial System
- Base unit: 4px
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128
- Border radius: 8px (cards), 12px (buttons), 24px (large containers)
- Card elevation: subtle inner glow + soft shadow

### Motion Philosophy
- **Page transitions**: 600ms ease-out, staggered content reveal
- **Hover states**: 200ms cubic-bezier(0.4, 0, 0.2, 1)
- **Progress animations**: Spring physics feel (slight overshoot)
- **Achievement unlocks**: Burst animation with particle effects
- **Language switch**: Smooth morphing transitions

### Visual Assets
- **Icons**: Phosphor Icons (duotone style)
- **Illustrations**: Custom geometric/abstract patterns per language
- **Flags**: Minimal flag icons with rounded corners
- **Decorative**: Subtle grid patterns, flowing wave shapes

## 3. Layout & Structure

### Page Architecture

#### Landing Page
```
┌─────────────────────────────────────────────────────────┐
│  [Logo] LinguaFlow          [Login] [Start Free]        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│        ╭─────────────────────────────────╮              │
│        │   THE WORLD SPEAKS TO YOU      │              │
│        │   Master any language          │              │
│        │   [Start Learning Free →]       │              │
│        ╰─────────────────────────────────╯              │
│                                                         │
│   [🌸 English]  [🎌 Japanese]  [🎵 Korean]             │
│                                                         │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐                 │
│   │ 词汇     │  │ 语法    │  │ 口语    │  互动模块       │
│   │ Memory  │  │ Grammar │  │ Speaking│                 │
│   └─────────┘  └─────────┘  └─────────┘                 │
│                                                         │
│   [Trusted by learners worldwide - counter]            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### Dashboard (Authenticated)
```
┌─────────────────────────────────────────────────────────┐
│  [Logo]  [Search...]        [🔔] [⚙️] [Avatar ▼]         │
├────────┬────────────────────────────────────────────────┤
│        │  Welcome back, [Name]                          │
│  📊    │  You're on a [X] day streak! 🔥                │
│  主页  │                                                │
│        │  ┌──────────────┐ ┌──────────────┐           │
│  📚    │  │ Daily Goal    │ │ Weekly       │           │
│  课程  │  │ ████░░ 70%    │ │ Progress     │           │
│        │  │ 35/50 XP      │ │ ↗ +12%       │           │
│  ⚡    │  └──────────────┘ └──────────────┘           │
│  练习  │                                                │
│        │  Continue Learning                             │
│  🏆    │  ┌────────────────────────────────────┐       │
│  成就  │  │ 🇺🇸 English - Unit 5: Past Tense   │       │
│        │  │ ████████░░░░░░ 45%    [Continue]   │       │
│  💬    │  └────────────────────────────────────┘       │
│  社区  │                                                │
│        │  ┌─────────┐ ┌─────────┐ ┌─────────┐         │
│        │  │ 📖      │ │ 🎧      │ │ 🎤      │         │
│        │  │ 词汇    │ │ 听力    │ │ 口语    │         │
│        │  └─────────┘ └─────────┘ └─────────┘         │
│        │                                                │
└────────┴────────────────────────────────────────────────┘
```

### Responsive Strategy
- Desktop: Full sidebar navigation, multi-column layouts
- Tablet: Collapsible sidebar, 2-column grids
- Mobile: Bottom navigation, single column, swipe gestures

## 4. Features & Interactions

### 4.1 Authentication System
- **Register**: Email + password, email verification optional
- **Login**: Email/password with "Remember me"
- **Profile**: Avatar, name, native language, learning languages
- Form validation: Real-time feedback, friendly error messages

### 4.2 Course System (分级课程体系)
- **CEFR Levels**: A1, A2, B1, B2, C1, C2
- **Languages**: English, Japanese, Korean
- **Structure**: Units → Lessons → Activities
- **Each lesson**: 10-15 minutes, mix of activity types
- **Progress**: Automatic save, visual progress bar

### 4.3 Interactive Learning Modules

#### Vocabulary (单词记忆)
- Flashcard system with spaced repetition
- Flip animation on click/tap
- Example sentences with audio
- Progress tracking per word (learning/reviewing/mastered)
- **Interaction**: Click to flip, swipe to mark known/unknown

#### Grammar (语法练习)
- Interactive exercises (fill-in-blank, drag-drop)
- Immediate feedback with explanations
- Progressive difficulty
- **Interaction**: Type answer, Tab to submit, Enter to continue

#### Speaking (口语跟读)
- Audio playback of native speaker
- Recording interface with waveform visualization
- Playback comparison
- Pronunciation score (simulated)
- **Interaction**: Click mic to record, automatic playback

#### Listening (听力训练)
- Progressive audio with transcript option
- Speed control (0.75x, 1x, 1.25x)
- Comprehension questions
- **Interaction**: Play, pause, replay, transcript toggle

### 4.4 Progress Tracking (学习进度追踪)
- **Daily streak**: Calendar heatmap visualization
- **XP system**: Points for every activity
- **Skills breakdown**: Radar chart per language
- **Time spent**: Daily/weekly/monthly stats
- **Achievements**: Badges and milestones

### 4.5 Personalized Learning Path (个性化推荐)
- Initial assessment quiz
- Skill mapping to CEFR levels
- Weakness detection (grammar vs vocabulary)
- Weekly personalized recommendations
- Adjustable daily goal (5/10/15/20 minutes)

### 4.6 Community & Achievements
- **Leaderboard**: Weekly XP rankings
- **Achievements**:
  - "First Step" - Complete first lesson
  - "Week Warrior" - 7 day streak
  - "Vocabulary Master" - 500 words learned
  - "Perfect Score" - 100% on a lesson
  - Language-specific achievements
- **Community**: Discussion boards per language
- **Sharing**: Share achievements to community

## 5. Component Inventory

### Navigation
- **Sidebar**: Fixed left, collapsible, active state highlight
- **Header**: Search, notifications, profile dropdown
- **Bottom Nav** (mobile): 5 main sections with icons

### Cards
- **Course Card**: Language flag, level badge, progress bar, CTA
- **Lesson Card**: Number, title, duration, completion state
- **Activity Card**: Icon, title, XP reward, hover lift effect
- **Achievement Card**: Badge icon, title, locked/unlocked state

### Buttons
- **Primary**: Gradient background, slight glow, scale on hover
- **Secondary**: Ghost style, border only
- **Icon Button**: Circle, tooltip on hover
- **States**: Default, hover (lift + glow), active (press), disabled (50% opacity)

### Form Elements
- **Input**: Dark bg, subtle border, focus glow
- **Checkbox/Radio**: Custom styled, smooth check animation
- **Dropdown**: Smooth expand, selected highlight

### Progress Indicators
- **XP Bar**: Gradient fill, animated segments
- **Streak Counter**: Fire icon, number, pulse animation
- **Circular Progress**: SVG-based, percentage center

### Modals
- **Achievement Unlock**: Burst animation, confetti, centered
- **Lesson Complete**: Stats summary, XP gained, continue CTA
- **Confirm Dialog**: Clear actions, subtle backdrop blur

## 6. Technical Approach

### Stack
- **Framework**: React 18 + Vite
- **Styling**: CSS Modules with CSS Variables
- **State**: React Context + useReducer
- **Routing**: React Router v6
- **Icons**: Phosphor Icons
- **Animations**: Framer Motion

### Architecture
```
src/
├── components/          # Reusable UI components
│   ├── common/          # Button, Input, Card, etc.
│   ├── layout/          # Sidebar, Header, etc.
│   └── learning/        # Module-specific components
├── pages/               # Route pages
├── context/             # Auth, Language, Progress contexts
├── hooks/               # Custom hooks
├── styles/              # Global styles, variables
├── data/                # Mock data, courses
└── utils/               # Helpers
```

### Data Model
- **User**: id, name, email, avatar, nativeLanguage, learningLanguages[], streak, xp
- **Course**: id, language, level, units[], title, description
- **Lesson**: id, unitId, title, activities[], duration, xpReward
- **Progress**: lessonId, completed, score, timeSpent
- **Achievement**: id, title, description, icon, unlockedAt

### State Management
- AuthContext: User session, login/logout
- ProgressContext: XP, streak, completed lessons
- LanguageContext: Active language, course progress

### Mock Data Strategy
All data will be mock data stored in `/data` folder with realistic content for English, Japanese, and Korean courses.
