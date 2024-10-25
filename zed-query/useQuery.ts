import React from "react";

import { QueryClientContext } from "./QueryClientProvider";
import type { QueryData, QueryFn, QueryKey, QueryState } from "./Query";
import { QueryObserver } from "./QueryObserver";

type QueryOptions<TData> = {
  queryKey: QueryKey;
  queryFn: QueryFn<TData>;
  staleTime: number;
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
    new QueryObserver<TData>(queryClient, { queryKey, queryFn, staleTime }),
  );

  const [, setTick] = React.useState(0);
  const forceRerender = () => setTick((tick) => tick + 1);

  React.useEffect(() => {
    const unsubscribe = observer.current.subscribe(forceRerender);
    return () => {
      unsubscribe();
    };
  }, []);

  return observer.current.getQueryState();
};
