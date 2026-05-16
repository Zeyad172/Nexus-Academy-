import { request, api } from "./api-client";
import { Certificate } from "../types";

export const certificatesApi = {
  getMyCertificates: async (): Promise<Certificate[]> => {
    return request.get<Certificate[]>("/certificates");
  },

  getCertificateHtml: async (courseId: number): Promise<string> => {
    return api.get<never, string>(`/certificates/${courseId}`, {
      responseType: "text",
    });
  },

  verifyCertificate: async (certificateId: string): Promise<string> => {
    return api.get<never, string>(`/certificates/verify/${certificateId}`, {
      responseType: "text",
    });
  },

  getDownloadUrl: (courseId: number): string => {
    return `${api.defaults.baseURL}/certificates/download/${courseId}`;
  },
};
