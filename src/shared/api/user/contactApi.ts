// src/shared/api/contactApi.ts
/**
 * Contact Message API Module
 */

import api from '@shared/auth/axiosConfig';

export interface ContactMessageCreate {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  category: string;
  message: string;
  recaptcha_token: string;
}

export interface ContactMessageResponse {
  id: number;
  reference_id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  category: string;
  message: string;
  status: string;
  created_at: string;
}

/**
 * Submit a contact form message
 * Public endpoint - works with or without authentication
 */
export const submitContactMessage = async (
  data: ContactMessageCreate
): Promise<ContactMessageResponse> => {
  try {
    const response = await api.post<ContactMessageResponse>('/contact', data);
    return response.data;
  } catch (error: any) {
    // Handle rate limiting specifically
    if (error.response?.status === 429) {
      throw new Error(
        error.response.data?.detail || 
        'Too many requests. Please try again later.'
      );
    }
    
    // Handle other errors
    throw new Error(
      error.response?.data?.detail || 
      'Failed to send message. Please try again.'
    );
  }
};