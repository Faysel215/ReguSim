import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { TimeStepData } from '../types';

interface MarketChartProps {
  data: TimeStepData[];
}

const MarketChart: React.FC<MarketChartProps> = ({ data }) => {
  return (
    <div className="w-full h-full min-h-[300px] bg-slate-900/50 rounded-lg p-4 border border-slate-700">
      <h3 className="text-sm font-semibold text-slate-400 mb-4 tracking-wider uppercase">Market Indicators</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis 
            dataKey="time" 
            stroke="#94a3b8" 
            tick={{fontSize: 12}}
            label={{ value: 'Time (Steps)', position: 'insideBottomRight', offset: -5, fill: '#94a3b8', fontSize: 10 }} 
          />
          <YAxis 
            yAxisId="left" 
            stroke="#94a3b8" 
            domain={[0, 120]} 
            tick={{fontSize: 12}}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            stroke="#ef4444" 
            domain={[0, 100]} 
            tick={{fontSize: 12}}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f1f5f9' }}
            itemStyle={{ fontSize: '12px' }}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="sukukIndex" 
            stroke="#22d3ee" 
            strokeWidth={2} 
            name="Sukuk Index" 
            dot={false}
          />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="liquidity" 
            stroke="#10b981" 
            strokeWidth={2} 
            name="Liquidity" 
            dot={false}
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="systemicRisk" 
            stroke="#ef4444" 
            strokeWidth={2} 
            name="Systemic Risk" 
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MarketChart;