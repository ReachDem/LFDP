"use client"

import * as React from "react"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DrawerProps {
  children: React.ReactNode
  isOpen: boolean
  onToggle: () => void
  side?: "left" | "right"
}

export function Drawer({ children, isOpen, onToggle, side = "right" }: DrawerProps) {
  return (
    <div
      className={cn(
        "fixed top-0 bottom-0 w-full sm:max-w-md md:max-w-lg bg-white shadow-lg border transition-all duration-300 ease-in-out",
        side === "right" ? "right-0 border-l" : "left-0 border-r",
        isOpen ? "translate-x-0" : side === "right" ? "translate-x-full" : "-translate-x-full"
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "absolute top-1/2 -translate-y-1/2 bg-white shadow-md border",
          side === "right" ? "-left-8 rounded-l-full" : "-right-8 rounded-r-full"
        )}
        onClick={onToggle}
      >
        <ChevronRight className={cn(
          "h-4 w-4 transition-transform",
          !isOpen && "rotate-180",
          side === "left" && "rotate-180",
          !isOpen && side === "left" && "rotate-0"
        )} />
      </Button>
      {children}
    </div>
  )
}
