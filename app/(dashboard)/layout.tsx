import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import AuthGuard from "@/components/AuthGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div
        className="flex flex-col h-screen"
        style={{ background: "var(--bg-page)" }}
      >
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-8 relative">
            {/* Ambient blobs — CSS hides these in light mode via .ambient-blobs class */}
            <div className="ambient-blobs pointer-events-none fixed inset-0 overflow-hidden -z-10">
              <div className="absolute -top-24 right-[-8%] w-[520px] h-[520px] rounded-full bg-indigo-600/10 blur-[130px]" />
              <div className="absolute bottom-[-15%] left-[5%] w-[440px] h-[440px] rounded-full bg-violet-600/10 blur-[110px]" />
              <div className="absolute top-[45%] left-[35%] w-[300px] h-[300px] rounded-full bg-blue-500/[0.07] blur-[90px]" />
            </div>

            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
