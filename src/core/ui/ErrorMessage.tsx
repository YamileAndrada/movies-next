"use client";

import React from "react";

export function ErrorMessage({ message }: { message: string }) {
  return (
    <div role="alert" className="text-sm text-red-700 bg-red-50 border border-red-100 p-3 rounded">
      {message}
    </div>
  );
}

export default ErrorMessage;
