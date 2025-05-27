import React, { useState } from "react";
import axiosInstance from "../axios";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  LinearProgress,
  IconButton,
  useTheme,
  useMediaQuery,
  Alert,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  Paper,
  alpha,
  Tooltip,
  Chip,
  Divider,
} from "@mui/material";
import { Close, CheckCircle, CloudUpload, Upload, ErrorOutline, Download } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";

interface UploadContactsDialogProps {
  open: boolean;
  onClose: () => void;
}

interface ContactHeader {
  key: keyof typeof CONTACT_FIELDS;
  required: boolean;
  label: string;
}

const CONTACT_FIELDS = {
  dms_number: { required: false, label: 'dms_number' },
  first_name: { required: true, label: 'first_name' },
  last_name: { required: true, label: 'last_name' },
  date_of_birth: { required: false, label: 'date_of_birth' },
  gender: { required: false, label: 'gender' },
  preferred_language: { required: false, label: 'preferred_language' },
  preferred_contact: { required: false, label: 'preferred_contact' },
  primary_email: { required: true, label: 'primary_email' },
  secondary_email: { required: false, label: 'secondary_email' },
  mobile_phone: { required: true, label: 'mobile_phone' },
  home_phone: { required: false, label: 'home_phone' },
  work_phone: { required: false, label: 'work_phone' },
  street_address: { required: false, label: 'street_address' },
  city: { required: false, label: 'city' },
  province: { required: false, label: 'province' },
  postal_code: { required: false, label: 'postal_code' },
  country: { required: false, label: 'country' },
} as const;

const UploadContactsDialog: React.FC<UploadContactsDialogProps> = ({
  open,
  onClose,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const validateHeaders = (headers: string[]): boolean => {
    const requiredFields = Object.entries(CONTACT_FIELDS)
      .filter(([_, value]) => value.required)
      .map(([key]) => key.toLowerCase());

    const headersMapped = headers.map(h => h.toLowerCase().trim());
    const missingRequired = requiredFields.filter(
      field => !headersMapped.some(h => h.includes(field))
    );

    if (missingRequired.length > 0) {
      setValidationErrors([
        `Missing required columns: ${missingRequired
          .map(field => CONTACT_FIELDS[field as keyof typeof CONTACT_FIELDS].label)
          .join(', ')}`
      ]);
      return false;
    }

    return true;
  };

  const validateFile = (file: File): boolean => {
    setError(null);
    setValidationErrors([]);

    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('File size should be less than 5MB');
      return false;
    }
    return true;
  };

  const previewCSV = async (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const csvHeaders = lines[0].split(',').map(h => h.trim());

      if (!validateHeaders(csvHeaders)) {
        setPreview([]);
        return;
      }

      setHeaders(csvHeaders);
      const previewRows = lines.slice(1, 6).map(line => line.split(','));
      setPreview(previewRows);
    };
    reader.readAsText(file);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null); // Clear previous errors
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        await previewCSV(selectedFile);
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError(null); // Clear previous errors

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
        await previewCSV(droppedFile);
      }
    }
  };

  const handleFileUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    setValidationErrors([]);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axiosInstance.post("/upload-contacts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onClose();
    } catch (error: any) {
      console.error("Error uploading file:", error);
      if (error.response?.data?.details) {
        if (Array.isArray(error.response.data.details)) {
          setValidationErrors(error.response.data.details);
        } else {
          setError(error.response.data.details);
        }
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError("Failed to upload file. Please try again.");
      }
    } finally {
      setUploading(false);
    }
  };

  const generateTemplateCSV = () => {
    // Step 1: Generate the CSV headers
    // Extract the labels from the CONTACT_FIELDS object and join them with commas to form the header row
    const headers = Object.entries(CONTACT_FIELDS)
      .map(([key, value]) => value.label) // Extract each field's label
      .join(','); // Join labels into a single string separated by commas

    // Step 2: Prepare sample data rows
    // These rows provide example values that match the structure defined by the headers
    const sampleData = [
      `DMS123,John,Doe,1990-01-01,Male,English,email,john.doe@email.com,john.secondary@email.com,+1234567890,+1234567891,+1234567892,123 Water Street,St. John's,NL,A1C 1A1,Canada`,
      `DMS456,Jane,Smith,1985-05-15,Female,French,sms,jane.smith@email.com,jane.work@email.com,+1234567893,+1234567894,+1234567895,456 Duckworth Street,Mount Pearl,NL,A1N 2C7,Canada`
    ].join('\n'); // Join the sample rows with newline characters to form a multi-row string

    // Step 3: Combine headers and sample data into the full CSV content
    const csvContent = `${headers}\n${sampleData}`; // Headers go first, followed by the sample data, separated by a newline

    // Step 4: Create a Blob from the CSV content
    // A Blob is a data type that allows you to handle raw data like files
    const blob = new Blob([csvContent], { type: 'text/csv' });

    // Step 5: Generate a temporary URL for the Blob
    const url = window.URL.createObjectURL(blob);

    // Step 6: Create a temporary download link
    const link = document.createElement('a');
    link.href = url; // Set the URL as the link's href
    link.setAttribute('download', 'contacts_template.csv'); // Set the desired file name for the download

    // Step 7: Trigger the download
    document.body.appendChild(link); // Append the link to the document to make it clickable
    link.click(); // Programmatically click the link to start the download
    document.body.removeChild(link); // Remove the link from the document after the click

    // Step 8: Clean up the URL
    window.URL.revokeObjectURL(url); // Release the memory allocated for the Blob's URL
  };

  const handleClose = () => {
    if (!uploading) {
      setFile(null);
      setError(null);
      setValidationErrors([]);
      setPreview([]);
      setHeaders([]);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullScreen={isMobile}
      fullWidth
      PaperProps={{
        elevation: 0,
        sx: {
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          maxWidth: '800px',
          margin: 'auto'
        }
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
          bgcolor: 'background.default'
        }}
      >
        <Box display="flex" alignItems="center">
          <DialogTitle sx={{
            p: 0,
            fontWeight: 700,
            fontSize: '1.5rem',
            color: 'text.primary',
            letterSpacing: '-0.01em'
          }}>
            Upload Contacts
          </DialogTitle>
        </Box>
        <IconButton
          onClick={handleClose}
          size="small"
          sx={{
            color: 'text.secondary',
            '&:hover': {
              color: 'text.primary',
              bgcolor: alpha(theme.palette.text.primary, 0.04)
            }
          }}
        >
          <Close fontSize="small" />
        </IconButton>
      </Box>
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          padding: "24px",
        }}
      >
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" align="center" color="text.secondary">
            Upload your contacts using a <b>.csv</b> file (max 5MB)
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
            <LoadingButton
              onClick={generateTemplateCSV}
              variant="outlined"
              color="secondary"
              startIcon={<Download />}
            >
              Download Template CSV
            </LoadingButton>
          </Box>
        </Box>

        <Box
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          sx={{
            width: "100%",
            border: "2px dashed",
            borderColor: dragActive
              ? theme.palette.primary.main
              : error
                ? theme.palette.error.main
                : theme.palette.divider,
            borderRadius: 2,
            textAlign: "center",
            padding: "32px 20px",
            cursor: "pointer",
            transition: "all 0.2s ease",
            backgroundColor: dragActive
              ? alpha(theme.palette.primary.main, 0.08)
              : error
                ? alpha(theme.palette.error.main, 0.08)
                : 'transparent',
            "&:hover": {
              borderColor: theme.palette.primary.main,
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
            },
            "&:focus-visible": {
              outline: `2px solid ${theme.palette.primary.main}`,
              outlineOffset: 2,
            },
          }}
          onClick={() => document.getElementById("file-input")?.click()}
          role="button"
          tabIndex={0}
          aria-label="Click or drag and drop to upload CSV file"
        >
          {file ? (
            <>
              <CheckCircle color="success" sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 'medium' }}>
                {file.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {(file.size / 1024 / 1024).toFixed(2)}MB
              </Typography>
            </>
          ) : (
            <>
              <CloudUpload sx={{ fontSize: 48, mb: 1, color: 'primary.main' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                Drag and drop your CSV file here
              </Typography>
              <Typography variant="body2" color="text.secondary">
                or click to browse
              </Typography>
            </>
          )}
        </Box>

        <input
          id="file-input"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          style={{ display: "none" }}
          aria-label="Upload CSV file"
        />

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {validationErrors.length > 0 && (
          <Alert
            severity="warning"
            sx={{ mt: 2 }}
            icon={<ErrorOutline />}
          >
            {validationErrors.map((error, index) => (
              <Typography key={index} variant="body2">{error}</Typography>
            ))}
          </Alert>
        )}

        {preview.length > 0 && (
          <Paper variant="outlined" sx={{ mt: 2, p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="subtitle2">
                Preview
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Showing first 5 rows
              </Typography>
            </Box>
            <TableContainer sx={{ maxHeight: 300 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    {headers.map((header, index) => {
                      const matchedField = Object.entries(CONTACT_FIELDS).find(
                        ([key, value]) => header.toLowerCase().includes(key.toLowerCase())
                      );
                      return (
                        <TableCell key={index}>
                          <Tooltip title={matchedField ? `Field: ${matchedField[1].label}${matchedField[1].required ? ' (Required)' : ''}` : 'Unmapped column'}>
                            <Typography variant="caption" noWrap
                              sx={{
                                fontWeight: matchedField?.['1'].required ? 600 : 400,
                                color: matchedField ? 'text.primary' : 'text.secondary'
                              }}>
                              {header}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {preview.map((row, i) => (
                    <TableRow key={i}>
                      {row.map((cell, j) => (
                        <TableCell key={j}>
                          <Typography variant="caption" noWrap>
                            {cell}
                          </Typography>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {uploading && (
          <Box sx={{ width: "100%", mt: 2 }}>
            <LinearProgress variant="determinate" value={uploading ? 70 : 0} />
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
              Uploading...
            </Typography>
          </Box>
        )}
      </DialogContent>
      <Divider />
      <DialogActions
        sx={{
          px: 4,
          py: 3,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.default',
          display: 'flex',
          justifyContent: 'flex-end'
        }}
      >
        <Box sx={{ display: 'flex', gap: 2 }}>     
        <Button onClick={handleClose} variant="outlined" color="secondary">

          Cancel
        </Button>
          <LoadingButton
            onClick={handleFileUpload}
            variant="contained"
            disabled={!file || uploading || validationErrors.length > 0}
            loading={uploading}
            loadingPosition="start"
            startIcon={<Upload />}
          >
            {uploading ? "Uploading..." : "Upload Contacts"}
          </LoadingButton>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default UploadContactsDialog;
