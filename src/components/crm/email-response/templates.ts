import { EmailTemplate } from "../types/types";

export const emailTemplates: EmailTemplate[] = [
    {
        id: 'test-drive',
        name: 'Request a Test Drive',
        subject: '{{dealership_name}} - Schedule Your Test Drive for {{vehicle_year}} {{vehicle_make}} {{vehicle_model}}',
        body: `Dear {{first_name}},

Thank you for your interest in test driving the {{vehicle_year}} {{vehicle_make}} {{vehicle_model}}. I'm {{agentName}} from {{dealership_name}}, and I'd be happy to help arrange your test drive.

Would any of these times work for you?
• Tomorrow at 10:00 AM
• Tomorrow at 2:00 PM
• {{dayAfterTomorrow}} at 10:00 AM

Please let me know your preferred time, and I'll make sure to have the vehicle ready for you. When you arrive, please bring:
• Your valid driver's license
• Proof of insurance

If none of these times work for you, please suggest a time that better fits your schedule.

Looking forward to showing you the {{vehicle_model}} and answering any questions you may have.

Best regards,
{{agentName}}
{{dealership_name}}
{{agentPhone}}`,
        description: 'Template for scheduling test drives with customers',
        category: 'sales',
        variables: ['dealership_name', 'vehicle_year', 'vehicle_make', 'vehicle_model', 'first_name', 'agentName', 'dayAfterTomorrow', 'agentPhone'],
        lastModified: '2025-02-22'
    },
    {
        id: 'general-inquiry',
        name: 'General Inquiry Response',
        subject: 'Thank you for contacting {{dealership_name}}',
        body: `Dear {{first_name}},

Thank you for reaching out to {{dealership_name}}. I'm {{agentName}}, and I'll be your dedicated point of contact.

I understand you're interested in learning more about our {{vehicle_year}} {{vehicle_make}} {{vehicle_model}}. I'd be happy to provide you with detailed information and answer any specific questions you may have.

Would you prefer to:
• Schedule a phone call to discuss your requirements in detail
• Receive more information via email
• Visit our dealership for a personal consultation

Please let me know your preference, and I'll be glad to accommodate your request.

Best regards,
{{agentName}}
{{dealership_name}}
{{agentPhone}}`,
        description: 'General response template for customer inquiries',
        category: 'general',
        variables: ['dealership_name', 'first_name', 'agentName', 'inquiryTopic', 'agentPhone'],
        lastModified: '2025-02-22'
    },
    {
        id: 'quote-request',
        name: 'Request a Quote',
        subject: '{{dealership_name}} - Your {{vehicle_year}} {{vehicle_make}} {{vehicle_model}} Quote',
        body: `Dear {{first_name}},

Thank you for your interest in the {{vehicle_year}} {{vehicle_make}} {{vehicle_model}}. I've prepared a detailed quote for you:

Vehicle Details:
• Model: {{vehicle_model}}
• Year: {{vehicle_year}}
• Trim: {{vehicleTrim}}
• Color: {{vehicleColor}}

Available Incentives:
{{incentives}}

Based on your preferences, I've included:
• {{feature1}}
• {{feature2}}
• {{feature3}}

The MSRP for this configuration is {{msrp}}, but we're offering it at {{specialPrice}}. This special pricing includes all available manufacturer incentives and our dealer discount.

Would you like to:
• Schedule a test drive
• Discuss financing options
• Review different trim levels or features

I'm here to help make your car-buying experience as smooth as possible.

Best regards,
{{agentName}}
{{dealership_name}}
{{agentPhone}}`,
        description: 'Template for providing vehicle quotes to customers',
        category: 'sales',
        variables: ['dealership_name', 'vehicle_year', 'vehicle_make', 'vehicle_model', 'first_name', 'agentName', 'vehicleTrim', 'vehicleColor', 'incentives', 'feature1', 'feature2', 'feature3', 'msrp', 'specialPrice', 'agentPhone'],
        lastModified: '2025-02-22'
    },
    {
        id: 'service-appointment',
        name: 'Service Appointment',
        subject: '{{dealership_name}} - Your Service Appointment Confirmation',
        body: `Dear {{first_name}},

Thank you for choosing {{dealership_name}} for your vehicle service needs. I'm confirming your service appointment:

Appointment Details:
• Date: {{appointmentDate}}
• Time: {{appointmentTime}}
• Service Type: {{serviceType}}
• Vehicle: {{vehicle_year}} {{vehicle_make}} {{vehicle_model}}

What to bring:
• Vehicle registration
• Insurance card
• Service records (if available)

For your convenience:
• Free WiFi available in our waiting area
• Complimentary coffee and refreshments
• Shuttle service available upon request
• Loaner vehicles available (please ask for details)

Please arrive 10 minutes early to complete any necessary paperwork. If you need to reschedule, please give us at least 24 hours notice.

Best regards,
{{agentName}}
Service Department
{{dealership_name}}
{{agentPhone}}`,
        description: 'Template for confirming service appointments',
        category: 'service',
        variables: ['dealership_name', 'first_name', 'appointmentDate', 'appointmentTime', 'serviceType', 'vehicle_year', 'vehicle_make', 'vehicle_model', 'agentName', 'agentPhone'],
        lastModified: '2025-02-22'
    },
    {
        id: 'trade-appraisal',
        name: 'Trade Appraisal',
        subject: '{{dealership_name}} - Your Vehicle Trade-In Appraisal',
        body: `Dear {{first_name}},

Thank you for considering {{dealership_name}} for your vehicle trade-in. Based on the information you provided about your {{tradeYear}} {{tradeMake}} {{tradeModel}}, I'd like to provide you with our initial appraisal.

Vehicle Details Provided:
• Year: {{tradeYear}}
• Make: {{tradeMake}}
• Model: {{tradeModel}}
• Mileage: {{tradeMileage}}
• Condition: {{tradeCondition}}

To provide you with the most accurate trade-in value, we'd like to schedule an in-person appraisal. This allows us to:
• Perform a detailed vehicle inspection
• Document any modifications or upgrades
• Verify vehicle condition and history
• Provide you with our best possible offer

Would you be available for an in-person appraisal on any of these dates?
• {{date1}}
• {{date2}}
• {{date3}}

The appraisal takes approximately 30 minutes, and you'll receive our offer immediately afterward.

Best regards,
{{agentName}}
{{dealership_name}}
{{agentPhone}}`,
        description: 'Template for vehicle trade-in appraisals',
        category: 'sales',
        variables: ['dealership_name', 'first_name', 'tradeYear', 'tradeMake', 'tradeModel', 'tradeMileage', 'tradeCondition', 'date1', 'date2', 'date3', 'agentName', 'agentPhone'],
        lastModified: '2025-02-22'
    }
];
