
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, ComposedChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, Clock, TrendingUp, DollarSign, Calendar, Eye, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { FinancialGoal } from '@/types/financial';

interface FinancialGoalsChartProps {
  goals: FinancialGoal[];
  monthlySavings: number;
  className?: string;
}

const FinancialGoalsChart: React.FC<FinancialGoalsChartProps> = ({
  goals,
  monthlySavings,
  className = ""
}) => {
  const [viewMode, setViewMode] = useState<'progress' | 'timeline' | 'priority'>('progress');

  const categoryColors: Record<string, string> = {
    emergency: '#EF4444',
    investment: '#8B5CF6', 
    purchase: '#F59E0B',
    retirement: '#10B981',
    education: '#3B82F6',
    other: '#6B7280'
  };

  const priorityColors: Record<string, string> = {
    high: '#EF4444',
    medium: '#F59E0B', 
    low: '#10B981'
  };

  // Prepare data for different chart views
  const progressData = goals.map(goal => ({
    ...goal,
    progress: (goal.currentAmount / goal.targetAmount) * 100,
    remaining: goal.targetAmount - goal.currentAmount,
    monthsToGoal: Math.ceil((goal.targetAmount - goal.currentAmount) / monthlySavings)
  }));

  const timelineData = goals.map((goal, index) => {
    const monthsToGoal = Math.ceil((goal.targetAmount - goal.currentAmount) / monthlySavings);
    const projectedData = [];
    
    for (let month = 0; month <= Math.min(monthsToGoal, 36); month++) {
      const projectedAmount = goal.currentAmount + (monthlySavings * month);
      projectedData.push({
        month: `Month ${month}`,
        [`goal_${index}`]: Math.min(projectedAmount, goal.targetAmount),
        target: goal.targetAmount,
        goalName: goal.description
      });
    }
    return projectedData;
  }).flat();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="cosmic-card p-4 border border-neon-cyan/30 backdrop-blur-md">
          <p className="font-orbitron text-neon-cyan font-semibold mb-2">{label}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">{entry.dataKey}:</span>
                <span className="font-mono text-neon-cyan">₹{entry.value?.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    switch (viewMode) {
      case 'progress':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={progressData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="description" 
                stroke="#E5E7EB"
                fontSize={12}
                tick={{ fill: '#E5E7EB' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                stroke="#E5E7EB"
                fontSize={12}
                tick={{ fill: '#E5E7EB' }}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="currentAmount" 
                fill="#00F5FF" 
                name="Current Amount"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="remaining" 
                fill="#374151" 
                name="Remaining Amount"
                radius={[4, 4, 0, 0]}
                opacity={0.3}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'timeline':
        const uniqueMonths = [...new Set(timelineData.map(d => d.month))];
        const consolidatedTimeline = uniqueMonths.map(month => {
          const monthData = timelineData.filter(d => d.month === month);
          const result: any = { month };
          monthData.forEach((data, index) => {
            Object.keys(data).forEach(key => {
              if (key.startsWith('goal_')) {
                result[key] = data[key];
              }
            });
          });
          return result;
        });

        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={consolidatedTimeline} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="month" 
                stroke="#E5E7EB"
                fontSize={12}
                tick={{ fill: '#E5E7EB' }}
              />
              <YAxis 
                stroke="#E5E7EB"
                fontSize={12}
                tick={{ fill: '#E5E7EB' }}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              {goals.map((goal, index) => (
                <Line
                  key={index}
                  type="monotone"
                  dataKey={`goal_${index}`}
                  stroke={Object.values(categoryColors)[index % Object.values(categoryColors).length]}
                  strokeWidth={3}
                  dot={{ fill: Object.values(categoryColors)[index % Object.values(categoryColors).length], r: 4 }}
                  name={goal.description}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'priority':
        const priorityData = goals.map(goal => ({
          name: goal.description.substring(0, 20) + '...',
          value: goal.targetAmount,
          priority: goal.priority,
          progress: (goal.currentAmount / goal.targetAmount) * 100,
          category: goal.category
        }));

        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={priorityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, progress }) => 
                  `${name}: ₹${(value / 1000).toFixed(0)}k (${progress.toFixed(0)}%)`
                }
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {priorityData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={priorityColors[entry.priority]} 
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Target Amount']}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return <div>Select a view mode</div>;
    }
  };

  // Calculate summary metrics
  const totalTargetAmount = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalCurrentAmount = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const overallProgress = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;
  const highPriorityGoals = goals.filter(goal => goal.priority === 'high').length;

  return (
    <Card className={`cosmic-card ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-orbitron text-xl text-cosmic-gradient flex items-center gap-2">
              <Target className="w-5 h-5 text-stellar-gold" />
              Financial Goals Tracker
            </CardTitle>
            <p className="text-sm text-gray-400 mt-1">Monitor progress towards your financial objectives</p>
          </div>
          
          <div className="flex gap-2">
            {[
              { mode: 'progress' as const, icon: BarChart3, label: 'Progress' },
              { mode: 'timeline' as const, icon: Clock, label: 'Timeline' },
              { mode: 'priority' as const, icon: PieChartIcon, label: 'Priority' },
            ].map(({ mode, icon: Icon, label }) => (
              <Button
                key={mode}
                size="sm"
                variant={viewMode === mode ? "default" : "outline"}
                onClick={() => setViewMode(mode)}
                className={`cosmic-button px-3 py-1 ${viewMode === mode ? 'bg-neon-cyan text-slate-900' : 'border-neon-cyan text-neon-cyan'}`}
              >
                <Icon className="w-4 h-4" />
              </Button>
            ))}
          </div>
        </div>
        
        {/* Summary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <div className="text-center p-3 rounded-lg bg-gradient-to-br from-slate-800/50 to-slate-700/50">
            <div className="text-xs text-gray-400 mb-1">Total Goals</div>
            <div className="font-mono text-lg text-neon-cyan">{goals.length}</div>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-gradient-to-br from-slate-800/50 to-slate-700/50">
            <div className="text-xs text-gray-400 mb-1">Overall Progress</div>
            <div className="font-mono text-lg text-cosmic-purple">{overallProgress.toFixed(1)}%</div>
            <Progress value={overallProgress} className="mt-1 h-1" />
          </div>
          
          <div className="text-center p-3 rounded-lg bg-gradient-to-br from-slate-800/50 to-slate-700/50">
            <div className="text-xs text-gray-400 mb-1">Target Amount</div>
            <div className="font-mono text-sm text-stellar-gold">₹{(totalTargetAmount / 100000).toFixed(1)}L</div>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-gradient-to-br from-slate-800/50 to-slate-700/50">
            <div className="text-xs text-gray-400 mb-1">High Priority</div>
            <div className="font-mono text-lg text-nebula-pink">{highPriorityGoals}</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {goals.length === 0 ? (
          <div className="text-center py-12">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-orbitron text-lg text-gray-400 mb-2">No Financial Goals Set</h3>
            <p className="text-gray-500 text-sm">Add your financial goals to track progress and get insights</p>
          </div>
        ) : (
          <>
            {/* Chart */}
            <div className="mb-6">
              {renderChart()}
            </div>

            {/* Goals List */}
            <div className="space-y-4">
              <h4 className="font-orbitron text-lg text-neon-cyan mb-4">Goal Details</h4>
              {progressData.map((goal, index) => (
                <div key={goal.id} className="p-4 bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-lg border border-slate-600">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: categoryColors[goal.category] }} />
                      <h5 className="font-orbitron text-md text-cosmic-gradient">{goal.description}</h5>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`border-${goal.priority === 'high' ? 'nebula-pink' : goal.priority === 'medium' ? 'stellar-gold' : 'aurora-green'} text-${goal.priority === 'high' ? 'nebula-pink' : goal.priority === 'medium' ? 'stellar-gold' : 'aurora-green'}`}>
                        {goal.priority.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="border-neon-cyan text-neon-cyan">
                        {goal.category.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-400 mb-1">Current</div>
                      <div className="font-mono text-neon-cyan">₹{goal.currentAmount.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 mb-1">Target</div>
                      <div className="font-mono text-stellar-gold">₹{goal.targetAmount.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 mb-1">Progress</div>
                      <div className="font-mono text-cosmic-purple">{goal.progress.toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-gray-400 mb-1">Est. Time</div>
                      <div className="font-mono text-aurora-green">{goal.monthsToGoal}mo</div>
                    </div>
                  </div>
                  
                  <Progress value={goal.progress} className="mt-3 h-2" />
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default FinancialGoalsChart;
