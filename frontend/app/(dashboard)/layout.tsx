import Nav from "@/components/Nav";
import RequireAuth from "@/components/RequireAuth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth>
      <Nav />
      <main className="relative mx-auto max-w-6xl px-6 py-10">{children}</main>
    </RequireAuth>
  );
}
