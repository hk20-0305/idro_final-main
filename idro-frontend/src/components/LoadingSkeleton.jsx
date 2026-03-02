import React from 'react';

// Alert Card Skeleton
export function AlertSkeleton() {
  return (
    <div className="rounded-lg border-l-4 border-slate-700 bg-slate-800/30 p-4 space-y-3 animate-pulse">
      <div className="flex justify-between items-start">
        <div className="skeleton h-6 w-32"></div>
        <div className="skeleton h-4 w-20"></div>
      </div>
      <div className="skeleton h-8 w-full"></div>
      <div className="skeleton h-3 w-24"></div>
    </div>
  );
}

// Camp Card Skeleton
export function CampSkeleton() {
  return (
    <div className="bg-slate-800/50 border border-white/10 rounded-lg p-3 space-y-3 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="skeleton h-5 w-40"></div>
        <div className="skeleton h-5 w-16"></div>
      </div>
      <div className="flex gap-2">
        <div className="skeleton h-4 w-20"></div>
        <div className="skeleton h-4 w-24"></div>
      </div>
    </div>
  );
}

// Message Skeleton
export function MessageSkeleton() {
  return (
    <div className="p-3 rounded-lg bg-slate-800/50 border border-white/10 space-y-2 animate-pulse">
      <div className="flex justify-between">
        <div className="skeleton h-3 w-24"></div>
        <div className="skeleton h-3 w-16"></div>
      </div>
      <div className="skeleton h-4 w-full"></div>
    </div>
  );
}

// Stats Card Skeleton
export function StatsSkeleton() {
  return (
    <div className="flex items-center gap-3 animate-pulse">
      <div className="skeleton h-10 w-10 rounded-lg"></div>
      <div className="space-y-2">
        <div className="skeleton h-3 w-24"></div>
        <div className="skeleton h-6 w-16"></div>
      </div>
    </div>
  );
}

// Full Dashboard Loading State
export function DashboardSkeleton() {
  return (
    <div className="relative w-full h-screen bg-slate-900 overflow-hidden">
      {/* Header Skeleton */}
      <header className="relative z-50 flex items-center justify-between px-6 py-3 border-b border-white/10 bg-slate-900/90">
        <div className="flex items-center gap-4">
          <div className="skeleton h-10 w-10 rounded"></div>
          <div className="space-y-2">
            <div className="skeleton h-5 w-40"></div>
            <div className="skeleton h-3 w-48"></div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="skeleton h-8 w-24 rounded-lg"></div>
          <div className="skeleton h-8 w-24 rounded-lg"></div>
          <div className="skeleton h-10 w-64 rounded-lg"></div>
        </div>
      </header>

      {/* Stats Bar Skeleton */}
      <div className="relative z-40 bg-slate-800/50 border-b border-white/10 px-6 py-3">
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <StatsSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Main Content Skeleton */}
      <main className="relative z-10 grid grid-cols-12 gap-0 h-[calc(100vh-160px)]">
        {/* Left Panel */}
        <div className="col-span-3 bg-slate-900/90 border-r border-white/10 p-4 space-y-4">
          <div className="space-y-3">
            <div className="skeleton h-8 w-full rounded"></div>
            {[1, 2].map((i) => (
              <AlertSkeleton key={i} />
            ))}
          </div>
          <div className="space-y-3 mt-6">
            <div className="skeleton h-8 w-full rounded"></div>
            {[1, 2].map((i) => (
              <CampSkeleton key={i} />
            ))}
          </div>
        </div>

        {/* Center Map Skeleton */}
        <div className="col-span-6 relative bg-slate-800 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="skeleton h-64 w-64 rounded-full mx-auto"></div>
            <div className="skeleton h-6 w-48 mx-auto"></div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="col-span-3 bg-slate-900/90 border-l border-white/10 p-4 space-y-4">
          <div className="skeleton h-40 w-full rounded-xl"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <MessageSkeleton key={i} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default DashboardSkeleton;