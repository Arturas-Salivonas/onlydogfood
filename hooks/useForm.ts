import { useState, useCallback, useEffect } from 'react';

export interface FormField<T = any> {
  value: T;
  error?: string;
  touched?: boolean;
}

export interface FormState<T extends Record<string, any>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
}

export interface FormActions<T extends Record<string, any>> {
  setValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setError: <K extends keyof T>(field: K, error: string) => void;
  setTouched: <K extends keyof T>(field: K, touched?: boolean) => void;
  setValues: (values: Partial<T>) => void;
  reset: (initialValues?: T) => void;
  validate: () => boolean;
  handleSubmit: (onSubmit: (values: T) => void | Promise<void>) => (e: React.FormEvent) => Promise<void>;
}

export type UseFormReturn<T extends Record<string, any>> = FormState<T> & FormActions<T>;

export function useForm<T extends Record<string, any>>(
  initialValues: T,
  validate?: (values: T) => Partial<Record<keyof T, string>>
): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValues(prev => ({ ...prev, [field]: value }));

    // Clear error when field changes
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  const setError = useCallback(<K extends keyof T>(field: K, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const setTouchedField = useCallback(<K extends keyof T>(field: K, touchedValue: boolean = true) => {
    setTouched(prev => ({ ...prev, [field]: touchedValue }));
  }, []);

  const setValuesBulk = useCallback((newValues: Partial<T>) => {
    setValues(prev => ({ ...prev, ...newValues }));
  }, []);

  const reset = useCallback((resetValues?: T) => {
    setValues(resetValues || initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const validateForm = useCallback(() => {
    if (!validate) return true;

    const validationErrors = validate(values);
    setErrors(validationErrors);

    return Object.keys(validationErrors).length === 0;
  }, [values, validate]);

  const handleSubmit = useCallback(
    (onSubmit: (values: T) => void | Promise<void>) =>
      async (e: React.FormEvent) => {
        e.preventDefault();

        // Mark all fields as touched
        const allTouched = Object.keys(values).reduce(
          (acc, key) => ({ ...acc, [key]: true }),
          {} as Partial<Record<keyof T, boolean>>
        );
        setTouched(allTouched);

        // Validate form
        const isValid = validateForm();
        if (!isValid) return;

        setIsSubmitting(true);

        try {
          await onSubmit(values);
        } finally {
          setIsSubmitting(false);
        }
      },
    [values, validateForm]
  );

  // Auto-validate when values change
  useEffect(() => {
    if (validate) {
      const validationErrors = validate(values);
      setErrors(validationErrors);
    }
  }, [values, validate]);

  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    setValue,
    setError,
    setTouched: setTouchedField,
    setValues: setValuesBulk,
    reset,
    validate: validateForm,
    handleSubmit,
  };
}

// Validation helpers
export const validators = {
  required: (message: string = 'This field is required') => (value: any) =>
    !value || (typeof value === 'string' && value.trim() === '') ? message : undefined,

  minLength: (min: number, message?: string) => (value: string) =>
    value && value.length < min ? (message || `Must be at least ${min} characters`) : undefined,

  maxLength: (max: number, message?: string) => (value: string) =>
    value && value.length > max ? (message || `Must be no more than ${max} characters`) : undefined,

  email: (message: string = 'Invalid email address') => (value: string) =>
    value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? message : undefined,

  pattern: (regex: RegExp, message: string) => (value: string) =>
    value && !regex.test(value) ? message : undefined,

  min: (min: number, message?: string) => (value: number) =>
    value !== undefined && value < min ? (message || `Must be at least ${min}`) : undefined,

  max: (max: number, message?: string) => (value: number) =>
    value !== undefined && value > max ? (message || `Must be no more than ${max}`) : undefined,
};