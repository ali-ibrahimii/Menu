"use client";

import { ReactNode } from "react";

interface HeaderProps {
  leftElement?: ReactNode;
  rightElement?: ReactNode;
}

export default function Header({ leftElement, rightElement }: HeaderProps) {
  return (
    <div className="relative z-10 dark:text-white pt-8 px-4">
      <div className="flex justify-between px-2 items-center mb-4">
        {leftElement}
        {rightElement}
      </div>
    </div>
  );
}