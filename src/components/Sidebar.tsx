"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  Menu,
  X,
  LogOut,
  UserCheck,
  Building2,
  CalendarDays,
} from "lucide-react";

interface SidebarProps {
  user: any;
  onLogout: () => void;
}

const Sidebar = ({ user, onLogout }: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const pathname = usePathname();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const toggleMenu = (menuName: string) => {
    setExpandedMenus((prev) =>
      prev.includes(menuName)
        ? prev.filter((m) => m !== menuName)
        : [...prev, menuName]
    );
  };

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + "/");
  };

  const menuItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
    },
  ];

  // Add Classes for all users
  menuItems.push({
    name: "Classes",
    href: "/dashboard/classes",
    icon: BookOpen,
    active: isActive("/dashboard/classes"),
  });

  // Add Online Classes for all authenticated users (students, teachers, and admins)
  menuItems.push({
    name: "Online Classes",
    href: "/dashboard/online-classes",
    icon: BookOpen,
    active: isActive("/dashboard/online-classes"),
  });

  // Add Academic Calendar for all users
  menuItems.push({
    name: "Academic Calendar",
    href: "/dashboard/calendar",
    icon: Calendar,
    active: isActive("/dashboard/calendar"),
  });

  // Add Rooms for all users
  menuItems.push({
    name: "Rooms",
    href: "/dashboard/rooms",
    icon: Building2,
    active: isActive("/dashboard/rooms"),
  });

  // Add Timetable for all users
  menuItems.push({
    name: "Timetable",
    href: "/dashboard/timetable",
    icon: CalendarDays,
    active: isActive("/dashboard/timetable"),
  });

  // Admin-only menu items
  if (user?.role === "admin") {
    menuItems.push(
      {
        name: "Students",
        href: "/dashboard/students",
        icon: Users,
        active: isActive("/dashboard/students"),
      },
      {
        name: "Teachers",
        href: "/dashboard/teachers",
        icon: UserCheck,
        active: isActive("/dashboard/teachers"),
      }
    );
  }

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg transition-transform duration-300 ease-in-out z-50 h-screen ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:inset-0 w-64`}
      >
        {/* Header */}
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <div className="flex flex-col">
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                CAP LMS
              </span>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Presidency University
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 h-[80%]">
          <div className="px-2 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    item.active
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-r-2 border-blue-600"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <Icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 ${
                      item.active
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                    }`}
                  />
                  <span className="flex-1">{item.name}</span>
                  {item.active && (
                    <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between w-full gap-2">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {user?.name?.charAt(0) || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user?.name || "Unknown User"}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                {user?.role || "user"}
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
