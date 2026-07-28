import React, { useState } from 'react';
import { IconButton, InputAdornment } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { FormTextField } from './FormTextField';
import type { FormTextFieldProps } from './FormTextField';

export const PasswordField: React.FC<FormTextFieldProps> = (props) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  return (
    <FormTextField
      {...props}
      type={showPassword ? 'text' : 'password'}
      slotProps={{
        input: {
          ...(props.slotProps?.input ?? {}),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleClickShowPassword}
                edge="end"
                size="small"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
};
