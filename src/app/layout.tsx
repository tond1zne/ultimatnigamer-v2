import type { Metadata } from "next";
import { Lilita_One, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { SITE_NAME } from "@/lib/site";

const display = Lilita_One({ weight: "400", subsets: ["latin", "latin-ext"], variable: "--font-display" });
const body = Bricolage_Grotesque({ subsets: ["latin", "latin-ext"], variable: "--font-body" });

export const metadata: Metadata = {
  title: { default: `${SITE_NAME} - výzvy ve hrách i v reálu`, template: `%s | ${SITE_NAME}` },
  description: "Plň výzvy ve hrách i v reálném životě, nahraj důkaz a sbírej body v týdenním žebříčku.",
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs">
      <body className={`${display.variable} ${body.variable} min-h-screen bg-paper text-ink`}>
        <a href="#obsah" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[60] focus:bg-paper focus:p-3">
          Přeskočit na obsah
        </a>
        <Navbar />
        <main id="obsah" className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">{children}</main>
        <footer className="mt-16 border-t-[3px] border-ink">
          <div className="mx-auto flex max-w-6xl flex-col justify-between gap-2 px-4 py-6 text-sm font-bold sm:flex-row sm:px-6">
            <span>{SITE_NAME} {new Date().getFullYear()}</span>
            <span className="text-ash">Splň to, natoč to, zapiš si body.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
