export type QueryState<TData extends QueryData> = {
  status: "pending" | "success" | "error";
  isFetching: boolean;
  data: TData | undefined;
  error: Error | undefined;
  lastUpdated: number | undefined;
};

export type QueryData = Record<string, unknown> | string | number;

export type QueryKey = string | number | (string | number)[];
export type QueryFn<TData> = () => Promise<TData>;

export type QueryOptions<TData> = {
  queryKey: QueryKey;
  queryFn: QueryFn<TData>;
};

export type Subscriber = {
  notify: () => void;
};
type FetchingFn = () => void;

export class Query<TData extends QueryData> {
  queryKey: QueryKey;
  queryHash: string;
  subscribers: Subscriber[];
  state: QueryState<TData>;
  fetchingFunction: FetchingFn | null;

  private queryFn: QueryFn<TData>;

  constructor({ queryKey, queryFn }: QueryOptions<TData>) {
    this.queryKey = queryKey;
    this.queryFn = queryFn;
    this.queryHash = JSON.stringify(queryKey);
    this.subscribers = [];
    this.state = {
      status: "pending",
      isFetching: true,
      data: undefined,
      error: undefined,
      lastUpdated: undefined,
    };
    this.fetchingFunction = null;
  }

  subscribe(subscriber: Subscriber) {
    this.subscribers.push(subscriber);
    return () => {
      this.subscribers = this.subscribers.filter((cb) => cb !== subscriber);
    };
  }

  setState(updater: (state: QueryState<TData>) => QueryState<TData>) {
    this.state = updater(this.state);
    for (const subscriber of this.subscribers) {
      subscriber.notify();
    }
  }

  async fetch() {
    if (!this.fetchingFunction) {
      this.fetchingFunction = async () => {
        this.setState((state) => ({
          ...state,
          isFetching: true,
          error: undefined,
        }));
        try {
          const data = await this.queryFn();
          this.setState((state) => ({
            ...state,
            status: "success",
            lastUpdated: Date.now(),
            data,
          }));
        } catch (error) {
          this.setState((state) => ({
            ...state,
            status: "error",
            error: error instanceof Error ? error : new Error(String(error)),
          }));
        } finally {
          this.setState((state) => ({
            ...state,
            isFetching: false,
          }));
        }
      };
    }
    this.fetchingFunction();
  }
}
