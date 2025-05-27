import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Typography,
  Box,
  Divider,
  Chip,
  Alert,
  alpha,
} from '@mui/material';
import { Close, AccessTime, Flag } from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { useTheme } from '@mui/material/styles';

interface TaskDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  taskData?: Task | null;
}

interface Task {
  id?: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: Date | null;
  assignedTo?: string;
}

const PRIORITIES = [
  { value: 'high', label: 'High', color: 'error' },
  { value: 'medium', label: 'Medium', color: 'warning' },
  { value: 'low', label: 'Low', color: 'success' },
];

const STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'overdue', label: 'Overdue' },
];

const TaskDialog: React.FC<TaskDialogProps> = ({
  open,
  onClose,
  onSave,
  taskData,
}) => {
  const [task, setTask] = useState<Task>({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Default to tomorrow
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Task, string>>>({});
  const theme = useTheme();

  useEffect(() => {
    if (taskData) {
      setTask({
        ...taskData,
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
      });
    } else {
      // Reset form for new task
      setTask({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
    }
    setErrors({});
  }, [taskData, open]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Task> = {};

    if (!task.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!task.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }
    if (task.description && task.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave(task);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        elevation: 0,
        sx: {
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          maxWidth: '800px',
          margin: 'auto',
        },
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        px={4}
        py={2.5}
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.default',
        }}
      >
        <Box display="flex" alignItems="center">
          <DialogTitle
            sx={{
              p: 0,
              fontWeight: 700,
              fontSize: '1.5rem',
              color: 'text.primary',
              letterSpacing: '-0.01em',
            }}
          >
            {taskData ? 'Edit Task' : 'Create New Task'}
          </DialogTitle>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: 'text.secondary',
            '&:hover': {
              color: 'text.primary',
              bgcolor: alpha(theme.palette.text.primary, 0.04),
            },
          }}
        >
          <Close />
        </IconButton>
      </Box>

      <DialogContent>
        <Stack spacing={3}>
          {/* Title */}
          <TextField
            label="Title"
            value={task.title}
            onChange={(e) => setTask({ ...task, title: e.target.value })}
            error={!!errors.title}
            helperText={errors.title}
            fullWidth
            required
          />

          {/* Priority and Status Row */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={task.priority}
                onChange={(e) => setTask({ ...task, priority: e.target.value })}
                label="Priority"
                startAdornment={<Flag sx={{ mr: 1, color: 'text.secondary' }} />}
              >
                {PRIORITIES.map((priority) => (
                  <MenuItem key={priority.value} value={priority.value}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Chip
                        label={priority.label}
                        size="small"
                        color={priority.color as any}
                        variant="outlined"
                      />
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={task.status}
                onChange={(e) => setTask({ ...task, status: e.target.value })}
                label="Status"
              >
                {STATUSES.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          {/* Due Date */}
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label="Due Date"
              value={task.dueDate}
              onChange={(newValue) => setTask({ ...task, dueDate: newValue })}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!errors.dueDate,
                  helperText: errors.dueDate as string | undefined,
                  required: true,
                },
              }}
            />
          </LocalizationProvider>

          {/* Description */}
          <TextField
            label="Description"
            value={task.description}
            onChange={(e) => setTask({ ...task, description: e.target.value })}
            error={!!errors.description}
            helperText={errors.description || `${task.description.length}/500 characters`}
            multiline
            rows={4}
            fullWidth
          />

          {/* Warning for overdue tasks */}
          {taskData && task.status !== 'completed' && task.dueDate && task.dueDate < new Date() && (
            <Alert severity="warning">
              This task is overdue. Please update the due date or mark it as completed.
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: 4,
          py: 3,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.default',
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button onClick={onClose} variant="outlined" color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color={taskData ? 'primary' : 'primary'}
          >
            {taskData ? 'Update Task' : 'Create Task'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default TaskDialog;