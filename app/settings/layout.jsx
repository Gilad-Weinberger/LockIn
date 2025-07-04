import Navbar from "@/components/ui/Navbar";
import SettingsSidebar from "@/components/settings/SettingsSidebar";

export default function SettingsLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-8">
            {/* Sidebar */}
            <div className="w-80 flex-shrink-0">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <SettingsSidebar />
              </div>
            </div>

            {/* Page Content */}
            <div className="flex-1 min-w-0">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
