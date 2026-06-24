import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
  glassomorphism?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverable = false,
  glassomorphism = false,
  className = "",
  ...props
}) => {
  const baseClasses = "bg-brand-card rounded-lg border border-brand-border p-4";

  const hoverableClass = hoverable ? "hover:bg-brand-border transition-all cursor-pointer" : "";

  const glassomorphismClass = glassomorphism
    ? "bg-opacity-10 backdrop-blur-md border-opacity-20"
    : "";

  return (
    <div
      className={`${baseClasses} ${hoverableClass} ${glassomorphismClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
