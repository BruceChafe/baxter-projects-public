import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Chip,
  CircularProgress,
  Stack,
  TextField,
  Tooltip,
} from "@mui/material";
import {
  Refresh,
  Search as SearchIcon,
  Email,
  Event,
  Update,
  Task,
  Assignment,
} from "@mui/icons-material";
import { useSnackbar } from "../../../../context/SnackbarContext";
import { useParams } from "react-router-dom";
import DataTableLayout from "../../../../common/DataTableLayout";
import TaskDialog from "./TaskDialog";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "../../../../../supabase/supabaseClient";

const LeadActivityHistory: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { showSnackbar } = useSnackbar();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [openTaskDialog, setOpenTaskDialog] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<any | null>(null);

  useEffect(() => {
    fetchActivities();
  }, [id]);

  const fetchActivities = async () => {
    if (!id) return;
    setLoading(true);

    try {
      console.log("Fetching activities for lead ID:", id);
      
      const { data: activitiesData, error: activitiesError } = await supabase
        .from("leadactivity")
        .select("*")
        .eq("lead_id", id);

      const { data: tasksData, error: tasksError } = await supabase
        .from("leadtasks")
        .select("*")
        .eq("lead_id", id);

      if (activitiesError || tasksError) {
        throw new Error(activitiesError?.message || tasksError?.message);
      }

      console.log("Activities:", activitiesData);
      console.log("Tasks:", tasksData);

      const tasks = tasksData.map((task: any) => ({
        ...task,
        type: "task",
        title: task.title || "Untitled Task",
        description: task.description || "No details provided",
        created_at: task.due_date || new Date().toISOString(),
      }));

      const mergedActivities = [...activitiesData, ...tasks].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setActivities(mergedActivities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      showSnackbar("Failed to fetch activities", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleTaskClick = (task: any) => {
    setEditingTask(task);
    setOpenTaskDialog(true);
  };

  const handleSaveTask = async (updatedTask: any) => {
    try {
      let response;
      if (updatedTask.id) {
        response = await supabase
          .from("tasks")
          .update(updatedTask)
          .eq("id", updatedTask.id);
        showSnackbar("Task updated successfully!", "success");
      } else {
        response = await supabase
          .from("tasks")
          .insert([{ ...updatedTask, lead_id: id }]);
        showSnackbar("Task created successfully!", "success");
      }

      if (response.error) throw response.error;

      setOpenTaskDialog(false);
      fetchActivities();
    } catch (error) {
      console.error("Error saving task:", error);
      showSnackbar("Failed to save task", "error");
    }
  };

  const filteredActivities = activities.filter((activity) => {
    return (
      (activity.title?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (activity.description?.toLowerCase().includes(search.toLowerCase()) ?? false)
    );
  });

  const getActivityIcon = (type?: string) => {
    switch (type?.toLowerCase()) {
      case "lead_created":
        return <Assignment sx={{ color: "success.main" }} />;
      case "status_change":
        return <Update sx={{ color: "warning.main" }} />;
      case "task":
        return <Task sx={{ color: "primary.main" }} />;
      case "email_sent":
      case "email_received":
        return <Email sx={{ color: "info.main" }} />;
      case "appointment":
        return <Event sx={{ color: "secondary.main" }} />;
      default:
        return <Assignment sx={{ color: "text.secondary" }} />;
    }
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" fontWeight="600" color="primary">
          Lead Activity History
        </Typography>
        <Tooltip title="Refresh">
          <IconButton onClick={fetchActivities}>
            <Refresh />
          </IconButton>
        </Tooltip>
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={3}>
        <Box sx={{ position: "relative", flex: 1 }}>
          <SearchIcon
            sx={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", color: "text.secondary" }}
          />
          <TextField
            fullWidth
            size="small"
            placeholder="Search activity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ "& .MuiOutlinedInput-root": { pl: 5 } }}
          />
        </Box>
      </Stack>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px" }}>
          <CircularProgress />
        </Box>
      ) : (
        <DataTableLayout
          columns={[
            {
              id: "type",
              label: "Activity Type",
              render: (value: string) => (
                <Stack direction="row" spacing={1} alignItems="center">
                  {getActivityIcon(value)}
                  <Chip label={value} size="small" />
                </Stack>
              ),
            },
            {
              id: "title",
              label: "Title",
              render: (value: string) => <Typography fontWeight={500}>{value}</Typography>,
            },
            {
              id: "description",
              label: "Details",
              render: (value: string) => <Typography variant="body2">{value || "No details available"}</Typography>,
            },
          ]}
          data={filteredActivities}
          emptyMessage="No activity available"
        />
      )}

<TaskDialog open={openTaskDialog} onClose={() => setOpenTaskDialog(false)} onSave={handleSaveTask} taskData={editingTask} />

    </Paper>
  );
};

export default LeadActivityHistory;
