/**
 * User Type Definition
 */

export interface User {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  role: string;
  is_verified: boolean;
  is_active: boolean;    
  created_at: string;
  updated_at: string;
}

export interface UserCreate {
  name: string;
  email: string;
  phone_number: string;
  password: string;
}

export interface UserUpdate {
  name?: string;
  email?: string;
  phone_number?: string;
  role?: string;
}

export interface UserPasswordChange {
  old_password: string;
  new_password: string;
}

export interface UserPasswordUpdate {
  new_password: string;
}

export interface Organizer extends User {
  bio: string;
  organization_name?: string;
  website_url?: string;
  social_media_links?: string[];
  profile_picture_url?: string;
  area_of_expertise?: string[];
}

export interface OrganizerCreate {
  bio: string;
  organization_name?: string;
  website_url?: string;
  social_media_links?: string[];
  profile_picture_url: string;
  area_of_expertise: string[];
}

export interface OrganizerUpdate {
  bio?: string;
  organization_name?: string;
  website_url?: string;
  social_media_links?: string[];
  profile_picture_url?: string;
  area_of_expertise?: string[];
}