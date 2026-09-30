import React, { useState, useEffect } from "react";
import { getMediaUrl } from "@/lib/api";
import { ShoppingBag } from "lucide-react";

interface ProductCoverProps {
  src?: string | null;
  title?: string | null;
  category?: string | null;
  className?: string;
}

export default function ProductCover({
  src,
  title,
  category,
  className = "",
}: ProductCoverProps) {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [src]);

  const mediaUrl = src ? getMediaUrl(src) : null;

  if (mediaUrl && !error) {
    return (
      <img
        src={mediaUrl}
        alt={title || "Product Cover"}
        className={`h-full w-full object-cover transition duration-300 ${className}`}
        onError={() => setError(true)}
      />
    );
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-blue-50/80 to-slate-100 p-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100/80 text-blue-600 mb-2 shadow-inner">
        <ShoppingBag className="h-6 w-6" />
      </div>
      <span className="text-xs font-bold text-slate-700 line-clamp-1">{category || "Digital Product"}</span>
    </div>
  );
}
