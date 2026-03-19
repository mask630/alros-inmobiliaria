import { AdminSidebar } from "@/components/layout/AdminSidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-slate-100 flex-col lg:flex-row">
            <AdminSidebar />
            <main className="flex-1 p-4 lg:p-8 overflow-y-auto mt-16 lg:mt-0 w-full overflow-x-hidden">
                {children}
            </main>
        </div>
    );
}
