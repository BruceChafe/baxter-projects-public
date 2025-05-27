import { ReactNode } from 'react';

export interface ContactHistoryEntry {
  id: string;
  date: string;
  type: 'call' | 'email' | 'sms' | 'visit' | 'note' | 'other';
  details: string | null;
  duration?: string;
  outcome?: 'successful' | 'unsuccessful' | 'pending';
  agent?: string;
  location?: string;
}

export interface VehicleHistoryEntry {
  id: string;
  make: string;
  model: string;
  year: string;
  vin: string;
  purchaseDate: string;
  saleDate?: string;
  status?: 'current' | 'sold' | 'traded';
  color?: string;
  mileage?: string;
}

export interface ServiceHistoryEntry {
  id: string;
  date: string;
  serviceType: string;
  cost: string;
  notes?: string;
  status?: 'completed' | 'pending' | 'cancelled';
}

export interface DetailHeaderProps {
  title: string;
  subtitle?: string;
  avatar?: {
    text: string;
    image?: string;
  };
  actions?: Array<{
    label: string;
    icon?: ReactNode;
    onClick: () => void;
    variant?: 'text' | 'outlined' | 'contained';
    disabled?: boolean;
  }>;
}

export interface DetailLayoutProps {
  header: DetailHeaderProps;
  tabs: Array<{
    label: string;
    icon?: ReactNode;
    content: ReactNode;
  }>;
  loading?: boolean;
  error?: string | null;
}

export interface TableAction {
  label: string;
  onClick: () => void;
  variant?: 'text' | 'outlined' | 'contained';
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface TableHeaderProps {
  title: string;
  subtitle?: string;
  actions?: TableAction[];
}

export interface Column<T> {
  id: keyof T;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface FilterProps {
  children: React.ReactNode;
  sx?: any;
}

export interface DataTableLayoutProps<T> {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  columns: {
    id: keyof T;
    label: string;
    sortable?: boolean; // Indicates if the column is sortable
    render?: (value: any, row: T) => React.ReactNode;
  }[];
  data: T[];
  loading: boolean;
  error?: string;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  page: number;
  rowsPerPage: number;
  totalCount?: number;
  onPageChange: (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
  sortColumn?: string; // Current column being sorted
  sortDirection?: "asc" | "desc"; // Current sort direction
  onSort?: (column: string) => void; // Callback for sorting logic
  filters?: React.ReactNode;
}

