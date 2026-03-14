"use client";

import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import AuthGuard from "@/components/auth/AuthGuard";
import { ToastProvider } from "@/components/ui/toast/ToastProvider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "xl:ml-[290px]"
    : "xl:ml-[90px]";

  return (
    <AuthGuard>
      <ToastProvider>
        <div className="min-h-screen xl:flex">
          {/* Sidebar and Backdrop */}
          <AppSidebar />
          <Backdrop />
          {/* Main Content Area */}
          <div
            className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
          >
            {/* Header — fixed at viewport top, never scrolls */}
            <div className={`fixed top-0 right-0 z-[99999] transition-all duration-300 ease-in-out ${
              isMobileOpen
                ? "left-0"
                : isExpanded || isHovered
                ? "xl:left-[290px] left-0"
                : "xl:left-[90px] left-0"
            }`}>
              <AppHeader />
            </div>
            {/* Spacer to offset fixed header height */}
            <div className="h-16 xl:h-[72px]" />
            {/* Page Content */}
            <div className="mx-auto max-w-(--breakpoint-2xl) w-full">
              {children}
            </div>
          </div>
        </div>
      </ToastProvider>
    </AuthGuard>
  );
}
