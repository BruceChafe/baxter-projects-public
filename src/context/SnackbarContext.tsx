import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { Snackbar, Alert, AlertColor, SnackbarOrigin } from "@mui/material";

interface SnackbarContextType {
  showSnackbar: (
    message: string,
    severity?: AlertColor,
    duration?: number,
    position?: SnackbarOrigin
  ) => void;
  closeSnackbar: () => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export const useSnackbar = (): SnackbarContextType => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error("useSnackbar must be used within a SnackbarProvider");
  }
  return context;
};

interface SnackbarProviderProps {
  children: ReactNode;
}

export const SnackbarProvider: React.FC<SnackbarProviderProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<AlertColor>("info");
  const [autoHideDuration, setAutoHideDuration] = useState(6000);
  const [anchorOrigin, setAnchorOrigin] = useState<SnackbarOrigin>({
    vertical: "bottom",
    horizontal: "left",
  });

  const showSnackbar = useCallback(
    (
      message: string,
      severity: AlertColor = "info",
      duration: number = 6000,
      position: SnackbarOrigin = { vertical: "bottom", horizontal: "left" }
    ) => {
      setMessage(message);
      setSeverity(severity);
      setAutoHideDuration(duration);
      setAnchorOrigin(position);
      setOpen(true);
    },
    []
  );

  const closeSnackbar = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <SnackbarContext.Provider value={{ showSnackbar, closeSnackbar }}>
      <Snackbar
        open={open}
        autoHideDuration={autoHideDuration}
        onClose={closeSnackbar}
        anchorOrigin={anchorOrigin}
      >
        <Alert onClose={closeSnackbar} severity={severity} sx={{ width: "100%" }}>
          {message}
        </Alert>
      </Snackbar>
      {children}
    </SnackbarContext.Provider>
  );
};
