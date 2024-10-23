import type { Query, QueryData, QueryFn, QueryKey, QueryState } from "./Query";
import { QueryClient } from "./QueryClient";

type QueryOptions<TData> = {
  queryKey: QueryKey;
  queryFn: QueryFn<TData>;
  staleTime: number;
};

type RerenderFn = () => void;
type UnsubscribeFn = () => void;

export class QueryObserver<TData extends QueryData> {
  private queryClient: QueryClient;
  private queryKey: QueryKey;
  private queryFn: QueryFn<TData>;
  private staleTime: number;
  private query: Query<TData>;
  private notifyCallback: RerenderFn = () => {};

  constructor(queryClient: QueryClient, options: QueryOptions<TData>) {
    this.queryClient = queryClient;
    this.queryKey = options.queryKey;
    this.queryFn = options.queryFn;
    this.staleTime = options.staleTime;
    this.query = this.queryClient.getQuery<TData>({
      queryKey: this.queryKey,
      queryFn: this.queryFn,
    });
  }

  notify() {
    this.notifyCallback();
  }

  subscribe(rerender: RerenderFn): UnsubscribeFn {
    const unsubscribe = this.query.subscribe(this);
    this.notifyCallback = rerender;
    if (
      !this.query.state.lastUpdated ||
      Date.now() - this.query.state.lastUpdated > this.staleTime
    ) {
      this.query.fetch();
    }
    return unsubscribe;
  }

  getQueryState(): QueryState<TData> {
    return this.query.state;
  }
}
