import React from 'react';
import { Typography, Stack } from '@mui/material';

interface FormatAddressProps {
  street_address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
}

const FormatAddress: React.FC<FormatAddressProps> = ({ street_address, city, province, postal_code }) => {
  return (
    <Stack spacing={0.5}>
      {street_address && (
        <Typography variant="body2" component="div">
          {street_address}
        </Typography>
      )}
      <Typography variant="body2" component="div">
        {[city, province].filter(Boolean).join(', ')} {postal_code}
      </Typography>
    </Stack>
  );
};

export default FormatAddress;