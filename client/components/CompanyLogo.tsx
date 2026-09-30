import React, { useState, useEffect } from "react";
import { getMediaUrl } from "@/lib/api";
import { Building2 } from "lucide-react";

interface CompanyLogoProps {
  src?: string | null;
  name?: string | null;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

const sizeMap = {
  xs: "h-7 w-7 text-xs rounded-lg",
  sm: "h-9 w-9 text-xs rounded-xl",
  md: "h-12 w-12 text-sm rounded-2xl",
  lg: "h-14 w-14 text-base rounded-2xl",
  xl: "h-16 w-16 text-lg rounded-3xl",
};

export default function CompanyLogo({
  src,
  name,
  className = "",
  size = "md",
}: CompanyLogoProps) {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [src]);

  const mediaUrl = src ? getMediaUrl(src) : null;
  const initial = name ? name.trim().slice(0, 2).toUpperCase() : "CO";

  if (mediaUrl && !error) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center overflow-hidden bg-white border border-slate-200/80 shadow-sm ${sizeMap[size]} ${className}`}
      >
        <img
          src={mediaUrl}
          alt={name || "Company Logo"}
          className="h-full w-full object-cover"
          onError={() => setError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center font-bold bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 border border-slate-300/60 shadow-inner ${sizeMap[size]} ${className}`}
    >
      {initial || <Building2 className="h-5 w-5 text-slate-400" />}
    </div>
  );
}
