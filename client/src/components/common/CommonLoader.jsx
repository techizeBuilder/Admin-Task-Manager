import React from "react";

const sizeMap = {
  sm: "w-4 h-4",
  md: "w-8 h-8",
  lg: "w-12 h-12",
};

export default function CommonLoader({
  variant = "spinner", // spinner | dots | pulse
  size = "md",
  color = "text-indigo-600",
  label = "",
  className = "",
}) {
  const sizeClass = sizeMap[size] || sizeMap.md;

  return (
    <div
      role="status"
      aria-label={label || "Loading"}
      className={`inline-flex items-center gap-2 ${className}`}
    >
      {/* Spinner */}
      {variant === "spinner" && (
        <div
          className={`border-4 border-current border-t-transparent rounded-full ${sizeClass} ${color} animate-spin`}
        ></div>
      )}

      {/* Dots */}
      {variant === "dots" && (
        <div className="flex space-x-1" aria-hidden="true">
          <div className={`w-2 h-2 rounded-full ${color} animate-bounce`}></div>
          <div
            className={`w-2 h-2 rounded-full ${color} animate-bounce [animation-delay:-.15s]`}
          ></div>
          <div
            className={`w-2 h-2 rounded-full ${color} animate-bounce [animation-delay:-.3s]`}
          ></div>
        </div>
      )}

      {/* Pulse */}
      {variant === "pulse" && (
        <div
          className={`rounded-full ${sizeClass} ${color} opacity-70 animate-pulse`}
        ></div>
      )}

      {label && (
        <span className="text-sm text-gray-600 dark:text-gray-300">{label}</span>
      )}
    </div>
  );
}
