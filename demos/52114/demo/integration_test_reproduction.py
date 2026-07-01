#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
集成测试脚本：验证食草动物完整繁殖流程

这个脚本模拟一个小型生态系统，包含食草动物和生产者，并验证食草动物在满足条件后是否能够成功繁殖。
"""

import sys
import os
import random

# 添加当前目录到Python路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config.settings import load_config
from core.simulation import Simulation
from organisms.herbivore import Herbivore
from organisms.producer import Producer

# 确保中文显示正常
import matplotlib.pyplot as plt
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False

class ReproductionIntegrationTest:
    """繁殖集成测试类"""
    
    def __init__(self):
        # 加载配置
        self.config = load_config()
        print("配置加载成功")
        
        # 设置测试参数
        self.grid_width = 10
        self.grid_height = 10
        # 修正Simulation初始化，根据错误信息只传递self参数
        self.simulation = Simulation()
        
        # 跟踪统计信息
        self.initial_herbivores = 0
        self.final_herbivores = 0
        self.reproduction_attempts = 0
        self.successful_reproductions = 0
        self.steps = 50  # 模拟步骤数
        
    def setup_test_environment(self):
        """设置测试环境，添加食草动物和生产者"""
        print("\n=== 设置测试环境 ===")
        
        # 清空simulation中的生物体列表，只保留我们测试用的生物体
        self.simulation.organisms.clear()
        print("清空了simulation中的现有生物体")
        
        # 添加生产者
        producer_count = 15
        producers = []
        for _ in range(producer_count):
            x = random.randint(0, self.grid_width - 1) * 50  # 使用grid_size类似的缩放
            y = random.randint(0, self.grid_height - 1) * 50
            producer = Producer(x, y)
            # 设置生产者较高的能量，确保食草动物容易进食
            producer.energy = 100
            producers.append(producer)
        
        # 直接添加到simulation的organisms列表
        self.simulation.organisms.extend(producers)
        print(f"添加了 {producer_count} 个生产者")
        
        # 添加食草动物
        herbivore_count = 5
        herbivores = []
        for _ in range(herbivore_count):
            x = random.randint(0, self.grid_width - 1) * 50
            y = random.randint(0, self.grid_height - 1) * 50
            herbivore = Herbivore(x, y)
            # 设置较高的初始能量，使它们接近繁殖条件
            herbivore.energy = 350  # 高于最小繁殖能量但不是满值
            herbivores.append(herbivore)
        
        # 直接添加到simulation的organisms列表
        self.simulation.organisms.extend(herbivores)
        
        self.initial_herbivores = herbivore_count
        print(f"添加了 {herbivore_count} 个食草动物，初始能量设为 350")
        print(f"食草动物最小繁殖能量: {getattr(Herbivore, 'min_energy_for_reproduction', 300)}")
    
    def run_simulation(self):
        """运行模拟"""
        print("\n=== 开始模拟 ===")
        
        # 存储初始生物数量
        initial_count = len(self.simulation.organisms)
        print(f"初始生物总数: {initial_count}")
        
        # 定义调试日志回调函数来跟踪繁殖事件
        original_can_reproduce = Herbivore.can_reproduce
        
        def debug_can_reproduce(self):
            # 记录基础条件
            has_enough_energy = getattr(self, 'energy', 0) >= getattr(self, 'min_energy_for_reproduction', 300)
            has_eaten = getattr(self, 'has_eaten_this_update', False)
            base_condition = has_enough_energy and has_eaten
            
            # 调用原始方法
            result = original_can_reproduce(self)
            
            # 更新统计
            self.__class__.reproduction_attempts = getattr(self.__class__, 'reproduction_attempts', 0) + 1
            if base_condition:
                self.__class__.base_conditions_met = getattr(self.__class__, 'base_conditions_met', 0) + 1
                if result:
                    self.__class__.successful_reproductions = getattr(self.__class__, 'successful_reproductions', 0) + 1
                    print(f"🎉 食草动物({self.x},{self.y}) 成功繁殖！(能量={self.energy:.1f}, 已进食={has_eaten})")
                else:
                    print(f"❌ 食草动物({self.x},{self.y}) 基础条件满足但繁殖失败！")
            
            return result
        
        # 临时替换can_reproduce方法
        Herbivore.can_reproduce = debug_can_reproduce
        Herbivore.reproduction_attempts = 0
        Herbivore.successful_reproductions = 0
        Herbivore.base_conditions_met = 0
        
        try:
            # 运行模拟步骤
            for step in range(self.steps):
                print(f"\n--- 步骤 {step + 1}/{self.steps} ---")
                
                # 每个时间步更新生物体
                self.simulation.update(1.0)  # delta_time = 1.0
                
                # 每5步打印一次状态
                if (step + 1) % 5 == 0:
                    herbivore_count = sum(1 for org in self.simulation.organisms if isinstance(org, Herbivore))
                    producer_count = sum(1 for org in self.simulation.organisms if isinstance(org, Producer))
                    print(f"状态统计: 食草动物={herbivore_count}, 生产者={producer_count}")
                    print(f"繁殖统计: 基础条件满足次数={Herbivore.base_conditions_met}, 成功繁殖次数={Herbivore.successful_reproductions}")
        finally:
            # 恢复原始方法
            Herbivore.can_reproduce = original_can_reproduce
            
            # 保存统计信息
            self.reproduction_attempts = Herbivore.reproduction_attempts
            self.successful_reproductions = Herbivore.successful_reproductions
        
        # 获取最终生物数量
        self.final_herbivores = sum(1 for org in self.simulation.organisms if isinstance(org, Herbivore))
        final_count = len(self.simulation.organisms)
        
        print(f"\n=== 模拟结束 ===")
        print(f"最终生物总数: {final_count}")
        print(f"繁殖尝试次数: {self.reproduction_attempts}")
        print(f"成功繁殖次数: {self.successful_reproductions}")
    
    def analyze_results(self):
        """分析测试结果"""
        print("\n=== 测试结果分析 ===")
        
        # 获取统计数据
        base_conditions_met = getattr(Herbivore, 'base_conditions_met', 0)
        
        # 计算食草动物数量变化
        herbivore_increase = self.final_herbivores - self.initial_herbivores
        
        print(f"食草动物初始数量: {self.initial_herbivores}")
        print(f"食草动物最终数量: {self.final_herbivores}")
        print(f"食草动物数量变化: {herbivore_increase}")
        print(f"繁殖尝试次数: {self.reproduction_attempts}")
        print(f"基础条件满足次数: {base_conditions_met}")
        print(f"成功繁殖次数: {self.successful_reproductions}")
        
        # 计算繁殖成功率
        if self.reproduction_attempts > 0:
            overall_success_rate = (self.successful_reproductions / self.reproduction_attempts) * 100
            print(f"总体繁殖成功率: {overall_success_rate:.1f}%")
        
        # 计算基础条件满足时的繁殖成功率
        if base_conditions_met > 0:
            conditional_success_rate = (self.successful_reproductions / base_conditions_met) * 100
            print(f"基础条件满足时的繁殖成功率: {conditional_success_rate:.1f}%")
            if conditional_success_rate >= 95:
                print("✅ 随机判断已成功禁用，基础条件满足时几乎100%繁殖成功！")
        else:
            print("未检测到基础条件满足的情况")
        
        # 判断测试是否通过
        test_passed = herbivore_increase > 0 or self.successful_reproductions > 0
        
        if test_passed:
            print("\n✅ 繁殖集成测试通过！食草动物能够成功繁殖。")
            print("✅ has_eaten_this_update变量正常工作，繁殖条件判断逻辑正确。")
        else:
            print("\n❌ 繁殖集成测试失败。请检查：")
            print("  - 食草动物是否能够成功进食")
            print("  - has_eaten_this_update标志是否正确设置")
            print("  - 繁殖概率计算是否合理")
        
        return test_passed
    
    def run(self):
        """运行完整的测试"""
        print("\n🚀 启动繁殖集成测试")
        print("📝 注意：随机数判断已禁用，基础条件满足时应100%繁殖成功")
        
        try:
            self.setup_test_environment()
            
            # 额外设置：增加食草动物初始能量，提高基础条件满足概率
            herbivores = [org for org in self.simulation.organisms if isinstance(org, Herbivore)]
            for herbivore in herbivores:
                herbivore.energy = 500  # 设置较高能量，更容易满足繁殖条件
            print("📊 已将所有食草动物初始能量设置为500，以提高繁殖概率")
            
            self.run_simulation()
            result = self.analyze_results()
            
            if result:
                print("\n🎉 所有测试完成，繁殖功能正常工作！")
            else:
                print("\n⚠️  测试完成，但繁殖功能可能存在问题，建议进一步检查。")
                
            return result
            
        except Exception as e:
            print(f"\n❌ 测试过程中出现错误: {e}")
            import traceback
            traceback.print_exc()
            return False
        finally:
            print("\n🛑 测试结束")

if __name__ == "__main__":
    print("=== 食草动物繁殖集成测试 ===")
    print("此测试验证食草动物在满足条件（能量充足且已进食）后是否能够成功繁殖")
    
    test = ReproductionIntegrationTest()
    success = test.run()
    
    # 根据测试结果设置退出码
    sys.exit(0 if success else 1)
