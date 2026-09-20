"use client";

import { useBranch } from "@/contexts/BranchContext";

export default function Footer() {
  const { selectedBranch } = useBranch();
  return (
    <footer>
        {/* فوتر */}
        <div className="flex flex-col items-center border-t border-black/5 dark:border-white/10 px-5 py-3 mt-4">
        <p className="text-[12px] opacity-60">{selectedBranch?.name_fa || selectedBranch?.name_en}</p>
          <p className="text-center text-[11px] opacity-40">
            © {new Date().getFullYear()} Vatandar Restaurant
          </p>
        </div>
    </footer>
  );
}
