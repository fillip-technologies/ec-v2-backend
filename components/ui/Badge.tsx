import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "brand" | "emerald" | "amber" | "outline" | "white";
  showDot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "brand",
  showDot = false,
  className = "",
}) => {
  const variantStyles = {
    brand: "bg-bgSoft border-borderSoft text-brand",
    emerald: "bg-successLight border-successBorder text-successDark",
    amber: "bg-warningLight border-warningBorder text-warningDark",
    outline: "bg-white border-borderSoft text-textPrimary",
    white: "bg-white/90 border-borderSoft text-textPrimary shadow-sm backdrop-blur-md",
  };

  const dotStyles = {
    brand: "bg-brand",
    emerald: "bg-success",
    amber: "bg-warningMuted",
    outline: "bg-brand",
    white: "bg-success",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-black uppercase tracking-[0.16em] ${variantStyles[variant]} ${className}`}
    >
      {showDot && (
        <span className={`h-2 w-2 rounded-full ${dotStyles[variant]} animate-pulse`} />
      )}
      {children}
    </span>
  );
};
