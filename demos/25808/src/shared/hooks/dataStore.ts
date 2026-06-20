import { 抄表记录, 月度抄表记录, 默认抄表历史, 默认月度抄表历史 } from "../types";
import { apiService } from "../services/apiService";

const DAILY_RECORDS_KEY = "酒店抄表历史";
const MONTHLY_RECORDS_KEY = "酒店月度抄表历史";

interface DataStore<T> {
  get(): T[];
  set(items: T[]): void;
  syncFromApi(): Promise<T[]>;
}

export class RecordStore<T> implements DataStore<T> {
  private key: string;
  private defaultValue: T[];
  private apiFetcher: () => Promise<any[]>;
  private apiSaver?: (items: T[]) => Promise<void>;
  private transform?: (raw: any) => T;

  constructor(
    key: string,
    defaultValue: T[],
    apiFetcher: () => Promise<any[]>,
    apiSaver?: (items: T[]) => Promise<void>,
    transform?: (raw: any) => T
  ) {
    this.key = key;
    this.defaultValue = defaultValue;
    this.apiFetcher = apiFetcher;
    this.apiSaver = apiSaver;
    this.transform = transform;
  }

  get(): T[] {
    const cached = localStorage.getItem(this.key);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return this.defaultValue;
      }
    }
    return this.defaultValue;
  }

  set(items: T[]): void {
    localStorage.setItem(this.key, JSON.stringify(items));
  }

  async syncFromApi(): Promise<T[]> {
    try {
      const raw = await this.apiFetcher();
      const transformed = this.transform
        ? raw.map((r: any) => this.transform!(r))
        : raw;
      this.set(transformed);
      return transformed;
    } catch {
      return this.get();
    }
  }

  async save(item: T, identifier: (item: T) => string): Promise<void> {
    const current = this.get();
    const id = identifier(item);
    const existingIndex = current.findIndex((i) => identifier(i) === id);
    
    if (existingIndex >= 0) {
      current[existingIndex] = item;
    } else {
      current.push(item);
    }
    
    this.set(current);
    
    if (this.apiSaver) {
      await this.apiSaver(current);
    }
  }

  async delete(identifier: string, getId: (item: T) => string): Promise<void> {
    const current = this.get();
    const filtered = current.filter((i) => getId(i) !== identifier);
    this.set(filtered);
    
    if (this.apiSaver) {
      await this.apiSaver(filtered);
    }
  }
}

const dailyTransformer = (raw: any): 抄表记录 => ({
  日期: new Date(raw.date).toISOString().split('T')[0],
  ...(raw.readings || {}),
});

export const dailyRecordsStore = new RecordStore<抄表记录>(
  DAILY_RECORDS_KEY,
  默认抄表历史,
  () => apiService.getDailyRecords(),
  undefined,
  dailyTransformer
);

export const monthlyRecordsStore = new RecordStore<月度抄表记录>(
  MONTHLY_RECORDS_KEY,
  默认月度抄表历史,
  () => apiService.getMonthlyRecords('')
);
