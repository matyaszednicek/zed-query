import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import App from "./App.tsx";
import { QueryClient, QueryClientProvider } from "zed-query";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider value={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
