"use client";

import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./ThemeProvider";
import OnboardingModal from "@/components/onboarding/OnboardingModal";
import FloatingTimer from "@/components/ui/FloatingTimer";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      {children}
      <FloatingTimer />
      <OnboardingModal />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "rgba(15, 23, 42, 0.95)",
            color: "#f1f5f9",
            border: "1px solid rgba(139, 92, 246, 0.3)",
            backdropFilter: "blur(12px)",
            borderRadius: "12px",
            padding: "12px 16px",
            fontSize: "14px",
            fontWeight: "500",
          },
          success: {
            iconTheme: { primary: "#10b981", secondary: "#fff" },
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "#fff" },
          },
        }}
      />
    </ThemeProvider>
  );
}
