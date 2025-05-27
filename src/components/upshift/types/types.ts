export interface Visit {
  id: number;
  visitReason: string;
  dateOfVisit: string;
}

export interface Visitor {
  id: number;
  first_name: string;
  last_name: string;
  middleName?: string;
  city?: string;
  state?: string;
  emailAddress?: string;
  is_banned: boolean;
  firstVisit?: string;
  last_visit?: string;
  licenseNumber: string;
  dealergroup_id: number;
  dob: string;
  address: string;
  province: string;
  phoneNumber: string;
  total_visits: number;
  visits: Visit[];
}

export interface DealerGroup {
  id: number;
  name: string;
}

export interface VisitData {
  id: number;
  user: {
    first_name: string;
    last_name: string;
    email: string;
  };
  driversLicense: {
    first_name: string;
    last_name: string;
  };
  dateOfVisit: string;
  visitReason: string;
  salesConsultant: string;
}