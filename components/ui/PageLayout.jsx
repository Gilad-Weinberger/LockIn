"use client";

import StepBar from "./StepBar";
import DropdownMenu from "./DropdownMenu";

const PageLayout = ({ children }) => {
  return (
    <div className="h-screen flex flex-col overflow-hidden relative">
      {/* Main content area - takes up remaining space */}
      <div className="flex-1 min-h-0">{children}</div>

      {/* StepBar at bottom - fixed height */}
      <div className="flex-shrink-0">
        <StepBar />
      </div>

      {/* DropdownMenu - positioned absolutely */}
      <div className="absolute bottom-4 left-8 z-50">
        <DropdownMenu />
      </div>
    </div>
  );
};

export default PageLayout;
