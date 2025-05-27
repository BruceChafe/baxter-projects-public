import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  IconButton,
  TextField,
  InputAdornment
} from '@mui/material';
import { Search, Tag, Edit } from '@mui/icons-material';
import { EmailTemplate } from '../types/types';
import { emailTemplates } from './templates';

const TemplatePreviewDialog = ({ template, open, onClose }) => {
  if (!template) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6">{template.name}</Typography>
            <Typography variant="body2" color="textSecondary">
              Last modified: {template.lastModified}
            </Typography>
          </Box>
          <Chip 
            label={template.category} 
            sx={{ 
              backgroundColor: template.category === 'sales' ? 'lightblue' : 
                template.category === 'service' ? 'lightgreen' : 'plum',
              color: 'white'
            }}
          />
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box mt={2}>
          <Typography variant="subtitle2" color="textSecondary">Subject</Typography>
          <Typography variant="body1">{template.subject}</Typography>
        </Box>
        <Box mt={2}>
          <Typography variant="subtitle2" color="textSecondary">Body</Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>{template.body}</Typography>
        </Box>
        <Box mt={2}>
          <Typography variant="subtitle2" color="textSecondary">Variables</Typography>
          <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
            {template.variables.map((variable) => (
              <Chip key={variable} label={`{{${variable}}}`} variant="outlined" />
            ))}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onClose}>Close</Button>
        <Button variant="contained">Edit Template</Button>
      </DialogActions>
    </Dialog>
  );
};

const TemplateDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredTemplates = emailTemplates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTemplateClick = (template) => {
    setSelectedTemplate(template);
    setIsDialogOpen(true);
  };

  return (
    <Box p={4}>
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold">Email Templates</Typography>
        <TextField
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          margin="normal"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            )
          }}
        />
      </Box>

      <Grid container spacing={3}>
        {filteredTemplates.map((template) => (
          <Grid item xs={12} sm={6} md={4} key={template.id}>
            <Card
              sx={{ cursor: 'pointer', '&:hover': { boxShadow: 3 } }}
              onClick={() => handleTemplateClick(template)}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Typography variant="h6" fontWeight="bold">{template.name}</Typography>
                  <IconButton size="small">
                    <Edit fontSize="small" />
                  </IconButton>
                </Box>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {template.description}
                </Typography>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Chip 
                    label={template.category} 
                    sx={{ 
                      backgroundColor: template.category === 'sales' ? 'lightblue' : 
                        template.category === 'service' ? 'lightgreen' : 'plum',
                      color: 'white'
                    }}
                  />
                  <Box display="flex" alignItems="center" color="textSecondary">
                    <Tag fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="body2">{template.variables.length} variables</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <TemplatePreviewDialog
        template={selectedTemplate}
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </Box>
  );
};

export default TemplateDashboard;
