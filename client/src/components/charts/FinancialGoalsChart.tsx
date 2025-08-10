
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Calendar, DollarSign } from 'lucide-react';

interface FinancialGoal {
  description: string;
  amount: number;
  timeToAchieve: number;
  monthlyRequired: number;
  feasibility: string;
}

interface FinancialGoalsChartProps {
  goals: FinancialGoal[];
}

const FinancialGoalsChart: React.FC<FinancialGoalsChartProps> = ({ goals }) => {
  const colors = ['#00F5FF', '#D946EF', '#F59E0B', '#10B981', '#8B5CF6', '#EF4444'];
  
  const pieData = goals.map((goal, index) => ({
    name: goal.description,
    value: goal.amount,
    color: colors[index % colors.length],
    timeToAchieve: goal.timeToAchieve,
    monthlyRequired: goal.monthlyRequired,
    feasibility: goal.feasibility
  }));

  const totalGoalAmount = goals.reduce((sum, goal) => sum + goal.amount, 0);

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, index }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const percentage = ((value / totalGoalAmount) * 100).toFixed(1);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${percentage}%`}
      </text>
    );
  };

  return (
    <Card className="cosmic-card">
      <CardHeader>
        <CardTitle className="font-orbitron text-xl text-cosmic-gradient flex items-center gap-2">
          <Target className="w-5 h-5 text-stellar-gold" />
          Financial Goals Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="#1A1A3A"
                  strokeWidth={2}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(26, 26, 58, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                  formatter={(value: number, name: string, props: any) => [
                    <div key="tooltip">
                      <div>{`₹${value.toLocaleString()}`}</div>
                      <div className="text-xs text-gray-300">
                        {`${props.payload.timeToAchieve} months to achieve`}
                      </div>
                      <div className="text-xs text-gray-300">
                        {`₹${props.payload.monthlyRequired.toLocaleString()}/month required`}
                      </div>
                      <div className={`text-xs ${props.payload.feasibility === 'High' ? 'text-green-400' : 
                        props.payload.feasibility === 'Medium' ? 'text-yellow-400' : 'text-red-400'}`}>
                        {`Feasibility: ${props.payload.feasibility}`}
                      </div>
                    </div>, 
                    name
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-orbitron text-lg text-neon-cyan mb-4">Goal Details</h4>
            {goals.map((goal, index) => (
              <div key={index} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                <div className="flex items-start gap-3">
                  <div 
                    className="w-4 h-4 rounded-full mt-1" 
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <div className="flex-1">
                    <h5 className="font-semibold text-white">{goal.description}</h5>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-gray-300">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        ₹{goal.amount.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {goal.timeToAchieve} months
                      </div>
                    </div>
                    <div className="mt-2 text-sm">
                      <span className="text-gray-400">Monthly Required: </span>
                      <span className="text-neon-cyan font-semibold">
                        ₹{goal.monthlyRequired.toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-1">
                      <span className="text-gray-400 text-sm">Feasibility: </span>
                      <span className={`text-sm font-semibold ${
                        goal.feasibility === 'High' ? 'text-green-400' : 
                        goal.feasibility === 'Medium' ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {goal.feasibility}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialGoalsChart;
