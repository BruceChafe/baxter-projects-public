import { SxProps, Theme, alpha } from "@mui/material";

export const containerStyles: SxProps<Theme> = {
  bgcolor: "background.paper",
  borderRadius: 3,
  boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
  p: { xs: 2, sm: 3, md: 4 },
  position: "relative",
  overflow: "hidden",
  transition: "all 0.3s ease",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "6px",
    background: (theme) => `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
  },
  "&:hover": {
    boxShadow: "0 14px 36px rgba(0,0,0,0.09)",
  },
};

export const headerStyles: SxProps<Theme> = {
  mb: 4,
  textAlign: { xs: "center", sm: "left" },
  "& .icon": {
    fontSize: { xs: 36, sm: 40, md: 44 },
    color: "primary.main",
    mb: 2,
    display: "inline-flex",
    background: (theme) => alpha(theme.palette.primary.main, 0.1),
    padding: 1.5,
    borderRadius: 2,
  },
  "& .title": {
    fontWeight: 800,
    color: "text.primary",
    letterSpacing: "-0.5px",
    mb: 1.5,
    fontSize: { xs: "1.75rem", sm: "2rem", md: "2.25rem" },
  },
  "& .subtitle": {
    color: "text.secondary",
    maxWidth: "550px",
    fontSize: { xs: "0.95rem", sm: "1rem" },
    lineHeight: 1.6,
    margin: { xs: "0 auto", sm: "0" },
  },
};

export const inputStyles: SxProps<Theme> = {
  mb: 2.5,
  "& .MuiInputLabel-root": {
    fontWeight: 500,
    fontSize: "0.95rem",
  },
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    transition: "all 0.2s",
    backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.8),
    "&:hover": {
      boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
    },
    "&.Mui-focused": {
      boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
      borderColor: "primary.main",
    },
  },
  "& .MuiFormHelperText-root": {
    marginLeft: 1,
    fontSize: "0.8rem",
  },
};

export const buttonStyles: SxProps<Theme> = {
  borderRadius: 2,
  py: 1.5,
  px: 3.5,
  fontWeight: 600,
  boxShadow: (theme) => `0 4px 14px ${alpha(theme.palette.primary.main, 0.25)}`,
  transition: "all 0.3s",
  "&:hover": {
    transform: "translateY(-3px)",
    boxShadow: (theme) => `0 6px 20px ${alpha(theme.palette.primary.main, 0.35)}`,
  },
  "&.MuiButton-outlined": {
    borderWidth: 2,
    "&:hover": {
      borderWidth: 2,
      backgroundColor: "rgba(25, 118, 210, 0.04)",
    },
  },
  "&.MuiButton-secondary": {
    color: "text.primary",
    backgroundColor: (theme) => alpha(theme.palette.grey[300], 0.5),
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
    "&:hover": {
      backgroundColor: (theme) => alpha(theme.palette.grey[300], 0.7),
      boxShadow: "0 6px 14px rgba(0,0,0,0.12)",
    },
  },
};

export const sectionStyles: SxProps<Theme> = {
  p: { xs: 2, sm: 3 },
  bgcolor: (theme) => alpha(theme.palette.grey[50], 0.7),
  borderRadius: 2.5,
  border: "1px solid",
  borderColor: "divider",
  mb: 3.5,
  transition: "all 0.2s ease",
  "&:hover": {
    boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
    bgcolor: (theme) => alpha(theme.palette.grey[50], 0.9),
  },
  "& .section-title": {
    fontWeight: 700,
    color: "text.primary",
    mb: 3,
    position: "relative",
    paddingBottom: 1.5,
    fontSize: { xs: "1.2rem", sm: "1.3rem", md: "1.4rem" },
    "&::after": {
      content: '""',
      position: "absolute",
      bottom: 0,
      left: 0,
      width: 48,
      height: 3,
      borderRadius: 1.5,
      bgcolor: "primary.main",
    },
  },
};

export const chipStyles: SxProps<Theme> = {
  borderRadius: 8,
  fontWeight: 500,
  px: 1.5,
  "& .MuiChip-icon": {
    color: "inherit",
  },
};

export const cardStyles: SxProps<Theme> = {
  borderRadius: 2.5,
  p: 2.5,
  height: "100%",
  transition: "all 0.3s ease",
  border: "1px solid",
  borderColor: "divider",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
  },
};

export const stepperStyles: SxProps<Theme> = {
  marginBottom: 4,
  "& .MuiStepLabel-root": {
    "& .MuiStepLabel-iconContainer": {
      "& .MuiStepIcon-root": {
        fontSize: 32,
        "&.Mui-active": {
          color: "primary.main",
        },
        "&.Mui-completed": {
          color: "success.main",
        },
      },
    },
    "& .MuiStepLabel-label": {
      marginTop: 0.5,
      fontWeight: 500,
      "&.Mui-active": {
        color: "primary.main",
      },
      "&.Mui-completed": {
        color: "text.primary",
      },
    },
  },
};

export const selectStyles: SxProps<Theme> = {
  ...inputStyles,
  "& .MuiSelect-select": {
    paddingTop: 1.5,
    paddingBottom: 1.5,
  },
};

export const tableStyles: SxProps<Theme> = {
  "& .MuiTableCell-head": {
    backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.06),
    color: "text.primary",
    fontWeight: 600,
  },
  "& .MuiTableRow-root:nth-of-type(even)": {
    backgroundColor: (theme) => alpha(theme.palette.grey[50], 0.5),
  },
  "& .MuiTableRow-root:hover": {
    backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.04),
  },
  "& .MuiTableCell-root": {
    borderColor: (theme) => alpha(theme.palette.divider, 0.6),
  },
};