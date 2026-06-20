import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const historicalTabCode = `
                  {/* ========================================================
                      历史抄表库视图
                      ======================================================== */}
                  {当前路由 === '历史抄表库' && (
                    <motion.div
                      key="历史抄表库"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-8"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
                            历史抄表库与数据导出
                          </h2>
                          <p className="text-xs text-zinc-400 mt-1 font-sans">
                            查询、导出、修改或重新录入历史抄表数据，用于全量归档。
                          </p>
                        </div>
                        <div className="flex space-x-3 items-center">
                          <div className="flex items-center space-x-2 bg-white border border-zinc-200/60 rounded-xl max-w-md px-3 py-1.5 shadow-xs">
                            <Search className="h-4 w-4 text-zinc-400" />
                            <input
                              type="date"
                              value={查询历史日期}
                              onChange={(e) => set查询历史日期(e.target.value)}
                              className="text-xs focus:outline-none border-none text-zinc-700 bg-transparent py-1 w-32"
                            />
                            {查询历史日期 && (
                              <button onClick={() => set查询历史日期('')} className="text-zinc-400 hover:text-zinc-600 text-xs">
                                清除
                              </button>
                            )}
                          </div>
                          
                          <button
                            onClick={() => exportDailyHistoryToExcel(历史数据, 限额配置)}
                            className="bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
                          >
                            <FileSpreadsheet className="h-4 w-4" />
                            <span>导出Excel报表</span>
                          </button>
                          
                          <button
                            onClick={() => document.getElementById('importHistoricals')?.click()}
                            className="bg-zinc-800 text-white hover:bg-zinc-900 flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
                          >
                            <Download className="h-4 w-4 rotate-180" />
                            <span>导入历史 (JSON)</span>
                          </button>
                          <input
                            type="file"
                            id="importHistoricals"
                            accept=".json"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = (e) => {
                                try {
                                  const result = JSON.parse(e.target?.result as string);
                                  if (Array.isArray(result) && result.length > 0 && typeof result[0] === 'object' && '日期' in result[0]) {
                                    set历史数据(result);
                                  } else {
                                    alert('导入的文件格式不正确');
                                  }
                                } catch (error) {
                                  alert('解析JSON文件失败');
                                }
                              };
                              reader.readAsText(file);
                            }}
                          />
                        </div>
                      </div>

                      <div className="bg-white border border-zinc-200/60 rounded-2xl shadow-xs overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse whitespace-nowrap">
                            <thead>
                              <tr className="bg-zinc-50/75 border-b border-zinc-200/50 text-xs font-semibold text-zinc-500 tracking-wider">
                                <th className="py-4 px-6 text-center w-16">序号</th>
                                <th className="py-4 px-6 w-32">抄表日期</th>
                                <th className="py-4 px-6 text-right">李体线电表 (度)</th>
                                <th className="py-4 px-6 text-right">午沙线电表 (度)</th>
                                <th className="py-4 px-6 text-right">酒店水表 (吨)</th>
                                <th className="py-4 px-6 text-right">喷泉水表 (吨)</th>
                                <th className="py-4 px-6 text-right border-l px-4">天然气总量 (m³)</th>
                                <th className="py-4 px-6 text-right text-zinc-400">锅炉房1</th>
                                <th className="py-4 px-6 text-right text-zinc-400">锅炉房2</th>
                                <th className="py-4 px-6 text-right text-zinc-400">锅炉房3</th>
                                <th className="py-4 px-6 text-right text-zinc-400">3楼宴会</th>
                                <th className="py-4 px-6 text-right text-zinc-400 border-r px-4">4楼自助</th>
                                <th className="py-4 px-6 text-center">操作</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 text-xs text-zinc-700">
                              {历史数据.length === 0 ? (
                                <tr>
                                  <td colSpan={13}>
                                    <div className="py-20 text-center space-y-3">
                                      <Archive className="h-10 w-10 text-zinc-300 mx-auto" />
                                      <p className="text-sm text-zinc-400 font-sans">暂无历史抄表数据，可进行导入或在「日常抄表录入」登记。</p>
                                    </div>
                                  </td>
                                </tr>
                              ) : (
                                历史数据
                                  .filter((项) => 查询历史日期 ? 项.日期 === 查询历史日期 : true)
                                  .slice()
                                  .reverse()
                                  .map((项, i) => (
                                    <tr key={项.日期} className="hover:bg-cyan-50/20 transition">
                                      <td className="py-3.5 px-6 font-mono text-center text-zinc-400">{i + 1}</td>
                                      <td className="py-3.5 px-6 font-semibold text-zinc-900">{项.日期}</td>
                                      <td className="py-3.5 px-6 text-right font-mono text-zinc-650">{项.李体线电表}</td>
                                      <td className="py-3.5 px-6 text-right font-mono text-zinc-650">{项.午沙线电表}</td>
                                      <td className="py-3.5 px-6 text-right font-mono text-zinc-650">{项.酒店水表}</td>
                                      <td className="py-3.5 px-6 text-right font-mono text-zinc-650">{项.喷泉水表}</td>
                                      <td className="py-3.5 px-6 text-right font-mono font-bold text-orange-600 border-l px-4">{项.天然气表}</td>
                                      <td className="py-3.5 px-6 text-right font-mono text-zinc-400">{项.气_锅炉1}</td>
                                      <td className="py-3.5 px-6 text-right font-mono text-zinc-400">{项.气_锅炉2}</td>
                                      <td className="py-3.5 px-6 text-right font-mono text-zinc-400">{项.气_锅炉3}</td>
                                      <td className="py-3.5 px-6 text-right font-mono text-zinc-400">{项.气_3F宴会}</td>
                                      <td className="py-3.5 px-6 text-right font-mono text-zinc-400 border-r px-4">{项.气_4F自助}</td>
                                      <td className="py-3.5 px-6 text-center space-x-2">
                                        <button
                                          onClick={() => { 安全跳转路由("日常抄表"); 填充单条抄表数据(项); }}
                                          className="text-cyan-600 hover:text-cyan-700 cursor-pointer text-xxs font-medium"
                                        >
                                          校准
                                        </button>
                                        <button
                                          onClick={() => 删除单条抄表(项.日期)}
                                          className="text-red-500 hover:text-red-700 hover:underline cursor-pointer text-xxs font-medium"
                                        >
                                          删除
                                        </button>
                                      </td>
                                    </tr>
                                  ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </motion.div>
                  )}
`;

content = content.replace(
  "{/* ========================================================\n                      系统字典配置视图 (仅 ADMIN - 工程总监 可见)\n                      ======================================================== */}",
  historicalTabCode + "\n                  {/* ========================================================\n                      系统字典配置视图 (仅 ADMIN - 工程总监 可见)\n                      ======================================================== */}"
);

fs.writeFileSync('src/App.tsx', content);
