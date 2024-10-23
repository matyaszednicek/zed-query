import React from "react";

import { QueryClientContext } from "./QueryClientProvider";
import { QueryClient } from "./QueryClient";
import type { QueryData, QueryFn, QueryKey, QueryState } from "./createQuery";

type QueryOptions<TData> = {
  queryKey: QueryKey;
  queryFn: QueryFn<TData>;
  staleTime: number;
};

type QueryObserver<TData extends QueryData> = {
  notify: () => void;
  subscribe: (rerender: () => void) => () => void;
  getQueryState: () => QueryState<TData>;
};

const createQueryObserver = <TData extends QueryData>(
  queryClient: QueryClient,
  { queryKey, queryFn, staleTime }: QueryOptions<TData>,
): QueryObserver<TData> => {
  const query = queryClient.getQuery<TData>({ queryKey, queryFn });

  const observer: QueryObserver<TData> = {
    notify: () => {},
    subscribe: (rerender) => {
      const unsubscribe = query.subscribe(observer);
      observer.notify = rerender;
      if (
        !query.state.lastUpdated ||
        Date.now() - query.state.lastUpdated > staleTime
      ) {
        query.fetch();
      }
      return unsubscribe;
    },
    getQueryState: () => query.state,
  };

  return observer;
};

export const useQuery = <TData extends QueryData>({
  queryKey,
  queryFn,
  staleTime = 0,
}: QueryOptions<TData>): QueryState<TData> => {
  const queryClient = React.useContext(QueryClientContext);
  if (!queryClient) {
    throw new Error("useQuery must be used within a QueryClientProvider");
  }
  const observer = React.useRef(
    createQueryObserver<TData>(queryClient, { queryKey, queryFn, staleTime }),
  );

  const [, setCount] = React.useState(0);
  const rerender = () => setCount((count) => count + 1);

  React.useEffect(() => {
    const unsubscribe = observer.current.subscribe(rerender);
    return () => {
      unsubscribe();
    };
  }, []);

  return observer.current.getQueryState();
};
