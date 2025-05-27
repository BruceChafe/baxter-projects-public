import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const NotAuthorized: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        textAlign: "center",
        p: 2,
      }}
    >
      <Typography variant="h4" gutterBottom>
        Access Denied
      </Typography>
      <Typography variant="body1" gutterBottom>
        You do not have the necessary permissions to view this page.
      </Typography>
      <Button variant="contained" color="primary" onClick={handleGoBack} sx={{ mt: 2 }}>
        Go Back
      </Button>
    </Box>
  );
};

export default NotAuthorized;
