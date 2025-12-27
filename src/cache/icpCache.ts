import type { CompanyResult } from '../types/company.js';

const cache = new Map<string, CompanyResult[]>();

export const getCached = (key: string) => cache.get(key);
export const setCached = (key: string, value: CompanyResult[]) =>
  cache.set(key, value);
