import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Dashboard | Pulse",
    description: "Pulse workspace dashboard",
};

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                    Dashboard
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Welcome back! Here&apos;s an overview of your workspace.
                </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard title="Total Projects" value="—" color="brand" />
                <MetricCard title="Active Tasks" value="—" color="blue" />
                <MetricCard title="Team Members" value="—" color="green" />
                <MetricCard title="Completed" value="—" color="purple" />
            </div>

            {/* Placeholder */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-brand-50 dark:bg-brand-500/10">
                        <svg
                            className="w-8 h-8 text-brand-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Dashboard coming soon
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                        Charts, metrics, and workspace overview will be displayed here.
                        Navigate to Projects to start managing your work.
                    </p>
                </div>
            </div>
        </div>
    );
}

function MetricCard({
    title,
    value,
    color,
}: {
    title: string;
    value: string;
    color: "brand" | "blue" | "green" | "purple";
}) {
    const colorMap = {
        brand: "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400",
        blue: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
        green: "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400",
        purple: "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
    };

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                    </svg>
                </div>
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
                    <p className="text-xl font-semibold text-gray-800 dark:text-white/90">{value}</p>
                </div>
            </div>
        </div>
    );
}
