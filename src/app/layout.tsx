import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "SMK Yadika Soreang - DevOps Learning Center",
  description: "Platform pembelajaran Linux & DevOps interaktif untuk siswa RPL SMK Yadika Soreang. Elevate your shell skills, master the system.",
  keywords: ["DevOps", "Linux", "CTF", "SMK Yadika Soreang", "Terminal Simulator", "Shell skills"],
  authors: [{ name: "NextSkill Indonesia" }],
  openGraph: {
    title: "SMK Yadika Soreang - DevOps Learning Center",
    description: "Platform pembelajaran Linux & DevOps interaktif untuk siswa RPL SMK Yadika Soreang.",
    url: "https://ctf.yadika.id",
    siteName: "Yadika DevOps",
    images: [
      {
        url: "/icon.svg",
        width: 512,
        height: 512,
        alt: "Yadika DevOps Logo",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Yadika DevOps Learning Center",
    description: "Platform pembelajaran Linux & DevOps interaktif untuk siswa RPL SMK Yadika.",
    images: ["/icon.svg"],
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-mono" suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
