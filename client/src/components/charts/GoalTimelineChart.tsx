import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, ComposedChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, Calendar, TrendingUp, Zap, Clock, CheckCircle } from 'lucide-react';

interface GoalTimelineData {
  month: string;
  currentProgress: number;
  projectedProgress: number;
  simulatedProgress: number;
  goalTarget: number;
  milestone?: string;
  achievementDate?: string;
}

interface GoalTimelineChartProps {
  data: GoalTimelineData[];
  goalName: string;
  targetAmount: number;
  currentAmount: number;
  projectedDate: string;
  simulatedDate?: string;
  isSimulating?: boolean;
  className?: string;
}

const GoalTimelineChart: React.FC<GoalTimelineChartProps> = ({
  data,
  goalName,
  targetAmount,
  currentAmount,
  projectedDate,
  simulatedDate,
  isSimulating = false,
  className = ""
}) => {
  const [viewMode, setViewMode] = useState<'timeline' | 'progress' | 'comparison'>('timeline');
  const [highlightedMilestone, setHighlightedMilestone] = useState<string | null>(null);
  const [animationFrame, setAnimationFrame] = useState(0);

  useEffect(() => {
    if (isSimulating) {
      const timer = setInterval(() => {
        setAnimationFrame(prev => (prev + 1) % 360);
      }, 100);
      return () => clearInterval(timer);
    }
  }, [isSimulating]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="cosmic-card p-4 border border-neon-cyan/30 backdrop-blur-md">
          <p className="font-orbitron text-neon-cyan font-semibold mb-2">{label}</p>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Current:</span>
              <span className="font-mono text-neon-cyan">₹{data.currentProgress?.toLocaleString()}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Projected:</span>
              <span className="font-mono text-cosmic-purple">₹{data.projectedProgress?.toLocaleString()}</span>
            </div>
            
            {data.simulatedProgress && (
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Simulated:</span>
                <span className="font-mono text-aurora-green">₹{data.simulatedProgress?.toLocaleString()}</span>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Target:</span>
              <span className="font-mono text-stellar-gold">₹{data.goalTarget?.toLocaleString()}</span>
            </div>
            
            {data.milestone && (
              <div className="border-t border-gray-600 pt-2">
                <p className="text-xs text-aurora-green">🎯 {data.milestone}</p>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    switch (viewMode) {
      case 'timeline':
        return (
          <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
            
            {/* Goal Target Line */}
            <ReferenceLine 
              y={targetAmount} 
              stroke="#FFD700" 
              strokeDasharray="8 4" 
              strokeWidth={2}
              label={{ value: "Goal Target", position: "top", fill: "#FFD700" }}
            />
            
            {/* Current Progress */}
            <Line 
              type="monotone" 
              dataKey="currentProgress" 
              stroke="#00F5FF" 
              strokeWidth={3}
              dot={{ fill: '#00F5FF', strokeWidth: 2, r: 4 }}
              name="Current Progress"
            />
            
            {/* Projected Progress */}
            <Line 
              type="monotone" 
              dataKey="projectedProgress" 
              stroke="#8B5CF6" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 3 }}
              name="Projected Progress"
            />
            
            {/* Simulated Progress with Animation */}
            {data.some(d => d.simulatedProgress) && (
              <Line 
                type="monotone" 
                dataKey="simulatedProgress" 
                stroke="#00FF7F" 
                strokeWidth={3}
                dot={{ 
                  fill: '#00FF7F', 
                  strokeWidth: 2, 
                  r: isSimulating ? 5 : 4,
                  style: {
                    filter: isSimulating ? 'drop-shadow(0 0 8px #00FF7F)' : 'none'
                  }
                }}
                name="Simulated Progress"
                animationDuration={1500}
              />
            )}
          </ComposedChart>
        );

      case 'progress':
        const progressData = data.map(item => ({
          ...item,
          currentPercent: (item.currentProgress / targetAmount) * 100,
          projectedPercent: (item.projectedProgress / targetAmount) * 100,
          simulatedPercent: item.simulatedProgress ? (item.simulatedProgress / targetAmount) * 100 : 0
        }));

        return (
          <ComposedChart data={progressData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
              tickFormatter={(value) => `${value}%`}
              domain={[0, 120]}
            />
            <Tooltip 
              formatter={(value: number, name: string) => [
                `${value.toFixed(1)}%`,
                name.replace('Percent', ' Progress')
              ]}
            />
            
            <ReferenceLine y={100} stroke="#FFD700" strokeDasharray="8 4" strokeWidth={2} />
            
            <Area
              type="monotone"
              dataKey="currentPercent"
              stroke="#00F5FF"
              fill="url(#currentGradient)"
              strokeWidth={2}
            />
            
            <Line 
              type="monotone" 
              dataKey="projectedPercent" 
              stroke="#8B5CF6" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 3 }}
            />
            
            {data.some(d => d.simulatedProgress) && (
              <Line 
                type="monotone" 
                dataKey="simulatedPercent" 
                stroke="#00FF7F" 
                strokeWidth={3}
                dot={{ fill: '#00FF7F', strokeWidth: 2, r: 4 }}
              />
            )}
            
            <defs>
              <linearGradient id="currentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00F5FF" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#00F5FF" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
          </ComposedChart>
        );

      case 'comparison':
        const comparisonData = data.map(item => ({
          ...item,
          timeSaved: item.simulatedProgress && item.projectedProgress 
            ? Math.max(0, item.simulatedProgress - item.projectedProgress)
            : 0
        }));

        return (
          <ComposedChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
            
            <Area
              type="monotone"
              dataKey="timeSaved"
              stroke="#00FF7F"
              fill="url(#improvementGradient)"
              strokeWidth={2}
            />
            
            <defs>
              <linearGradient id="improvementGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00FF7F" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#00FF7F" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
          </ComposedChart>
        );

      default:
        return <div>Invalid view mode</div>;
    }
  };

  // Calculate key metrics
  const currentProgress = (currentAmount / targetAmount) * 100;
  const remainingAmount = targetAmount - currentAmount;
  const monthsToGoal = simulatedDate 
    ? new Date(simulatedDate).getMonth() - new Date().getMonth()
    : new Date(projectedDate).getMonth() - new Date().getMonth();
  const timeSaved = simulatedDate 
    ? (new Date(projectedDate).getTime() - new Date(simulatedDate).getTime()) / (1000 * 60 * 60 * 24 * 30)
    : 0;

  return (
    <Card className={`cosmic-card transform-3d transition-all duration-500 hover:scale-105 ${className} ${isSimulating ? 'animate-glow' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-orbitron text-xl text-cosmic-gradient flex items-center gap-2">
              <Target className="w-5 h-5 text-stellar-gold" />
              {goalName} Timeline
              {isSimulating && <Zap className="w-4 h-4 text-stellar-gold animate-pulse" />}
            </CardTitle>
            <p className="text-sm text-gray-400 mt-1">Track your progress towards financial goals</p>
          </div>
          
          <div className="flex gap-2">
            {[
              { mode: 'timeline' as const, icon: Calendar, label: 'Timeline' },
              { mode: 'progress' as const, icon: TrendingUp, label: 'Progress' },
              { mode: 'comparison' as const, icon: CheckCircle, label: 'Compare' },
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
        
        {/* Goal Status */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <div className="text-center p-3 rounded-lg bg-gradient-to-br from-slate-800/50 to-slate-700/50">
            <div className="text-xs text-gray-400 mb-1">Current Progress</div>
            <div className="font-mono text-lg text-neon-cyan">{currentProgress.toFixed(1)}%</div>
            <div className="text-xs text-gray-400">₹{currentAmount.toLocaleString()}</div>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-gradient-to-br from-slate-800/50 to-slate-700/50">
            <div className="text-xs text-gray-400 mb-1">Remaining</div>
            <div className="font-mono text-lg text-cosmic-purple">₹{remainingAmount.toLocaleString()}</div>
            <div className="text-xs text-gray-400">{(100 - currentProgress).toFixed(1)}% left</div>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-gradient-to-br from-slate-800/50 to-slate-700/50">
            <div className="text-xs text-gray-400 mb-1">Target Date</div>
            <div className="font-mono text-sm text-stellar-gold">
              {simulatedDate ? new Date(simulatedDate).toLocaleDateString() : new Date(projectedDate).toLocaleDateString()}
            </div>
            <div className="text-xs text-gray-400">{Math.abs(monthsToGoal)} months</div>
          </div>
          
          {timeSaved > 0 && (
            <div className="text-center p-3 rounded-lg bg-gradient-to-br from-slate-800/50 to-slate-700/50">
              <div className="text-xs text-gray-400 mb-1">Time Saved</div>
              <div className="font-mono text-lg text-aurora-green">{timeSaved.toFixed(1)}mo</div>
              <div className="text-xs text-gray-400">Faster!</div>
            </div>
          )}
        </div>
        
        {/* Milestones */}
        <div className="flex flex-wrap gap-2 mt-4">
          {data.filter(d => d.milestone).map((item, index) => (
            <Badge
              key={index}
              variant="outline"
              className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-slate-900 cursor-pointer transition-colors"
              onMouseEnter={() => setHighlightedMilestone(item.milestone!)}
              onMouseLeave={() => setHighlightedMilestone(null)}
            >
              <Clock className="w-3 h-3 mr-1" />
              {item.milestone}
            </Badge>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="relative">
          {/* Live Simulation Indicator */}
          {isSimulating && (
            <div className="absolute top-0 right-0 z-10">
              <div className="flex items-center gap-2 bg-stellar-gold/20 px-3 py-1 rounded-full animate-pulse">
                <div 
                  className="w-2 h-2 bg-stellar-gold rounded-full"
                  style={{ 
                    opacity: Math.sin(animationFrame * Math.PI / 180) * 0.5 + 0.5 
                  }}
                />
                <span className="text-xs font-mono text-stellar-gold">SIMULATING</span>
              </div>
            </div>
          )}
          
          <ResponsiveContainer width="100%" height={400}>
            {renderChart()}
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 mt-6">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50">
            <div className="w-4 h-1 bg-neon-cyan rounded" />
            <span className="text-sm font-space text-gray-300">Current Progress</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50">
            <div className="w-4 h-1 bg-cosmic-purple rounded" style={{ borderStyle: 'dashed' }} />
            <span className="text-sm font-space text-gray-300">Projected</span>
          </div>
          {data.some(d => d.simulatedProgress) && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50">
              <div className="w-4 h-1 bg-aurora-green rounded" />
              <span className="text-sm font-space text-gray-300">With Changes</span>
            </div>
          )}
          <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50">
            <div className="w-4 h-1 bg-stellar-gold rounded" style={{ borderStyle: 'dashed' }} />
            <span className="text-sm font-space text-gray-300">Goal Target</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalTimelineChart;