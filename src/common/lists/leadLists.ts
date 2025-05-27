import { ReactNode } from 'react';

export const LEAD_SOURCES = [
    { value: "Website", label: "Website" },
    { value: "walk_in", label: "Walk-in" },
    { value: "phone_call", label: "Phone Call" },
    { value: "email", label: "Email" },
    { value: "social_media", label: "Social Media" },
    { value: "third_party", label: "Third-Party Listing" },
    { value: "referral", label: "Customer Referral" },
    { value: "event", label: "Event or Trade Show" },
    { value: "direct_mail", label: "Direct Mail" },
    { value: "radio_tv", label: "Radio/TV Advertisement" },
    { value: "billboard", label: "Billboard Advertisement" },
    { value: "repeat_customer", label: "Repeat Customer" },
    { value: "other", label: "Other" },
  ];
  
  export const LEAD_TYPES = [
    { value: "new_customer", label: "New Customer" },
    { value: "returning_customer", label: "Returning Customer" },
    { value: "business", label: "Business Inquiry" },
    { value: "fleet", label: "Fleet Purchase" },
    { value: "trade_in", label: "Trade-In Interest" },
    { value: "service", label: "Service Inquiry" },
    { value: "finance", label: "Finance Inquiry" },
    { value: "wholesale", label: "Wholesale Inquiry" },
  ];
  
  export const LEAD_STATUSES = [
    { value: "new", label: "New" },
    { value: "New", label: "New" },
    { value: "contacted", label: "Contacted" },
    { value: "appointment_scheduled", label: "Appointment Scheduled" },
    { value: "follow_up_needed", label: "Follow-up Needed" },
    { value: "test_drive_completed", label: "Test Drive Completed" },
    { value: "quote_given", label: "Quote Given" },
    { value: "negotiation", label: "Negotiation" },
    { value: "pending_finance", label: "Pending Finance Approval" },
    { value: "sold", label: "Sold" },
    { value: "lost", label: "Lost Lead" },
    { value: "inactive", label: "Inactive" },
  ];
  
  export const LEAD_MEDIA = [
    { value: "phone", label: "Phone" },
    { value: "email", label: "Email" },
    { value: "sms", label: "SMS/Text" },
    { value: "social_media", label: "Social Media" },
    { value: "in_person", label: "In-Person Visit" },
    { value: "live_chat", label: "Live Chat" },
    { value: "video_call", label: "Video Call" },
  ];
  
  export const FOLLOW_UP_TYPES = [
    { value: "none", label: "No Follow-up Needed" },
    { value: "phone_call", label: "Phone Call" },
    { value: "email", label: "Email" },
    { value: "sms", label: "SMS/Text Message" },
    { value: "appointment", label: "In-Person Appointment" },
    { value: "video_call", label: "Video Call" },
  ];
  
  export const LEAD_PRIORITIES = [
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" },
  ];
  