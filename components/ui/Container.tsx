import React from "react";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: "default" | "wide" | "narrow";
}

export const Container: React.FC<ContainerProps> = ({
  children,
  className = "",
  size = "default",
}) => {
  const sizeClasses = {
    default: "max-w-7xl",
    wide: "max-w-[1500px]",
    narrow: "max-w-4xl",
  };

  return (
    <div className={`mx-auto w-full px-4 sm:px-6 lg:px-8 ${sizeClasses[size]} ${className}`}>
      {children}
    </div>
  );
};
