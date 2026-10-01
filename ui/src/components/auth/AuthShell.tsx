// Shared dark two-column auth shell, used by BOTH the Stack Auth handler
// (/handler/[...stack], cloud) and the local/OSS auth pages (/auth/login,
// /auth/signup). LEFT: a centered card that wraps the auth form (`children`).
// RIGHT (lg+ only): a brand/value panel with the Dograh logo, proof points, and
// a Bland-style enterprise CTA block at the bottom (passed in as `enterpriseSlot`).
// Mobile collapses to the single card column. The form column scrolls and stays
// centered so tall (sign-up) forms never clip on short viewports. Palette is the
// app's blacks/greys with one warm CTA accent.

import { bebasNeue } from "@/lib/fonts";
import type { ReactNode } from "react";

export function AuthShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full bg-background flex flex-col items-center justify-center overflow-hidden">
      {/* Fiery radial glow background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(220,38,38,0.25)_0%,transparent_65%)] pointer-events-none" />

      <main className="relative z-10 flex w-full flex-col items-center justify-center px-6 py-10 sm:px-10">
        
        <div className="flex flex-col items-center justify-center gap-2 mb-8">
          <img src="/Logo.jpg" alt="Dracarys Logo" className="h-12 w-12 rounded-xl object-cover shadow-md" />
          <span className={`${bebasNeue.className} text-3xl tracking-[0.15em] text-[#F5F0E8] uppercase mt-1`}>
            Dracarys
          </span>
        </div>

        <div className="w-full max-w-md space-y-6 rounded-2xl border border-border/60 bg-card p-6 shadow-2xl sm:p-8 backdrop-blur-sm">
          {children}
        </div>
      </main>
    </div>
  );
}
