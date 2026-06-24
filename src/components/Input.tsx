import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = "",
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-dark-primary mb-2">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-2 bg-brand-card border border-brand-border rounded-lg text-dark-primary placeholder-dark-tertiary focus:border-brand-accent focus:outline-none transition-all ${
          error ? "border-red-500" : ""
        } ${className}`}
        {...props}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      {helperText && !error && (
        <p className="text-dark-tertiary text-sm mt-1">{helperText}</p>
      )}
    </div>
  );
};

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  error,
  helperText,
  className = "",
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-dark-primary mb-2">
          {label}
        </label>
      )}
      <textarea
        className={`w-full px-4 py-2 bg-brand-card border border-brand-border rounded-lg text-dark-primary placeholder-dark-tertiary focus:border-brand-accent focus:outline-none transition-all resize-none ${
          error ? "border-red-500" : ""
        } ${className}`}
        {...props}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      {helperText && !error && (
        <p className="text-dark-tertiary text-sm mt-1">{helperText}</p>
      )}
    </div>
  );
};
