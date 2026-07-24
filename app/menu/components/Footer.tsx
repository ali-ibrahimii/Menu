"use client";

import { useBranch } from "@/contexts/BranchContext";

export default function Footer() {
  const { selectedBranch } = useBranch();
  return (
    <footer>
      <div className="text-center dark:text-gray-200 text-sm py-6 mt-6 opacity-70">
        <p>{selectedBranch?.name_fa || selectedBranch?.name_en}</p>© 2025
        Vatandar Restaurant
      </div>
    </footer>
  );
}
