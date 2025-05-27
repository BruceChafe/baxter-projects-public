import React, { useState } from "react";
import {
  Paper,
  Button,
  Box,
  Typography,
  IconButton,
  Container,
  LinearProgress,
  useTheme,
  alpha,
  Grid,
  Fade,
  Tooltip,
} from "@mui/material";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ImageIcon from "@mui/icons-material/Image";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

interface StepOneCaptureProps {
  frontImage: File | null;
  rearImage: File | null;
  setFrontImage: (file: File | null) => void;
  setRearImage: (file: File | null) => void;
  rotation: { front: number; rear: number };
  setRotation: React.Dispatch<React.SetStateAction<{ front: number; rear: number }>>;
  handleAnalyzeLicense: () => void;
  isLoading: boolean;
}

const StepOneCapture: React.FC<StepOneCaptureProps> = ({
  frontImage,
  rearImage,
  setFrontImage,
  setRearImage,
  rotation,
  setRotation,
  handleAnalyzeLicense,
  isLoading,
}) => {
  const theme = useTheme();
  const [dragActive, setDragActive] = useState<{ front: boolean; rear: boolean }>({
    front: false,
    rear: false,
  });

  const [previewUrls, setPreviewUrls] = useState<{ front: string | null; rear: string | null }>({
    front: null,
    rear: null,
  });

  const revokePreview = (side: "front" | "rear") => {
    if (previewUrls[side]) {
      URL.revokeObjectURL(previewUrls[side]!);
      setPreviewUrls((prev) => ({ ...prev, [side]: null }));
    }
  };

  const handleFileChange = (side: "front" | "rear") => (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      revokePreview(side); // cleanup previous
      setPreviewUrls((prev) => ({ ...prev, [side]: url }));
      setRotation((prev) => ({ ...prev, [side]: 0 }));
      if (side === "front") setFrontImage(file);
      if (side === "rear") setRearImage(file);
    }
  };

  const handleRemoveImage = (side: "front" | "rear") => () => {
    revokePreview(side);
    if (side === "front") setFrontImage(null);
    if (side === "rear") setRearImage(null);
    setRotation((prev) => ({ ...prev, [side]: 0 }));
  };

  const handleRotateImage = (side: "front" | "rear") => () => {
    setRotation((prev) => ({
      ...prev,
      [side]: (prev[side] + 90) % 360,
    }));
  };

  const handleDrag = (side: "front" | "rear", active: boolean) => (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive((prev) => ({ ...prev, [side]: active }));
  };

  const handleDrop = (side: "front" | "rear") => (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive((prev) => ({ ...prev, [side]: false }));

    const file = e.dataTransfer.files?.[0] || null;
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      revokePreview(side);
      setPreviewUrls((prev) => ({ ...prev, [side]: url }));
      setRotation((prev) => ({ ...prev, [side]: 0 }));
      if (side === "front") setFrontImage(file);
      if (side === "rear") setRearImage(file);
    }
  };

  const renderUploadBox = (label: string, side: "front" | "rear", image: File | null) => {
    const imageUrl = previewUrls[side];
    const isDragActive = dragActive[side];

    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 2,
          border: `2px dashed ${isDragActive ? theme.palette.primary.main : alpha(theme.palette.text.primary, 0.1)}`,
          bgcolor: isDragActive ? alpha(theme.palette.primary.main, 0.05) : alpha(theme.palette.background.paper, 0.6),
          textAlign: "center",
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          transition: "all 0.2s ease",
          cursor: imageUrl ? "default" : "pointer",
          "&:hover": {
            borderColor: !imageUrl ? theme.palette.primary.main : alpha(theme.palette.text.primary, 0.1),
          },
        }}
        onDragEnter={handleDrag(side, true)}
        onDragLeave={handleDrag(side, false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop(side)}
        component="div"
      >
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            color: imageUrl ? "text.primary" : "text.secondary",
            fontSize: "1rem",
            fontWeight: 600,
          }}
        >
          {imageUrl ? `${label} of License` : `Upload ${label} of License`}
        </Typography>

        {imageUrl ? (
          <Box sx={{ position: "relative", width: "100%" }}>
            <img
              src={imageUrl}
              alt={`${label} License`}
              style={{
                maxWidth: "100%",
                maxHeight: "240px",
                objectFit: "contain",
                borderRadius: "8px",
                transform: `rotate(${rotation[side]}deg)`,
                transition: "transform 0.3s ease",
                boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.1)}`,
              }}
            />
            <Box sx={{ position: "absolute", top: "8px", right: "8px", display: "flex", gap: 1 }}>
              <Tooltip title="Rotate image">
                <IconButton
                  onClick={handleRotateImage(side)}
                  size="small"
                  sx={{
                    bgcolor: alpha(theme.palette.background.paper, 0.9),
                    boxShadow: theme.shadows[2],
                    "&:hover": { bgcolor: theme.palette.background.paper },
                  }}
                >
                  <RotateRightIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Remove image">
                <IconButton
                  onClick={handleRemoveImage(side)}
                  size="small"
                  sx={{
                    bgcolor: alpha(theme.palette.error.light, 0.9),
                    color: "white",
                    boxShadow: theme.shadows[2],
                    "&:hover": { bgcolor: theme.palette.error.main },
                  }}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Fade in={true}>
              <Box
                sx={{
                  position: "absolute",
                  bottom: "-10px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  bgcolor: alpha(theme.palette.success.main, 0.9),
                  color: "white",
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  boxShadow: theme.shadows[1],
                }}
              >
                <CheckCircleOutlineIcon fontSize="inherit" />
                <span>Image Loaded</span>
              </Box>
            </Fade>
          </Box>
        ) : (
          <>
            <Box
              sx={{
                p: 4,
                border: `2px dashed ${isDragActive ? theme.palette.primary.main : alpha(theme.palette.text.primary, 0.1)}`,
                borderRadius: 1,
                bgcolor: isDragActive ? alpha(theme.palette.primary.main, 0.05) : alpha(theme.palette.background.paper, 0.6),
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                mb: 2,
                transition: "all 0.2s ease",
              }}
            >
              <CloudUploadIcon
                sx={{
                  fontSize: 48,
                  color: isDragActive ? "primary.main" : alpha(theme.palette.text.primary, 0.4),
                  mb: 2,
                }}
              />
              <Typography variant="body2" sx={{ mb: 2, color: isDragActive ? "primary.main" : "text.secondary" }}>
                Drop your image here or click to browse
              </Typography>
            </Box>

            <label htmlFor={`upload-${side}`}>
              <Button
                variant="contained"
                component="span"
                startIcon={<ImageIcon />}
                sx={{
                  borderRadius: 1.5,
                  textTransform: "none",
                  px: 2,
                  py: 1,
                  boxShadow: theme.shadows[1],
                }}
              >
                Select {label} Image
              </Button>
            </label>
            <input
              id={`upload-${side}`}
              type="file"
              accept="image/*"
              hidden
              onChange={handleFileChange(side)}
            />
          </>
        )}
      </Paper>
    );
  };

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      {isLoading ? (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: "center",
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.04),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                mr: 2,
              }}
            >
              <ImageIcon sx={{ color: theme.palette.primary.main }} />
            </Box>
            <Typography variant="h6" sx={{ color: "primary.main", fontWeight: 600 }}>
              Processing License...
            </Typography>
          </Box>

          <Box sx={{ px: 4 }}>
            <LinearProgress
              sx={{
                height: 10,
                borderRadius: 5,
                mb: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                "& .MuiLinearProgress-bar": {
                  borderRadius: 5,
                  backgroundImage: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                },
              }}
            />
            <Typography variant="body2" color="text.secondary">
              This may take a few moments. We're extracting and processing the license information.
            </Typography>
          </Box>
        </Paper>
      ) : (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              {renderUploadBox("Front", "front", frontImage)}
            </Grid>
            <Grid item xs={12} md={6}>
              {renderUploadBox("Rear", "rear", rearImage)}
            </Grid>
          </Grid>

          <Box sx={{ display: "flex", justifyContent: "center", mt: 2, position: "relative" }}>
            <Button
              variant="contained"
              onClick={handleAnalyzeLicense}
              disabled={!frontImage || !rearImage}
              sx={{
                px: 6,
                py: 1.5,
                borderRadius: 2,
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: 600,
                boxShadow: !frontImage || !rearImage ? "none" : `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
                minWidth: 200,
                background: !frontImage || !rearImage
                  ? undefined
                  : `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                "&:hover": {
                  boxShadow: `0 6px 18px ${alpha(theme.palette.primary.main, 0.6)}`,
                },
                transition: "all 0.3s ease",
              }}
            >
              Analyze License
            </Button>

            {!frontImage || !rearImage ? (
              <Typography
                variant="caption"
                sx={{
                  position: "absolute",
                  bottom: -24,
                  color: "text.secondary",
                }}
              >
                Please upload both front and rear images
              </Typography>
            ) : null}
          </Box>
        </>
      )}
    </Container>
  );
};

export default StepOneCapture;
