import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';

export type FormTextFieldProps = TextFieldProps & {
  errorText?: string;
};

export const FormTextField: React.FC<FormTextFieldProps> = ({ errorText, ...props }) => {
  return (
    <TextField
      {...props}
      error={!!errorText || props.error}
      helperText={errorText || props.helperText}
      sx={{
        mb: 2,
        ...props.sx,
      }}
    />
  );
};
