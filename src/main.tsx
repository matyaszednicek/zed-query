import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { QueryClient } from "./zed-query/QueryClient.ts";
import { QueryClientProvider } from "./zed-query/QueryClientProvider.tsx";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider value={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
