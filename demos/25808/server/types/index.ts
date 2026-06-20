export interface 字典配置 {
  酒店名称?: string;
  电费户号?: string;
  李体线表号?: string;
  午沙线表号?: string;
  电表换算基数?: number;
  电费单价?: number;
  水费单价?: number;
  气费单价?: number;
  对账日?: number;
  单价历史?: Array<{
    id: string;
    生效日期: string;
    结束日期?: string;
    电费单价: number;
    水费单价: number;
    气费单价: number;
    备注?: string;
    操作人?: string;
  }>;
}
