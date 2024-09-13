"use client"
import { useState, useEffect } from 'react';
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun, LogOut } from "lucide-react";
import Image from 'next/image';
import federatedLogout from "@/utils/federatedLogout";
import { useSession } from "next-auth/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [isRTL, setIsRTL] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleDirection = () => {
    const newDirection = !isRTL ? 'rtl' : 'ltr';
    setIsRTL(!isRTL);
    document.documentElement.dir = newDirection;
    document.documentElement.lang = newDirection === 'rtl' ? 'ar' : 'en';
  };

  const logoSrc = theme === "light" 
    ? "https://www.therff.com/images/rff-logo.png"
    : "https://www.therff.com/new/images/rff-logo-white.png";

  if (!mounted) return null;

  return (
    <header className="bg-background border-b">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="relative w-32 h-12">
          <img
            src={logoSrc}
            alt="RFF Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleDirection}
                >
                  {isRTL ? 'E' : 'ع'}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isRTL ? 'Switch to English' : 'التبديل إلى العربية'}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                >
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle theme</p>
              </TooltipContent>
            </Tooltip>

            {session && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={federatedLogout}
                  >
                    <LogOut className="h-[1.2rem] w-[1.2rem]" />
                    <span className="sr-only">Logout</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Logout</p>
                </TooltipContent>
              </Tooltip>
            )}
          </TooltipProvider>
        </div>
      </div>
    </header>
  );
}