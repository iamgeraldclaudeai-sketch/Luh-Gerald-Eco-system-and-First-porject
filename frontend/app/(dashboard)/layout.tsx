import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import RequireAuth from "@/components/RequireAuth";
import PageTransition from "@/components/PageTransition";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth>
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex flex-1 flex-col md:flex-row">
          <Sidebar />
          <main className="relative w-full flex-1 px-4 py-8 md:px-8 md:py-10">
            <div className="mx-auto max-w-5xl">
              <PageTransition>{children}</PageTransition>
            </div>
          </main>
        </div>
      </div>
    </RequireAuth>
  );
}
