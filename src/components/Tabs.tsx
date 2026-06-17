"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export type Tab = { id: string; label: string; content: React.ReactNode };

export default function Tabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0]?.id);
  const activeTab = tabs.find((t) => t.id === active) ?? tabs[0];

  return (
    <div>
      <div className="mb-5 flex gap-1 overflow-x-auto border-b border-white/10">
        {tabs.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`relative whitespace-nowrap px-4 py-2.5 text-sm transition-colors ${
                isActive ? "font-medium text-foreground" : "text-text-soft hover:text-foreground"
              }`}
            >
              {tab.label}
              {isActive && (
                <motion.span
                  layoutId="tab-underline"
                  className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand-green shadow-[0_0_10px_rgba(132,206,37,0.8)]"
                />
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab?.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab?.content}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
