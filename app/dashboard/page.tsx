// frontend/app/dashboard/page.tsx

"use client";

import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "../../context/AuthContext";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      router.push("/login");
    }
  }, [user, router]);

  if (user === null) return null; // Loading handled by layout

  const { UserType, Name } = user;

  // Define navigation links based on user role
  const navigationLinks = {
    Admin: [
      { name: "Manage Users", href: "/users" },
      { name: "Manage Books", href: "/books" },
      { name: "View Reports", href: "/reports" },
      { name: "Manage Providers", href: "/provider" },
      { name: "View Notifications", href: "/notifications" },
    ],
    Librarian: [
      { name: "Manage Books", href: "/books" },
      { name: "Manage Transactions", href: "/transactions" },
      { name: "Manage Reservations", href: "/reservations" },
      { name: "Manage Book Updates", href: "/bookupdates" },
      { name: "View Notifications", href: "/notifications" },
    ],
    "Registered User": [
      { name: "Browse Books", href: "/books" },
      { name: "My Transactions", href: "/transactions" },
      { name: "My Reservations", href: "/reservations" },
      { name: "My Notifications", href: "/notifications" },
      { name: "Edit Profile", href: "/profile" },
    ],
  };

  const links = navigationLinks[UserType] || [];

  return (
    <div className="bg-background text-foreground">
      {/* Welcome Message */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Welcome, {Name}</h2>
        <p className="text-muted">Your role: {UserType}</p>
      </div>

      {/* Role-Based Content */}
      <div className="bg-card p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold mb-4">{UserType} Dashboard</h3>
        <ul className="space-y-2">
          {links.map((link) => (
            <li key={link.name}>
              <Link href={link.href} className="text-primary hover:underline">
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
