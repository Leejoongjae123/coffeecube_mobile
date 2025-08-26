import BottomNavbar from "./components/BottomNavbar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white max-w-[360px] mx-auto h-screen relative overflow-hidden">
      {/* Main Content - with bottom padding to avoid navbar overlap */}
      <div className="h-full pb-20 overflow-hidden">
        {children}
      </div>
      
      {/* Bottom Navigation - Fixed at bottom */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-[360px] z-50">
        <BottomNavbar />
      </div>
    </div>
  );
}
