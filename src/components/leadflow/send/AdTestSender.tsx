// React Component - AdfTestSender.tsx

import React, { useState } from 'react'
import {
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material'
import { supabase } from '../../../../supabase/supabaseClient' // adjust path as needed

export function AdfTestSender() {
  const [source, setSource] = useState('Kijiji')
  const [dealership, setDealership] = useState('Baxter Motors')
  const [city, setCity] = useState("St. John's")
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const sendAdf = async () => {
    setStatus('loading')
    const session = await supabase.auth.getSession()
    const token = session.data?.session?.access_token
  
    const res = await fetch(`${supabase.functions.url}/send-adf-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ source, dealership, city }),
    })
  
    setStatus(res.ok ? 'success' : 'error')
  }

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 400 }}>
      <Typography variant="h6" gutterBottom>
        Send Test ADF Lead
      </Typography>

      <TextField
        select
        fullWidth
        label="Lead Source"
        value={source}
        onChange={(e) => setSource(e.target.value)}
        sx={{ mb: 2 }}
      >
        {['Kijiji', 'CarGurus', 'AutoTrader', 'Facebook'].map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        fullWidth
        label="Dealership"
        value={dealership}
        onChange={(e) => setDealership(e.target.value)}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        label="City"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        sx={{ mb: 2 }}
      />

      <Box display="flex" justifyContent="flex-end" alignItems="center" gap={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={sendAdf}
          disabled={status === 'loading'}
        >
          {status === 'loading' ? <CircularProgress size={24} /> : 'Send Test Lead'}
        </Button>
      </Box>

      {status === 'success' && (
        <Alert severity="success" sx={{ mt: 2 }}>
          Lead sent successfully!
        </Alert>
      )}
      {status === 'error' && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Failed to send lead.
        </Alert>
      )}
    </Paper>
  )
}
