import { useState, useEffect } from "react";
import { MonthlyCircuitConfig } from "../types";

interface UseRouteStateProps {
  circuitData: MonthlyCircuitConfig[];
  自定义大类映射: { [key: string]: string[] };
}

export function useRouteState({ circuitData, 自定义大类映射 }: UseRouteStateProps) {
  const [抄表子路由, set抄表子路由] = useState<"日常" | "月度">("日常");
  const [历史抄表子路由, set历史抄表子路由] = useState<
    "日常" | "日常汇总" | "月度" | "月度汇总"
  >("日常");
  const [当前回路分类, set当前回路分类] = useState<string>("客房区域");
  const [查询历史日期, set查询历史日期] = useState("");

  useEffect(() => {
    const activeMajorCategories = Array.from(
      new Set(
        circuitData.map((c) => {
          for (const [mj, subs] of Object.entries(自定义大类映射 || {})) {
            if (subs.includes(c.category)) return mj;
          }
          return c.category || "未分类";
        }),
      ),
    );
    if (activeMajorCategories.length > 0 && !activeMajorCategories.includes(当前回路分类)) {
      set当前回路分类(activeMajorCategories[0]);
    }
  }, [circuitData, 自定义大类映射, 当前回路分类]);

  return {
    抄表子路由,
    set抄表子路由,
    历史抄表子路由,
    set历史抄表子路由,
    当前回路分类,
    set当前回路分类,
    查询历史日期,
    set查询历史日期,
  };
}
