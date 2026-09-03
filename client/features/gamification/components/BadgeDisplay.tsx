"use client";

import { Shield, Star, Award, Zap } from "lucide-react";

interface BadgeDisplayProps {
  badgeName: string;
  size?: "sm" | "md" | "lg";
}

export function BadgeDisplay({ badgeName, size = "md" }: BadgeDisplayProps) {
  const iconProps = {
    className: `
      ${size === "sm" ? "w-4 h-4" : size === "md" ? "w-8 h-8" : "w-12 h-12"}
    `
  };

  switch (badgeName) {
    case "Civic Starter":
      return <div className="text-blue-500 bg-blue-50 p-2 rounded-full"><Star {...iconProps} /></div>;
    case "Neighborhood Watch":
      return <div className="text-purple-500 bg-purple-50 p-2 rounded-full"><Shield {...iconProps} /></div>;
    case "City Guardian":
      return <div className="text-yellow-600 bg-yellow-50 p-2 rounded-full"><Award {...iconProps} /></div>;
    default:
      return <div className="text-gray-500 bg-gray-50 p-2 rounded-full"><Zap {...iconProps} /></div>;
  }
}
