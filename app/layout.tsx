// frontend/app/layout.tsx

import { ModeToggle } from "@/components/Theme-toggle";
import { AuthProvider } from "../context/AuthContext";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
export const metadata = {
  title: "Library Management System",
  description: "A library management system built with Next.js and PHP",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ModeToggle />
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
