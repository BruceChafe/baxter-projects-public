// import React, { useState, useRef, useCallback } from "react";
// import {
//   Box,
//   Typography,
//   IconButton,
//   Paper,
//   Button,
//   List,
//   ListItem,
//   ListItemText,
//   ListItemIcon,
//   Tooltip,
// } from "@mui/material";
// import {
//   ArrowBackIos,
//   ArrowForwardIos,
//   Add as AddIcon,
// } from "@mui/icons-material";
// import FullCalendar from "@fullcalendar/react";
// import dayGridPlugin from "@fullcalendar/daygrid";
// import timeGridPlugin from "@fullcalendar/timegrid";
// import interactionPlugin from "@fullcalendar/interaction";
// import dayjs from "dayjs";
// import { Event } from "../../../types";

// interface CalendarDashboardDesktopProps {
//   events?: Event[];
// }

// interface Category {
//   label: string;
//   color: string;
// }

// const categories: Category[] = [
//   { label: "Active", color: "#2196f3" },
//   { label: "Completed", color: "#4caf50" },
//   { label: "Cancelled", color: "#ff9800" },
// ];

// const styles = {
//   root: {
//     display: "flex",
//     flexDirection: { xs: "column", md: "row" },
//     gap: 3,
//     p: 1,
//     bgcolor: "background.default",
//   },
//   sidebar: {
//     width: { xs: "100%", md: 350 },
//     p: 3,
//     boxShadow: 4,
//     borderRadius: 3,
//     bgcolor: "background.paper",
//   },
//   calendarHeader: {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     mb: 3,
//   },
//   miniCalendar: {
//     height: 400,
//     overflow: "hidden",
//   },
//   dayCell: (isToday: boolean, isSelected: boolean) => ({
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     height: "100%",
//     backgroundColor: isSelected
//       ? "#1976d2"
//       : isToday
//       ? "#90caf9"
//       : "transparent",
//     color: isSelected || isToday ? "#fff" : "text.primary",
//     borderRadius: "50%",
//     transition: "background-color 0.2s ease-in-out",
//     "&:hover": {
//       backgroundColor: !isSelected && !isToday ? "action.hover" : undefined,
//     },
//   }),
//   categoryList: {
//     mt: 4,
//     mb: 2,
//   },
//   categoryItem: {
//     transition: "transform 0.2s ease-in-out",
//     "&:hover": { transform: "translateX(5px)" },
//   },
//   mainContent: {
//     flex: 1,
//   },
//   mainHeader: {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     mb: 3,
//   },
// };

// const CalendarDashboardDesktop: React.FC<CalendarDashboardDesktopProps> = ({
//   events = [
//     {
//       id: "1",
//       title: "Meeting with client",
//       start: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
//     },
//     {
//       id: "2",
//       title: "Car service appointment",
//       start: dayjs().add(1, "day").format("YYYY-MM-DDTHH:mm:ss"),
//     },
//   ],
// }) => {
//   const [currentDate, setCurrentDate] = useState(dayjs());
//   const [selectedDate, setSelectedDate] = useState(dayjs());
//   const mainCalendarRef = useRef<FullCalendar | null>(null);

//   const handleDateClick = useCallback(
//     (info: { dateStr: string }) => {
//       const clickedDate = dayjs(info.dateStr);
//       setSelectedDate(clickedDate);
//       if (mainCalendarRef.current) {
//         mainCalendarRef.current.getApi().gotoDate(info.dateStr);
//       }
//     },
//     []
//   );

//   const handlePrev = useCallback(
//     () => setCurrentDate(currentDate.subtract(1, "month")),
//     [currentDate]
//   );
//   const handleNext = useCallback(
//     () => setCurrentDate(currentDate.add(1, "month")),
//     [currentDate]
//   );

//   return (
//     <Box sx={styles.root}>
//       {/* Sidebar */}
//       <Paper sx={styles.sidebar} aria-label="Sidebar navigation">
//         <Box sx={styles.calendarHeader}>
//           <Tooltip title="Previous month">
//             <IconButton onClick={handlePrev} aria-label="Previous month">
//               <ArrowBackIos fontSize="small" />
//             </IconButton>
//           </Tooltip>
//           <Typography
//             variant="h6"
//             fontWeight="bold"
//             textAlign="center"
//             color="text.primary"
//           >
//             {currentDate.format("MMMM YYYY")}
//           </Typography>
//           <Tooltip title="Next month">
//             <IconButton onClick={handleNext} aria-label="Next month">
//               <ArrowForwardIos fontSize="small" />
//             </IconButton>
//           </Tooltip>
//         </Box>
//         <Box sx={styles.miniCalendar}>
//           <FullCalendar
//             plugins={[dayGridPlugin, interactionPlugin]}
//             initialView="dayGridMonth"
//             headerToolbar={false}
//             dateClick={handleDateClick}
//             initialDate={currentDate.toISOString()}
//             height="100%"
//             dayCellContent={({ date }) => {
//               const isToday = dayjs(date).isSame(dayjs(), "day");
//               const isSelected = dayjs(date).isSame(selectedDate, "day");
//               return (
//                 <Box sx={styles.dayCell(isToday, isSelected)}>
//                   <Typography
//                     variant="body2"
//                     fontWeight={isToday || isSelected ? "bold" : "normal"}
//                   >
//                     {dayjs(date).date()}
//                   </Typography>
//                 </Box>
//               );
//             }}
//           />
//         </Box>
//         <Typography
//           variant="h6"
//           sx={styles.categoryList}
//           fontWeight="bold"
//           color="text.primary"
//         >
//           Categories
//         </Typography>
//         <List>
//           {categories.map((cat, index) => (
//             <ListItem
//               key={index}
//               disablePadding
//               sx={styles.categoryItem}
//               aria-label={`Category: ${cat.label}`}
//             >
//               <ListItemIcon>
//                 <Box
//                   sx={{
//                     width: 10,
//                     height: 10,
//                     borderRadius: "50%",
//                     backgroundColor: cat.color,
//                   }}
//                   aria-hidden="true"
//                 />
//               </ListItemIcon>
//               <ListItemText primary={cat.label} />
//             </ListItem>
//           ))}
//         </List>
//       </Paper>

//       {/* Main Content */}
//       <Box sx={styles.mainContent}>
//         <Box sx={styles.mainHeader}>
//           <Typography variant="h5" fontWeight="bold" color="text.primary">
//             {selectedDate.startOf("week").format("MMMM DD")} -{" "}
//             {selectedDate.endOf("week").format("MMMM DD, YYYY")}
//           </Typography>
//           <Button
//             startIcon={<AddIcon />}
//             variant="contained"
//             sx={{ textTransform: "none" }}
//             onClick={() => alert("Create Event Clicked!")}
//             aria-label="Create new event"
//           >
//             Create Event
//           </Button>
//         </Box>
//         <FullCalendar
//           ref={mainCalendarRef}
//           plugins={[timeGridPlugin, interactionPlugin]}
//           initialView="timeGridWeek"
//           headerToolbar={false}
//           events={events}
//           initialDate={selectedDate.toISOString()}
//           height="75vh"
//           eventColor="#1976d2"
//         />
//       </Box>
//     </Box>
//   );
// };

// export default CalendarDashboardDesktop;

import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Paper,
  IconButton,
  Divider,
  Container,
  alpha
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Today as TodayIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Event,
  Person,
  Notes
} from '@mui/icons-material';
import { EventApi } from '@fullcalendar/core';


// Theme constants
const theme = {
  colors: {
    primary: '#2196f3',
    secondary: '#f50057',
    background: '#ffffff',
    surface: '#f5f7f9',
    text: {
      primary: '#2c3e50',
      secondary: '#6b7c93',
      light: '#8795a1'
    },
    border: '#e1e8ef',
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
    action: {
      active: '#00bcd4',  // Teal color from screenshot
      danger: '#ff5722'   // Orange/coral from screenshot
    }
  },
  spacing: {
    unit: 8
  }
};

const CalendarDashboardDesktop = () => {

  const [selectedEvent, setSelectedEvent] = useState<EventApi | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Custom styles for FullCalendar
  const calendarStyles = {
    '.fc': {

      // Header toolbar
      '& .fc-toolbar': {
        p: { xs: 2, sm: 3 },
        mb: 4,
        borderRadius: 3,
        background: "linear-gradient(to right, #f8f9fa, #ffffff)",
        border: "1px solid #e0e0e0",
        transition: "box-shadow 0.3s ease-in-out",
        "&:hover": {
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)", // Add shadow on hover
        },
      },

      // Button styles
      '& .fc-button-primary': {
        backgroundColor: theme.colors.background,
        border: `1px solid ${theme.colors.border}`,
        color: theme.colors.text.primary,
        textTransform: 'capitalize',
        padding: '6px 16px',
        fontWeight: 500,
        '&:hover': {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
        '&:focus': {
          boxShadow: `0 0 0 2px ${theme.colors.primary}40`,
        }
      },

      // Active button state
      '& .fc-button-active': {
        backgroundColor: `${theme.colors.primary} !important`,
        borderColor: `${theme.colors.primary} !important`,
        color: '#fff !important',
      },

      // Day header cells
      '& .fc-col-header-cell': {
        backgroundColor: theme.colors.surface,
        p: { xs: 2, sm: 3 },
        mb: 4,
        borderRadius: 3,
        border: '1px solid #e0e0e0',
        transition: "box-shadow 0.3s ease-in-out",
        "&:hover": {
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)", // Add shadow on hover
        },
      },

      // Event styles
      '& .fc-event': {
        borderRadius: '4px',
        padding: '2px',
        margin: '1px 0',
        borderWidth: '0',
        '&:hover': {
          cursor: 'pointer',
        }
      },

      // Today highlight
      '& .fc-day-today': {
        backgroundColor: `${theme.colors.primary}08 !important`,
      },

      // Cell styles
      '& .fc-daygrid-day': {
        backgroundColor: theme.colors.surface,
        '&:hover': {
          backgroundColor: theme.colors.surface,
        }
      }
    }
  };

  // Custom Dialog Styles
  // const dialogStyles = {
  //   paper: {
  //     borderRadius: '8px',
  //     maxWidth: '800px'
  //   },
  //   header: {
  //     display: 'flex',
  //     justifyContent: 'space-between',
  //     alignItems: 'center',
  //     padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px`,
  //     borderBottom: `1px solid ${theme.colors.border}`,
  //   },
  //   title: {
  //     color: theme.colors.text.primary,
  //     fontSize: '1.25rem',
  //     fontWeight: 500
  //   },
  //   content: {
  //     padding: theme.spacing.unit * 3,
  //   },
  //   label: {
  //     color: theme.colors.text.secondary,
  //     fontSize: '0.875rem',
  //     marginBottom: theme.spacing.unit
  //   },
  //   value: {
  //     color: theme.colors.text.primary,
  //     fontSize: '1rem'
  //   },
  //   actions: {
  //     padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px`,
  //     borderTop: `1px solid ${theme.colors.border}`,
  //   },
  //   actionButton: {
  //     textTransform: 'none',
  //     fontWeight: 500,
  //     padding: '6px 16px',
  //   }
  // };

  // Sample events with updated styling
  const events = [
    {
      id: "1",
      title: 'Test Drive - Honda Civic',
      start: new Date(),
      type: 'appointment',
      status: 'scheduled',
      customer: 'John Smith',
      phone: '555-0123',
      notes: 'Customer interested in financing options',
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary
    },
    {
      id: "2",
      title: 'Follow-up Call',
      start: new Date().setHours(14, 0),
      type: 'task',
      status: 'pending',
      customer: 'Sarah Johnson',
      phone: '555-0456',
      notes: 'Discuss trade-in value for current vehicle',
      backgroundColor: theme.colors.success,
      borderColor: theme.colors.success
    }
  ];

  const handleEventClick = (clickInfo: { event: EventApi }) => {
    setSelectedEvent(clickInfo.event);
    setIsDialogOpen(true);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, pb: 4, width: '100%' }}>
      <Box sx={calendarStyles}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          initialView="dayGridMonth"
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          events={events}
          eventClick={handleEventClick}
          height="auto"
        />
      </Box>

      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        PaperProps={{
          elevation: 0,
          sx: {
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            overflow: 'hidden',
            maxWidth: '800px',
            height: '90vh',  // Fixed height
            margin: 'auto',
            display: 'flex',
            flexDirection: 'column' // Ensure content is arranged properly
          }
        }} maxWidth="md"
        fullWidth
      >
        {selectedEvent && (
          <>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              px={4}
              py={2.5}
              sx={{
                borderBottom: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.default'
              }}
            >
              <DialogTitle sx={{
                p: 0,
                fontWeight: 700,
                fontSize: '1.5rem',
                color: 'text.primary',
                letterSpacing: '-0.01em'
              }}>

                Event Details
              </DialogTitle>
              <IconButton
                onClick={() => setIsDialogOpen(false)} size="small"
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    color: 'text.primary',
                    bgcolor: alpha(theme.colors.text.primary, 0.04)
                  }
                }}
              >

                <CloseIcon />
              </IconButton>
            </Box>


<DialogContent sx={{ p: 4, bgcolor: '#F2F4FC', }}>
  {/* Event Information Section */}
  <Box>
    <Typography
      variant="h6"
      sx={{
        mb: 3,
        fontWeight: 700,
        fontSize: "1.125rem",
        color: "text.primary",
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      <Event sx={{ fontSize: "1.25rem" }} />
      Event Details
    </Typography>
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
      }}
    >
      <Grid container spacing={2.5}>
        {[
          { label: "Event Title", value: selectedEvent.title, icon: <Person sx={{ fontSize: "1rem" }} /> },
          { label: "Customer", value: selectedEvent.extendedProps.customer },
          { label: "Phone", value: selectedEvent.extendedProps.phone },
          {
            label: "Date & Time",
            value: selectedEvent.start
              ? `${selectedEvent.start.toLocaleDateString()} at ${selectedEvent.start.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}`
              : "N/A",
          },
          {
            label: "Status",
            value: selectedEvent.extendedProps.status,
            style: { textTransform: "capitalize" },
          },
        ].map((item, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Box sx={{ display: "flex", gap: 2, alignItems: "baseline" }}>
              <Typography
                sx={{
                  color: "text.secondary",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  minWidth: "120px",
                }}
              >
                {item.label}:
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.875rem",
                  color: item.value ? "text.primary" : "text.secondary",
                  fontWeight: item.value ? 500 : 400,
                  ...item.style,
                }}
              >
                {item.value}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Paper>
  </Box>

  {/* Notes Section */}
  {selectedEvent.extendedProps?.notes && (
    <Box mt={4}>
      <Typography
        variant="h6"
        sx={{
          mb: 3,
          fontWeight: 700,
          fontSize: "1.125rem",
          color: "text.primary",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Notes sx={{ fontSize: "1.25rem" }} />
        Notes
      </Typography>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
        }}
      >
        <Typography variant="body1" color="text.primary">
          {selectedEvent.extendedProps.notes}
        </Typography>
      </Paper>
    </Box>
  )}
</DialogContent>;


            <DialogActions
              sx={{
                px: 4,
                py: 3,
                borderTop: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.default',
                display: 'flex',
                justifyContent: 'flex-end'
              }}
            >
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => setIsDialogOpen(false)}
color="secondary"
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setIsDialogOpen(false)}
                  color="primary"
                >
                  Edit Event
                </Button>
              </Box>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default CalendarDashboardDesktop;