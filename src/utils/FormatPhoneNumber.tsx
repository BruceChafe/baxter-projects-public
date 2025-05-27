import React from 'react';
import { TextField, Tooltip, Stack, InputAdornment } from '@mui/material';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import HomeIcon from '@mui/icons-material/Home';
import WorkIcon from '@mui/icons-material/Work';

interface FormatPhoneNumberProps {
  type: 'mobile' | 'home' | 'work';
  number: string;
  label?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
}

const formatPhoneNumberString = (phoneNumber: string): string | null => {
  const cleaned = phoneNumber.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  return match ? `(${match[1]}) ${match[2]}-${match[3]}` : phoneNumber; // Keep raw input if invalid
};

const PHONE_TYPE_INFO: Record<
  FormatPhoneNumberProps['type'],
  { icon: JSX.Element; tooltip: string }
> = {
  mobile: { icon: <SmartphoneIcon fontSize="small" />, tooltip: 'Mobile Phone' },
  home: { icon: <HomeIcon fontSize="small" />, tooltip: 'Home Phone' },
  work: { icon: <WorkIcon fontSize="small" />, tooltip: 'Work Phone' },
};

const FormatPhoneNumber: React.FC<FormatPhoneNumberProps> = ({
  type,
  number,
  label,
  onChange,
  disabled = false,
  error = false,
  helperText = '',
}) => {
  const { icon, tooltip } = PHONE_TYPE_INFO[type];

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (onChange) onChange(value);
  };

  return (
    <Tooltip title={tooltip} aria-label={tooltip}>
      <TextField
        label={label || tooltip}
        value={formatPhoneNumberString(number) || ''}
        onChange={handleChange}
        disabled={disabled}
        error={error}
        helperText={helperText}
        size="small"
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">{icon}</InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 1,
            '&.Mui-disabled': {
              bgcolor: 'action.hover',
            },
          },
        }}
      />
    </Tooltip>
  );
};

export default FormatPhoneNumber;
