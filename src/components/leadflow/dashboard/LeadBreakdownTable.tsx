import React, { useMemo } from "react";
import {
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Skeleton,
  Box,
  alpha,
  Grid,
  IconButton,
  Chip,
} from "@mui/material";
import { useTheme } from "@mui/material";
import {
  TableChartRounded,
  ChevronRightRounded,
  BarChartRounded,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const LeadBreakdownTable = ({ loading = false, leadsBySource = [] }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Calculate aggregates for the summary row
  const aggregates = useMemo(() => {
    const totalLeads = leadsBySource.reduce(
      (sum, source) => sum + source.count,
      0
    );
    const totalResponded = leadsBySource.reduce(
      (sum, source) => sum + source.responded,
      0
    );
    const responsePercentage =
      totalLeads > 0 ? Math.round((totalResponded / totalLeads) * 100) : 0;

    // Calculate weighted average response time
    let weightedResponseTime = 0;
    let totalWithResponseTime = 0;

    leadsBySource.forEach((source) => {
      if (source.avgResponseTime && source.avgResponseTime !== "—") {
        weightedResponseTime += parseInt(source.avgResponseTime) * source.count;
        totalWithResponseTime += source.count;
      }
    });

    const avgResponseTime =
      totalWithResponseTime > 0
        ? Math.round(weightedResponseTime / totalWithResponseTime)
        : "—";

    return {
      totalLeads,
      totalResponded,
      responsePercentage,
      avgResponseTime,
    };
  }, [leadsBySource]);

  const handleViewDetails = (leadSource) => {
    navigate(`/leadflow/leads?source=${encodeURIComponent(leadSource)}`);
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return "#4CAF50"; // green
    if (percentage >= 50) return "#FF9800"; // orange
    return "#E0E0E0"; // light gray for low percentages
  };

  return (
    <Grid item xs={12} sx={{ mt: 1 }}>
      <Card
        elevation={0}
        sx={{
          borderRadius: "8px",
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          height: "100%",
          overflow: "hidden",
          background: "#fff",
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Box
            sx={{
              p: 2.5,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontSize: "16px",
                fontWeight: 600,
                color: "#424242",
                display: "flex",
                alignItems: "center",
              }}
            >
              <TableChartRounded
                sx={{ mr: 1, color: "#5D4777", fontSize: 20 }}
              />
              Lead Breakdown
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ p: 2 }}>
              <Skeleton
                variant="rectangular"
                height={45}
                sx={{ mb: 1, borderRadius: 1 }}
              />
              <Skeleton
                variant="rectangular"
                height={45}
                sx={{ mb: 1, borderRadius: 1 }}
              />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#FAFAFA" }}>
                    <TableCell
                      sx={{
                        fontWeight: 500,
                        fontSize: "13px",
                        color: "#757575",
                        py: 1.5,
                        pl: 2.5,
                      }}
                    >
                      Lead Source
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 500,
                        fontSize: "13px",
                        color: "#757575",
                      }}
                    >
                      Leads
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 500,
                        fontSize: "13px",
                        color: "#757575",
                      }}
                    >
                      Responded
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 500,
                        fontSize: "13px",
                        color: "#757575",
                      }}
                    >
                      Lead Allocation
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 500,
                        fontSize: "13px",
                        color: "#757575",
                      }}
                    >
                      Response Time
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* Aggregate Total Row */}
                  <TableRow
                    sx={{
                      backgroundColor: "#F3F1F6",
                      borderTop: "1px solid #E0E0E0",
                    }}
                  >
                    <TableCell sx={{ pl: 2.5, py: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <BarChartRounded
                          sx={{ mr: 1, color: "#5D4777", fontSize: 18 }}
                        />
                        <Typography
                          sx={{
                            fontWeight: 600,
                            fontSize: "14px",
                            color: "#5D4777",
                          }}
                        >
                          TOTAL (All Sources)
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: "14px",
                          color: "#424242",
                        }}
                      >
                        {aggregates.totalLeads}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography
                          sx={{
                            mr: 1,
                            fontWeight: 600,
                            fontSize: "14px",
                            color: "#424242",
                          }}
                        >
                          {aggregates.totalResponded}
                        </Typography>
                        <Chip
                          label={`${aggregates.responsePercentage}%`}
                          size="small"
                          sx={{
                            bgcolor: alpha(
                              getProgressColor(aggregates.responsePercentage),
                              0.15
                            ),
                            color: getProgressColor(
                              aggregates.responsePercentage
                            ),
                            fontWeight: 600,
                            fontSize: "11px",
                            height: 20,
                          }}
                        />
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          width: "100%",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: "12px",
                            fontWeight: 600,
                            color: "#5D4777",
                          }}
                        >
                          100%
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Box
                        sx={{
                          bgcolor: "#5D4777",
                          px: 2,
                          py: 0.5,
                          borderRadius: 4,
                          display: "inline-block",
                          minWidth: 60,
                          textAlign: "center",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: "13px",
                            color: "#FFFFFF",
                            fontWeight: 500,
                          }}
                        >
                          {typeof aggregates.avgResponseTime === "number"
                            ? `${aggregates.avgResponseTime}h`
                            : aggregates.avgResponseTime}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell align="right"></TableCell>
                  </TableRow>
                  {leadsBySource.map((src, index) => {
                    const avgResponseTime = src.avgResponseTime || "—";

                    // Calculate response percentage
                    const responsePercent = Math.round(
                      (src.responded / src.count) * 100
                    );
                    const responseColor =
                      responsePercent === 100
                        ? "#4CAF50"
                        : responsePercent > 0
                        ? "#FF9800"
                        : "#E0E0E0";

                    return (
                      <TableRow
                        key={src.leadSource}
                        sx={{
                          backgroundColor: index % 2 ? "#F9F9F9" : "#FFFFFF",
                          "&:hover": {
                            backgroundColor: "#F5F5F5",
                          },
                        }}
                      >
                        <TableCell
                          sx={{
                            pl: 2.5,
                            py: 2,
                            borderLeft: `3px solid ${src.color}`,
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                backgroundColor: src.color,
                                borderRadius: "50%",
                                mr: 1.5,
                              }}
                            />
                            <Typography
                              sx={{
                                fontWeight: 500,
                                fontSize: "14px",
                                color: "#424242",
                              }}
                            >
                              {src.leadSource}
                            </Typography>
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Typography
                            sx={{
                              fontWeight: 500,
                              fontSize: "14px",
                              color: "#616161",
                            }}
                          >
                            {src.count}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Typography
                              sx={{
                                mr: 1,
                                fontWeight: 500,
                                fontSize: "14px",
                                color: "#616161",
                              }}
                            >
                              {src.responded}
                            </Typography>
                            <Chip
                              label={`${responsePercent}%`}
                              size="small"
                              sx={{
                                bgcolor: alpha(responseColor, 0.1),
                                color: responseColor,
                                fontWeight: 500,
                                fontSize: "11px",
                                height: 20,
                              }}
                            />
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              width: "100%",
                            }}
                          >
                            <Typography
                              sx={{ fontSize: "12px", color: "#757575" }}
                            >
                              {src.allocation}
                            </Typography>
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Box
                            sx={{
                              bgcolor: "#F5F5F5",
                              px: 2,
                              py: 0.5,
                              borderRadius: 4,
                              display: "inline-block",
                              minWidth: 60,
                              textAlign: "center",
                            }}
                          >
                            <Typography
                              sx={{ fontSize: "13px", color: "#757575" }}
                            >
                              {avgResponseTime}
                            </Typography>
                          </Box>
                        </TableCell>

                        <TableCell align="right">
                          <IconButton
                            onClick={() => handleViewDetails(src.leadSource)}
                            size="small"
                            sx={{
                              color: "#5D4777",
                              "&:hover": {
                                backgroundColor: alpha("#5D4777", 0.1),
                              },
                            }}
                          >
                            <ChevronRightRounded />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Grid>
  );
};

export default LeadBreakdownTable;
