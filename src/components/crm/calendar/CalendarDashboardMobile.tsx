import React, { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Grid,
  Tabs,
  Tab,
  Fab,
} from "@mui/material";
import {
  ArrowBackIos,
  ArrowForwardIos,
  Add as AddIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";

interface Event {
  date: string; // Format: YYYY-MM-DD
  title: string;
  time: string; // Format: "8:30 AM - 10:00 AM"
  location?: string;
}

interface CalendarDashboardmobile_props {
  events?: Event[];
}

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const CalendarDashboardMobile: React.FC<CalendarDashboardmobile_props> = ({
  events = [],
}) => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [view, setView] = useState<"day" | "week" | "month">("day");

  const getEventsForDate = (date: dayjs.Dayjs) =>
    events.filter((event) => dayjs(event.date).isSame(date, "day"));

  const handlePrevDay = () => setCurrentDate(currentDate.subtract(1, "day"));
  const handleNextDay = () => setCurrentDate(currentDate.add(1, "day"));
  const handleToday = () => setCurrentDate(dayjs());

  const renderDayView = () => {
    const eventsForToday = getEventsForDate(currentDate);

    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          {currentDate.format("dddd, MMMM DD")}
        </Typography>
        {eventsForToday.length > 0 ? (
          eventsForToday.map((event, index) => (
            <Paper
              key={index}
              elevation={2}
              sx={{
                mb: 2,
                p: 2,
                backgroundColor: "#fef9c3", // Example soft yellow
                borderRadius: "10px",
              }}
            >
              <Typography variant="body1" fontWeight="bold" sx={{ mb: 0.5 }}>
                {event.title}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {event.time}
              </Typography>
              {event.location && (
                <Typography
                  variant="caption"
                  color="textSecondary"
                  sx={{ display: "block", mt: 0.5 }}
                >
                  {event.location}
                </Typography>
              )}
            </Paper>
          ))
        ) : (
          <Typography
            variant="body2"
            sx={{
              textAlign: "center",
              mt: 2,
              color: "#757575",
            }}
          >
            No events for today.
          </Typography>
        )}
      </Box>
    );
  };

  const renderWeekView = () => {
    const startOfWeek = currentDate.startOf("week");
    const daysInWeek = Array.from({ length: 7 }, (_, i) =>
      startOfWeek.add(i, "day")
    );

    return (
      <Grid container spacing={1} sx={{ mt: 2 }}>
        {daysInWeek.map((date, index) => (
          <Grid item xs={1.7} key={index}>
            <Box
              onClick={() => setCurrentDate(date)}
              sx={{
                textAlign: "center",
                borderRadius: "8px",
                p: 1,
                backgroundColor: date.isSame(currentDate, "day")
                  ? "#1976d2"
                  : "#f3f3f3",
                color: date.isSame(currentDate, "day") ? "#fff" : "#000",
                cursor: "pointer",
              }}
            >
              <Typography variant="subtitle2">{daysOfWeek[date.day()]}</Typography>
              <Typography variant="body2">{date.date()}</Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderMonthView = () => {
    const startOfMonth = currentDate.startOf("month");
    const endOfMonth = currentDate.endOf("month");
    const startOfWeek = startOfMonth.startOf("week");
    const endOfWeek = endOfMonth.endOf("week");

    const daysInCalendar = [];
    let datePointer = startOfWeek;

    while (datePointer.isBefore(endOfWeek) || datePointer.isSame(endOfWeek)) {
      daysInCalendar.push(datePointer);
      datePointer = datePointer.add(1, "day");
    }

    return (
      <Grid container spacing={1} sx={{ mt: 2 }}>
        {daysInCalendar.map((date, index) => (
          <Grid item xs={1.7} key={index}>
            <Box
              onClick={() => setCurrentDate(date)}
              sx={{
                textAlign: "center",
                borderRadius: "8px",
                p: 1,
                backgroundColor: date.isSame(currentDate, "day")
                  ? "#1976d2"
                  : "#fff",
                color: date.isSame(currentDate, "day") ? "#fff" : "#000",
                cursor: "pointer",
                border: "1px solid #e0e0e0",
              }}
            >
              <Typography variant="body2">{date.date()}</Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Box
    >
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <IconButton onClick={handlePrevDay} sx={{ color: "#1976d2" }}>
          <ArrowBackIos />
        </IconButton>
        <Typography variant="h5" fontWeight="bold">
          {currentDate.format("MMMM YYYY")}
        </Typography>
        <IconButton onClick={handleNextDay} sx={{ color: "#1976d2" }}>
          <ArrowForwardIos />
        </IconButton>
      </Box>

      {/* Tabs */}
      <Tabs
        value={view}
        onChange={(e, newValue) => setView(newValue)}
        centered
        sx={{
          "& .MuiTab-root": {
            textTransform: "none",
          },
        }}
      >
        <Tab label="Day" value="day" />
        <Tab label="Week" value="week" />
        <Tab label="Month" value="month" />
      </Tabs>

      {/* Views */}
      {view === "day" && renderDayView()}
      {view === "week" && renderWeekView()}
      {view === "month" && renderMonthView()}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
        }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default CalendarDashboardMobile;
