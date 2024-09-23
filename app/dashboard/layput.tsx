// frontend/app/dashboard/layout.tsx

"use client";

import React, { useContext } from "react";
import Link from "next/link";
import { AuthContext } from "../../context/AuthContext";
import LogoutButton from "../../components/LogoutButton";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { MenuIcon, XIcon } from "@heroicons/react/outline";
import { useState } from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen bg-background text-foreground">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  const { UserType, Name } = user;

  // Define navigation links based on user role
  const navigationLinks = {
    Admin: [
      { name: "Manage Users", href: "/dashboard/users" },
      { name: "Manage Books", href: "/dashboard/books" },
      { name: "View Reports", href: "/dashboard/reports" },
      { name: "Manage Providers", href: "/dashboard/provider" },
      { name: "View Notifications", href: "/dashboard/notifications" },
    ],
    Librarian: [
      { name: "Manage Books", href: "/dashboard/books" },
      { name: "Manage Transactions", href: "/dashboard/transactions" },
      { name: "Manage Reservations", href: "/dashboard/reservations" },
      { name: "Manage Book Updates", href: "/dashboard/bookupdates" },
      { name: "View Notifications", href: "/dashboard/notifications" },
    ],
    "Registered User": [
      { name: "Browse Books", href: "/dashboard/books" },
      { name: "My Transactions", href: "/dashboard/transactions" },
      { name: "My Reservations", href: "/dashboard/reservations" },
      { name: "My Notifications", href: "/dashboard/notifications" },
      { name: "Edit Profile", href: "/dashboard/profile" },
    ],
  };

  const links = navigationLinks[UserType] || [];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 bg-secondary text-foreground">
          {/* Sidebar Header */}
          <div className="flex items-center h-16 px-4 bg-primary text-primary-foreground">
            <h1 className="text-lg font-bold">Library Dashboard</h1>
          </div>
          {/* Navigation Links */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {links.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="block px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground"
              >
                {link.name}
              </Link>
            ))}
          </nav>
          {/* Logout Button */}
          <div className="px-4 py-4">
            <LogoutButton />
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 z-40 md:hidden ${
          isMobileMenuOpen ? "block" : "hidden"
        }`}
      >
        <div
          className="fixed inset-0 bg-black opacity-50"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
        <div className="fixed inset-y-0 left-0 w-64 bg-secondary text-foreground p-4 overflow-y-auto">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-bold">Library Dashboard</h1>
            <button onClick={() => setIsMobileMenuOpen(false)}>
              <XIcon className="h-6 w-6" />
            </button>
          </div>
          {/* Navigation Links */}
          <nav className="flex-1 space-y-1">
            {links.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="block px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </nav>
          {/* Logout Button */}
          <div className="mt-4">
            <LogoutButton />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="flex items-center justify-between md:hidden bg-primary text-primary-foreground p-4">
          <h1 className="text-lg font-bold">Library Dashboard</h1>
          <button onClick={() => setIsMobileMenuOpen(true)}>
            <MenuIcon className="h-6 w-6" />
          </button>
        </header>

        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
