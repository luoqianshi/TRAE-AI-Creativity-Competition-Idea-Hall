/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from "motion/react";

// 业务组件 - 从 components 目录导入
import { EnergyDashboard } from "./components/dashboard";
import { PowerDashboard } from "./components/dashboard";
import { WaterDashboard } from "./components/dashboard";
import { GasDashboard } from "./components/dashboard";
import { DailyEntryView } from "./components/meter-entry";
import { HistoryArchiveView } from "./components/history";
import { SystemConfigView } from "./components/config";
import { LoginView } from "./components/auth";

// 共享组件
import { Sidebar, Header, SystemDialogWrapper } from "./shared/components";

// Hooks
import { useSystemDialog } from "./shared/hooks";
import { useAuth } from "./shared/hooks";
import { useEnergyConfig } from "./shared/hooks";
import { useMeterRecords } from "./shared/hooks";

// 类型
import { 抄表记录 } from "./shared/types";

export default function App() {
  // 1. 全局弹窗控制
  const {
    系统弹窗,
    closeDialog,
    openPrompt,
    openConfirm,
    openAlert,
    set系统弹窗,
  } = useSystemDialog();

  // 2. 身份验证与登录体系
  const {
    当前路由,
    用户,
    登录账号,
    set登录账号,
    登录密码,
    set登录密码,
    登录错误,
    登录中,
    触发登录Action,
    触发退出登录,
    安全跳转路由,
  } = useAuth();

  // 3. 回路模型与参数校验限额词典
  const energyConfig = useEnergyConfig(当前路由, openAlert, openPrompt);

  // 4. 数仓全备与日常、月度抄表序列管理
  const meterRecords = useMeterRecords(
    energyConfig.日常回路配置,
    energyConfig.circuitData,
    energyConfig.自定义大类映射,
    用户,
    openConfirm,
    openAlert,
    energyConfig.set配置反馈,
  );

  // 5. 衍生能效快照计算
  const 最新记录: 抄表记录 = meterRecords.历史数据[meterRecords.历史数据.length - 1] || { 日期: "无数据" };
  const 昨日记录: 抄表记录 = meterRecords.历史数据[meterRecords.历史数据.length - 2] || 最新记录;

  // 根据当前输入的日期，寻找刚好在那之前的最后一条记录作为"上期底数"
  let 填报上期记录: 抄表记录 = { 日期: "无数据" };
  for (let i = meterRecords.历史数据.length - 1; i >= 0; i--) {
    if (meterRecords.历史数据[i].日期 < meterRecords.输入日期) {
      填报上期记录 = meterRecords.历史数据[i];
      break;
    }
  }

  // 未登录时显示登录页
  if (!用户) {
    return (
      <LoginView
        登录账号={登录账号}
        set登录账号={set登录账号}
        登录密码={登录密码}
        set登录密码={set登录密码}
        登录错误={登录错误}
        登录中={登录中}
        触发登录Action={触发登录Action}
      />
    );
  }

  // 主应用布局
  return (
    <div className="flex bg-zinc-100 h-screen overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key="dashboard_container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-1"
        >
          {/* Sidebar */}
          <Sidebar
            当前路由={当前路由}
            用户={用户}
            安全跳转路由={安全跳转路由}
            酒店名称={energyConfig.限额配置.酒店名称}
          />

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-w-0">
            <Header
              当前路由={当前路由}
              最新记录日期={最新记录.日期}
              用户={用户}
              触发退出登录={触发退出登录}
            />

            <main className="flex-1 overflow-y-auto overflow-x-hidden w-full min-w-0 p-10 bg-zinc-50/70">
              <AnimatePresence mode="wait">
                {/* 能效大盘 */}
                {当前路由 === "能效大盘" && (
                  <EnergyDashboard
                    历史数据={meterRecords.历史数据}
                    最新记录={最新记录}
                    昨日记录={昨日记录}
                    日常回路配置={energyConfig.日常回路配置}
                    限额配置={energyConfig.限额配置}
                  />
                )}

                {/* 用电看板 */}
                {当前路由 === "用电看板" && (
                  <PowerDashboard
                    历史数据={meterRecords.历史数据}
                    最新记录={最新记录}
                    昨日记录={昨日记录}
                    限额配置={energyConfig.限额配置}
                    日常回路配置={energyConfig.日常回路配置}
                    月度历史={meterRecords.月度历史}
                    circuitData={energyConfig.circuitData}
                  />
                )}

                {/* 用水看板 */}
                {当前路由 === "用水看板" && (
                  <WaterDashboard
                    历史数据={meterRecords.历史数据}
                    最新记录={最新记录}
                    昨日记录={昨日记录}
                    限额配置={energyConfig.限额配置}
                    日常回路配置={energyConfig.日常回路配置}
                  />
                )}

                {/* 用气看板 */}
                {当前路由 === "用气看板" && (
                  <GasDashboard
                    历史数据={meterRecords.历史数据}
                    最新记录={最新记录}
                    昨日记录={昨日记录}
                    日常回路配置={energyConfig.日常回路配置}
                    限额配置={energyConfig.限额配置}
                  />
                )}

                {/* 日常抄表 */}
                {当前路由 === "日常抄表" && (
                  <DailyEntryView
                    抄表子路由={meterRecords.抄表子路由}
                    set抄表子路由={meterRecords.set抄表子路由}
                    输入日期={meterRecords.输入日期}
                    set输入日期={meterRecords.set输入日期}
                    日常抄表输入={meterRecords.日常抄表输入}
                    set日常抄表输入={meterRecords.set日常抄表输入}
                    抄表反馈={meterRecords.抄表反馈}
                    提交日常抄表={meterRecords.提交日常抄表}
                    快速清空抄表表单={meterRecords.快速清空抄表表单}
                    日常回路配置={energyConfig.日常回路配置}
                    最新记录={填报上期记录}
                    选中月度月份={meterRecords.选中月度月份}
                    set选中月度月份={meterRecords.set选中月度月份}
                    当前回路分类={meterRecords.当前回路分类}
                    set当前回路分类={meterRecords.set当前回路分类}
                    circuitData={energyConfig.circuitData}
                    月度回路输入={meterRecords.月度回路输入}
                    set月度回路输入={meterRecords.set月度回路输入}
                    提交月度抄表={meterRecords.提交月度抄表}
                    快速清空月度表单={meterRecords.快速清空月度表单}
                    月度抄表反馈={meterRecords.月度抄表反馈}
                    填充单条月度数据={meterRecords.填充单条月度数据}
                    月度历史={meterRecords.月度历史}
                    自定义大类映射={energyConfig.自定义大类映射}
                    限额配置={energyConfig.限额配置}
                  />
                )}

                {/* 历史抄表库 */}
                {当前路由 === "历史抄表库" && (
                  <HistoryArchiveView
                    历史抄表子路由={meterRecords.历史抄表子路由}
                    set历史抄表子路由={meterRecords.set历史抄表子路由}
                    历史数据={meterRecords.历史数据}
                    更新抄表数据={meterRecords.更新抄表数据}
                    限额配置={energyConfig.限额配置}
                    日常回路配置={energyConfig.日常回路配置}
                    circuitData={energyConfig.circuitData}
                    sortedMonthlyCols={energyConfig.sortedMonthlyCols}
                    月度历史={meterRecords.月度历史}
                  />
                )}

                {/* 字典配置 */}
                {当前路由 === "字典配置" && (
                  <SystemConfigView
                    配置激活Tab={energyConfig.配置激活Tab}
                    set配置激活Tab={energyConfig.set配置激活Tab}
                    配置反馈={energyConfig.配置反馈}
                    配置输入={energyConfig.配置输入}
                    set配置输入={energyConfig.set配置输入}
                    保存配置={energyConfig.保存配置}
                    自定义大类映射={energyConfig.自定义大类映射}
                    set自定义大类映射={energyConfig.set自定义大类映射}
                    临时日常配置={energyConfig.临时日常配置}
                    set临时日常配置={energyConfig.set临时日常配置}
                    临时月度配置={energyConfig.临时月度配置}
                    set临时月度配置={energyConfig.set临时月度配置}
                    日常回路配置={energyConfig.日常回路配置}
                    circuitData={energyConfig.circuitData}
                    set日常列顺序={energyConfig.set日常列顺序}
                    set月度列顺序={energyConfig.set月度列顺序}
                    sortedDailyCols={energyConfig.sortedDailyCols}
                    sortedMonthlyCols={energyConfig.sortedMonthlyCols}
                    addDailyCol={energyConfig.addDailyCol}
                    removeDailyCol={energyConfig.removeDailyCol}
                    addMonthlyCol={energyConfig.addMonthlyCol}
                    removeMonthlyCol={energyConfig.removeMonthlyCol}
                    insertDailyRow={energyConfig.insertDailyRow}
                    insertMonthlyRow={energyConfig.insertMonthlyRow}
                    保存日常表字段={energyConfig.保存日常表字段}
                    保存月度回路={energyConfig.保存月度回路}
                    导出数据库备份={meterRecords.handle导出数据库备份}
                    导入数据库备份={meterRecords.handle导入数据库备份}
                    openConfirm={openConfirm}
                    openPrompt={openPrompt}
                    openAlert={openAlert}
                    月度历史={meterRecords.月度历史}
                    更新月度抄表数据={meterRecords.更新月度抄表数据}
                    日常抄表数据={meterRecords.历史数据}
                    更新日常抄表数据={meterRecords.更新抄表数据}
                  />
                )}
              </AnimatePresence>
            </main>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* 系统弹窗 */}
      <SystemDialogWrapper
        isOpen={系统弹窗.isOpen}
        title={系统弹窗.title}
        message={系统弹窗.message}
        type={系统弹窗.type}
        value={系统弹窗.value || ''}
        closeDialog={closeDialog}
        set系统弹窗={set系统弹窗}
        onConfirm={系统弹窗.onConfirm}
      />
    </div>
  );
}