import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Puzzle, Info, GitBranch } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { SolverProvider } from "../components/puzzle/SolverContext";

const navigationItems = [
  {
    title: "Puzzle Solver",
    url: createPageUrl("Solver"),
    icon: Puzzle,
    description: "Live solving & analysis dashboard"
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  return (
    <SolverProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
          <style jsx>{`
            :root {
              --sidebar-background: rgb(15 23 42);
              --sidebar-foreground: rgb(226 232 240);
              --sidebar-primary: rgb(99 102 241);
              --sidebar-primary-foreground: rgb(255 255 255);
              --sidebar-accent: rgb(30 41 59);
              --sidebar-accent-foreground: rgb(226 232 240);
              --sidebar-border: rgb(30 41 59);
            }
          `}</style>
          
          <Sidebar className="border-r border-slate-800 bg-slate-950">
            <SidebarHeader className="border-b border-slate-800 p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Puzzle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-xl text-white">Eternity II</h2>
                  <p className="text-xs text-slate-400">Solver & Analyzer</p>
                </div>
              </div>
            </SidebarHeader>
            
            <SidebarContent className="p-4">
              <SidebarGroup>
                <SidebarGroupLabel className="text-xs font-medium text-slate-400 uppercase tracking-wider px-3 py-2">
                  Dashboard
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {navigationItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          className={`group relative overflow-hidden rounded-xl p-3 transition-all duration-200 ${
                            location.pathname === item.url 
                              ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white shadow-lg border border-indigo-500/30' 
                              : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                          }`}
                        >
                          <Link to={item.url} className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg transition-colors ${
                              location.pathname === item.url
                                ? 'bg-indigo-500/20 text-indigo-400'
                                : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-300'
                            }`}>
                              <item.icon className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-semibold text-sm">{item.title}</span>
                              <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                            </div>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarGroup className="mt-8">
                <SidebarGroupLabel className="text-xs font-medium text-slate-400 uppercase tracking-wider px-3 py-2">
                  Algorithm Info
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <div className="px-3 py-4 space-y-4">
                    <div className="flex items-start gap-3 text-sm">
                        <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300">Strict placement order & random rotation matching.</span>
                    </div>
                     <div className="flex items-start gap-3 text-sm">
                        <GitBranch className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300">Non-backtracking, brute-force statistical analysis.</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-slate-400">Board Size:</span>
                      <span className="ml-2 font-semibold text-white">16×16</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-slate-400">Total Pieces:</span>
                      <span className="ml-2 font-semibold text-white">256</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-slate-400">Hint Pieces:</span>
                      <span className="ml-2 font-semibold text-white">5</span>
                    </div>
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>

          <main className="flex-1 flex flex-col">
            <header className="bg-slate-950/50 border-b border-slate-800 px-6 py-4 md:hidden backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="hover:bg-slate-800 p-2 rounded-lg transition-colors duration-200 text-slate-300" />
                <h1 className="text-xl font-bold text-white">PuzzleSolver</h1>
              </div>
            </header>

            <div className="flex-1 overflow-auto">
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </SolverProvider>
  );
}