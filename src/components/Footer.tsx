// components/Footer.tsx
import React from "react";

function Footer() {
  return (
    <footer className="bg-slate-300 text-slate-900 py-[8%]">
      <div className="max-w-7xl mx-auto px-6 md:px-[10%] py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand + Address */}
          <div>
            <h2 className="text-3xl font-extrabold mb-3">Testify</h2>
            <address className="not-italic text-sm leading-relaxed">
              D-1, Vyapar Marg,<br />
              Noida Sector 3, Noida,<br />
              Uttar Pradesh, India - 201301
            </address>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="hover:underline">Home</a></li>
              <li><a href="/test" className="hover:underline">Tests</a></li>
              <li><a href="/sign-in" className="hover:underline">Sign In</a></li>
              <li><a href="/support" className="hover:underline">Contact</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Contact</h3>
            <p className="text-sm">
              support@testify.com<br />
              Toll Free: 1800 203 0577
            </p>
            <p className="text-xs mt-3 text-muted-foreground">
              Office Hours: 10 AM to 7 PM (all 7 days)
            </p>
          </div>
        </div>

        <div className="border-t border-slate-200 mt-8 pt-6 text-center text-sm text-slate-700">
          © {new Date().getFullYear()} Testify. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
