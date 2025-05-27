import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress,
  TextField
} from "@mui/material";
import { styled } from "@mui/system";
import { Close as CloseIcon } from "@mui/icons-material";

interface PasswordResetDialogProps {
  open: boolean;
  onClose: () => void;
  email: string;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  isLoading: boolean;
  resetMessage: string;
}

const StyledTextField = styled(TextField)({
    backgroundColor: "#fff",
    borderRadius: "8px",
    "& .MuiOutlinedInput-root": {
      color: "#524266",
      "&::placeholder": {
        color: "#666",
      },
      "& fieldset": {
        borderColor: "#e0e0e0",
      },
      "&:hover fieldset": {
        borderColor: "#FF4D8D",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#FF4D8D",
      },
    },
    "& .MuiInputLabel-root": {
      color: "#666",
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "#FF4D8D",
    },
  });

const PasswordResetDialog: React.FC<PasswordResetDialogProps> = ({
  open,
  onClose,
  email,
  onEmailChange,
  onSubmit,
  isLoading,
  resetMessage,
}) => {
  const isSuccess = resetMessage.includes('sent');

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxWidth: 'sm',
          width: '100%',
          m: 2,
          position: 'relative',
          overflow: 'visible'
        },
      }}
    >
      {/* Floating close button */}
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: -12,
          top: -12,
          bgcolor: 'background.paper',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: '1px solid',
          borderColor: 'divider',
          '&:hover': {
            bgcolor: 'background.paper',
            transform: 'scale(1.1)',
          },
          transition: 'transform 0.2s',
          zIndex: 1,
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>

      <DialogTitle
        sx={{
          pt: 4,
          px: 4,
          pb: 2,
          '& .MuiTypography-root': {
            fontSize: '1.5rem',
            fontWeight: 600,
            color: 'text.primary',
          },
        }}
      >
        Reset your password
      </DialogTitle>

      <DialogContent sx={{ px: 4, pb: 2, bgcolor: '#F2F4FC', }}>
        <Typography 
          sx={{ 
            mb: 3, 
            color: 'text.secondary',
            lineHeight: 1.6,
          }}
        >
          Enter your email address and we'll send you a link to reset your password.
          You'll receive the instructions within a few minutes.
        </Typography>

        <StyledTextField
          fullWidth
          label="Email address"
          variant="outlined"
          value={email}
          onChange={onEmailChange}
          placeholder="Enter your email"
          sx={{ mb: 3 }}
        />

        {resetMessage && (
          <Alert 
            severity={isSuccess ? "success" : "error"}
            sx={{
              borderRadius: 2,
              '& .MuiAlert-message': {
                width: '100%',
              },
            }}
          >
            {resetMessage}
          </Alert>
        )}
      </DialogContent>

      <DialogActions 
        sx={{ 
          p: 4,
          pt: 2,
          gap: 2,
          flexDirection: {
            xs: 'column',
            sm: 'row',
          },
        }}
      >
        <Button
          fullWidth={false}
          variant="outlined"
          onClick={onClose}
          sx={{
            order: { xs: 2, sm: 1 },
            flex: { xs: '1', sm: '0 0 auto' },
            px: 4,
          }}
        >
          Cancel
        </Button>
        <Button
          fullWidth={false}
          variant="contained"
          onClick={onSubmit}
          disabled={isLoading || !email}
          sx={{
            order: { xs: 1, sm: 2 },
            flex: { xs: '1', sm: '0 0 auto' },
            px: 4,
          }}
        >
          {isLoading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <span>Sending</span>
              <CircularProgress size={16} thickness={4} />
            </Box>
          ) : (
            "Send boobs link"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PasswordResetDialog;