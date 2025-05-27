export interface Entity {
  id: number;
  name: string;
}

export interface User extends Entity {
  first_name: string;
  last_name: string;
  jobTitle?: string;
  department?: string;
  dealership?: string;
  email: string;
  phoneNumber?: string;
  dateCreated: string;
  lastLogin?: string;
  isActive: boolean;
}

export interface UserData {
  id: number;
  first_name: string;
  last_name: string;
  job_title_id: number;
  jobTitle: string;
  department_id: uuid;
  department: string;
  dealership: string;
  dealership_id: number;
  primaryDealership: string;
  primary_dealership_id: number;
  dealerships: string[];
  dealergroup_id: number;
  email: string;
  phoneNumber: string;
  dateCreated: string;
  lastLogin: string;
  firebaseLastLogin?: string;
  isActive: string;
  role: string;
  role_id: number;
}

export interface LeadData {
  id: number;
  first_name: string;
  last_name: string;
  job_title_id: number;
  jobTitle: string;
  department_id: number;
  department: string;
  dealership: string;
  dealership_id: number;
  primaryDealership: string;
  primary_dealership_id: number;
  dealergroup_id: number;
  email: string;
  phoneNumber: string;
  dateCreated: string;
  lastLogin: string;
  firebaseLastLogin?: string;
  isActive: string;
  role: string;
  role_id: number;
}

export interface DealershipHours {
  day: string;
  open: string;
  close: string;
}

export interface ExtractedData {
  FIRST_NAME: string;
  MIDDLE_NAME?: string;
  LAST_NAME: string;
  SUFFIX?: string;

  DATE_OF_BIRTH: string;
  EXPIRATION_DATE: string;
  DATE_OF_ISSUE?: string;

  DOCUMENT_NUMBER: string;
  CLASS?: string;
  RESTRICTIONS?: string;
  ENDORSEMENTS?: string;

  ADDRESS: string;
  CITY_IN_ADDRESS?: string;
  STATE_IN_ADDRESS?: string;
  ZIP_CODE_IN_ADDRESS?: string;
  COUNTRY?: string;

  GENDER?: string;
  EYE_COLOR?: string;
  HEIGHT?: string;
  WEIGHT?: string;

  IMAGE_URL?: string;
}
export interface Dealership extends Entity {
  dealergroup_id: number;
  dealership_name: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phoneNumber: string;
  faxNumber: string;
  contactEmail: string;
  website: string;
  dateCreated: string;
  isActive: boolean;
  dealershipHours: DealershipHours[];
}

export interface License {
  id: number;
  licenseName: string;
  description?: string;
}

export type ColumnVisibility = Record<string, boolean>;

export interface Event {
  date: string; // Format: YYYY-MM-DD
  title: string;
  time: string; // Format: "09:00 AM - 10:00 AM"
  category?: string; // Optional category (e.g., "Marketing", "Design")
}

export interface ContactData {
  id: string;
  dealership_id: string | null;
  dealergroup_id: string | null;
  dms_number: string;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  gender: string;
  preferred_language: string;
  preferred_contact: Record<string, any>;
  primary_email: string;
  secondary_email?: string;
  mobile_phone: string;
  home_phone?: string;
  work_phone?: string;
  street_address: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
  status: string;
  is_banned: boolean;
  last_visit: string | null;
  total_visits: number;
  created_at: string;
  updated_at: string;
}
