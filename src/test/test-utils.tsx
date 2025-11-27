import { render, RenderOptions, renderHook as rtlRenderHook, RenderHookOptions } from "@testing-library/react";
import { ReactElement } from "react";
import { SWRConfig } from "swr";

/**
 * SWR wrapper for tests - disables cache and deduping
 */
export function SWRTestProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      {children}
    </SWRConfig>
  );
}

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

/**
 * Custom renderHook that wraps hooks with SWR provider
 */
function customRenderHook<Result, Props>(
  hook: (props: Props) => Result,
  options?: RenderHookOptions<Props>
) {
  return rtlRenderHook(hook, {
    wrapper: SWRTestProvider,
    ...options,
  });
}

// Re-export everything from React Testing Library
export * from "@testing-library/react";

// Override render and renderHook methods
export { customRender as render, customRenderHook as renderHook };
