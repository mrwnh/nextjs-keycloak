"use client";

import { usePathname, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"

const tabs = [
  { name: 'Registrations', href: '/admin/registrations' },
  { name: 'Payments', href: '/admin/payments' },
]

export function TabSwitcher() {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <div className="flex space-x-4 mb-6">
      {tabs.map((tab) => (
        <Button
          key={tab.name}
          variant={pathname === tab.href ? "default" : "outline"}
          onClick={() => router.push(tab.href)}
        >
          {tab.name}
        </Button>
      ))}
    </div>
  )
}