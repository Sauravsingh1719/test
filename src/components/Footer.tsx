// components/Footer.tsx
"use client";

import React from "react";
import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

function Footer() {
  return (
    <footer className="relative overflow-hidden">
      {/* Soft gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-100 via-slate-200 to-slate-300 dark:from-slate-900 dark:via-slate-950 dark:to-black" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/40 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-6 md:px-[10%] py-16 text-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 place-items-center">

          {/* Brand + Address */}
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Testify
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Reliable online tests for skills & learning. Simple. Fast. Secure.
            </p>

            <address className="not-italic mt-5 space-y-2 text-sm text-slate-700 dark:text-slate-300 flex flex-col items-center">
              <p className="flex items-start justify-center gap-2">
                <MapPin className="h-4 w-4 mt-0.5 opacity-80" />
                <span>
                  D-1, Vyapar Marg,<br />
                  Noida Sector 3, Noida,<br />
                  Uttar Pradesh, India - 201301
                </span>
              </p>
              <p className="flex items-center justify-center gap-2">
                <Mail className="h-4 w-4 opacity-80" />
                <a href="mailto:support@testify.com" className="hover:underline">
                  support@testify.com
                </a>
              </p>
              <p className="flex items-center justify-center gap-2">
                <Phone className="h-4 w-4 opacity-80" />
                <a href="tel:18002030577" className="hover:underline">
                  1800 203 0577
                </a>
              </p>
            </address>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/" className="hover:text-slate-900 dark:hover:text-white transition">Home</Link></li>
              <li><Link href="/test" className="hover:text-slate-900 dark:hover:text-white transition">Tests</Link></li>
              <li><Link href="/sign-in" className="hover:text-slate-900 dark:hover:text-white transition">Sign In</Link></li>
              <li><Link href="/support" className="hover:text-slate-900 dark:hover:text-white transition">Contact</Link></li>
            </ul>
          </div>

          {/* Explore */}
          <div>
            <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">
              Explore
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-slate-900 dark:hover:text-white transition">About Us</Link></li>
              <li><Link href="/pricing" className="hover:text-slate-900 dark:hover:text-white transition">Pricing</Link></li>
              <li><Link href="/privacy" className="hover:text-slate-900 dark:hover:text-white transition">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-slate-900 dark:hover:text-white transition">Terms & Conditions</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-slate-300/70 dark:border-slate-800">
          <p className="text-center text-sm text-slate-700 dark:text-slate-300">
            © {new Date().getFullYear()} Testify. All rights reserved.
          </p>

          <p className="mt-3 text-center text-sm font-medium text-slate-800 dark:text-slate-100 flex items-center justify-center gap-1">
            Made with <span className="text-red-600 animate-pulse">❤️</span> in India by{" "}
            <span className="font-semibold">Saurav</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
