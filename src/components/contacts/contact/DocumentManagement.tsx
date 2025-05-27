import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  IconButton,
  Button,
  Stack,
  Chip,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  TextField,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  InputAdornment,
  Tooltip
} from '@mui/material';
import {
  FileUpload,
  Search,
  Visibility,
  Download,
  Delete,
  CheckCircle,
  Schedule,
  Error,
  Add
} from '@mui/icons-material';

const DocumentManagement = () => {
  const [documents, setDocuments] = useState([
    {
      id: 1,
      type: "Driver's License",
      status: "verified",
      uploadDate: "2024-01-15",
      expiryDate: "2028-01-15",
      fileName: "drivers_license_front.pdf",
      fileSize: "1.2 MB",
      verifiedBy: "John Smith",
      verificationDate: "2024-01-15"
    }
  ]);
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [newDocument, setNewDocument] = useState({
    type: '',
    expiryDate: '',
    file: null
  });

  const handleUploadClick = () => {
    setUploadDialogOpen(true);
  };

  const handleCloseUpload = () => {
    setUploadDialogOpen(false);
    setNewDocument({ type: '', expiryDate: '', file: null });
  };

  const getStatusChipProps = (status) => {
    switch (status) {
      case 'verified':
        return {
          icon: <CheckCircle fontSize="small" />,
          color: 'success',
          label: 'Verified'
        };
      case 'pending':
        return {
          icon: <Schedule fontSize="small" />,
          color: 'warning',
          label: 'Pending'
        };
      case 'rejected':
        return {
          icon: <Error fontSize="small" />,
          color: 'error',
          label: 'Rejected'
        };
      default:
        return {
          icon: <Schedule fontSize="small" />,
          color: 'default',
          label: status
        };
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3 
      }}>
        <Typography variant="h6" fontWeight="bold">
          Documents ({documents.length})
        </Typography>
        <Stack direction="row" spacing={2}>
          <TextField
            size="small"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ width: 250 }}
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={handleUploadClick}
            sx={{
              textTransform: 'none',
              borderRadius: 1,
              px: 2
            }}
          >
            Upload Document
          </Button>
        </Stack>
      </Box>

      {documents.length > 0 ? (
        <Paper elevation={0} variant="outlined">
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Document Type</TableCell>
                  <TableCell>File Name</TableCell>
                  <TableCell>Upload Date</TableCell>
                  <TableCell>Expiry Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDocuments
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((doc) => (
                    <TableRow key={doc.id} hover>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <FileUpload fontSize="small" color="action" />
                          <Typography variant="body2">{doc.type}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{doc.fileName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {doc.fileSize}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{doc.uploadDate}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          by {doc.verifiedBy}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{doc.expiryDate}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          {...getStatusChipProps(doc.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title="View Document">
                            <IconButton size="small">
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download">
                            <IconButton size="small">
                              <Download fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" color="error">
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filteredDocuments.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </Paper>
      ) : (
        <Box sx={{ 
          textAlign: "center", 
          py: 8,
          backgroundColor: 'action.hover',
          borderRadius: 2
        }}>
          <FileUpload sx={{ fontSize: 40, color: 'text.secondary', mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            No documents found.
          </Typography>
        </Box>
      )}

      <Dialog 
        open={uploadDialogOpen} 
        onClose={handleCloseUpload}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle fontWeight="bold">Upload New Document</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Document Type"
                  select
                  fullWidth
                  size="small"
                  value={newDocument.type}
                  onChange={(e) => setNewDocument({...newDocument, type: e.target.value})}
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="">Select document type</option>
                  <option value="Driver's License">Driver's License</option>
                  <option value="Passport">Passport</option>
                  <option value="State ID">State ID</option>
                  <option value="Insurance Card">Insurance Card</option>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Expiry Date"
                  type="date"
                  fullWidth
                  size="small"
                  value={newDocument.expiryDate}
                  onChange={(e) => setNewDocument({...newDocument, expiryDate: e.target.value})}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<FileUpload />}
                  sx={{ width: '100%', textTransform: 'none' }}
                >
                  Choose File
                  <input
                    type="file"
                    hidden
                    onChange={(e) => setNewDocument({
                      ...newDocument,
                      file: e.target.files[0]
                    })}
                  />
                </Button>
                {newDocument.file && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Selected: {newDocument.file.name}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={handleCloseUpload}
            color="inherit"
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCloseUpload}
            sx={{ textTransform: 'none' }}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentManagement;