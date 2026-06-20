const getChinaDateStr = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

export function 导出数据库备份(
  set配置反馈: (val: string) => void,
  openAlert: (title: string, message: string) => void,
) {
  try {
    const keys = [
      "酒店日常回路配置",
      "酒店月度回路配置",
      "酒店日常自定义列",
      "酒店日常列顺序",
      "酒店月度自定义列",
      "酒店月度列顺序",
      "酒店抄表历史",
      "酒店月度抄表历史",
      "系统字典限额",
      "酒店月度自定义大类映射",
    ];
    const backupData: { [key: string]: string | null } = {};
    keys.forEach((key) => {
      backupData[key] = localStorage.getItem(key);
    });

    const jsonString = JSON.stringify(
      {
        appName: "GuoxinFinancialHotelEnergySystem",
        version: "1.2.0",
        timestamp: new Intl.DateTimeFormat("en-CA", {
          timeZone: "Asia/Shanghai",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
          .format(new Date())
          .replace(",", "")
          .replace(/\//g, "-"),
        data: backupData,
      },
      null,
      2,
    );

    const blob = new Blob([jsonString], {
      type: "application/json;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStr = getChinaDateStr().replace(/-/g, "");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `国信金融酒店_能耗数仓_备份_${dateStr}.json`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    set配置反馈("数据库备份已打包并成功下载。");
    setTimeout(() => set配置反馈(""), 3000);
  } catch (err) {
    openAlert("备份失败", "打包导出备份文件时发生未知错误，请重试");
  }
}

export function 导入数据库备份(
  file: File,
  openConfirm: (title: string, message: string, onConfirm: () => void) => void,
  openAlert: (title: string, message: string) => void,
) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const text = e.target?.result as string;
      const parsed = JSON.parse(text);
      if (
        !parsed ||
        parsed.appName !== "GuoxinFinancialHotelEnergySystem" ||
        !parsed.data
      ) {
        openAlert(
          "导入失败",
          "不合法的备份包文件，请确认上传了正确的国信金融酒店能耗备份JSON包。",
        );
        return;
      }

      openConfirm(
        "警告与二次确认",
        "恢复备份将会彻底覆盖您浏览器当前存储的全部日常/月度抄表历史数据、自定回路字段、指标预警上限等所有数仓配置！此操作不可撤回，确定覆盖吗？",
        () => {
          const dataToRestore = parsed.data;
          Object.keys(dataToRestore).forEach((key) => {
            if (dataToRestore[key] !== null) {
              localStorage.setItem(key, dataToRestore[key]);
            } else {
              localStorage.removeItem(key);
            }
          });
          window.location.reload();
        },
      );
    } catch (err) {
      openAlert("导入失败", "解析备份文件失败，JSON格式损坏或内容不完整。");
    }
  };
  reader.readAsText(file);
}
