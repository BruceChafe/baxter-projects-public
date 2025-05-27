import React from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  alpha,
  useTheme,
  Skeleton,
  Fade,
} from "@mui/material";
import { DataTableLayoutProps } from "../types/types";
import {
  FolderOffRounded,
  ArrowUpwardRounded,
  ArrowDownwardRounded,
  UnfoldMoreRounded,
} from "@mui/icons-material";

export function DataTableLayout<T extends { id: number | string }>({
  columns,
  data,
  loading,
  error,
  emptyMessage = "No data available",
  onRowClick,
  page = 0,
  rowsPerPage = 10,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  sortColumn,
  sortDirection,
  onSort,
  filters,
}: DataTableLayoutProps<T>) {
  const theme = useTheme();

  const formatDateTime = (value: string | Date) => {
    const date = new Date(value);
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Enhanced skeleton loader with fade-in animation
  if (loading) {
    return (
      <Fade in={loading} timeout={300}>
        <TableContainer
          component={Paper}
          elevation={2}
          sx={{
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            overflow: "hidden",
            boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`,
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id as string}
                    sx={{
                      py: 2.5,
                      px: 3,
                      fontWeight: 700,
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                      borderBottom: "2px solid",
                      borderBottomColor: "primary.main",
                      color: "primary.dark",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {[...Array(5)].map((_, index) => (
                <TableRow key={index}>
                  {columns.map((column, cellIndex) => (
                    <TableCell
                      key={`skeleton-${index}-${cellIndex}`}
                      sx={{ py: 2.5, px: 3 }}
                    >
                      <Skeleton
                        animation="pulse"
                        height={24}
                        sx={{
                          borderRadius: 1,
                          opacity: 1 - index * 0.15, // Fading effect for rows further down
                        }}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Fade>
    );
  }

  // Enhanced error state
  if (error) {
    return (
      <Fade in timeout={300}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: "center",
            borderRadius: 3,
            border: "1px solid",
            borderColor: (theme) => alpha(theme.palette.error.main, 0.2),
            bgcolor: (theme) => alpha(theme.palette.error.main, 0.05),
            boxShadow: `0 4px 20px ${alpha(theme.palette.error.main, 0.1)}`,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 4,
            }}
          >
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: alpha(theme.palette.error.main, 0.1),
                mb: 2,
              }}
            >
              <FolderOffRounded color="error" sx={{ fontSize: 32 }} />
            </Box>
            <Typography
              variant="h6"
              color="error.main"
              fontWeight={600}
              gutterBottom
            >
              Something went wrong
            </Typography>
            <Typography color="error" sx={{ fontWeight: 500, maxWidth: 500 }}>
              {error}
            </Typography>
          </Box>
        </Paper>
      </Fade>
    );
  }

  // Enhanced data table
  return (
    <Fade in timeout={300}>
      <Box>
        {filters && <Box sx={{ mb: 3 }}>{filters}</Box>}

        <TableContainer
          component={Paper}
          elevation={2}
          sx={{
            mb: 4,
            borderRadius: "16px",
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: "background.paper",

            transition: "all 0.35s ease-in-out",
            "&:hover": {
              boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
            },
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id as string}
                    sx={{
                      py: 2.5,
                      px: 3,
                      fontWeight: 700,
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                      borderBottom: "2px solid",
                      borderBottomColor: "primary.main",
                      color: "primary.dark",
                      cursor: column.sortable ? "pointer" : "default",
                      userSelect: "none",
                      transition: "all 0.2s ease",
                      letterSpacing: "0.02em",
                      "&:hover": column.sortable
                        ? {
                            backgroundColor: alpha(
                              theme.palette.primary.main,
                              0.12
                            ),
                          }
                        : {},
                    }}
                    onClick={() =>
                      column.sortable && onSort?.(column.id as string)
                    }
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>{column.label}</span>
                      {column.sortable && (
                        <Box
                          component="span"
                          sx={{
                            ml: 1,
                            display: "flex",
                            alignItems: "center",
                            color:
                              sortColumn === column.id
                                ? "primary.main"
                                : "text.secondary",
                          }}
                        >
                          {sortColumn === column.id ? (
                            sortDirection === "asc" ? (
                              <ArrowUpwardRounded fontSize="small" />
                            ) : (
                              <ArrowDownwardRounded fontSize="small" />
                            )
                          ) : (
                            <UnfoldMoreRounded
                              fontSize="small"
                              sx={{ opacity: 0.6 }}
                            />
                          )}
                        </Box>
                      )}
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    sx={{
                      textAlign: "center",
                      py: 10,
                      color: "text.secondary",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        py: 4,
                      }}
                    >
                      <Box
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: alpha(theme.palette.text.disabled, 0.1),
                          mb: 3,
                        }}
                      >
                        <FolderOffRounded
                          sx={{ fontSize: 40, color: "text.disabled" }}
                        />
                      </Box>
                      <Typography
                        variant="h6"
                        color="text.secondary"
                        gutterBottom
                      >
                        {emptyMessage}
                      </Typography>
                      <Typography variant="body2" color="text.disabled">
                        No records found matching your criteria
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, index) => (
                  <TableRow
                    key={row.id}
                    onClick={() => onRowClick?.(row)}
                    sx={{
                      cursor: onRowClick ? "pointer" : "default",
                      bgcolor:
                        index % 2 === 0
                          ? "transparent"
                          : alpha(theme.palette.primary.main, 0.02),
                      transition: "background-color 0.15s ease",
                      "&:hover": {
                        backgroundColor: alpha(
                          theme.palette.primary.main,
                          0.05
                        ),
                        boxShadow: `inset 0 0 0 1px ${alpha(
                          theme.palette.primary.main,
                          0.1
                        )}`,
                      },
                    }}
                  >
                    {columns.map((column) => (
                      <TableCell
                        key={`${row.id}-${column.id as string}`}
                        sx={{
                          py: 2.5,
                          px: 3,
                          borderBottom: "1px solid",
                          borderBottomColor: alpha(theme.palette.divider, 0.7),
                          transition: "all 0.15s ease",
                        }}
                      >
{column.render
  ? column.render(row[column.id], row)
  : typeof row[column.id] === "string" &&
    /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(row[column.id])
  ? formatDateTime(row[column.id])
  : row[column.id]?.toString() || (
      <Typography component="span" sx={{ color: "text.disabled", fontStyle: "italic" }}>
        N/A
      </Typography>
    )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {onPageChange && onRowsPerPageChange && (
          <TablePagination
            component={Paper}
            count={totalCount || data.length}
            page={page}
            onPageChange={(event, newPage) => onPageChange(event, newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(
              event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
            ) => onRowsPerPageChange(event)}
            disabled={loading}
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
            }}
          />
        )}
      </Box>
    </Fade>
  );
}

export default DataTableLayout;
