'use client';
import React from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
} from 'recharts';

interface Co2ChartProps {
  data: { month: string; co2: number }[];
}

export default function Co2Chart({ data }: Co2ChartProps) {
  const safeData = data ?? [];
  if (safeData.length === 0) {
    return <div className="h-full flex items-center justify-center text-gray-400 text-sm">Sin datos disponibles</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={safeData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
        <defs>
          <linearGradient id="co2Gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="month"
          tickLine={false}
          tick={{ fontSize: 10 }}
          interval="preserveStartEnd"
          label={{ value: 'Mes', position: 'insideBottom', offset: -15, style: { textAnchor: 'middle', fontSize: 11 } }}
        />
        <YAxis
          tickLine={false}
          tick={{ fontSize: 10 }}
          label={{ value: 'kg CO₂', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 11 } }}
        />
        <Tooltip
          contentStyle={{ fontSize: 11 }}
        />
        <Area
          type="monotone"
          dataKey="co2"
          stroke="#22c55e"
          strokeWidth={2}
          fill="url(#co2Gradient)"
          name="CO₂ (kg)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
