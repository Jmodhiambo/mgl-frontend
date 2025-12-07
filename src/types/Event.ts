/**
 * Event types and interfaces
 */

export interface Event {
  id: number;
  title: string;
  organizer_id: number;
  description?: string;
  venue: string;
  start_time: string;
  end_time: string;
  original_filename: string;
  flyer_url: string;
  status: string;
  created_at: string;
  update_at: string;
}

export interface EventCreate {
    title: string;
    description?: string;
    venue: string;
    start_time: string;
    end_time: string;
}

export interface EventUpdate {
    title?: string;
    description?: string;
    venue?: string;
    start_time?: string;
    end_time?: string;
}