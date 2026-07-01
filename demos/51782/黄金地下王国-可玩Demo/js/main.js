// ============================================================
// 黄金地下王国 - 主入口
// ============================================================

// 数据层
import GameData from './data/game-data.js?v=2';

// 渲染层
import MazeRenderer from './core/maze-renderer.js?v=2';
import MapEditor from './core/map-editor.js?v=2';

// UI层
import CharacterCreation from './ui/character-creation.js?v=2';
import Town from './ui/town.js?v=3';
import Shop from './ui/shop.js';
import ItemQuickUse from './ui/item-quick-use.js';
import BattleMeeting from './ui/battle-meeting.js';
import AIEditor from './ui/ai-editor.js';
import Menu from './ui/menu.js?v=2';
import Dialog from './ui/dialog.js';
import TitleScreen from './ui/title-screen.js?v=2';
import Guild from './ui/guild.js';

// 管理器层
import GlobalATBSystem from './managers/atb-system.js';
import HiddenMonsterManager from './managers/hidden-monster-manager.js';

// 核心层
import Battle from './core/battle.js?v=5';
import Maze from './core/maze.js?v=2';
import Game from './core/game.js?v=4';

// 战斗会议AI核心模块
import MicroGBDT from './core/micro-gbdt.js';
import PersonalityEngine from './core/personality-engine.js';
import BattleDataRecorder from './core/battle-data-recorder.js';
import RuleInterceptor from './core/rule-interceptor.js';
import ExperienceSolidifier from './core/experience-solidifier.js';

// GM测试指令系统
import GmConsole from './core/gm-console.js?v=3';

// 挂载到全局（保持与原代码兼容）
window.GameData = GameData;
window.MazeRenderer = MazeRenderer;
window.MapEditor = MapEditor;
window.CharacterCreation = CharacterCreation;
window.GlobalATBSystem = GlobalATBSystem;
window.Battle = Battle;
window.Town = Town;
window.Shop = Shop;
window.HiddenMonsterManager = HiddenMonsterManager;
window.Maze = Maze;
window.ItemQuickUse = ItemQuickUse;
window.BattleMeeting = BattleMeeting;
window.AIEditor = AIEditor;
window.Menu = Menu;
window.Dialog = Dialog;
window.Game = Game;
window.TitleScreen = TitleScreen;
window.Guild = Guild;
window.MicroGBDT = MicroGBDT;
window.PersonalityEngine = PersonalityEngine;
window.BattleDataRecorder = BattleDataRecorder;
window.RuleInterceptor = RuleInterceptor;
window.ExperienceSolidifier = ExperienceSolidifier;
window.GmConsole = GmConsole;

console.log('[main.js] 所有模块加载完成');

// 初始化
window.addEventListener('DOMContentLoaded', () => {
    Game.init();
    TitleScreen.init();
});
