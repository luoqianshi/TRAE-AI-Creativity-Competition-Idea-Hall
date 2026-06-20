export function getDynamicMeterNames() {
  let litixianName = "李体线";
  let wushaxianName = "午沙线";
  let hotelWaterName = "酒店自来水";
  let fountainWaterName = "喷泉景观水";

  try {
    const savedDaily = localStorage.getItem("酒店日常回路配置");
    if (savedDaily) {
      const parsed = JSON.parse(savedDaily);
      if (Array.isArray(parsed)) {
        const item1 = parsed.find((f: any) => f.id === "李体线电表");
        if (item1 && item1.name) {
          litixianName = item1.name.replace(/电表$/, "");
        }
        const item2 = parsed.find((f: any) => f.id === "午沙线电表");
        if (item2 && item2.name) {
          wushaxianName = item2.name.replace(/电表$/, "");
        }
        const item3 = parsed.find((f: any) => f.id === "酒店水表");
        if (item3 && item3.name) {
          hotelWaterName = item3.name.replace(/水表$/, "");
        }
        const item4 = parsed.find((f: any) => f.id === "喷泉水表");
        if (item4 && item4.name) {
          fountainWaterName = item4.name.replace(/水表$/, "");
        }
      }
    }
  } catch (e) {
    // ignore
  }

  return { litixianName, wushaxianName, hotelWaterName, fountainWaterName };
}
