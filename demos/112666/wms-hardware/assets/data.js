// WMS Hardware - Shared Data Store (localStorage)
var Store = (function() {
  'use strict';

  var STORAGE_KEY = 'wms_hardware_data';
  var SYNC_KEY = 'wms_hardware_sync';

  function getDefaultData() {
    return {
      inventory: [
        { id:1, code:'ITEM-001', name:'贴片电阻 0402 1KΩ', category:'电子元器件', spec:'0402 1KΩ ±5%', qty:50000, unit:'个', location:'A-01-01', barcode:'BC10001', safety:10000, status:'正常' },
        { id:2, code:'ITEM-002', name:'贴片电容 0603 100nF', category:'电子元器件', spec:'0603 100nF 50V', qty:32000, unit:'个', location:'A-01-02', barcode:'BC10002', safety:8000, status:'正常' },
        { id:3, code:'ITEM-003', name:'STM32F407VET6 MCU', category:'电子元器件', spec:'LQFP-100 ARM Cortex-M4', qty:850, unit:'个', location:'A-02-01', barcode:'BC10003', safety:200, status:'正常' },
        { id:4, code:'ITEM-004', name:'M3x10 不锈钢螺丝', category:'机械零件', spec:'M3x10 304不锈钢', qty:4000, unit:'个', location:'B-01-01', barcode:'BC10004', safety:2000, status:'正常' },
        { id:5, code:'ITEM-005', name:'轴承 6205-2RS', category:'机械零件', spec:'25x52x15mm 双密封', qty:120, unit:'个', location:'B-01-02', barcode:'BC10005', safety:50, status:'低库存' },
        { id:6, code:'ITEM-006', name:'铝合金型材 2020', category:'机械零件', spec:'20x20mm 1m/根', qty:180, unit:'米', location:'B-02-01', barcode:'BC10006', safety:40, status:'正常' },
        { id:7, code:'ITEM-007', name:'ABS塑料颗粒', category:'原材料', spec:'通用级 25kg/袋', qty:45, unit:'kg', location:'C-01-01', barcode:'BC10007', safety:100, status:'缺货' },
        { id:8, code:'ITEM-008', name:'铜线 0.5mm²', category:'原材料', spec:'0.5mm² 100m/卷', qty:28, unit:'卷', location:'C-01-02', barcode:'BC10008', safety:15, status:'正常' },
        { id:9, code:'ITEM-009', name:'智能温控器 X200', category:'成品', spec:'X200 220V 16A WiFi', qty:560, unit:'个', location:'D-01-01', barcode:'BC10009', safety:100, status:'正常' },
        { id:10, code:'ITEM-010', name:'LED驱动电源 24V', category:'成品', spec:'24V 100W IP67防水', qty:48, unit:'个', location:'D-02-01', barcode:'BC10010', safety:30, status:'低库存' },
        { id:11, code:'ITEM-011', name:'防静电包装袋', category:'包装材料', spec:'200x300mm 防静电', qty:8000, unit:'个', location:'E-01-01', barcode:'BC10011', safety:2000, status:'正常' },
        { id:12, code:'ITEM-012', name:'纸箱 K3K 5层', category:'包装材料', spec:'400x300x250mm', qty:320, unit:'个', location:'E-01-02', barcode:'BC10012', safety:100, status:'正常' }
      ],
      locations: [
        { code:'A-01-01', zone:'A区-电子仓', shelf:'R01', layer:1, capacity:500, used:320 },
        { code:'A-01-02', zone:'A区-电子仓', shelf:'R01', layer:2, capacity:500, used:410 },
        { code:'A-02-01', zone:'A区-电子仓', shelf:'R02', layer:1, capacity:500, used:180 },
        { code:'B-01-01', zone:'B区-机械仓', shelf:'R01', layer:1, capacity:300, used:280 },
        { code:'B-01-02', zone:'B区-机械仓', shelf:'R01', layer:2, capacity:300, used:150 },
        { code:'B-02-01', zone:'B区-机械仓', shelf:'R02', layer:1, capacity:300, used:90 },
        { code:'C-01-01', zone:'C区-原材料仓', shelf:'R01', layer:1, capacity:800, used:600 },
        { code:'C-01-02', zone:'C区-原材料仓', shelf:'R01', layer:2, capacity:800, used:350 },
        { code:'D-01-01', zone:'D区-成品仓', shelf:'R01', layer:1, capacity:400, used:220 },
        { code:'D-02-01', zone:'D区-成品仓', shelf:'R02', layer:1, capacity:400, used:380 },
        { code:'E-01-01', zone:'E区-包装仓', shelf:'R01', layer:1, capacity:600, used:200 },
        { code:'E-01-02', zone:'E区-包装仓', shelf:'R01', layer:2, capacity:600, used:450 }
      ],
      pickingOrders: [
        { id:1, orderNo:'PICK-20260711-001', customer:'北京恒通科技', waveNo:'WAVE-001', priority:'高', items:[
          { productCode:'ITEM-009', productName:'智能温控器 X200', qty:20, unit:'个', location:'D-01-01', barcode:'BC10009', picked:0, status:'待拣货' },
          { productCode:'ITEM-010', productName:'LED驱动电源 24V', qty:5, unit:'个', location:'D-02-01', barcode:'BC10010', picked:0, status:'待拣货' },
          { productCode:'ITEM-001', productName:'贴片电阻 0402 1KΩ', qty:500, unit:'个', location:'A-01-01', barcode:'BC10001', picked:0, status:'待拣货' }
        ], status:'拣货中', createTime:'2026-07-11 08:30', assignee:'张三' },
        { id:2, orderNo:'PICK-20260711-002', customer:'上海华虹电子', waveNo:'WAVE-001', priority:'高', items:[
          { productCode:'ITEM-002', productName:'贴片电容 0603 100nF', qty:2000, unit:'个', location:'A-01-02', barcode:'BC10002', picked:0, status:'待拣货' },
          { productCode:'ITEM-003', productName:'STM32F407VET6 MCU', qty:50, unit:'个', location:'A-02-01', barcode:'BC10003', picked:0, status:'待拣货' }
        ], status:'待拣货', createTime:'2026-07-11 08:30', assignee:'--' },
        { id:3, orderNo:'PICK-20260711-003', customer:'广州自动化设备', waveNo:'WAVE-002', priority:'中', items:[
          { productCode:'ITEM-006', productName:'铝合金型材 2020', qty:10, unit:'米', location:'B-02-01', barcode:'BC10006', picked:0, status:'待拣货' },
          { productCode:'ITEM-004', productName:'M3x10 不锈钢螺丝', qty:500, unit:'个', location:'B-01-01', barcode:'BC10004', picked:0, status:'待拣货' }
        ], status:'待拣货', createTime:'2026-07-11 09:00', assignee:'--' },
        { id:4, orderNo:'PICK-20260711-004', customer:'深圳照明科技', waveNo:'WAVE-002', priority:'中', items:[
          { productCode:'ITEM-010', productName:'LED驱动电源 24V', qty:10, unit:'个', location:'D-02-01', barcode:'BC10010', picked:0, status:'待拣货' },
          { productCode:'ITEM-011', productName:'防静电包装袋', qty:500, unit:'个', location:'E-01-01', barcode:'BC10011', picked:0, status:'待拣货' }
        ], status:'待拣货', createTime:'2026-07-11 09:00', assignee:'--' }
      ],
      inboundOrders: [
        { id:1, orderNo:'IN-20260711-001', productName:'贴片电阻 0402 1KΩ', qty:10000, unit:'个', location:'A-01-01', supplier:'深圳华强电子', date:'2026-07-11', status:'待收货', barcode:'BC10001' },
        { id:2, orderNo:'IN-20260711-002', productName:'智能温控器 X200', qty:100, unit:'个', location:'D-01-01', supplier:'杭州智控科技', date:'2026-07-11', status:'待收货', barcode:'BC10009' },
        { id:3, orderNo:'IN-20260710-001', productName:'STM32F407VET6 MCU', qty:200, unit:'个', location:'A-02-01', supplier:'ST意法半导体', date:'2026-07-10', status:'已完成', barcode:'BC10003' }
      ],
      outboundOrders: [
        { id:1, orderNo:'OUT-20260711-001', productName:'智能温控器 X200', qty:30, unit:'个', location:'D-01-01', customer:'成都电子研究所', date:'2026-07-11', status:'待发货', barcode:'BC10009' },
        { id:2, orderNo:'OUT-20260710-001', productName:'贴片电容 0603 100nF', qty:5000, unit:'个', location:'A-01-02', customer:'上海华虹电子', date:'2026-07-10', status:'已发货', barcode:'BC10002' }
      ],
      nextIds: { inventory:13, pickingOrder:5, pickingItem:1, inbound:4, outbound:3, location:13 }
    };
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) { return JSON.parse(raw); }
    } catch(e) {}
    var d = getDefaultData();
    save(d);
    return d;
  }

  function save(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      localStorage.setItem(SYNC_KEY, Date.now().toString());
    } catch(e) {}
  }

  function getSyncTime() {
    return localStorage.getItem(SYNC_KEY) || '0';
  }

  var data = load();

  function persist() { save(data); }

  return {
    data: data,
    persist: persist,
    getSyncTime: getSyncTime,
    STORAGE_KEY: STORAGE_KEY,
    SYNC_KEY: SYNC_KEY
  };
})();