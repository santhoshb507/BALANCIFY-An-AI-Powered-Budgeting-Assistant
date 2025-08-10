import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useState } from 'react';

interface SpendingChartProps {
  data: Record<string, number>;
  title: string;
  colors: string[];
}

export function SpendingChart({ data, title, colors }: SpendingChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  
  const categoryNames: Record<string, string> = {
    housing: 'Housing & Rent',
    food: 'Food & Dining',
    transportation: 'Transportation',
    entertainment: 'Entertainment',
    shopping: 'Shopping',
    subscriptions: 'Subscriptions',
    loans: 'Loans & EMIs',
    investments: 'Investments',
    savings: 'Savings',
    other: 'Other Expenses'
  };

  const chartData = Object.entries(data)
    .filter(([_, value]) => value > 0) // Only show categories with spending
    .map(([key, value], index) => ({
      name: categoryNames[key] || key.charAt(0).toUpperCase() + key.slice(1),
      shortName: key,
      value,
      color: colors[index % colors.length],
      percentage: (value / Object.values(data).reduce((sum, val) => sum + val, 0)) * 100
    }));

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent, name, value
  }: any) => {
    if (percent < 0.08) return null; // Hide labels for very small slices
    
    const radius = innerRadius + (outerRadius - innerRadius) * 0.7;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <g>
        <text 
          x={x} 
          y={y - 8} 
          fill="white" 
          textAnchor={x > cx ? 'start' : 'end'} 
          dominantBaseline="central"
          fontSize={11}
          fontWeight="bold"
          className="drop-shadow-lg"
        >
          {name.split(' ')[0]}
        </text>
        <text 
          x={x} 
          y={y + 8} 
          fill="#FFD700" 
          textAnchor={x > cx ? 'start' : 'end'} 
          dominantBaseline="central"
          fontSize={10}
          fontWeight="bold"
          className="drop-shadow-lg"
        >
          ₹{(value / 1000).toFixed(0)}k
        </text>
      </g>
    );
  };

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  return (
    <div className="w-full h-96">
      <h3 className="font-orbitron text-xl font-bold mb-4 text-center text-cosmic-gradient flex items-center justify-center">
        <span className="mr-2">💰</span>
        {title}
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={activeIndex !== null ? 120 : 110}
            innerRadius={30}
            fill="#8884d8"
            dataKey="value"
            stroke="#1A1A3A"
            strokeWidth={3}
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
                stroke={activeIndex === index ? '#FFD700' : entry.color}
                strokeWidth={activeIndex === index ? 4 : 2}
                style={{
                  filter: activeIndex === index ? 'brightness(1.2) drop-shadow(0 0 10px rgba(255, 215, 0, 0.5))' : 'none',
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(26, 26, 58, 0.95)',
              border: '2px solid rgba(0, 245, 255, 0.5)',
              borderRadius: '12px',
              color: '#ffffff',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(10px)'
            }}
            formatter={(value: number, name: string) => [
              <span className="font-mono text-stellar-gold">₹{value.toLocaleString()}</span>, 
              <span className="font-semibold">{name}</span>
            ]}
            labelFormatter={(label) => (
              <span className="font-orbitron text-neon-cyan font-bold">{label}</span>
            )}
          />
          <Legend
            wrapperStyle={{ 
              color: '#ffffff', 
              fontSize: '12px',
              paddingTop: '20px'
            }}
            iconType="circle"
            formatter={(value, entry: any) => (
              <span style={{ color: entry.color, fontWeight: 'bold' }}>
                {value} ({entry.payload.percentage.toFixed(1)}%)
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
