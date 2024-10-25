import { useQuery } from "zed-query";

type Post = { title: string; likes: number };

const fetchData: () => Promise<{ posts: Post[] }> = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        posts: [
          { title: "Post 1", likes: 20 },
          { title: "Post 2", likes: 3 },
        ],
      });
    }, 2000);
  });
};

function App() {
  const {
    data: posts,
    isFetching,
    status,
    error,
  } = useQuery({
    queryKey: "posts",
    queryFn: fetchData,
    staleTime: 0,
  });

  return (
    <>
      <div className="flex flex-col w-full space-y-4 text-left">
        <p>Posts:</p>
        {isFetching && (
          <p>{status === "pending" ? "Loading..." : "Refetching..."}</p>
        )}
        {error && <p>Error: {error?.message}</p>}
        {posts && <pre>{JSON.stringify(posts, null, 2)}</pre>}
      </div>
    </>
  );
}

export default App;
