import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Autocomplete,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  Select, SelectChangeEvent,
  MenuItem,
  IconButton,
  alpha,
} from '@mui/material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteIcon from '@mui/icons-material/Delete';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { useTheme } from '@mui/material/styles';
import { Close } from '@mui/icons-material';

// Example email templates - these would come from your api in production
const EMAIL_TEMPLATES = [
  {
    id: 1,
    name: 'Welcome Email',
    subject: 'Welcome to Our Service',
    message: 'Dear {{customerName}},<br><br>Welcome to our service! Were excited to have you on board...',
  },
  {
    id: 2,
    name: 'Follow-up Meeting',
    subject: 'Follow-up: {{meetingTopic}}',
    message: 'Hi {{customerName}},<br><br>Thank you for your time during our meeting about {{meetingTopic}}...',
  },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit per file
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

interface EmailDialogProps {
  open: boolean;
  onClose: () => void;
  recipientEmail: string;
  contacts: { email: string }[];
}

const EmailDialog: React.FC<EmailDialogProps> = ({ open, onClose, recipientEmail, contacts }) => {
  const [emailData, setEmailData] = useState({
    to: [],
    cc: [],
    bcc: [],
    subject: '',
    message: '',
    templateId: '',
  });
  const [attachments, setAttachments] = useState<File[]>([]);
  const [templateVariables, setTemplateVariables] = useState<{ [key: string]: string }>({});
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState<{ [key: number]: number }>({});

  // Quill editor configuration
  const quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link'],
      ['clean']
    ],
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = event.target.files ? Array.from(event.target.files) : [];
    const validFiles = newFiles.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        setError(`${file.name} is too large. Maximum size is 5MB`);
        return false;
      }
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        setError(`${file.name} has an unsupported file type`);
        return false;
      }
      return true;
    });

    setAttachments(prev => [...prev, ...validFiles]);
    // Reset file input
    event.target.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[index];
      return newProgress;
    });
  };

  const extractTemplateVariables = (template: { id: number; name: string; subject: string; message: string }) => {
    const variables: { [key: string]: string } = {};
    const regex = /{{(\w+)}}/g;
    let match;

    while ((match = regex.exec(template.message)) !== null) {
      variables[match[1]] = '';
    }
    while ((match = regex.exec(template.subject)) !== null) {
      variables[match[1]] = '';
    }

    return variables;
  };

  const applyTemplateVariables = (text: string) => {
    let result = text;
    Object.entries(templateVariables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), String(value) || `{{${key}}}`);
    });
    return result;
  };

  const handleTemplateChange = (event: SelectChangeEvent<string>) => {
    const templateId = event.target.value;
    if (templateId) {
      const selectedTemplate = EMAIL_TEMPLATES.find(t => t.id === Number(templateId));
      const variables = selectedTemplate ? extractTemplateVariables(selectedTemplate) : {};

      setEmailData(prev => ({
        ...prev,
        templateId: templateId as string,
        subject: selectedTemplate?.subject || '',
        message: selectedTemplate?.message || '',
      }));
      setTemplateVariables(variables);
    } else {
      setEmailData(prev => ({
        ...prev,
        templateId: '',
        subject: '',
        message: '',
      }));
      setTemplateVariables({});
    }
  };

  const handleVariableChange = (variable: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setTemplateVariables(prev => ({
      ...prev,
      [variable]: event.target.value
    }));
  };

  const simulateFileUpload = async (file: File, index: number) => {
    for (let progress = 0; progress <= 100; progress += 10) {
      setUploadProgress(prev => ({
        ...prev,
        [index]: progress
      }));
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    setError('');

    try {
      // Simulate file uploads
      await Promise.all(attachments.map((file, index) => simulateFileUpload(file, index)));

      const finalEmailData = {
        ...emailData,
        subject: applyTemplateVariables(emailData.subject),
        message: applyTemplateVariables(emailData.message),
        attachments: attachments.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type
        }))
      };

      // Here you would implement your email sending logic with finalEmailData
      await new Promise(resolve => setTimeout(resolve, 1000));

      onClose();
      // Reset form
      setEmailData({
        to: [],
        cc: [],
        bcc: [],
        subject: '',
        message: '',
        templateId: '',
      });
      setTemplateVariables({});
      setAttachments([]);
      setUploadProgress({});
    } catch (err) {
      setError('Failed to send email. Please try again.');
    } finally {
      setSending(false);
    }
  };
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      // fullScreen={isMobile}
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
      <form onSubmit={handleSubmit}>
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
              Compose Email
            </DialogTitle>
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: 'text.secondary',
              '&:hover': {
                color: 'text.primary',
                bgcolor: alpha(theme.palette.text.primary, 0.04)
              }
            }}
          >
            <Close />
          </IconButton>
        </Box>

        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Email Template</InputLabel>
              <Select
                value={emailData.templateId}
                onChange={handleTemplateChange}
                label="Email Template"
                size='small'

              >
                <MenuItem value="">
                  <em>None (Custom Email)</em>
                </MenuItem>
                {EMAIL_TEMPLATES.map(template => (
                  <MenuItem key={template.id} value={template.id}>
                    {template.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="To"
              size='small'
              value={recipientEmail}
              required
              variant="outlined"
            />

            <TextField
              label="CC"
              size='small'
              variant="outlined"
            />
            <TextField
              label="BCC"
              size='small'

              variant="outlined"
            />


            {/* {Object.keys(templateVariables).length > 0 && (
              <Box sx={{ border: 1, borderColor: 'divider', p: 2, borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Template Variables
                </Typography>
                {Object.keys(templateVariables).map(variable => (
                  <TextField
                  size='small'

                    key={variable}
                    label={variable}
                    value={templateVariables[variable]}
                    onChange={handleVariableChange(variable)}
                    variant="outlined"
                    fullWidth
                    sx={{ mb: 2 }}
                  />
                ))}
              </Box>
            )} */}

            <TextField
              label="Subject"
              size='small'

              required
              value={emailData.subject}
              onChange={(e) => setEmailData(prev => ({
                ...prev,
                subject: e.target.value
              }))}
              variant="outlined"
            />

            <Box sx={{ mb: 3 }}>
              <ReactQuill
                value={emailData.message}
                onChange={(content) => setEmailData(prev => ({
                  ...prev,
                  message: content
                }))}
                modules={quillModules}
                style={{ height: '200px' }}
              />
            </Box>

            <Box sx={{ mt: 2 }}>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="file-input"
                accept={ALLOWED_FILE_TYPES.join(',')}
              />
              <label htmlFor="file-input">
                <Button
                  component="span"
                  variant="outlined"
                  startIcon={<AttachFileIcon />}
                >
                  Attach Files
                </Button>
              </label>

              {/* Attachments List */}
              <Box sx={{ mt: 2 }}>
                {attachments.map((file, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: 1,
                      p: 1,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1
                    }}
                  >
                    <FileUploadIcon sx={{ mr: 1 }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2">{file.name}</Typography>
                      {uploadProgress[index] !== undefined && (
                        <Box
                          sx={{
                            width: '100%',
                            height: 4,
                            bgcolor: 'grey.200',
                            borderRadius: 2,
                            mt: 0.5
                          }}
                        >
                          <Box
                            sx={{
                              width: `${uploadProgress[index]}%`,
                              height: '100%',
                              bgcolor: 'primary.main',
                              borderRadius: 2,
                              transition: 'width 0.3s'
                            }}
                          />
                        </Box>
                      )}
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => removeAttachment(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Box>

            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}
          </Box>
        </DialogContent>

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
                      <Button onClick={onClose} variant="outlined" color="secondary">
            Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={sending || emailData.to.length === 0 || !emailData.subject || !emailData.message}
            >
              {sending ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Sending...
                </>
              ) : (
                'Send'
              )}
            </Button>
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EmailDialog;