/**
 * User Type Definition
 */

export interface User {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  role: string;
  email_verified: boolean;
  is_active: boolean;    
  created_at: string;
  // updated_at: string;
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

export interface OrganizerCreate {
  bio: string;
  organization_name?: string;
  website_url?: string;
  social_media_links?: string[];
  area_of_expertise: string[];
}

export interface OrganizerInfo extends OrganizerCreate {
  profile_picture_url?: string;
}
export interface Organizer {
    id: number;
    name: string;
    email: string;
    phone_number: string;
    role: string;
    email_verified: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    organizer_info: OrganizerInfo;

}

export interface OrganizerUpdate extends UserUpdate {
  bio?: string;
  organization_name?: string;
  website_url?: string;
  social_media_links?: string[];
  area_of_expertise?: string[];
}