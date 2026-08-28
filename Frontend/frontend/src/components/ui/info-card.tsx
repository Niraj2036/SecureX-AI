import React from "react";

export type InfoCardVariant = "info" | "success" | "warning" | "error";

interface InfoCardProps {
  variant?: InfoCardVariant;
  className?: string;
  children: React.ReactNode;
}

const VARIANT_STYLES: Record<InfoCardVariant, string> = {
  info:    "text-blue-600 bg-blue-50 border-blue-100",
  success: "text-green-600 bg-green-50 border-green-100",
  warning: "text-yellow-600 bg-yellow-50 border-yellow-100",
  error:   "text-red-600 bg-red-50 border-red-100",
};

export const InfoCard: React.FC<InfoCardProps> = ({
  variant = "info",
  className = "",
  children,
}) => (
  <div
    className={`p-2 mb-2 text-sm rounded border ${VARIANT_STYLES[variant]} ${className}`}
  >
    {children}
  </div>
);

export default InfoCard;