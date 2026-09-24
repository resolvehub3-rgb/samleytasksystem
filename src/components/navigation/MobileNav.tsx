import React from 'react';
import { LayoutDashboard, FolderGit2, CheckSquare, CircleDollarSign, Menu } from 'lucide-react';

interface MobileNavProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenMobileMenu: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenMobileMenu,
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'finance', label: 'Finance', icon: CircleDollarSign },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-white dark:bg-[#121A15] border-t border-neutral-200 dark:border-neutral-800 z-30 flex items-center justify-around px-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex flex-col items-center justify-center flex-1 py-1 cursor-pointer transition-colors ${
              isActive
                ? 'text-[#0B5D3B] dark:text-[#28A76B] font-bold'
                : 'text-neutral-500 dark:text-neutral-400'
            }`}
          >
            <Icon className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] leading-tight">{tab.label}</span>
          </button>
        );
      })}

      {/* Menu Drawer Toggle */}
      <button
        onClick={onOpenMobileMenu}
        className="flex flex-col items-center justify-center flex-1 py-1 cursor-pointer text-neutral-500 dark:text-neutral-400"
      >
        <Menu className="w-4 h-4 mb-0.5" />
        <span className="text-[10px] leading-tight">More</span>
      </button>
    </div>
  );
};
