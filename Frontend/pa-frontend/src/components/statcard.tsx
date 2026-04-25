"use client";

import Image, { StaticImageData } from "next/image";

import React from "react";

interface InfoCardProps {
  iconSrc: string | StaticImageData;
  title: string; // Card title
  count: number | string; // Count or primary value
  description: string; // Secondary description text
  loading: boolean; // Indicates if the count is loading
}

const InfoCard: React.FC<InfoCardProps> = ({
  iconSrc,
  title,
  count,
  description,
  loading,
}) => {
  return (
    <div className="flex flex-col w-full rounded-lg border border-gray-300 bg-white shadow-sm p-6">
      {/* Icon and Title */}
      <div>
        <div className="flex items-center mb-2">
          <Image
            src={iconSrc}
            alt={title}
            width={24}
            height={24}
            className="mr-2"
          />
          <h2 className="text-sm font-medium text-gray-700">{title}</h2>
        </div>
        {/* Count */}
        <div className="text-4xl font-bold text-gray-900">
          {loading ? (
            <div className="w-16 h-10 bg-gray-200 rounded animate-pulse" />
          ) : (
            count
          )}
        </div>
        {/* Description */}
        <p className="text-sm text-gray-500 mt-2">{description}</p>
      </div>
    </div>
  );
};

export default InfoCard;
