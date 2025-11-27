"use client";

import React, { useEffect, useRef } from "react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
}

export function Modal({ isOpen, onClose, title, children, ariaLabel, ariaLabelledBy, ariaDescribedBy }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previouslyFocused.current = document.activeElement as HTMLElement | null;
      document.body.style.overflow = "hidden";
      // focus the close button if present, otherwise focus the dialog
      setTimeout(() => {
        const closeBtn = dialogRef.current?.querySelector('button[aria-label="Close modal"]') as HTMLElement | null;
        if (closeBtn) {
          closeBtn.focus();
        } else {
          dialogRef.current?.focus();
        }
      }, 0);
    } else {
      document.body.style.overflow = "";
      previouslyFocused.current?.focus();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    if (isOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation" onClick={onClose}>
      <div className="fixed inset-0 bg-gray-500 bg-opacity-50" aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-label={ariaLabel ?? title}
        aria-modal="true"
        {...(ariaLabelledBy ? { "aria-labelledby": ariaLabelledBy } : {})}
        {...(ariaDescribedBy ? { "aria-describedby": ariaDescribedBy } : {})}
        tabIndex={-1}
        className="relative bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] z-10 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-6 pb-4 border-b border-gray-200 flex-shrink-0">
          {title && (
            <h2 className="text-lg font-medium pr-8" {...(ariaLabelledBy ? { id: ariaLabelledBy } : {})}>
              {title}
            </h2>
          )}
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="flex-shrink-0 text-gray-600 hover:text-gray-800 text-2xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="overflow-y-auto p-6 flex-1">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
