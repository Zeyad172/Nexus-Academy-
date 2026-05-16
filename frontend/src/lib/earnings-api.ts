import { request } from "./api-client";
import { EarningsSummary, EarningsAnalytics } from "../types";

export const earningsApi = {
  getSummary: async <T = any>(page = 1, limit = 10): Promise<EarningsSummary<T>> => {
    return request.get<EarningsSummary<T>>(`/earnings?page=${page}&limit=${limit}`);
  },

  getAnalytics: async (): Promise<EarningsAnalytics[]> => {
    return request.get<EarningsAnalytics[]>("/earnings/analytics");
  },
};
