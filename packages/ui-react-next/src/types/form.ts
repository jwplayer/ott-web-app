import type React from 'react';

export type FormControlProps = {
  name: string;
  label?: React.ReactNode;
  placeholder?: string;
  className?: string;
  required?: boolean;
  error?: boolean;
  editing?: boolean;
  testId?: string;
  value?: string;
  lang?: string;
  size?: 'small' | 'medium';
};
