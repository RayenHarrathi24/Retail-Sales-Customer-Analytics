import { type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { FilterBar } from './FilterBar';
import { DashboardBackground } from './DashboardBackground';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="relative flex h-screen overflow-hidden">
      <DashboardBackground />
      <Sidebar />
      <div className="relative flex-1 flex flex-col min-w-0 overflow-hidden">
        <FilterBar />
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-6 md:p-8 w-full max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
