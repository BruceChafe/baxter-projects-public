import React from "react";
import {
  Paper,
  Stack,
  Typography,
  IconButton,
  Collapse,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Box,
  SelectChangeEvent,
  alpha,
  useTheme,
} from "@mui/material";
import {
  ExpandLess,
  ExpandMore,
  ClearAll,
  Groups2Rounded,
  BusinessRounded,
  CalendarToday,
  PersonOutlineRounded,
  Search,
  FilterAltOutlined,
} from "@mui/icons-material";

interface Salesperson {
  user_id: string;
  name: string;
}

interface TimeRangeOption {
  value: string;
  label: string;
}

interface FiltersProps {
  dealerGroups: any[];
  dealerships: any[];
  selected_dealergroup_id: string;
  selectedDealershipId: string;
  loadingDealerships: boolean;
  onDealerGroupChange: (id: string) => void;
  onDealershipChange: (id: string) => void;
  isGlobalAdmin: boolean;
  showTimeRangeFilter?: boolean;
  showSalespersonFilter?: boolean;
  showSearchFilter?: boolean;
  timeRangeOptions: TimeRangeOption[];
  selectedTimeRange: string;
  onTimeRangeChange: (range: string) => void;
  onSalespersonChange: (id: string) => void;
  selectedSalesperson: string;
  salespeople: Salesperson[];
  searchQuery?: string;
  onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  resetAllFilters?: () => void;
}

const Filters: React.FC<FiltersProps> = ({
  dealerGroups,
  dealerships,
  selected_dealergroup_id,
  selectedDealershipId,
  loadingDealerships,
  onDealerGroupChange,
  onDealershipChange,
  isGlobalAdmin,
  showTimeRangeFilter = false,
  showSalespersonFilter = false,
  showSearchFilter = false,
  timeRangeOptions,
  selectedTimeRange,
  onTimeRangeChange,
  onSalespersonChange,
  selectedSalesperson,
  salespeople,
  searchQuery = "",
  onSearchChange = () => {},
  resetAllFilters = () => {},
}) => {
  const [expanded, setExpanded] = React.useState(true);
  const theme = useTheme();

  // Calculate active filter count
  const activeFilterCount = [
    !!selectedDealershipId,
    !!selectedSalesperson,
    selectedTimeRange !== (timeRangeOptions[0]?.value || ""),
    !!searchQuery,
  ].filter(Boolean).length;

  const selectStyles = {
    borderRadius: "16px",
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: (value) => (value ? "primary.light" : "divider"),
      borderWidth: (value) => (value ? 2 : 1),
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "primary.main",
    },
  };

  return (
    <Paper
      elevation={1}
      sx={{
        p: { xs: 2, sm: 3 },
        mb: 4,
        borderRadius: "16px",
        border: `1px solid ${theme.palette.divider}`,
        background: `linear-gradient(145deg, ${
          theme.palette.background.paper
        } 0%, ${alpha(theme.palette.background.default, 0.7)} 100%)`,
        transition: "all 0.35s ease-in-out",
        "&:hover": {
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
        },
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          opacity: activeFilterCount > 0 ? 1 : 0,
          transition: "opacity 0.3s ease-in-out",
        },
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={expanded ? 2.5 : 0}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            sx={{
              width: { xs: 32, sm: 40 },
              height: { xs: 32, sm: 40 },
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: (theme) =>
                activeFilterCount > 0
                  ? `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`
                  : theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.04)",
              transition: "all 0.3s ease",
            }}
          >
            <FilterAltOutlined
              sx={{
                color: (theme) =>
                  activeFilterCount > 0
                    ? "white"
                    : theme.palette.text.secondary,
                transition: "color 0.3s ease",
              }}
            />
          </Box>
          <Box>
            <Typography
              variant="h6"
              fontWeight={600}
              sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
            >
              Filters
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1}>
          <IconButton
            size="small"
            onClick={() => setExpanded(!expanded)}
            sx={selectStyles}
          >
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Stack>
      </Stack>

      <Collapse in={expanded} timeout="auto">
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2.5}
          sx={{ width: "100%", mt: 2 }}
        >
          <FormControl fullWidth sx={{ flex: 1 }}>
            <InputLabel>
              {loadingDealerships ? "Loading dealerships..." : "Dealership"}
            </InputLabel>
            <Select
              value={selectedDealershipId || ""}
              onChange={(e: SelectChangeEvent<string>) =>
                onDealershipChange(e.target.value)
              }
              label={
                loadingDealerships ? "Loading dealerships..." : "Dealership"
              }
              startAdornment={
                <InputAdornment position="start">
                  <BusinessRounded
                    sx={{
                      color: selectedDealershipId
                        ? "primary.main"
                        : "action.active",
                      ml: 1,
                    }}
                  />
                </InputAdornment>
              }
              disabled={loadingDealerships}
              sx={selectStyles}
              displayEmpty
            >
              <MenuItem value="">
                <em>All Dealerships</em>
              </MenuItem>
              {dealerships.map((dealership) => (
                <MenuItem
                  key={dealership.dealership_id}
                  value={dealership.dealership_id}
                >
                  {dealership.dealership_name ||
                    `Dealership ${dealership.dealership_id}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {showTimeRangeFilter && (
            <FormControl fullWidth sx={{ flex: 1 }}>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={selectedTimeRange}
                onChange={(e: SelectChangeEvent<string>) =>
                  onTimeRangeChange(e.target.value)
                }
                label="Time Range"
                startAdornment={
                  <InputAdornment position="start">
                    <CalendarToday
                      sx={{
                        color:
                          selectedTimeRange !==
                          (timeRangeOptions[0]?.value || "")
                            ? "primary.main"
                            : "action.active",
                        ml: 1,
                      }}
                    />
                  </InputAdornment>
                }
                sx={selectStyles}
              >
                {timeRangeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {showSalespersonFilter && (
            <FormControl fullWidth sx={{ flex: 1 }}>
              <InputLabel>Sales Consultant</InputLabel>
              <Select
                value={selectedSalesperson || ""}
                onChange={(e: SelectChangeEvent<string>) =>
                  onSalespersonChange(e.target.value)
                }
                displayEmpty
                renderValue={(selected) =>
                  selected
                    ? salespeople.find((c) => c.user_id === selected)?.name ||
                      "Unknown"
                    : "All Consultants"
                }
                label="Sales Consultant"
                startAdornment={
                  <InputAdornment position="start">
                    <PersonOutlineRounded
                      sx={{
                        color: selectedSalesperson
                          ? "primary.main"
                          : "action.active",
                        ml: 1,
                      }}
                    />
                  </InputAdornment>
                }
                sx={selectStyles}
              >
                <MenuItem value="">
                  <em>All Consultants</em>
                </MenuItem>
                {salespeople.map((consultant: Salesperson) => (
                  <MenuItem key={consultant.user_id} value={consultant.user_id}>
                    {consultant.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {showSearchFilter && (
            <TextField
              placeholder="Search by name, email, or phone"
              value={searchQuery}
              onChange={onSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search
                      sx={{
                        color: searchQuery ? "primary.main" : "text.secondary",
                      }}
                    />
                  </InputAdornment>
                ),
              }}
              sx={selectStyles}
            />
          )}
        </Stack>
      </Collapse>
    </Paper>
  );
};

export default Filters;
