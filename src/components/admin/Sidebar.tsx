'use client'
import React, { useState } from 'react';
import Button from '../button';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigationItems = [
    { label: 'Home', href: '/admin' },
    { label: 'Teacher', href: '/admin/teacher' },
    { label: 'Students', href: '/admin/students' },
    { label: 'Category', href: '/admin/category' },
    { label: 'Tests', href: '/admin/tests' },
  ];

  return (
    <>
      {/* Desktop Sidebar (visible on lg+) */}
      <motion.nav
        className="hidden lg:flex flex-col fixed left-0 top-0 h-full bg-blue-300 w-64 z-50 p-4"
        initial={{ x: 0 }}
      >
        <h1 className="font-extrabold text-4xl mb-8">LOGO</h1>
        <ul className="flex flex-col gap-4 py-10">
          {navigationItems.map(item => (
            <li key={item.label}>
              <Button className="w-full text-left">{item.label}</Button>
            </li>
          ))}
        </ul>
      </motion.nav>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 h-12 w-12 rounded-full bg-blue-300 hover:bg-blue-400"
        aria-label="Toggle menu"
      >
        {/* icon spans... */}
        <motion.span
          animate={isOpen ? { rotate: 45, top: '50%' } : { rotate: 0, top: '35%' }}
          className="absolute h-1 w-10 bg-white"
          style={{ top: '35%', left: '50%', transform: 'translateX(-50%)' }}
        />
        <motion.span
          animate={isOpen ? { rotate: -45 } : { rotate: 0 }}
          className="absolute h-1 w-10 bg-white"
          style={{ top: '50%', left: '50%', transform: 'translateX(-50%)' }}
        />
        <motion.span
          animate={isOpen ? { rotate: 45, bottom: '50%', width: '40px', left: '50%' } : { rotate: 0, bottom: '35%', width: '20px', left: 'calc(50% + 10px)' }}
          className="absolute h-1 bg-white"
          style={{ bottom: '35%', left: 'calc(50% + 10px)', transform: 'translateX(-50%)' }}
        />
      </button>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 lg:hidden z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween' }}
              className="fixed top-0 left-0 h-full w-64 bg-blue-300 z-50 p-4 lg:hidden"
            >
              <h1 className="font-extrabold text-4xl mb-8">LOGO</h1>
              <ul className="flex flex-col gap-4">
                {navigationItems.map(item => (
                  <li key={item.label}>
                    <Button 
                      className="w-full text-left"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </Button>
                  </li>
                ))}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;