"use client";

import { useEffect, useRef, memo } from "react";
import { Modal } from "@/core/ui";
import type { NormalizedMovie } from "@/core/lib";

/**
 * Props for MovieDetailsModal component
 */
export interface MovieDetailsModalProps {
  /** Movie to display, or null to close modal */
  movie: NormalizedMovie | null;
  /** Callback when modal should be closed */
  onClose: () => void;
}

/**
 * Accessible modal for displaying movie details
 * Features:
 * - role="dialog" with proper ARIA attributes
 * - Escape key support
 * - Basic focus trap
 * - Displays all movie metadata fields
 */
function MovieDetailsModalComponent({
  movie,
  onClose,
}: MovieDetailsModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Handle Escape key
  useEffect(() => {
    if (!movie) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [movie, onClose]);

  // Focus trap
  useEffect(() => {
    if (!movie || !dialogRef.current) return;

    const dialog = dialogRef.current;
    const focusableElements = dialog.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element (close button)
    closeButtonRef.current?.focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    dialog.addEventListener("keydown", handleTab);
    return () => dialog.removeEventListener("keydown", handleTab);
  }, [movie]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (movie) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [movie]);

  if (!movie) return null;

  return (
    <Modal
      isOpen={!!movie}
      onClose={onClose}
      title={movie.title}
      ariaLabel={`Details for ${movie.title}`}
      ariaLabelledBy="movie-title"
      ariaDescribedBy="movie-description"
    >
      <div id="movie-description" className="space-y-4">
        <div>
          <dt className="text-sm font-medium text-gray-500">Year</dt>
          <dd className="mt-1 text-base text-gray-900">{movie.year ?? "N/A"}</dd>
        </div>

        <div>
          <dt className="text-sm font-medium text-gray-500">Rated</dt>
          <dd className="mt-1 text-base text-gray-900">{movie.rated || "N/A"}</dd>
        </div>

        <div>
          <dt className="text-sm font-medium text-gray-500">Released</dt>
          <dd className="mt-1 text-base text-gray-900">{movie.released || "N/A"}</dd>
        </div>

        <div>
          <dt className="text-sm font-medium text-gray-500">Runtime</dt>
          <dd className="mt-1 text-base text-gray-900">{movie.runtime ? `${movie.runtime} minutes` : "N/A"}</dd>
        </div>

        <div>
          <dt className="text-sm font-medium text-gray-500">Genre</dt>
          <dd className="mt-1 text-base text-gray-900">{movie.genres.length > 0 ? movie.genres.join(", ") : "N/A"}</dd>
        </div>

        <div>
          <dt className="text-sm font-medium text-gray-500">Director</dt>
          <dd className="mt-1 text-base text-gray-900">{movie.directors.length > 0 ? movie.directors.join(", ") : "N/A"}</dd>
        </div>

        <div>
          <dt className="text-sm font-medium text-gray-500">Writer</dt>
          <dd className="mt-1 text-base text-gray-900">{movie.writers.length > 0 ? movie.writers.join(", ") : "N/A"}</dd>
        </div>

        <div>
          <dt className="text-sm font-medium text-gray-500">Actors</dt>
          <dd className="mt-1 text-base text-gray-900">{movie.actors.length > 0 ? movie.actors.join(", ") : "N/A"}</dd>
        </div>
      </div>
    </Modal>
  );
}

export const MovieDetailsModal = memo(MovieDetailsModalComponent);
