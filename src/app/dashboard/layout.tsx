import { SideNav } from "./side-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="container mx-auto pt-12">
      <div className="flex gap-14">
        <SideNav />
        <div className="w-full">{children}</div>
      </div>
    </main>
  );
}
