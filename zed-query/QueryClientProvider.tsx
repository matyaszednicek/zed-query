import React from "react";

import { QueryClient } from "./QueryClient";

export const QueryClientContext = React.createContext<QueryClient | null>(null);

export const QueryClientProvider = ({
  value,
  children,
}: React.ProviderProps<QueryClient>) => (
  <QueryClientContext.Provider value={value}>
    {children}
  </QueryClientContext.Provider>
);
