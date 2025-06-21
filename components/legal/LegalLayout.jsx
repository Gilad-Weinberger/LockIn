import Navbar from "@/components/ui/Navbar";
import LegalSidebar from "./LegalSidebar";

const LegalLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto flex md:flex-row flex-col">
          {/* Sidebar - Hidden on mobile, fixed position on desktop */}
          <div className="hidden md:block md:w-80 bg-white shadow-sm border-r border-gray-200 h-fit mt-12 rounded-lg md:fixed md:mr-6">
            <LegalSidebar />
          </div>

          {/* Main Content - No padding on mobile, left padding on desktop */}
          <div className="flex-1 md:pl-96 px-4 md:px-0">
            <div className="max-w-4xl mx-auto md:pt-12">
              {/* Mobile sidebar - show above content */}
              <div className="md:hidden mb-8 bg-white shadow-sm border border-gray-200 rounded-lg">
                <LegalSidebar />
              </div>

              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LegalLayout;
