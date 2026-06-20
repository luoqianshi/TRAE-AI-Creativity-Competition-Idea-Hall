import React, { useState, useEffect } from "react";
import { DailyFieldConfig, MonthlyCircuitConfig, 字典配置, DEFAULT_DAILY_FIELDS, DEFAULT_CIRCUITS, 默认配置 } from "../types";
import { apiService } from "../services/apiService";

export function useEnergyConfig(
  当前路由: string,
  _openAlert: (title: string, message: string) => void,
  openPrompt: (title: string, onConfirm: (val: string) => void) => void,
) {
  const [限额配置, set限额配置] = useState<字典配置>(默认配置);
  const [配置输入, set配置输入] = useState<字典配置>(默认配置);
  const [配置反馈, set配置反馈] = useState("");

  const [日常回路配置, set日常回路配置] = useState<DailyFieldConfig[]>(() => {
    const saved = localStorage.getItem("酒店日常回路配置");
    return saved ? JSON.parse(saved) : DEFAULT_DAILY_FIELDS;
  });

  const [circuitData, setCircuitData] = useState<MonthlyCircuitConfig[]>(() => {
    const saved = localStorage.getItem("酒店月度回路配置");
    return saved ? JSON.parse(saved) : DEFAULT_CIRCUITS;
  });

  const [自定义大类映射, set自定义大类映射] = useState<{
    [key: string]: string[];
  }>(() => {
    const saved = localStorage.getItem("酒店月度自定义大类映射");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        /* fallback */
      }
    }
    return {
      "建筑基础保障（公区、暖通、泵房电梯）": [
        "中央空调",
        "酒店电梯",
        "重点机房",
      ],
      "主营及服务设施运行（客房与服务）": ["客房区域", "餐饮厨房", "宴会区域"],
    };
  });

  // Local temporary states for Engineer Director's Dictionary Editors
  const [临时日常配置, set临时日常配置] = useState<DailyFieldConfig[]>([]);
  const [临时月度配置, set临时月度配置] = useState<MonthlyCircuitConfig[]>([]);
  const [配置激活Tab, set配置激活Tab] = useState<
    "费率限额" | "日常表字段" | "月度回路" | "数据备份" | "回路价格"
  >("费率限额");

  // Dynamic custom column name dictionary (maps custom_val_... to clean readable names)
  const [自定义列名称Map, set自定义列名称Map] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem("酒店动态自定义列名称");
    const parsed = saved ? JSON.parse(saved) : {};

    // Auto-migrate from any matching dummy rows in configuration files to prevent name loss
    try {
      const localDaily = localStorage.getItem("酒店日常回路配置");
      if (localDaily) {
        const dailyFields: DailyFieldConfig[] = JSON.parse(localDaily);
        dailyFields.forEach(f => {
          if (f.id.startsWith("custom_val_") && f.name) {
            parsed[f.id] = f.name;
          }
        });
      }
    } catch (e) {}

    try {
      const localMonthly = localStorage.getItem("酒店月度回路配置");
      if (localMonthly) {
        const monthlyCircuits: MonthlyCircuitConfig[] = JSON.parse(localMonthly);
        monthlyCircuits.forEach(c => {
          if (c.id.startsWith("custom_val_") && c.name) {
            parsed[c.id] = c.name;
          }
        });
      }
    } catch (e) {}

    return parsed;
  });

  // 自定义列表状态与重排序
  const [日常自定义列, set日常自定义列] = useState<string[]>(() => {
    const saved = localStorage.getItem("酒店日常自定义列");
    return saved ? JSON.parse(saved) : [];
  });
  const [日常列顺序, set日常列顺序] = useState<string[]>(() => {
    const saved = localStorage.getItem("酒店日常列顺序");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.filter((c: string) => c !== "limit");
      } catch (e) {
        // fallback
      }
    }
    return ["name", "id", "category", "unit"];
  });
  const [月度自定义列, set月度自定义列] = useState<string[]>(() => {
    const saved = localStorage.getItem("酒店月度自定义列");
    return saved ? JSON.parse(saved) : [];
  });
  const [月度列顺序, set月度列顺序] = useState<string[]>(() => {
    const saved = localStorage.getItem("酒店月度列顺序");
    if (saved) return JSON.parse(saved);
    return ["name", "id", "category"];
  });

  // Load configs in initialization
  useEffect(() => {
    const 缓存配置 = localStorage.getItem("系统字典限额");
    if (缓存配置) {
      try {
        const 解析配置 = JSON.parse(缓存配置);
        if (!解析配置.酒店名称) 解析配置.酒店名称 = "国信金融酒店";
        if (!解析配置.电费户号) 解析配置.电费户号 = "1001624686";
        if (!解析配置.李体线表号) 解析配置.李体线表号 = "000000536129444";
        if (!解析配置.午沙线表号) 解析配置.午沙线表号 = "000000536114945";
        if (解析配置.电表换算基数 === undefined) 解析配置.电表换算基数 = 3500;

        set限额配置(解析配置);
        set配置输入(解析配置);
      } catch {
        set限额配置(默认配置);
        set配置输入(默认配置);
      }
    } else {
      set限额配置(默认配置);
      set配置输入(默认配置);
    }
  }, []);

  // Sync editors
  useEffect(() => {
    if (当前路由 === "字典配置") {
      set临时日常配置(日常回路配置);
      set临时月度配置(circuitData);
    }
  }, [当前路由, 日常回路配置, circuitData]);

  const 保存配置 = async (e: React.FormEvent) => {
    e.preventDefault();
    set限额配置(配置输入);
    localStorage.setItem("系统字典限额", JSON.stringify(配置输入));
    
    // 同步到后端数据库
    try {
      await apiService.updateConfig('限额配置', 配置输入);
      set配置反馈("系统能耗警戒限额与用能代收单价配置保存成功");
    } catch (error) {
      set配置反馈("配置保存成功（本地存储）");
    }
    setTimeout(() => set配置反馈(""), 3000);
  };

  const 保存日常表字段 = (e: React.FormEvent) => {
    e.preventDefault();
    set日常回路配置(临时日常配置);
    localStorage.setItem("酒店日常回路配置", JSON.stringify(临时日常配置));
    localStorage.setItem("酒店日常自定义列", JSON.stringify(日常自定义列));
    localStorage.setItem("酒店日常列顺序", JSON.stringify(日常列顺序));
    localStorage.setItem("酒店动态自定义列名称", JSON.stringify(自定义列名称Map));
    set配置反馈("日常主表字段配置已保存并生效。");
    setTimeout(() => set配置反馈(""), 3000);
  };

  const 保存月度回路 = (e: React.FormEvent) => {
    e.preventDefault();
    setCircuitData(临时月度配置);
    localStorage.setItem("酒店月度回路配置", JSON.stringify(临时月度配置));
    localStorage.setItem("酒店月度自定义列", JSON.stringify(月度自定义列));
    localStorage.setItem("酒店月度列顺序", JSON.stringify(月度列顺序));
    localStorage.setItem("酒店动态自定义列名称", JSON.stringify(自定义列名称Map));
    localStorage.setItem(
      "酒店月度自定义大类映射",
      JSON.stringify(自定义大类映射),
    );
    set配置反馈("月度二级回路及归并大类配置已保存并生效。");
    setTimeout(() => set配置反馈(""), 3000);
  };

  const addDailyCol = () => {
    openPrompt(
      "请输入日常表要新增的字段属性名称（例如：夜间保温表值）：",
      (colName) => {
        if (colName && colName.trim() !== "") {
          const id = "custom_val_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
          const cleanName = colName.trim();
          set日常自定义列((prev) => [...prev, id]);
          set日常列顺序((prev) => [...prev, id]);
          set自定义列名称Map((prev) => ({ ...prev, [id]: cleanName }));
          const newField: DailyFieldConfig = {
            id,
            name: cleanName,
            category: "电",
            unit: "度",
            limit: 500,
          };
          set临时日常配置((prev) => [...prev, newField]);
        }
      },
    );
  };

  const removeDailyCol = (id: string) => {
    set日常自定义列((prev) => prev.filter((c) => c !== id));
    set日常列顺序((prev) => prev.filter((c) => c !== id));
    set临时日常配置((prev) => prev.filter((f) => f.id !== id));
  };

  const insertDailyRow = (idx: number) => {
    const field = 临时日常配置[idx];
    const newField: DailyFieldConfig = {
      ...field,
      id: "daily_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      name: field.name + " (副本)",
    };
    const n = [...临时日常配置];
    n.splice(idx + 1, 0, newField);
    set临时日常配置(n);
  };

  const addMonthlyCol = () => {
    openPrompt(
      "请输入月度表要新增的字段属性名称（例如：用电功率因素值）：",
      (colName) => {
        if (colName && colName.trim() !== "") {
          const id = "custom_val_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
          const cleanName = colName.trim();
          set月度自定义列((prev) => [...prev, id]);
          set月度列顺序((prev) => [...prev, id]);
          set自定义列名称Map((prev) => ({ ...prev, [id]: cleanName }));
          const newField: MonthlyCircuitConfig = {
            id,
            name: cleanName,
            category: "公区设备",
          };
          set临时月度配置((prev) => [...prev, newField]);
        }
      },
    );
  };

  const removeMonthlyCol = (id: string) => {
    set月度自定义列((prev) => prev.filter((c) => c !== id));
    set月度列顺序((prev) => prev.filter((c) => c !== id));
    set临时月度配置((prev) => prev.filter((f) => f.id !== id));
  };

  const insertMonthlyRow = (idx: number) => {
    const row = 临时月度配置[idx];
    const newRow: MonthlyCircuitConfig = {
      ...row,
      id: "circuit_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      name: row.name + " (副本)",
    };
    const n = [...临时月度配置];
    n.splice(idx + 1, 0, newRow);
    set临时月度配置(n);
  };

  const sortedDailyCols = 日常列顺序.map((colId) => {
    switch (colId) {
      case "name":
        return { id: colId, name: "名称", isSystem: true, minW: "120px" };
      case "id":
        return {
          id: colId,
          name: "代码ID (唯一)",
          isSystem: true,
          minW: "140px",
        };
      case "category":
        return { id: colId, name: "类别", isSystem: true, w: "24" };
      case "unit":
        return { id: colId, name: "单位", isSystem: true, w: "24" };
      case "limit":
        return { id: colId, name: "限额", isSystem: true, w: "28" };
      default:
        const fieldConfig = 日常回路配置.find((f) => f.id === colId) || 临时日常配置.find((f) => f.id === colId);
        return {
          id: colId,
          name: 自定义列名称Map[colId] || (fieldConfig ? fieldConfig.name : colId),
          isSystem: false,
          minW: "140px",
        };
    }
  });

  const sortedMonthlyCols = 月度列顺序.map((colId) => {
    switch (colId) {
      case "name":
        return { id: colId, name: "名称", isSystem: true, minW: "120px" };
      case "id":
        return {
          id: colId,
          name: "代码ID (唯一)",
          isSystem: true,
          minW: "160px",
        };
      case "category":
        return { id: colId, name: "层级 / 区域分类", isSystem: true, w: "40" };
      default:
        const fieldConfig = circuitData.find((f) => f.id === colId) || 临时月度配置.find((f) => f.id === colId);
        return {
          id: colId,
          name: 自定义列名称Map[colId] || (fieldConfig ? fieldConfig.name : colId),
          isSystem: false,
          minW: "140px",
        };
    }
  });

  return {
    限额配置,
    set限额配置,
    配置输入,
    set配置输入,
    配置反馈,
    set配置反馈,
    日常回路配置,
    set日常回路配置,
    circuitData,
    setCircuitData,
    自定义大类映射,
    set自定义大类映射,
    临时日常配置,
    set临时日常配置,
    临时月度配置,
    set临时月度配置,
    配置激活Tab,
    set配置激活Tab,
    日常自定义列,
    set日常自定义列,
    日常列顺序,
    set日常列顺序,
    月度自定义列,
    set月度自定义列,
    月度列顺序,
    set月度列顺序,
    保存配置,
    保存日常表字段,
    保存月度回路,
    addDailyCol,
    removeDailyCol,
    insertDailyRow,
    addMonthlyCol,
    removeMonthlyCol,
    insertMonthlyRow,
    sortedDailyCols,
    sortedMonthlyCols,
  };
}
