import React, { useState } from "react";
import { Box, Divider, Button, IconButton, useMediaQuery, Theme } from "@mui/material";

interface ActionButton {
  label: string;
  onClick: () => void;
}

interface TitleLayoutProps {
  title: React.ReactNode;
  actionButtons?: ActionButton[];
  isEditable?: boolean;
  onToggleEdit?: () => void;
}

const TitleLayout: React.FC<TitleLayoutProps> = ({
  title,
  actionButtons = [],
  isEditable,
  onToggleEdit,
}) => {

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Box sx={{ m: 1 }}>{title}</Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {onToggleEdit && (
            <Button onClick={onToggleEdit} variant="outlined" sx={{ mr: 2 }}>
              {isEditable ? "Save" : "Edit"}
            </Button>
          )}
          {actionButtons.map((button, index) => (
            <Button
              key={index}
              onClick={button.onClick}
              variant="outlined"
              sx={{ mr: 2 }}
            >
              {button.label}
            </Button>
          ))}
        </Box>
      </Box>
      <Divider />
    </Box>
  );
};

export default TitleLayout;
