import React from "react";

interface LoadingSkeletonProps {
  variant?: "hero" | "list-item";
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ variant = "list-item" }) => {
  if (variant === "hero") {
    return (
      <div className="animate-pulse space-y-4 p-6">
        <div className="h-8 w-40 bg-surface-container rounded" />
        <div className="h-12 w-full bg-surface-container rounded" />
        <div className="h-6 w-3/4 bg-surface-container rounded" />
        <div className="flex gap-3 mt-4">
          <div className="h-10 w-32 bg-surface-container rounded" />
          <div className="h-10 w-24 bg-surface-container rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-pulse p-4 space-y-3">
      <div className="h-4 w-1/3 bg-surface-container rounded" />
      <div className="h-4 w-1/2 bg-surface-container rounded" />
      <div className="h-3 w-full bg-surface-container rounded" />
    </div>
  );
};

export default LoadingSkeleton;
