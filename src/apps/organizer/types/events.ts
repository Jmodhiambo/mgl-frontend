// src/apps/organizer/types/events.ts

export interface EventFormData {
  title: string;
  description: string;
  venue: string;
  city: string;
  country: string;
  category: string;
  start_time: string;
  end_time: string;
  flyer: File | null;
}