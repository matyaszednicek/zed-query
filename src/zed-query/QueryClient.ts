import { Query, QueryData, QueryOptions } from "./Query";

export class QueryClient {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  queries: Query<any>[];

  constructor() {
    this.queries = [];
  }

  getQuery<TData extends QueryData>({
    queryKey,
    queryFn,
  }: QueryOptions<TData>): Query<TData> {
    const queryHash = JSON.stringify(queryKey);
    const query: Query<TData> | undefined = this.queries.find(
      (q) => JSON.stringify(q.queryKey) === queryHash,
    );
    if (!query) {
      const newQuery = new Query<TData>({ queryKey, queryFn });
      this.queries.push(newQuery);
      return newQuery;
    }
    return query;
  }
}
