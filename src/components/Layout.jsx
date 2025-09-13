import React from "react";
import { Puzzle } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 bg-background/80 border-b border-border px-6 py-4 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center shadow-lg">
              <Puzzle className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-xl text-foreground">Eternity II</h2>
              <p className="text-xs text-muted-foreground">Solver & Analyzer</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}