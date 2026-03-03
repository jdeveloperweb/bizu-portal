export default function StudentLoading() {
    return (
        <div className="p-6 md:p-10 max-w-[1400px] mx-auto space-y-6 animate-pulse">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <div className="h-8 w-48 bg-slate-100 rounded-2xl" />
                    <div className="h-4 w-72 bg-slate-50 rounded-xl" />
                </div>
                <div className="h-10 w-32 bg-slate-100 rounded-2xl hidden sm:block" />
            </div>

            {/* Stats grid skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-28 bg-slate-100 rounded-[28px]" />
                ))}
            </div>

            {/* Main content skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="h-56 bg-slate-100 rounded-[32px]" />
                    <div className="grid grid-cols-2 gap-4">
                        <div className="h-36 bg-slate-100 rounded-[28px]" />
                        <div className="h-36 bg-slate-100 rounded-[28px]" />
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="h-48 bg-slate-100 rounded-[32px]" />
                    <div className="h-48 bg-slate-100 rounded-[32px]" />
                </div>
            </div>
        </div>
    );
}
