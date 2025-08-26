import BottomNavbar from "./components/BottomNavbar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden bg-white max-w-[360px] mx-auto min-h-screen flex flex-col">
      {/* Main Content */}
      <div className="flex-1">
        {children}
      </div>
      
      {/* Bottom Navigation */}
      <BottomNavbar />
    </div>
  );
}
