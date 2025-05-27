import React from "react";
import { RouteObject, Navigate } from "react-router-dom";
import ContactsDashboard from "./components/contacts/ContactsDashboard";
import SignIn from "./components/frontEnd/accountPages/SignIn";
import UsersDashboard from "./components/admin/users/UsersDashboard";
import DealershipsDashboard from "./components/admin/dealerships/DealershipsDashboard";
import JobTitlesDashboard from "./components/admin/jobTitles/JobTitlesDashboard";
import VisitHistoryDashboard from "./components/upshift/visits/VisitHistoryDashboard";
import LandingPage from "./components/frontEnd/landingPages/LandingPage";
import SignUpPage from "./components/frontEnd/accountPages/SignUp";
import SignUpWithEmailPage from "./components/frontEnd/accountPages/SignUpWithEmail";
import { useAuth } from "./context/AuthContext";
import RouteProtection from "./RouteProtection";
import { Box, CircularProgress } from "@mui/material";
import UpShiftPage from "./components/frontEnd/landingPages/UpShiftPage";
import UserProfile from "./components/admin/userAdmin/UserProfile";
import CalendarDashboard from "./components/crm/calendar/CalendarDashboard";
import Contact from "./components/contacts/contact/Contact";
import LeadPage from "./components/crm/leads/lead/Lead";
import NewContact from "./components/contacts/NewContactDialog";
import LeadsDashboard from "./components/crm/leads/LeadsDashboard";
import Upsheet from "./components/upshift/upsheet/Upsheet";
import UpShiftDashboard from "./components/upshift/dashboard/UpShiftDashboard";
import BannedContactsDashboard from "./components/upshift/visitors/BannedContactsDashboard";
import UnattendedLeadsPage from "./components/crm/leads/UnattendedLeadsPage";
import LeadResponsePage from "./components/crm/leads/LeadResponsePage";
import ManagementDashboard from "./components/leadflow/dashboard/LeadFlowDashboard";
import TemplateDashboard from "./components/crm/email-response/templateDashboard";
import LeadNotificationDashboard from "./components/leadflow/admin/LeadFlowAdmin";
import SubscriptionDashboard from "./components/admin/subscriptions/SubscriptionDashboard";
import ConfirmRedirect from "./components/frontEnd/accountPages/ConfirmRedirect";
import OnboardingStepper from "./components/frontEnd/accountPages/OnboardingStepper";
import LeadSearchPage from "./components/leadflow/pages/LeadSearchPage";
import PricingPage from "./components/frontEnd/landingPages/PricingPage";
import BaxterWorkspace from "./components/projectHub/ProjectHub";
import HelpCenterPage from "./components/help/HelpCenterPage";
import HelpCategoryPage from "./components/help/HelpCategoryPage";
import HelpArticlePage from "./components/help/HelpArticlePage";
import LegalDocuments from "./components/frontEnd/legal/LegalDocuments";
import AboutUsPage from "./components/frontEnd/about/AboutUs";
import ReactivatePage from "./components/admin/reactivate/ReactivatePage";
import BillingDashboard from "./components/admin/billing/BillingDashboard";
import UpgradeDashboard from "./components/admin/billing/UpgradeDashboard";
import ResetPasswordPage from "./components/frontEnd/accountPages/ResetPasswordPage";

const AuthRedirectWrapper = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (user) {
    return <Navigate to="/home" />;
  }

  return <>{children}</>;
};

const routes: RouteObject[] = [
  {
    path: "/",
    element: (
      <AuthRedirectWrapper>
        <LandingPage />
      </AuthRedirectWrapper>
    ),
  },
  {
    path: "/signup",
    element: <SignUpPage />,
  },
  {
    path: "/legal",
    element: <LegalDocuments />,
  },
  {
    path: "/about",
    element: <AboutUsPage />,
  },
  {
    path: "/signup-email",
    element: <SignUpWithEmailPage />,
  },
  { path: "/onboarding", element: <OnboardingStepper /> },
  { path: "/confirm", element: <ConfirmRedirect /> },

  {
    path: "/solutions/UpShift",
    element: <UpShiftPage />,
  },
  {
    path: "/pricing",
    element: <PricingPage />,
  },
  {
    path: "/signin",
    element: <SignIn />,
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },
  {
    path: "/reactivate",
    element: (
      <RouteProtection>
        <ReactivatePage />
      </RouteProtection>
    ),
  },
  {
    path: "/home",
    element: (
      <RouteProtection>
        <BaxterWorkspace />
      </RouteProtection>
    ),
  },
  {
    path: "/contacts",
    element: (
      <RouteProtection>
        <ContactsDashboard />
      </RouteProtection>
    ),
  },
  {
    path: "/upsheet",
    element: (
      <RouteProtection>
        <Upsheet />
      </RouteProtection>
    ),
  },
  {
    path: "/contacts/:id",
    element: (
      <RouteProtection>
        <Contact />
      </RouteProtection>
    ),
  },
  {
    path: "/contacts/newcontact",
    element: (
      <RouteProtection>
        <NewContact />
      </RouteProtection>
    ),
  },
  {
    path: "/help",
    element: (
      <RouteProtection>
        <HelpCenterPage />
      </RouteProtection>
    ),
  },
  {
    path: "/help/:categoryKey",
    element: (
      <RouteProtection>
        <HelpCategoryPage />
      </RouteProtection>
    ),
  },
  {
    path: "/help/:categoryKey/:articleSlug",
    element: (
      <RouteProtection>
        <HelpArticlePage />
      </RouteProtection>
    ),
  },
  {
    path: "/admin/billing",
    element: (
      <RouteProtection>
        <BillingDashboard />
      </RouteProtection>
    ),
  },
  {
    path: "/admin/upgrade",
    element: (
      <RouteProtection>
        <UpgradeDashboard />
      </RouteProtection>
    ),
  },
  {
    path: "/admin/users",
    element: (
      <RouteProtection>
        <UsersDashboard />
      </RouteProtection>
    ),
  },
  {
    path: "/admin/userprofile",
    element: (
      <RouteProtection>
        <UserProfile />
      </RouteProtection>
    ),
  },
  {
    path: "/admin/dealerships",
    element: (
      <RouteProtection>
        <DealershipsDashboard />
      </RouteProtection>
    ),
  },
  {
    path: "/admin/jobtitles",
    element: (
      <RouteProtection>
        <JobTitlesDashboard />
      </RouteProtection>
    ),
  },
  {
    path: "/admin/emailtemplates",
    element: (
      <RouteProtection>
        <TemplateDashboard />
      </RouteProtection>
    ),
  },
  {
    path: "/admin/subscriptions",
    element: (
      <RouteProtection>
        <SubscriptionDashboard />
      </RouteProtection>
    ),
  },
  {
    path: "/upshift",
    element: (
      <RouteProtection>
        <UpShiftDashboard />
      </RouteProtection>
    ),
  },
  {
    path: "/upshift/upsheet",
    element: (
      <RouteProtection>
        <Upsheet />
      </RouteProtection>
    ),
  },
  {
    path: "/upshift/visits",
    element: (
      <RouteProtection>
        <VisitHistoryDashboard />
      </RouteProtection>
    ),
  },
  {
    path: "/upshift/banned",
    element: (
      <RouteProtection>
        <BannedContactsDashboard />
      </RouteProtection>
    ),
  },
  {
    path: "/crm/calendar",
    element: (
      <RouteProtection>
        <CalendarDashboard
          events={[
            { date: "2024-11-20", title: "Team Meeting" },
            { date: "2024-11-25", title: "Project Deadline" },
          ]}
        />
      </RouteProtection>
    ),
  },
  {
    path: "/crm/unattended-leads",
    element: (
      <RouteProtection>
        <UnattendedLeadsPage />
      </RouteProtection>
    ),
  },
  {
    path: "/leadflow/dashboard",
    element: (
      <RouteProtection>
        <ManagementDashboard />
      </RouteProtection>
    ),
  },
  {
    path: "/leadflow/admin",
    element: (
      <RouteProtection>
        <LeadNotificationDashboard />
      </RouteProtection>
    ),
  },
  {
    path: "/leadflow/leads",
    element: (
      <RouteProtection>
        <LeadSearchPage />
      </RouteProtection>
    ),
  },
  {
    path: "/crm/respond-lead/:lead_id",
    element: (
      <RouteProtection>
        <LeadResponsePage />
      </RouteProtection>
    ),
  },
  {
    path: "/crm/leads/:id",
    element: (
      <RouteProtection>
        <LeadPage />
      </RouteProtection>
    ),
  },
  {
    path: "/crm/leads",
    element: (
      <RouteProtection>
        <LeadsDashboard />
      </RouteProtection>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/home" />,
  },
];

export default routes;
