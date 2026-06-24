import React from "react";

export const Loading: React.FC = () => {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-brand-border" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand-accent animate-spin" />
      </div>
    </div>
  );
};

export const PageLoading: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center">
      <div className="text-center">
        <Loading />
        <p className="mt-4 text-dark-secondary">Loading...</p>
      </div>
    </div>
  );
};

interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = "w-full",
  height = "h-4",
  className = "",
}) => {
  return (
    <div
      className={`${width} ${height} bg-brand-border rounded animate-pulse ${className}`}
    />
  );
};
