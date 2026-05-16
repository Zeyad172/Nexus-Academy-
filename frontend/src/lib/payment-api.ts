import { request } from "./api-client";

export const paymentApi = {
  createCheckoutSession: async (courseId: number): Promise<{ url: string }> => {
    return request.post<{ url: string }>("/payments/create-checkout-session", {
      course_id: courseId,
    });
  },
};
