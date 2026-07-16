/**
 * 全局状态模块
 * 管理甘特图应用的全局数据：行数据、当前模式、自增ID
 */
window.GanttState = {
    /** @type {Array<{id:number, name:string, parentId:number|null, start:string, end:string, isManual:boolean}>} 行数据 */
    rows: [],
    /** @type {string} 当前模式：'date' 日期模式 | 'ordinal' 序数模式 */
    mode: 'date',
    /** @type {number} 下一个可用 ID */
    nextId: 1,
    /** @type {Object} 甘特图显示字段配置，true 为显示 */
    displayConfig: {
        seq: true,       // 序号
        name: true,      // 工作阶段
        start: true,     // 开始日期
        end: true,       // 结束日期
        duration: true   // 持续时间
    }
};
