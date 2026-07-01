import pygame
import random
from core.simulation import Simulation
from config import GRID_SIZE, SIMULATION_AREA_WIDTH, SIMULATION_AREA_HEIGHT

# 初始化pygame
pygame.init()

# 运行强制繁殖测试
def run_force_reproduction_test(cycles=10):
    print("[测试] 启动强制繁殖测试 - 绕过进食条件")
    
    # 创建模拟环境
    sim = Simulation()
    
    # 修改Herbivore类的方法，强制繁殖
    from organisms import Herbivore
    original_can_reproduce = Herbivore.can_reproduce
    original_reproduce = Herbivore.reproduce
    original_update = Herbivore.update
    
    def forced_can_reproduce(self):
        # 直接强制返回True，完全绕过所有条件检查
        print(f"[强制繁殖测试] 食草动物({self.x},{self.y})：强制返回True，忽略所有繁殖条件检查！")
        return True
    
    def forced_reproduce(self):
        print(f"[强制繁殖测试] 食草动物({self.x},{self.y})：执行繁殖方法")
        # 确保后代能被正确创建
        offspring = original_reproduce(self)
        print(f"[强制繁殖测试] 繁殖结果: {'成功' if offspring else '失败'}")
        return offspring
    
    def forced_update(self, delta_time=1.0):
        # 调用原始更新方法
        original_update(self, delta_time)
        # 之后立即设置高能量，确保能量充足
        self.energy = 800
        print(f"[强制繁殖测试] 重置食草动物能量为800")
    
    # 替换原始方法
    Herbivore.can_reproduce = forced_can_reproduce
    Herbivore.reproduce = forced_reproduce
    Herbivore.update = forced_update
    
    try:
        # 确保有足够的食草动物进行测试
        herbivores = [o for o in sim.organisms if isinstance(o, Herbivore)]
        print(f"[强制繁殖测试] 找到 {len(herbivores)} 个食草动物")
        
        # 记录初始食草动物数量
        initial_count = len([o for o in sim.organisms if isinstance(o, Herbivore)])
        print(f"[强制繁殖测试] 初始食草动物数量: {initial_count}")
        
        # 修改simulation的_update_organisms方法，确保繁殖调用
        original_update_organisms = sim._update_organisms
        
        def debug_update_organisms(delta_time):
            # 首先更新所有生物体
            for organism in sim.organisms:
                if hasattr(organism, 'update'):
                    organism.update(delta_time)
            
            # 单独处理每个食草动物的繁殖，确保调用
            for organism in sim.organisms:
                if isinstance(organism, Herbivore) and organism.can_reproduce():
                    print(f"[强制繁殖测试] 调用食草动物繁殖方法")
                    new_organism = organism.reproduce()
                    if new_organism:
                        print(f"[强制繁殖测试] 成功创建后代，添加到生物体列表")
                        sim.organisms.append(new_organism)
        
        # 替换simulation的方法
        sim._update_organisms = debug_update_organisms
        
        # 运行模拟
        for i in range(cycles):
            print(f"\n[强制繁殖测试] 运行周期 {i+1}/{cycles}")
            # 直接调用我们修改的_update_organisms方法
            sim._update_organisms(1.0)
            
            # 检查是否有新的食草动物出生
            current_count = len([o for o in sim.organisms if isinstance(o, Herbivore)])
            print(f"[强制繁殖测试] 当前食草动物数量: {current_count}")
        
        # 最终结果
        final_count = len([o for o in sim.organisms if isinstance(o, Herbivore)])
        print(f"\n[强制繁殖测试] 测试完成！")
        print(f"初始食草动物数量: {initial_count}")
        print(f"最终食草动物数量: {final_count}")
        print(f"繁殖成功次数: {final_count - initial_count}")
        
    finally:
        # 恢复原始方法
        Herbivore.can_reproduce = original_can_reproduce
        Herbivore.reproduce = original_reproduce
        Herbivore.update = original_update
        sim._update_organisms = original_update_organisms
        print("[强制繁殖测试] 已恢复所有原始方法")

if __name__ == "__main__":
    run_force_reproduction_test(cycles=10)
    pygame.quit()
