import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useState } from 'react';

interface NeedWantChartProps {
  needsPercentage: number;
  wantsPercentage: number;
}

export function NeedWantChart({ needsPercentage, wantsPercentage }: NeedWantChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  
  const data = [
    { 
      name: 'Essential Needs', 
      value: needsPercentage, 
      color: '#10B981',
      description: 'Housing, Food, Transportation'
    },
    { 
      name: 'Lifestyle Wants', 
      value: wantsPercentage, 
      color: '#EF4444',
      description: 'Entertainment, Shopping, Subscriptions'
    },
  ];

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent, name
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <g>
        <text 
          x={x} 
          y={y - 10} 
          fill="white" 
          textAnchor={x > cx ? 'start' : 'end'} 
          dominantBaseline="central"
          fontSize={14}
          fontWeight="bold"
          className="drop-shadow-lg"
        >
          {name.split(' ')[0]}
        </text>
        <text 
          x={x} 
          y={y + 10} 
          fill="#FFD700" 
          textAnchor={x > cx ? 'start' : 'end'} 
          dominantBaseline="central"
          fontSize={16}
          fontWeight="bold"
          className="drop-shadow-lg"
        >
          {`${(percent * 100).toFixed(0)}%`}
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
        <span className="mr-2">⚖️</span>
        Needs vs Wants Analysis
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={activeIndex !== null ? 120 : 110}
            innerRadius={40}
            fill="#8884d8"
            dataKey="value"
            stroke="#1A1A3A"
            strokeWidth={4}
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
                stroke={activeIndex === index ? '#FFD700' : entry.color}
                strokeWidth={activeIndex === index ? 5 : 3}
                style={{
                  filter: activeIndex === index ? 'brightness(1.3) drop-shadow(0 0 15px rgba(255, 215, 0, 0.6))' : 'none',
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
            formatter={(value: number, name: string, props: any) => [
              <div key="tooltip-content">
                <div className="font-mono text-stellar-gold text-lg font-bold">{value}%</div>
                <div className="text-gray-300 text-sm mt-1">{props.payload.description}</div>
              </div>,
              <span className="font-orbitron text-neon-cyan font-bold">{name}</span>
            ]}
          />
          <Legend
            wrapperStyle={{ 
              color: '#ffffff', 
              fontSize: '14px',
              paddingTop: '20px'
            }}
            iconType="circle"
            formatter={(value, entry: any) => (
              <span style={{ color: entry.color, fontWeight: 'bold', fontSize: '14px' }}>
                {value} ({entry.payload.value}%)
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
