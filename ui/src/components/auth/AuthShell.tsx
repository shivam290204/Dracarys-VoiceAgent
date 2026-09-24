// Shared dark two-column auth shell, used by BOTH the Stack Auth handler
// (/handler/[...stack], cloud) and the local/OSS auth pages (/auth/login,
// /auth/signup). LEFT: a centered card that wraps the auth form (`children`).
// RIGHT (lg+ only): a brand/value panel with the Dograh logo, proof points, and
// a Bland-style enterprise CTA block at the bottom (passed in as `enterpriseSlot`).
// Mobile collapses to the single card column. The form column scrolls and stays
// centered so tall (sign-up) forms never clip on short viewports. Palette is the
// app's blacks/greys with one warm CTA accent.

import type { ReactNode } from "react";

import { BrandLogo } from "@/components/BrandLogo";

const HIGHLIGHTS = [
  "Speech-to-speech",
  "MCP-native",
  "BYOK - any model",
];

export function AuthShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-screen w-full bg-background lg:grid-cols-[55%_45%]">
      {/* Form column (LEFT) — scrolls and stays centered so tall forms never
          clip. Carries the giant faded "dograh" imprint along its bottom. */}
      <main className="auth-imprint flex min-h-screen flex-col overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md space-y-6 rounded-2xl border border-border/60 bg-card p-6 shadow-lg sm:p-8">

            {children}
          </div>
        </div>
      </main>

      {/* Brand / value panel (RIGHT) — hidden on mobile */}
      <aside className="relative hidden flex-col justify-center overflow-hidden bg-black lg:flex items-center">
        {/* Full bleed background image */}
        <div className="absolute inset-0">
          <img 
            src="/dragon_photo.png" 
            alt="Majestic Dragon" 
            className="w-full h-full object-cover object-center opacity-100 transition-transform duration-[30000ms] hover:scale-110 ease-out"
          />
          {/* Vignette effect fading to black at the edges */}
          <div className="absolute inset-0 bg-black/20 shadow-[inset_0_0_150px_rgba(0,0,0,1)]" />
          
          {/* Gradient fading to pitch black at the very bottom for the text to sit on */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/80 to-transparent" />
          
          {/* Subtle side fade to blend with the form on the left */}
          <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-background to-transparent" />

          {/* Fiery radial glow anchored near the bottom to match the fire breath */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_80%,rgba(220,38,38,0.2)_0%,transparent_60%)] mix-blend-color-dodge pointer-events-none" />
        </div>

        {/* Content overlaid on the dragon - anchored to the bottom */}
        <div className="relative z-10 flex flex-col items-center justify-end w-full h-full pb-20 px-4 sm:px-10 pointer-events-none overflow-hidden">
          <h1 
            className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-orange-200 via-red-500 to-red-900 uppercase text-center w-full max-w-full drop-shadow-2xl" 
            style={{ 
              fontFamily: "'Cinzel', serif",
              filter: "drop-shadow(0 0 30px rgba(220,38,38,0.9)) drop-shadow(0 10px 10px rgba(0,0,0,0.9))"
            }}
          >
            Dracarys
          </h1>
          <p className="mt-4 sm:mt-6 text-sm sm:text-lg xl:text-xl tracking-[0.3em] text-red-500 uppercase font-bold text-center" style={{ filter: "drop-shadow(0 0 15px rgba(220,38,38,0.8))" }}>
            Fire and Blood
          </p>
        </div>
      </aside>
    </div>
  );
}
