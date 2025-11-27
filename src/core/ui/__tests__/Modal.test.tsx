import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Modal } from "@/core/ui";

describe("Modal", () => {
  it("renders when open and traps focus / responds to Escape", () => {
    const onClose = vi.fn();
    const { unmount } = render(
      <Modal isOpen={true} onClose={onClose} title="Dialog title">
        <button>Inside</button>
      </Modal>
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText(/dialog title/i)).toBeInTheDocument();

    // body scroll lock applied
    expect(document.body.style.overflow).toBe("hidden");

    // Escape should call onClose
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();

    unmount();
    expect(document.body.style.overflow).toBe("");
  });
});
