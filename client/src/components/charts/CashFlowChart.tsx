import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useState } from 'react';

interface CashFlowChartProps {
  income: number;
  expenses: number;
  investments: number;
  savings: number;
}

export function CashFlowChart({ income, expenses, investments, savings }: CashFlowChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  
  const data = [
    {
      name: 'Monthly Income',
      shortName: 'Income',
      amount: income,
      color: '#10B981',
      icon: '💰',
      description: 'Total monthly earnings'
    },
    {
      name: 'Total Expenses',
      shortName: 'Expenses',
      amount: expenses,
      color: '#EF4444',
      icon: '💸',
      description: 'All monthly spending'
    },
    {
      name: 'Investments',
      shortName: 'Investments',
      amount: investments,
      color: '#D946EF',
      icon: '📈',
      description: 'Investment allocations'
    },
    {
      name: 'Net Savings',
      shortName: 'Savings',
      amount: savings,
      color: '#00F5FF',
      icon: '🏦',
      description: 'Money saved each month'
    },
  ];

  return (
    <div className="w-full h-96">
      <h3 className="font-orbitron text-xl font-bold mb-4 text-center text-cosmic-gradient flex items-center justify-center">
        <span className="mr-2">📊</span>
        Cash Flow Analysis
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data} 
          margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
          onMouseMove={(e) => {
            if (e && e.activeTooltipIndex !== undefined) {
              setActiveIndex(e.activeTooltipIndex);
            }
          }}
          onMouseLeave={() => setActiveIndex(null)}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#374151" 
            strokeOpacity={0.3}
          />
          <XAxis 
            dataKey="shortName" 
            stroke="#E5E7EB"
            fontSize={12}
            fontWeight="bold"
            tick={{ fill: '#E5E7EB' }}
            tickFormatter={(value, index) => {
              const item = data[index];
              return `${item?.icon || ''} ${value}`;
            }}
          />
          <YAxis 
            stroke="#E5E7EB"
            fontSize={11}
            fontWeight="bold"
            tick={{ fill: '#E5E7EB' }}
            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(26, 26, 58, 0.95)',
              border: '2px solid rgba(0, 245, 255, 0.5)',
              borderRadius: '12px',
              color: '#ffffff',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(10px)'
            }}
            formatter={(value: number, name: string, props: any) => [
              <div key="tooltip-content">
                <div className="font-mono text-stellar-gold text-lg font-bold">
                  ₹{value.toLocaleString()}
                </div>
                <div className="text-gray-300 text-sm mt-1">
                  {props.payload.description}
                </div>
              </div>,
              <span className="font-orbitron text-neon-cyan font-bold">
                {props.payload.icon} {props.payload.name}
              </span>
            ]}
          />
          <Bar 
            dataKey="amount" 
            radius={[8, 8, 0, 0]}
            stroke="#1A1A3A"
            strokeWidth={2}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
                stroke={activeIndex === index ? '#FFD700' : entry.color}
                strokeWidth={activeIndex === index ? 3 : 1}
                style={{
                  filter: activeIndex === index ? 'brightness(1.2) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))' : 'none',
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
