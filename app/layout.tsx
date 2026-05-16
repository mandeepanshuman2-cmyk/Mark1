import type { Metadata } from "next";
import "./globals.css";
import { VideoProvider } from "@/lib/context/videoContext";

export const metadata: Metadata = {
  title: "EduGenie - AI YouTube Lecture Intelligence",
  description: "AI-powered YouTube lecture analysis with Groq LLaMA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <VideoProvider>{children}</VideoProvider>
      </body>
    </html>
  );
}
