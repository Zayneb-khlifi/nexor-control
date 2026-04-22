// src/components/common/Skeleton.tsx
import { motion } from "framer-motion";

interface SkeletonProps {
  variant?: "text" | "circular" | "rectangular" | "card";
  width?: string | number;
  height?: string | number;
  className?: string;
  count?: number;
  size?: number; // Ajout de la propriété size
}

const SkeletonBase = ({ width, height, className = "" }: { width?: string | number; height?: string | number; className?: string }) => (
  <div
    className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
    style={{ width: width || "100%", height: height || "1rem" }}
  />
);

export const SkeletonText = ({ width, height, className }: SkeletonProps) => (
  <SkeletonBase width={width} height={height} className={`rounded ${className}`} />
);

export const SkeletonCircular = ({ size = 40, className }: SkeletonProps) => (
  <SkeletonBase width={size} height={size} className={`rounded-full ${className}`} />
);

export const SkeletonRectangular = ({ width, height, className }: SkeletonProps) => (
  <SkeletonBase width={width} height={height} className={`rounded-lg ${className}`} />
);

export const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
    <div className="flex items-center gap-4 mb-4">
      <SkeletonCircular size={48} />
      <div className="flex-1">
        <SkeletonText width="60%" height={16} />
        <SkeletonText width="40%" height={12} className="mt-2" />
      </div>
    </div>
    <SkeletonText width="100%" height={12} />
    <SkeletonText width="80%" height={12} className="mt-2" />
    <div className="flex gap-2 mt-4">
      <SkeletonRectangular width="30%" height={32} />
      <SkeletonRectangular width="30%" height={32} />
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
    <div className="p-4 border-b dark:border-gray-700">
      <SkeletonText width="200px" height={24} />
    </div>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-6 py-3">
                <SkeletonText width={60} height={12} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i}>
              {Array.from({ length: columns }).map((_, j) => (
                <td key={j} className="px-6 py-4">
                  <SkeletonText width={j === 2 ? 120 : 80} height={14} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export const SkeletonDashboard = () => (
  <div className="space-y-6">
    {/* KPI Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-start mb-4">
            <SkeletonCircular size={48} />
            <SkeletonText width={40} height={20} />
          </div>
          <SkeletonText width="60%" height={14} className="mb-2" />
          <SkeletonText width="40%" height={28} />
        </div>
      ))}
    </div>
    {/* Chart */}
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <SkeletonText width="30%" height={20} className="mb-4" />
      <SkeletonRectangular height={300} />
    </div>
  </div>
);

export default SkeletonBase;