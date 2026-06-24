import React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md";
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = "primary",
  size = "md",
  children,
  className = "",
  ...props
}) => {
  const baseClasses = "inline-flex items-center font-medium rounded-full";

  const variantClasses = {
    primary: "bg-blue-900 text-blue-200",
    success: "bg-green-900 text-green-200",
    warning: "bg-yellow-900 text-yellow-200",
    danger: "bg-red-900 text-red-200",
    info: "bg-cyan-900 text-cyan-200",
  };

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
  };

  return (
    <span
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

interface PriorityBadgeProps {
  priority: "low" | "medium" | "high" | "critical";
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const priorityConfig = {
    low: { variant: "info" as const, label: "Low" },
    medium: { variant: "warning" as const, label: "Medium" },
    high: { variant: "danger" as const, label: "High" },
    critical: { variant: "danger" as const, label: "Critical" },
  };

  const config = priorityConfig[priority];

  return <Badge variant={config.variant}>{config.label}</Badge>;
};
