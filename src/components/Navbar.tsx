"use client";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { useState, useEffect } from "react";
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function NavbarDemo() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Set mounted state to avoid hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const navItems = [
    {
      name: "Home",
      link: "/",
    },
    {
      name: "Test",
      link: "/tests",
    },
    {
      name: "Category",
      link: "/categories",
    },
    {
      name: "Contact",
      link: "#contact",
    },
  ];

  // Add dashboard link for authenticated users
  if (session) {
    navItems.push({
      name: "Dashboard",
      link: `/${session.user?.role}`,
    });
  }

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
    setIsMobileMenuOpen(false);
  };

  // Don't render anything until component is mounted to avoid hydration issues
  if (!isMounted) {
    return null;
  }

  return (
    <div className="fixed w-full z-50">
      <Navbar>
        {/* Desktop Navigation */}
        <NavBody>
          <h1 className="text-4xl font-extrabold">Testify</h1>
          <NavItems items={navItems} />
          <div className="flex items-center gap-4">
            {session ? (
              <>
                <span className="text-sm text-gray-700">
                  Welcome, {session.user?.name}
                </span>
                <NavbarButton variant="secondary" onClick={handleLogout}>
                  Logout
                </NavbarButton>
              </>
            ) : (
              <a href="/sign-in">
                <NavbarButton variant="secondary">Login</NavbarButton>
              </a>
            )}
            <NavbarButton variant="primary">Book a call</NavbarButton>
          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <h1 className="text-4xl font-extrabold">Testify</h1>
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {navItems.map((item, idx) => (
              <a
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className="relative text-neutral-600 dark:text-neutral-300"
              >
                <span className="block">{item.name}</span>
              </a>
            ))}
            <div className="flex w-full flex-col gap-4">
              {session ? (
                <>
                  <span className="text-sm text-gray-700 text-center py-2">
                    Welcome, {session.user?.name}
                  </span>
                  <NavbarButton
                    onClick={handleLogout}
                    variant="primary"
                    className="w-full"
                  >
                    Logout
                  </NavbarButton>
                </>
              ) : (
                <a href="/sign-in">
                  <NavbarButton
                    onClick={() => setIsMobileMenuOpen(false)}
                    variant="primary"
                    className="w-full"
                  >
                    Login
                  </NavbarButton>
                </a>
              )}
              <NavbarButton
                onClick={() => setIsMobileMenuOpen(false)}
                variant="primary"
                className="w-full"
              >
                Book a call
              </NavbarButton>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
    </div>
  );
}