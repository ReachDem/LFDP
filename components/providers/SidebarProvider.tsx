'use client'
import React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"

export const Sidebar = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';
 
  const renderBreadcrumbs = () => {
    return pathname
      .split('/')
      .filter(Boolean)
      .map((path, index, array) => (
        <React.Fragment key={path}>
          <BreadcrumbItem className="hidden md:block">
            {index === array.length - 1 ? (
              <BreadcrumbPage>
                {path.charAt(0).toUpperCase() + path.slice(1)}
              </BreadcrumbPage>
            ) : (
              <BreadcrumbLink href={`/${array.slice(0, index + 1).join('/')}`}>
                {path.charAt(0).toUpperCase() + path.slice(1)}
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>
          {index < array.length - 1 && (
            <BreadcrumbSeparator className="hidden md:block" />
          )}
        </React.Fragment>
      ));
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {renderBreadcrumbs()}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
