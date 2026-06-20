export interface SerialPortInfo {
  path: string;
  manufacturer?: string;
  serialNumber?: string;
  pnpId?: string;
  locationId?: string;
  vendorId?: string;
  productId?: string;
}

export interface ConnectConfig {
  path: string;
  baudRate: number;
}

export interface SerialData {
  timestamp: number;
  data: string;
  isJson: boolean;
  parsedJson?: Record<string, any>;
}

export interface ConnectionState {
  isConnected: boolean;
  connectedPort?: string;
  baudRate?: number;
}
