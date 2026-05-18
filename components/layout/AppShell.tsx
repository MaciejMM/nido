import { BottomNav } from "@/components/layout/BottomNav";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { hasAdminRole } from "@/lib/auth/kinde-admin";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const showAdmin = await hasAdminRole();

  return (
    <div className="flex min-h-screen">
      <Sidebar showAdmin={showAdmin} />
      <div className="flex min-h-screen flex-1 flex-col">
        <Header />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 pb-24 md:px-6 md:pb-8">
          {children}
        </main>
        <BottomNav showAdmin={showAdmin} />
      </div>
    </div>
  );
}
