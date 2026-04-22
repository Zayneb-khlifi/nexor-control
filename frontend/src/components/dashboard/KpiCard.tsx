// src/components/dashboard/KpiCard.tsx
import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface KpiCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  color: string;
  trend?: { value: number; isPositive: boolean };
  onClick?: () => void;
  subtitle?: string;
  loading?: boolean;
}

const colorClasses: Record<string, { bg: string; light: string; dark: string }> = {
  "from-blue-500 to-blue-600": { bg: "bg-blue-500", light: "bg-blue-100", dark: "bg-blue-900/20" },
  "from-green-500 to-green-600": { bg: "bg-green-500", light: "bg-green-100", dark: "bg-green-900/20" },
  "from-purple-500 to-purple-600": { bg: "bg-purple-500", light: "bg-purple-100", dark: "bg-purple-900/20" },
  "from-orange-500 to-orange-600": { bg: "bg-orange-500", light: "bg-orange-100", dark: "bg-orange-900/20" },
  "from-red-500 to-red-600": { bg: "bg-red-500", light: "bg-red-100", dark: "bg-red-900/20" },
  "from-yellow-500 to-yellow-600": { bg: "bg-yellow-500", light: "bg-yellow-100", dark: "bg-yellow-900/20" },
};

export default function KpiCard({ title, value, icon, color, trend, onClick, subtitle, loading }: KpiCardProps) {
  const colors = colorClasses[color] || colorClasses["from-blue-500 to-blue-600"];
  
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 animate-pulse">
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer group ${onClick ? "cursor-pointer" : ""}`}
    >
      <div className={`h-1 bg-gradient-to-r ${color}`} />
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-2 sm:p-3 rounded-lg ${colors.light} dark:${colors.dark}`}>
            <div className="w-5 h-5 sm:w-6 sm:h-6">{icon}</div>
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-xs sm:text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </div>
          )}
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-medium">{title}</p>
        <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white mt-1">{value}</p>
        {subtitle && <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">{subtitle}</p>}
      </div>
    </motion.div>
  );
}