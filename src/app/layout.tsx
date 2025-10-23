import type { Metadata } from "next";
import "../styles/globals.css";
import Shell from "@/components/layout/Shell";
import I18nProvider from "@/components/providers/I18nProvider";
import ThemeProvider from "@/components/providers/ThemeProvider";

export const metadata: Metadata = {
  title: "HAMA - Human-in-the-Loop AI Investment System",
  description: "AI-powered investment decision support system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ overflowX: "hidden" }}>
      <body style={{ overflowX: "hidden", margin: 0, padding: 0 }}>
        <ThemeProvider>
          <I18nProvider>
            <Shell>{children}</Shell>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
