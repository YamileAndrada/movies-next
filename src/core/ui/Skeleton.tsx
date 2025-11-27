"use client";

import React from "react";

export function SkeletonText({ className = "", lines = 1 }: { className?: string; lines?: number }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 bg-gray-200 rounded animate-pulse w-full" />
      ))}
    </div>
  );
}

export function SkeletonBox({ className = "", height = 8 }: { className?: string; height?: number }) {
  return <div className={`bg-gray-200 rounded animate-pulse w-full ${className}`} style={{ height: `${height}rem` }} />;
}

export default SkeletonText;
