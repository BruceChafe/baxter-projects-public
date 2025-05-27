export type OnboardingStep = {
  step_key: string;
  title: string;
  description: string;
  path: string;
  action: string;
};

export const onboardingStepsByRole: Record<string, OnboardingStep[]> = {
  groupAdmin: [
    {
      step_key: "invite_users",
      title: "Invite your team",
      description: "Add team members like consultants and receptionists",
      path: "/admin/users",
      action: "Invite Users",
    },
    {
      step_key: "view_dashboard_metrics_summary",
      title: "Review Visitor Summary",
      description:
        "Check total visits, walk-ins, appointments, and interest in new vs. pre-owned vehicles.",
      path: "/help/dashboards/upshift-insights",
      action: "View Metrics",
    },
    {
      step_key: "_upshift_intake_form",
      title: "How to Complete an Intake in UpShift",
      description:
        "Learn how to greet a visitor, search or create a contact, and log a dealership visit.",
      path: "/help/receptionist/receptionist-upshift-intake",
      action: "UpShift Upsheet",
    },
  ],

  dealerAdmin: [
    {
      step_key: "invite_users",
      title: "Invite your team",
      description: "Add team members like consultants and receptionists",
      path: "/admin/users",
      action: "Invite Users",
    },
  ],

  receptionist: [
    {
      step_key: "intro_receptionist",
      title: "Welcome to UpShift",
      description:
        "Get a quick overview of your daily role and responsibilities",
      path: "/help/receptionist-role",
      action: "View Overview",
    },
    {
      step_key: "_upshift_intake_form",
      title: "How to Complete an Intake in UpShift",
      description:
        "Learn how to greet a visitor, search or create a contact, and log a dealership visit.",
      path: "/help/receptionist/receptionist-upshift-intake",
      action: "UpShift Upsheet",
    },
    {
      step_key: "view_dashboard_metrics_summary",
      title: "Review Visitor Summary",
      description:
        "Check total visits, walk-ins, appointments, and interest in new vs. pre-owned vehicles.",
      path: "/help/dashboards/upshift-insights",
      action: "View Metrics",
    },
    {
      step_key: "view_visit_history",
      title: "Explore visit history",
      description: "Learn how to search and edit existing visit records",
      path: "/visits/history",
      action: "View Visits",
    },
    {
      step_key: "scan_license",
      title: "Scan a driver's license",
      description: "Try out the license scanner using a test license image",
      path: "/scanner",
      action: "Scan License",
    },
    {
      step_key: "handle_banned_contact",
      title: "Understand banned visitors",
      description: "See how the system flags banned contacts",
      path: "/visits/history",
      action: "View Banned Contact",
    },
    {
      step_key: "daily_summary",
      title: "View today’s visitor summary",
      description: "Check how to view today's visit overview and filters",
      path: "/dashboard",
      action: "Open Dashboard",
    },
  ],

  salesConsultant: [
    {
      step_key: "complete_profile",
      title: "Complete your personal profile",
      description: "Add your contact info and profile picture",
      path: "/profile/personal",
      action: "Edit Profile",
    },
    {
      step_key: "review_leads_guide",
      title: "Review lead assignment guide",
      description: "Learn how leads are assigned and how to respond",
      path: "/help/leads",
      action: "Read Guide",
    },
  ],
};
