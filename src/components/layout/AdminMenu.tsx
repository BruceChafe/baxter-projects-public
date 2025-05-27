import React, { useState } from "react";
import {
  Menu,
  MenuItem,
  IconButton,
  Badge,
  ListItemIcon,
  Typography,
  alpha,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { FaGear } from "react-icons/fa6";
import GroupIcon from "@mui/icons-material/Group";
import StoreIcon from "@mui/icons-material/Store";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import { useAuth } from "../../context/AuthContext";

const AdminMenu: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { sqlUser } = useAuth();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton 
        onClick={handleClick}
        sx={{
          transition: 'all 0.2s ease-in-out',
          color: 'white',
          '&:hover': {
            transform: 'scale(1.1)',
            backgroundColor: 'rgba(255, 255, 255, 0.1)'
          }
        }}
      >
        <Badge>
          <FaGear size={20} />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            width: "250px",
            overflow: 'visible',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            mt: 1.5,
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1.5,
              borderRadius: 1,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: theme => alpha(theme.palette.primary.main, 0.08),
                '& .MuiListItemIcon-root': {
                  color: 'primary.main'
                },
                '& .MuiTypography-root': {
                  color: 'primary.main'
                }
              }
            }
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem
          component={RouterLink}
          to="/admin/users"
        >
          <ListItemIcon>
            <GroupIcon sx={{ fontSize: 20 }} />
          </ListItemIcon>
          <Typography>Users</Typography>
        </MenuItem>
        <MenuItem
          component={RouterLink}
          to="/admin/dealerships"
        >
          <ListItemIcon>
            <StoreIcon sx={{ fontSize: 20 }} />
          </ListItemIcon>
          <Typography>Dealerships</Typography>
        </MenuItem>
        <MenuItem
          component={RouterLink}
          to="/admin/jobtitles"
        >
          <ListItemIcon>
            <BusinessCenterIcon sx={{ fontSize: 20 }} />
          </ListItemIcon>
          <Typography>Departments & Job Titles</Typography>
        </MenuItem>
      </Menu>
    </>
  );
};

export default AdminMenu;
