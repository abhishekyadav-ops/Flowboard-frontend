import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  loading = false,
  children,
  disabled,
  ...props
}) => {
  const baseClasses =
    "font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2";

  const variantClasses = {
    primary:
      "bg-brand-accent hover:bg-brand-hover text-white disabled:opacity-50 disabled:cursor-not-allowed",
    secondary:
      "bg-brand-card hover:bg-brand-border text-dark-primary border border-brand-border",
    danger: "bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed",
    ghost: "hover:bg-brand-card text-dark-primary",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
};
