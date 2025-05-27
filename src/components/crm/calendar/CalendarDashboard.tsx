import React from "react";
import { useMediaQuery, useTheme, Container } from "@mui/material";
import CalendarDashboardMobile from "./CalendarDashboardMobile";
import CalendarDashboardDesktop from "./CalendarDashboardDesktop";

import { Event } from "../../../types";

interface CalendarDashboardProps {
  events?: Event[];
}

const CalendarDashboard: React.FC<CalendarDashboardProps> = ({ events = [] }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Container maxWidth={false} sx={{ width: "100%", mt: 2 }}>
      {isMobile ? (
        <CalendarDashboardMobile events={events} />
      ) : (
        <CalendarDashboardDesktop events={events} />
      )}
    </Container>
  );
};

export default CalendarDashboard;
