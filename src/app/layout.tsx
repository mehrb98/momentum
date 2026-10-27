import "@/styles/global.css";
import { inter } from "@/app/fonts";
import type { Metadata } from "next";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
    title: "Momentum · Task manager",
    description: "A focused workspace with AI-assisted task planning.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={inter.variable} suppressHydrationWarning>
            <body className="bg-background font-sans text-foreground">
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
