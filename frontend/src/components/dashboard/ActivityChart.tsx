// src/components/dashboard/ActivityChart.tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

interface ActivityChartProps {
  data: Array<{ date: string; commandes: number; robots: number }>;
  type?: "bar" | "line";
}

export default function ActivityChart({ data, type = "bar" }: ActivityChartProps) {
  const ChartComponent = type === "bar" ? BarChart : LineChart;
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Activité quotidienne</h3>
      <ResponsiveContainer width="100%" height={300}>
        <ChartComponent data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="commandes" fill="#3B82F6" name="Commandes" />
          <Bar dataKey="robots" fill="#10B981" name="Robots actifs" />
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
}