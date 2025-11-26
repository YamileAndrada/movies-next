import { render, RenderOptions } from "@testing-library/react";
import { ReactElement } from "react";

/**
 * Custom render function that wraps components with common providers
 * Add any global providers here (e.g., ThemeProvider, QueryClientProvider, etc.)
 */
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  // Add wrapper providers here when needed
  // const Wrapper = ({ children }: { children: React.ReactNode }) => {
  //   return <Provider>{children}</Provider>;
  // };

  return render(ui, options);
}

// Re-export everything from React Testing Library
export * from "@testing-library/react";

// Override render method
export { customRender as render };
