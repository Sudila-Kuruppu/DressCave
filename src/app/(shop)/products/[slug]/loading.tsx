export default function Loading() {
  return (
    <main className="product-detail-page">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Gallery skeleton */}
          <div className="animate-pulse">
            <div className="bg-gray-200 aspect-[3/4] w-full rounded-lg"></div>
            <div className="flex gap-2 mt-4">
              <div className="bg-gray-200 w-20 h-24 rounded"></div>
              <div className="bg-gray-200 w-20 h-24 rounded"></div>
              <div className="bg-gray-200 w-20 h-24 rounded"></div>
            </div>
          </div>
          
          {/* Info skeleton */}
          <div className="animate-pulse space-y-4">
            <div className="bg-gray-200 h-8 w-3/4 rounded"></div>
            <div className="bg-gray-200 h-6 w-1/4 rounded"></div>
            <div className="bg-gray-200 h-4 w-full rounded"></div>
            <div className="bg-gray-200 h-4 w-full rounded"></div>
            <div className="bg-gray-200 h-4 w-2/3 rounded"></div>
          </div>
        </div>
      </div>
    </main>
  );
}
