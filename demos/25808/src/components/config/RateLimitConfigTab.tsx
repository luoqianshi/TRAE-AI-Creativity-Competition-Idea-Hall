import React from "react";
import {
  Save,
  CalendarRange,
  ShieldAlert,
  Building,
} from "lucide-react";
import { 字典配置, DailyFieldConfig } from "../../shared/types";

interface RateLimitConfigTabProps {
  配置输入: 字典配置;
  set配置输入: (val: 字典配置) => void;
  保存配置: (e: React.FormEvent) => void;
  日常回路配置: DailyFieldConfig[];
}

export const RateLimitConfigTab: React.FC<RateLimitConfigTabProps> = ({
  配置输入,
  set配置输入,
  保存配置,
  日常回路配置,
}) => {
  const litixianName =
    日常回路配置.find((f) => f.id === "李体线电表")?.name || "李体线电表";
  const wushaxianName =
    日常回路配置.find((f) => f.id === "午沙线电表")?.name || "午沙线电表";

  return (
    <div className="space-y-6" id="rate_limit_config_container">
      <div className="bg-white border border-zinc-200/60 rounded-xl p-6 shadow-xs space-y-6">
        <div className="border-b border-zinc-150 pb-6 space-y-4" id="project_identity_config_section">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-widest flex items-center gap-1.5">
              <Building className="h-4.5 w-4.5 text-zinc-400" />
              一、酒店主体与用能仪表档案配置（跨板块基础信息同步）
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-zinc-550">
                用能项目（酒店/建筑）官方名称
              </label>
              <input
                type="text"
                value={配置输入.酒店名称 !== undefined ? 配置输入.酒店名称 : "国信金融酒店"}
                onChange={(e) => {
                  set配置输入({
                    ...配置输入,
                    酒店名称: e.target.value,
                  });
                }}
                className="w-full text-sm py-2 px-3 border border-zinc-200 rounded-lg bg-white text-zinc-800 focus:ring-2 focus:ring-zinc-900/5 transition-all outline-none"
                placeholder="请输入您的酒店/写字楼官方简称，如：国信金融酒店"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-zinc-550">
                电网结算交费户号 (10位)
              </label>
              <input
                type="text"
                value={配置输入.电费户号 !== undefined ? 配置输入.电费户号 : "1001624686"}
                onChange={(e) => {
                  set配置输入({
                    ...配置输入,
                    电费户号: e.target.value,
                  });
                }}
                className="w-full text-sm py-2 px-3 border border-zinc-200 rounded-lg bg-white font-mono text-zinc-800 focus:ring-2 focus:ring-zinc-900/5 transition-all outline-none"
                placeholder="请输入电网10位用电客户户号"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-zinc-550">
                「{litixianName}」主电网高压电表资产表号 (15位)
              </label>
              <input
                type="text"
                value={配置输入.李体线表号 !== undefined ? 配置输入.李体线表号 : "000000536129444"}
                onChange={(e) => {
                  set配置输入({
                    ...配置输入,
                    李体线表号: e.target.value,
                  });
                }}
                className="w-full text-sm py-2 px-3 border border-zinc-200 rounded-lg bg-white font-mono text-zinc-800 focus:ring-2 focus:ring-zinc-900/5 transition-all outline-none"
                placeholder={`请输入${litixianName}供电表表号`}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-zinc-550">
                「{wushaxianName}」主电网高压电表资产表号 (15位)
              </label>
              <input
                type="text"
                value={配置输入.午沙线表号 !== undefined ? 配置输入.午沙线表号 : "000000536114945"}
                onChange={(e) => {
                  set配置输入({
                    ...配置输入,
                    午沙线表号: e.target.value,
                  });
                }}
                className="w-full text-sm py-2 px-3 border border-zinc-200 rounded-lg bg-white font-mono text-zinc-800 focus:ring-2 focus:ring-zinc-900/5 transition-all outline-none"
                placeholder={`请输入${wushaxianName}供电表表号`}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-zinc-550">
                主电网高压电表换算基数（默认 3500）
              </label>
              <input
                type="number"
                value={配置输入.电表换算基数 !== undefined ? 配置输入.电表换算基数 : 3500}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  set配置输入({
                    ...配置输入,
                    电表换算基数: isNaN(val) ? 3500 : val,
                  });
                }}
                className="w-full text-sm py-2 px-3 border border-zinc-200 rounded-lg bg-white font-mono text-zinc-800 focus:ring-2 focus:ring-zinc-950/5 transition-all outline-none"
                placeholder="请输入电表换算基数，例如3500"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-150 pt-6">
          <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-widest flex items-center gap-1.5">
            <CalendarRange className="h-4.5 w-4.5 text-zinc-400" />
            三、酒店用电对账日设定（动态跨期数据结算与财务稽核）
          </h3>
          <p className="text-xs text-zinc-500 mt-1 font-sans">
            您可以设定每月固定用电抄表核销与财务对账截止日期。系统将自动切分出 **[上月对账日 + 1 日] 至 [本月对账日]** 跨期周期，与对应月份的月度抄表数据（二级回路总用量及电费）进行点对点差额穿透审计。
          </p>
          <div className="mt-4 p-4 bg-zinc-50 border border-zinc-200/50 rounded-xl max-w-md">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-600">
                每月固定用电结算对账日
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={配置输入.对账日 !== undefined ? 配置输入.对账日 : 28}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    set配置输入({
                      ...配置输入,
                      对账日: isNaN(val) ? 28 : Math.max(1, Math.min(31, val)),
                    });
                  }}
                  className="w-24 text-sm py-2 px-3 border border-zinc-200 rounded-lg bg-white font-mono text-zinc-800 text-center focus:ring-2 focus:ring-zinc-900/5 transition-all outline-none"
                />
                <span className="text-xs font-semibold text-zinc-700">日</span>
              </div>
              <p className="text-[10px] text-zinc-400 leading-normal">
                设定为 <span className="font-bold text-zinc-600">{配置输入.对账日 !== undefined ? 配置输入.对账日 : 28} 日</span> 后，月度系统对账计算范围为：<span className="font-bold text-zinc-650">上月 {配置输入.对账日 !== undefined ? (配置输入.对账日 % 31) + 1 : 29} 号</span> 起至 <span className="font-bold text-zinc-650">本月 {配置输入.对账日 !== undefined ? 配置输入.对账日 : 28} 号</span>。
              </p>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex items-start space-x-3">
          <ShieldAlert className="h-5 w-5 text-amber-600 mt-0.5" />
          <div className="text-xs text-amber-800 leading-relaxed font-sans">
            <span className="font-bold">重要提示：</span>
            变更上述配置后，变动正临时存储于编辑器缓存中。您
            <span className="font-bold">
              必须点击下方的「确认最终发布并同步费率配置」按钮
            </span>
            ，才能更新写入系统数据仓库以彻底生效！
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={(e) => {
              保存配置(e);
            }}
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>确认最终发布并同步费率配置</span>
          </button>
        </div>
      </div>
    </div>
  );
};
