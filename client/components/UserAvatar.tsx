import React, { useState } from "react";
import { getMediaUrl } from "@/lib/api";

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  xs: "h-6 w-6 text-[10px] rounded-lg",
  sm: "h-8 w-8 text-xs rounded-xl",
  md: "h-11 w-11 text-sm rounded-2xl",
  lg: "h-14 w-14 text-lg rounded-2xl",
  xl: "h-16 w-16 text-xl rounded-2xl",
};

export default function UserAvatar({
  src,
  name,
  className = "",
  size = "md",
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);

  React.useEffect(() => {
    setImageError(false);
  }, [src]);

  const mediaUrl = src ? getMediaUrl(src) : null;
  const initial = name ? name.trim()[0].toUpperCase() : "U";

  if (mediaUrl && !imageError) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center overflow-hidden bg-slate-100 border border-slate-200/80 shadow-inner ${sizeClasses[size]} ${className}`}
      >
        <img
          src={mediaUrl}
          alt={name || "User Avatar"}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center font-extrabold bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-inner border border-blue-500/30 ${sizeClasses[size]} ${className}`}
    >
      {initial}
    </div>
  );
}
