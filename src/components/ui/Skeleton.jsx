export default function Skeleton({ className = '', variant = 'text' }) {
  const variants = {
    text: 'h-4 w-full',
    title: 'h-8 w-3/4',
    card: 'h-64 w-full',
    image: 'h-48 w-full',
    avatar: 'h-12 w-12 rounded-full',
    button: 'h-10 w-24',
  };

  return (
    <div className={`skeleton rounded-lg ${variants[variant]} ${className}`} />
  );
}

export function ArticleCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <Skeleton variant="image" />
      <div className="p-4 space-y-3">
        <Skeleton variant="title" />
        <Skeleton variant="text" />
        <Skeleton variant="text" className="w-5/6" />
        <div className="flex justify-between">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}

export function ArticleListSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ArticleCardSkeleton key={i} />
      ))}
    </div>
  );
}

export  function CelebrityPhotoSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex gap-2 h-[200px] mb-4">
        <div className="rounded-2xl bg-gray-300 w-1/2 h-full" />
        <div className="flex flex-col w-1/2 gap-2">
          <div className="rounded-xl bg-gray-300 h-1/2" />
          <div className="rounded-xl bg-gray-300 h-1/2" />
        </div>
      </div>
      <div className="h-4 bg-gray-300 rounded w-3/4" />
    </div>
  );
}