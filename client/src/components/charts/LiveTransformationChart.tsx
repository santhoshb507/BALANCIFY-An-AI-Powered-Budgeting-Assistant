import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, ComposedChart, AreaChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, TrendingUp, Target, RefreshCw, Eye } from 'lucide-react';

interface TransformationData {
  month: string;
  beforeScenario: number;
  afterScenario: number;
  goalTarget: number;
  savings: number;
  difference: number;
}

interface LiveTransformationChartProps {
  data: TransformationData[];
  title: string;
  scenario: string;
  isLive?: boolean;
  className?: string;
}

const LiveTransformationChart: React.FC<LiveTransformationChartProps> = ({
  data,
  title,
  scenario,
  isLive = false,
  className = ""
}) => {
  const [viewMode, setViewMode] = useState<'comparison' | 'difference' | 'progress'>('comparison');
  const [animationProgress, setAnimationProgress] = useState(0);
  const [showPrediction, setShowPrediction] = useState(true);

  useEffect(() => {
    if (isLive) {
      const timer = setInterval(() => {
        setAnimationProgress(prev => (prev + 1) % 100);
      }, 50);
      return () => clearInterval(timer);
    }
  }, [isLive]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="cosmic-card p-4 border border-neon-cyan/30 backdrop-blur-md">
          <p className="font-orbitron text-neon-cyan font-semibold mb-2">{label}</p>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Before:</span>
              <span className="font-mono text-nebula-pink">₹{data.beforeScenario?.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">After:</span>
              <span className="font-mono text-aurora-green">₹{data.afterScenario?.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Target:</span>
              <span className="font-mono text-stellar-gold">₹{data.goalTarget?.toLocaleString()}</span>
            </div>
            <div className="border-t border-gray-600 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Improvement:</span>
                <span className={`font-mono ${data.difference > 0 ? 'text-aurora-green' : 'text-nebula-pink'}`}>
                  {data.difference > 0 ? '+' : ''}₹{data.difference?.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    switch (viewMode) {
      case 'comparison':
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
            <Line 
              type="monotone" 
              dataKey="goalTarget" 
              stroke="#FFD700" 
              strokeWidth={2}
              strokeDasharray="8 4"
              dot={{ fill: '#FFD700', strokeWidth: 2, r: 3 }}
              name="Goal Target"
            />
            
            {/* Before Scenario */}
            <Line 
              type="monotone" 
              dataKey="beforeScenario" 
              stroke="#FF1493" 
              strokeWidth={3}
              dot={{ fill: '#FF1493', strokeWidth: 2, r: 4 }}
              name="Before Scenario"
              strokeDasharray={isLive ? "5 5" : "none"}
            />
            
            {/* After Scenario with Animation */}
            <Line 
              type="monotone" 
              dataKey="afterScenario" 
              stroke="#00FF7F" 
              strokeWidth={3}
              dot={{ fill: '#00FF7F', strokeWidth: 2, r: 4 }}
              name="After Scenario"
              animationDuration={2000}
              style={{
                filter: isLive ? 'drop-shadow(0 0 8px #00FF7F)' : 'none'
              }}
            />
          </ComposedChart>
        );

      case 'difference':
        return (
          <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
              dataKey="difference"
              stroke="#00F5FF"
              fill="url(#differenceGradient)"
              strokeWidth={2}
            />
            
            <defs>
              <linearGradient id="differenceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00F5FF" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#00F5FF" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            
            <ReferenceLine y={0} stroke="#666" strokeDasharray="2 2" />
          </AreaChart>
        );

      case 'progress':
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
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip 
              formatter={(value: number, name: string) => [
                `${value.toFixed(1)}%`,
                name === 'progressBefore' ? 'Progress Before' : 'Progress After'
              ]}
            />
            
            <Area
              type="monotone"
              dataKey="progressBefore"
              stackId="1"
              stroke="#FF1493"
              fill="#FF1493"
              fillOpacity={0.6}
            />
            
            <Area
              type="monotone"
              dataKey="progressAfter"
              stackId="2"
              stroke="#00FF7F"
              fill="#00FF7F"
              fillOpacity={0.8}
            />
          </ComposedChart>
        );

      default:
        return <div>Invalid view mode</div>;
    }
  };

  // Calculate key metrics
  const totalImprovement = data.reduce((sum, item) => sum + item.difference, 0);
  const avgImprovement = totalImprovement / data.length;
  const maxImprovement = Math.max(...data.map(item => item.difference));
  const goalAchievementImprovement = data.reduce((acc, item) => {
    const beforeGap = Math.max(0, item.goalTarget - item.beforeScenario);
    const afterGap = Math.max(0, item.goalTarget - item.afterScenario);
    return acc + (beforeGap - afterGap);
  }, 0);

  return (
    <Card className={`cosmic-card transform-3d transition-all duration-500 hover:scale-105 ${className} ${isLive ? 'animate-glow' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-orbitron text-xl text-cosmic-gradient flex items-center gap-2">
              {isLive && <Zap className="w-5 h-5 text-stellar-gold animate-pulse" />}
              {title}
            </CardTitle>
            <p className="text-sm text-gray-400 mt-1">Scenario: {scenario}</p>
          </div>
          
          <div className="flex gap-2">
            {[
              { mode: 'comparison' as const, icon: TrendingUp, label: 'Compare' },
              { mode: 'difference' as const, icon: Target, label: 'Impact' },
              { mode: 'progress' as const, icon: Eye, label: 'Progress' },
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
        
        {/* Live Metrics */}
        <div className="grid grid-cols-4 gap-3 mt-4">
          <div className="text-center p-3 rounded-lg bg-gradient-to-br from-slate-800/50 to-slate-700/50">
            <div className="text-xs text-gray-400 mb-1">Total Impact</div>
            <div className={`font-mono text-sm ${totalImprovement > 0 ? 'text-aurora-green' : 'text-nebula-pink'}`}>
              {totalImprovement > 0 ? '+' : ''}₹{totalImprovement.toLocaleString()}
            </div>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-gradient-to-br from-slate-800/50 to-slate-700/50">
            <div className="text-xs text-gray-400 mb-1">Avg Monthly</div>
            <div className={`font-mono text-sm ${avgImprovement > 0 ? 'text-aurora-green' : 'text-nebula-pink'}`}>
              {avgImprovement > 0 ? '+' : ''}₹{avgImprovement.toLocaleString()}
            </div>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-gradient-to-br from-slate-800/50 to-slate-700/50">
            <div className="text-xs text-gray-400 mb-1">Peak Impact</div>
            <div className={`font-mono text-sm ${maxImprovement > 0 ? 'text-aurora-green' : 'text-nebula-pink'}`}>
              {maxImprovement > 0 ? '+' : ''}₹{maxImprovement.toLocaleString()}
            </div>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-gradient-to-br from-slate-800/50 to-slate-700/50">
            <div className="text-xs text-gray-400 mb-1">Goal Progress</div>
            <div className={`font-mono text-sm ${goalAchievementImprovement > 0 ? 'text-aurora-green' : 'text-nebula-pink'}`}>
              {goalAchievementImprovement > 0 ? '+' : ''}₹{goalAchievementImprovement.toLocaleString()}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="relative">
          {/* Live Animation Overlay */}
          {isLive && (
            <div className="absolute top-0 right-0 z-10">
              <div className="flex items-center gap-2 bg-stellar-gold/20 px-3 py-1 rounded-full">
                <RefreshCw className="w-4 h-4 text-stellar-gold animate-spin" />
                <span className="text-xs font-mono text-stellar-gold">LIVE</span>
              </div>
            </div>
          )}
          
          <ResponsiveContainer width="100%" height={400}>
            {renderChart()}
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 mt-6">
          {viewMode === 'comparison' && (
            <>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50">
                <div className="w-4 h-1 bg-nebula-pink rounded" />
                <span className="text-sm font-space text-gray-300">Before Scenario</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50">
                <div className="w-4 h-1 bg-aurora-green rounded" />
                <span className="text-sm font-space text-gray-300">After Scenario</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50">
                <div className="w-4 h-1 bg-stellar-gold rounded" style={{ borderStyle: 'dashed' }} />
                <span className="text-sm font-space text-gray-300">Goal Target</span>
              </div>
            </>
          )}
          
          {viewMode === 'difference' && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50">
              <div className="w-4 h-4 bg-gradient-to-b from-neon-cyan to-transparent rounded" />
              <span className="text-sm font-space text-gray-300">Financial Impact</span>
            </div>
          )}
          
          {viewMode === 'progress' && (
            <>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50">
                <div className="w-4 h-4 bg-nebula-pink/60 rounded" />
                <span className="text-sm font-space text-gray-300">Progress Before</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50">
                <div className="w-4 h-4 bg-aurora-green/80 rounded" />
                <span className="text-sm font-space text-gray-300">Progress After</span>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveTransformationChart;