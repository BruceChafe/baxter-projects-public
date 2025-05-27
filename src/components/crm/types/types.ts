export interface Contact {
    id: number;
    first_name: string;
    last_name: string;
    primary_email: string;
    mobile_phone: string;
    title: string;
    dealership: string;
    salesperson: string;
    type: string;
    status: string;
    source: string;
    date: string;
  }
  
  export interface Lead {
    id: number;
    contact: {
      first_name: string;
      last_name: string;
      primary_email: string;
      mobile_phone: string;
    };
    vehicleMake: string;
    vehicleModel: string;
    vehicleYear: string;
    leadSource: string;
    leadStatus: string;
    created_at: string;
    dealership_id: number;
  }
  
  export interface Filters {
    dealership: string;
    dateRange: {
      type: string;
      start: string | null;
      end: string | null;
    };
    salesperson: string;
    type: string;
    status: string;
    source: string;
  }

  export interface DealerGroup {
    id: number;
    name: string;
  }
  
  export enum TaskStatus {
    TODO = "To Do",
    IN_PROGRESS = "In Progress",
    COMPLETED = "Completed",
    CANCELLED = "Cancelled",
  }
  
  export enum TaskPriority {
    LOW = "Low",
    MEDIUM = "Medium",
    HIGH = "High",
    URGENT = "Urgent",
  }
  
  export interface Task {
    id?: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: Date;
    assignedTo?: string;
    createdBy: string;
    created_at: string;

    lead_id?: string;
  }

  export interface LeadData {
    id: string;
    leadSource: string;
    leadStatus: string;
    leadType: string;
    dealergroup_id: number;
    dealership_id: number;
    assignedTo: string | null;
    comments: string;
    leadMedia: string;
    leadPriority: 'high' | 'medium' | 'low';
    created_at: string;
    updated_at: string;
  }
  
  export interface ContactData {
    id: string;
    name: string;
    email: string;
    phone: string;
    title?: string;
  }
  
  export interface VehicleData {
    make: string;
    model: string;
    year: string;
    vin: string;
    price: string;
    color?: string;
    mileage?: string;
    condition?: string;
  }
  
  // Form validation
  export interface ValidationErrors {
    [key: string]: string;
  }

  export interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    body: string;
    description: string;
    category: 'sales' | 'service' | 'general';
    variables: string[];
    lastModified: string;
  }