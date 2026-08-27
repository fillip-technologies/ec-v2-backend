import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastNotificationContainer } from "@/components/shared/ToastNotification";

export const metadata: Metadata = {
  title: "Engineers Clinic | Build real projects. Prove you are job-ready.",
  description: "Practical engineering project tracks: milestones, GitHub submissions, mentor reviews, and verified certificates.",
  icons: {
    icon: "/images/Engineers-clinic-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased selection:bg-brand selection:text-white">
      <head>
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,800,900&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://cdn-uicons.flaticon.com/uicons-regular-rounded/css/uicons-regular-rounded.css"
        />

        {/*  title */}
        <title>Engineers Clinic</title>
      </head>
      <body className="min-h-full flex flex-col font-sans bg-bgBody text-textPrimary antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
        <ToastNotificationContainer />
      </body>
    </html>
  );
}
