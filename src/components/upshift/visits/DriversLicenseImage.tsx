import React, { useEffect, useState } from "react";
import {
  Box,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Skeleton,
  Typography,
  IconButton,
  Fade,
  alpha,
  useTheme,
  styled,
  DialogTitle,
} from "@mui/material";
import {
  BrokenImage as BrokenImageIcon,
  ZoomIn as ZoomInIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { supabase } from "../../../../supabase/supabaseClient";

const ImageContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  overflow: "hidden",
  borderRadius: theme.shape.borderRadius * 2,
  cursor: "pointer",
  transition: "transform 0.2s ease-in-out",
  "&:hover": {
    transform: "scale(1.02)",
    "& .zoom-overlay": {
      opacity: 1,
    },
  },
}));

const ZoomOverlay = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: alpha(theme.palette.common.black, 0.3),
  opacity: 0,
  transition: "opacity 0.2s ease-in-out",
}));

interface DriverLicenseImageProps {
  imageKey: string;
  height?: number | string;
  onError?: (error: string) => void;
}

const DriverLicenseImage: React.FC<DriverLicenseImageProps> = ({
  imageKey,
  height = 240,
  onError,
}) => {
  const theme = useTheme();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchSignedUrl = async () => {
    if (!imageKey) return;

    setLoading(true);
    setError(null);

    // Clean up the key if it's a full URL
    const cleanKey = imageKey.startsWith("https://")
      ? new URL(imageKey).pathname.replace(
          "/storage/v1/object/sign/license-images/",
          ""
        )
      : imageKey;

    const { data, error } = await supabase.storage
      .from("license-images")
      .createSignedUrl(cleanKey, 60 * 60);

    if (error) {
      const message = error.message || "Failed to load image.";
      setError(message);
      onError?.(message);
    } else {
      setImageUrl(data?.signedUrl || null);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchSignedUrl();
  }, [imageKey]);

  const handleRetry = () => {
    fetchSignedUrl();
  };

  const handleOpenDialog = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  if (loading) {
    return (
      <Fade in timeout={300}>
        <Box
          sx={{
            height,
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: alpha(theme.palette.primary.main, 0.04),
            borderRadius: 2,
            p: 2,
          }}
        >
          <Skeleton
            variant="rectangular"
            width="100%"
            height="100%"
            animation="wave"
            sx={{
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.08),
            }}
          />
        </Box>
      </Fade>
    );
  }

  if (error || !imageUrl) {
    return (
      <Fade in timeout={300}>
        <Box
          sx={{
            height,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: alpha(theme.palette.error.main, 0.04),
            borderRadius: 2,
            p: 3,
          }}
        >
          <BrokenImageIcon
            color="error"
            sx={{ fontSize: 48, mb: 2, opacity: 0.7 }}
          />
          <Typography
            variant="body2"
            color="error"
            align="center"
            sx={{ mb: 2 }}
          >
            {error || "No image available"}
          </Typography>
          <Button
            startIcon={<RefreshIcon />}
            variant="outlined"
            color="primary"
            onClick={handleRetry}
            size="small"
          >
            Retry
          </Button>
        </Box>
      </Fade>
    );
  }

  return (
    <>
      <ImageContainer sx={{ height }} onClick={handleOpenDialog}>
        <Box
          component="img"
          src={imageUrl}
          alt="Driver's License"
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
        <ZoomOverlay className="zoom-overlay">
          <IconButton
            sx={{
              color: "white",
              bgcolor: alpha(theme.palette.common.black, 0.2),
              "&:hover": {
                bgcolor: alpha(theme.palette.common.black, 0.4),
              },
            }}
            onClick={handleOpenDialog}
          >
            <ZoomInIcon />
          </IconButton>
        </ZoomOverlay>
      </ImageContainer>

      <Dialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        maxWidth={false}
        TransitionComponent={Fade}
        transitionDuration={300}
        PaperProps={{
          sx: {
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
            overflow: "hidden",
            maxWidth: "800px",
            margin: "auto",
            maxHeight: "90vh",
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
            borderBottom: "1px solid",
            borderColor: "divider",
            bgcolor: "background.default",
          }}
        >
          <DialogTitle
            sx={{
              p: 0,
              fontWeight: 700,
              fontSize: "1.5rem",
              color: "text.primary",
              letterSpacing: "-0.01em",
            }}
          >
            Driver's License
          </DialogTitle>
          <IconButton
            onClick={handleCloseDialog}
            size="small"
            sx={{
              color: "text.secondary",
              "&:hover": {
                color: "text.primary",
                bgcolor: alpha(theme.palette.text.primary, 0.04),
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <DialogContent
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            bgcolor: alpha(theme.palette.common.black, 0.02),
          }}
        >
          <Box
            component="img"
            src={imageUrl}
            alt="Driver's License"
            sx={{
              maxWidth: "100%",
              maxHeight: "85vh",
              objectFit: "contain",
              borderRadius: 1,
            }}
          />
        </DialogContent>

        <DialogActions
          sx={{
            px: 4,
            py: 3,
            borderTop: "1px solid",
            borderColor: "divider",
            gap: 2,
            bgcolor: "background.default",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}
        ></DialogActions>
      </Dialog>
    </>
  );
};

export default DriverLicenseImage;
