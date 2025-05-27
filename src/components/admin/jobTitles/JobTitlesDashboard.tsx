import React, { useState, useEffect } from "react";
import {
  Container,
  useTheme,
  Box,
  TextField,
  IconButton,
  Typography,
  Tooltip,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  alpha,
  TableBody
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add,
  Work,
  KeyboardArrowDown,
  KeyboardArrowUp
} from "@mui/icons-material";
import { useSnackbar } from "../../../context/SnackbarContext";
import { useAuth } from "../../../context/AuthContext";
import HeaderSection from "../../../common/headerSection/HeaderSection";
import StateDisplay from "../../upshift/shared/stateDisplay/StateDisplay";
import JobTitleCreationDialog from "./JobTitlesCreationDialog";
import DepartmentCreationDialog from "./DepartmentCreationDialog";
import { supabase } from "../../../../supabase/supabaseClient";

interface JobTitle {
  id: number;
  title: string;
}

interface Department {
  id: number;
  name: string;
  jobtitles: JobTitle[];
}

interface EditableItemProps {
  isEditing: boolean;
  value: string;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onChange: (value: string) => void;
  label: string;
  children?: React.ReactNode;
}

const EditableItem: React.FC<EditableItemProps> = ({
  isEditing,
  value,
  onEdit,
  onSave,
  onCancel,
  onChange,
  label,
  children
}) => {
  if (isEditing) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
        <TextField
          value={value}
          onChange={(e) => onChange(e.target.value)}
          fullWidth
          variant="outlined"
          size="small"
          sx={{
            "& .MuiOutlinedInput-root": {
              backgroundColor: "background.paper",
              "&:hover": {
                backgroundColor: "background.paper"
              }
            }
          }}
        />
        <IconButton
          onClick={onSave}
          size="small"
          color="primary"
          sx={{
            backgroundColor: "primary.main",
            color: "white",
            "&:hover": {
              backgroundColor: "primary.dark"
            }
          }}
        >
          <SaveIcon fontSize="small" />
        </IconButton>
        <IconButton
          onClick={onCancel}
          size="small"
          sx={{
            backgroundColor: "error.main",
            color: "white",
            "&:hover": {
              backgroundColor: "error.dark"
            }
          }}
        >
          <CancelIcon fontSize="small" />
        </IconButton>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%"
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        {label === "department" && <Work sx={{ color: "primary.main", opacity: 0.8 }} />}
        <Typography
          variant={label === "department" ? "h6" : "body1"}
          sx={
            label === "job title"
              ? {
                  color: "text.secondary",
                  "&:hover": {
                    color: "text.primary"
                  }
                }
              : {}
          }
        >
          {value}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", gap: 1 }}>
        <Tooltip title={`Edit ${label}`}>
          <IconButton
            onClick={onEdit}
            size="small"
            sx={{
              color: "primary.main",
              "&:hover": {
                backgroundColor: "primary.main",
                color: "white"
              }
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        {children}
      </Box>
    </Box>
  );
};

const JobTitlesDashboard: React.FC = () => {
    const { user, accessContext } = useAuth();
  
  const theme = useTheme();
  const { showSnackbar } = useSnackbar();

    const [dealergroup_id, setDealerGroupId] = useState<string | null>(null);
  
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [expandedDepartments, setExpandedDepartments] = useState<Set<number>>(new Set());
  const [editState, setEditState] = useState<{
    department_id: number | null;
    job_title_id: number | null;
    editedValue: string;
  }>({ department_id: null, job_title_id: null, editedValue: "" });
  const [isDrawerOpen, setIsDrawerOpen] = useState<{
    jobtitle: boolean;
    department: boolean;
  }>({ jobtitle: false, department: false });

    useEffect(() => {
      if (user) {
        const dgId =
          user.user_metadata?.dealergroup_id ||
          user.raw_user_meta_data?.dealergroup_id ||
          null;
        setDealerGroupId(dgId);
        // if (dgId) setSelectedDealerGroupId(String(dgId));
      }
    }, [user]);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("departments")
        .select("id, name, job_titles ( id, title )");
      
        if (dealergroup_id) {
          query = query.or(`is_universal.eq.true,dealergroup_id.eq.${dealergroup_id}`);
        }

      const { data, error } = await query;
      if (error) throw error;
      setDepartments(data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch departments with job titles.");
      showSnackbar("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dealergroup_id) {
      fetchDepartments();
    }
  }, [dealergroup_id]);

  const handleEdit = (type: "department" | "jobtitle", id: number, currentValue: string) => {
    setEditState({
      department_id: type === "department" ? id : null,
      job_title_id: type === "jobtitle" ? id : null,
      editedValue: currentValue
    });
  };

  const handleSave = async (type: "department" | "jobtitle", id: number) => {
    try {
      const endpoint = type === "department" ? "departments" : "job_titles";
      const payload = type === "department" ? { name: editState.editedValue } : { title: editState.editedValue };

      const { error } = await supabase
        .from(endpoint)
        .update(payload)
        .eq("id", id);

      if (error) throw error;
      await fetchDepartments();
      showSnackbar(
        `${type === "department" ? "Department" : "Job title"} updated successfully!`,
        "success"
      );
    } catch (err) {
      console.error(err);
      showSnackbar(`Failed to update ${type}!`, "error");
    } finally {
      setEditState({ department_id: null, job_title_id: null, editedValue: "" });
    }
  };

  const handleCancel = () => {
    setEditState({ department_id: null, job_title_id: null, editedValue: "" });
  };

  const toggleDepartmentExpansion = (department_id: number) => {
    setExpandedDepartments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(department_id)) {
        newSet.delete(department_id);
      } else {
        newSet.add(department_id);
      }
      return newSet;
    });
  };

  if (loading || error || departments.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, pb: 4 }}>
        <HeaderSection
          title="Job Titles & Departments"
          subtitle="Manage job titles and departments across your dealership"
          action={{
            label: "New Job Title",
            onClick: () => setIsDrawerOpen({ ...isDrawerOpen, jobtitle: true }),
            icon: <Add />,
            variant: "contained"
          }}
          additionalActions={[
            {
              label: "New Department",
              onClick: () => setIsDrawerOpen({ ...isDrawerOpen, department: true }),
              icon: <Add />,
              variant: "outlined"
            }
          ]}
        />
        <StateDisplay
          state={loading ? "loading" : error ? "error" : "empty"}
          errorMessage={error}
          emptyMessage="No departments or job titles found."
        />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, pb: 4 }}>
      <HeaderSection
        title="Job Titles & Departments"
        subtitle="Manage job titles and departments across your dealership"
        action={{
          label: "New Job Title",
          onClick: () => setIsDrawerOpen({ ...isDrawerOpen, jobtitle: true }),
          icon: <Add />,
          variant: "contained"
        }}
        additionalActions={[
          {
            label: "New Department",
            onClick: () => setIsDrawerOpen({ ...isDrawerOpen, department: true }),
            icon: <Add />,
            variant: "outlined"
          }
        ]}
      />

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          overflow: "hidden"
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  py: 2,
                  px: 3,
                  fontWeight: 600,
                  backgroundColor: alpha(theme.palette.primary.main, 0.04),
                  borderBottom: "2px solid",
                  borderBottomColor: "primary.main",
                  width: "60%"
                }}
              >
                Name
              </TableCell>
              <TableCell
                sx={{
                  py: 2,
                  px: 3,
                  fontWeight: 600,
                  backgroundColor: alpha(theme.palette.primary.main, 0.04),
                  borderBottom: "2px solid",
                  borderBottomColor: "primary.main",
                  width: "20%"
                }}
              >
                Type
              </TableCell>
              <TableCell
                sx={{
                  py: 2,
                  px: 3,
                  fontWeight: 600,
                  backgroundColor: alpha(theme.palette.primary.main, 0.04),
                  borderBottom: "2px solid",
                  borderBottomColor: "primary.main",
                  width: "20%"
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {departments.map((department) => (
              <React.Fragment key={department.id}>
                <TableRow
                  sx={{
                    backgroundColor: alpha(theme.palette.primary.main, 0.02),
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.primary.main, 0.04)
                    }
                  }}
                >
                  <TableCell sx={{ py: 2, px: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <IconButton
                        size="small"
                        onClick={() => toggleDepartmentExpansion(department.id)}
                        sx={{ color: "primary.main" }}
                      >
                        {expandedDepartments.has(department.id) ? (
                          <KeyboardArrowDown />
                        ) : (
                          <KeyboardArrowUp />
                        )}
                      </IconButton>
                      <Work sx={{ color: "primary.main", opacity: 0.8 }} />
                      {editState.department_id === department.id ? (
                        <TextField
                          value={editState.editedValue}
                          onChange={(e) =>
                            setEditState({ ...editState, editedValue: e.target.value })
                          }
                          variant="outlined"
                          size="small"
                          fullWidth
                        />
                      ) : (
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          {department.name}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ py: 2, px: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Department
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 2, px: 3 }}>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      {editState.department_id === department.id ? (
                        <>
                          <IconButton
                            size="small"
                            onClick={() => handleSave("department", department.id)}
                            sx={{
                              color: "white",
                              bgcolor: "primary.main",
                              "&:hover": { bgcolor: "primary.dark" }
                            }}
                          >
                            <SaveIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={handleCancel}
                            sx={{
                              color: "white",
                              bgcolor: "error.main",
                              "&:hover": { bgcolor: "error.dark" }
                            }}
                          >
                            <CancelIcon fontSize="small" />
                          </IconButton>
                        </>
                      ) : (
                        <Tooltip title="Edit Department">
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleEdit("department", department.id, department.name)
                            }
                            sx={{ color: "primary.main" }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
                {expandedDepartments.has(department.id) &&
                  department.job_titles.map((jobtitle: JobTitle) => (
                    <TableRow
                      key={jobtitle.id}
                      sx={{
                        "&:hover": {
                          backgroundColor: alpha(theme.palette.primary.main, 0.02)
                        }
                      }}
                    >
                      <TableCell sx={{ py: 2, px: 3 }}>
                        <Box sx={{ display: "flex", alignItems: "center", ml: 8 }}>
                          {editState.job_title_id === jobtitle.id ? (
                            <TextField
                              value={editState.editedValue}
                              onChange={(e) =>
                                setEditState({ ...editState, editedValue: e.target.value })
                              }
                              variant="outlined"
                              size="small"
                              fullWidth
                            />
                          ) : (
                            <Typography variant="body2">
                              {jobtitle.title}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 2, px: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          Job Title
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 2, px: 3 }}>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          {editState.job_title_id === jobtitle.id ? (
                            <>
                              <IconButton
                                size="small"
                                onClick={() => handleSave("jobtitle", jobtitle.id)}
                                sx={{
                                  color: "white",
                                  bgcolor: "primary.main",
                                  "&:hover": { bgcolor: "primary.dark" }
                                }}
                              >
                                <SaveIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={handleCancel}
                                sx={{
                                  color: "white",
                                  bgcolor: "error.main",
                                  "&:hover": { bgcolor: "error.dark" }
                                }}
                              >
                                <CancelIcon fontSize="small" />
                              </IconButton>
                            </>
                          ) : (
                            <Tooltip title="Edit Job Title">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleEdit("jobtitle", jobtitle.id, jobtitle.title)
                                }
                                sx={{ color: "primary.main" }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <JobTitleCreationDialog
        open={isDrawerOpen.jobtitle}
        onClose={() => setIsDrawerOpen({ ...isDrawerOpen, jobtitle: false })}
        refreshData={fetchDepartments}
        departments={departments}
        dealergroup_id={dealergroup_id}

      />

      <DepartmentCreationDialog
        open={isDrawerOpen.department}
        onClose={() => setIsDrawerOpen({ ...isDrawerOpen, department: false })}
        refreshData={fetchDepartments}
        dealergroup_id={dealergroup_id}
      />
    </Container>
  );
};

export default JobTitlesDashboard;
