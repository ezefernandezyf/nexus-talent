import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LandingPage } from "@/features/landing/pages/LandingPage";
import PrivacyPage from "@/features/landing/pages/PrivacyPage";

/**
 * Renders a page to an HTML string for SSR.
 * Called by both the dev middleware and the build-time prerender script.
 */
export function render(url: string): string {
  const Page = url === "/privacy" ? PrivacyPage : LandingPage;
  const queryClient = new QueryClient();

  return renderToString(
    <QueryClientProvider client={queryClient}>
      <StaticRouter location={url}>
        <Page />
      </StaticRouter>
    </QueryClientProvider>,
  );
}
