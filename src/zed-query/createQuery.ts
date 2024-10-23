export type QueryState<TData extends QueryData> = {
  status: "pending" | "success" | "error";
  isFetching: boolean;
  data: TData | undefined;
  error: Error | undefined;
  lastUpdated: number | undefined;
};

export type QueryData = Record<string, unknown> | string | number;

export type Query<TData extends QueryData> = {
  queryKey: string | number | (string | number)[];
  queryHash: string;
  subscribers: Array<{ notify: () => void }>;
  subscribe: (subscriber: { notify: () => void }) => () => void;
  state: QueryState<TData>;
  setState: (updater: (state: QueryState<TData>) => QueryState<TData>) => void;
  fetchingFunction: (() => void) | null;
  fetch: () => Promise<void>;
};

export type QueryKey = string | number | (string | number)[];
export type QueryFn<TData> = () => Promise<TData>;

export type QueryOptions<TData> = {
  queryKey: QueryKey;
  queryFn: QueryFn<TData>;
};

export const createQuery = <TData extends QueryData>({
  queryKey,
  queryFn,
}: QueryOptions<TData>) => {
  const query: Query<TData> = {
    queryKey,
    queryHash: JSON.stringify(queryKey),
    subscribers: [],
    subscribe: (subscriber) => {
      query.subscribers.push(subscriber);
      return () => {
        query.subscribers = query.subscribers.filter((cb) => cb !== subscriber);
      };
    },
    state: {
      status: "pending",
      isFetching: true,
      data: undefined,
      error: undefined,
      lastUpdated: undefined,
    },
    setState: (updater) => {
      query.state = updater(query.state);
      for (const subscriber of query.subscribers) {
        subscriber.notify();
      }
    },
    fetchingFunction: null,
    fetch: async () => {
      if (!query.fetchingFunction) {
        query.fetchingFunction = async () => {
          query.setState((state) => ({
            ...state,
            isFetching: true,
            error: undefined,
          }));
          try {
            const data = await queryFn();
            query.setState((state) => ({
              ...state,
              status: "success",
              lastUpdated: Date.now(),
              data,
            }));
          } catch (error) {
            query.setState((state) => ({
              ...state,
              status: "error",
              error: error instanceof Error ? error : new Error(String(error)),
            }));
          } finally {
            query.setState((state) => ({
              ...state,
              isFetching: false,
            }));
          }
        };
      }
      query.fetchingFunction();
    },
  };
  return query;
};
