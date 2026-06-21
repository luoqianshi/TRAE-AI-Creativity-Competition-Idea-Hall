/**
 * 课程数据模块
 * 整合所有单元数据
 */

// 课程状态常量
const LESSON_STATUS = {
    LOCKED: 'locked',
    UNLOCKED: 'unlocked',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed'
};

// 所有单元数据（从各个单元文件中获取）
var CourseData = {
    units: [],
    
    LESSON_STATUS: LESSON_STATUS,
    
    // 初始化单元数据
    init: function() {
        this.units = [];
        
        // 添加单元1
        if (typeof Unit1Data !== 'undefined') {
            this.units.push(Unit1Data);
        }
        
        // 添加单元2
        if (typeof Unit2Data !== 'undefined') {
            this.units.push(Unit2Data);
        }
        
        // 添加单元3
        if (typeof Unit3Data !== 'undefined') {
            this.units.push(Unit3Data);
        }
        
        // 添加单元4
        if (typeof Unit4Data !== 'undefined') {
            this.units.push(Unit4Data);
        }
        
        // 添加单元5
        if (typeof Unit5Data !== 'undefined') {
            this.units.push(Unit5Data);
        }
        
        // 添加单元6
        if (typeof Unit6Data !== 'undefined') {
            this.units.push(Unit6Data);
        }
        
        // 添加单元7
        if (typeof Unit7Data !== 'undefined') {
            this.units.push(Unit7Data);
        }
        
        // 添加单元8
        if (typeof Unit8Data !== 'undefined') {
            this.units.push(Unit8Data);
        }
        
        // 添加单元9
        if (typeof Unit9Data !== 'undefined') {
            this.units.push(Unit9Data);
        }
        
        // 添加单元10
        if (typeof Unit10Data !== 'undefined') {
            this.units.push(Unit10Data);
        }
        
        // 添加单元11
        if (typeof Unit11Data !== 'undefined') {
            this.units.push(Unit11Data);
        }
        
        // 添加单元12
        if (typeof Unit12Data !== 'undefined') {
            this.units.push(Unit12Data);
        }
        
        // 添加单元13
        if (typeof Unit13Data !== 'undefined') {
            this.units.push(Unit13Data);
        }
        
        // 添加单元14
        if (typeof Unit14Data !== 'undefined') {
            this.units.push(Unit14Data);
        }
        
        // 添加单元15
        if (typeof Unit15Data !== 'undefined') {
            this.units.push(Unit15Data);
        }
        
        // 添加单元16
        if (typeof Unit16Data !== 'undefined') {
            this.units.push(Unit16Data);
        }
        
        // 添加单元17
        if (typeof Unit17Data !== 'undefined') {
            this.units.push(Unit17Data);
        }
        
        // 添加单元18
        if (typeof Unit18Data !== 'undefined') {
            this.units.push(Unit18Data);
        }
        
        // 添加单元19
        if (typeof Unit19Data !== 'undefined') {
            this.units.push(Unit19Data);
        }
        
        // 添加单元20
        if (typeof Unit20Data !== 'undefined') {
            this.units.push(Unit20Data);
        }
        
        // 添加单元21
        if (typeof Unit21Data !== 'undefined') {
            this.units.push(Unit21Data);
        }
        
        // 添加单元22
        if (typeof Unit22Data !== 'undefined') {
            this.units.push(Unit22Data);
        }
        
        // 添加单元23
        if (typeof Unit23Data !== 'undefined') {
            this.units.push(Unit23Data);
        }
        
        // 添加单元24
        if (typeof Unit24Data !== 'undefined') {
            this.units.push(Unit24Data);
        }
        
        // 添加单元25
        if (typeof Unit25Data !== 'undefined') {
            this.units.push(Unit25Data);
        }
        
        // 添加单元26
        if (typeof Unit26Data !== 'undefined') {
            this.units.push(Unit26Data);
        }
        
        // 添加单元27
        if (typeof Unit27Data !== 'undefined') {
            this.units.push(Unit27Data);
        }
        
        // 按ID排序
        this.units.sort(function(a, b) {
            return a.id - b.id;
        });
    },
    
    getLessonById: function(unitId, lessonId) {
        for (var i = 0; i < this.units.length; i++) {
            var unit = this.units[i];
            if (unit.id === unitId) {
                for (var j = 0; j < unit.lessons.length; j++) {
                    if (unit.lessons[j].id === lessonId) {
                        return unit.lessons[j];
                    }
                }
            }
        }
        return null;
    }
};
