import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
// import { Badge } from '@/components/ui/badge';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Zap, Play, RotateCcw, TrendingUp, Target, AlertCircle, CheckCircle } from 'lucide-react';
import LiveTransformationChart from './charts/LiveTransformationChart';
import GoalTimelineChart from './charts/GoalTimelineChart';

interface SimulationParams {
  incomeIncrease: number;
  expenseReduction: number;
  additionalSavings: number;
  investmentBoost: number;
  goalTarget: number;
}

interface SimulationResult {
  insights: {
    goalAchievability: string;
    timeToGoal: string;
    savingsImpact: string;
    recommendations: string[];
  };
  projections: {
    monthlyData: Array<{
      month: string;
      beforeScenario: number;
      afterScenario: number;
      goalTarget: number;
      savings: number;
      difference: number;
    }>;
    goalTimeline: Array<{
      month: string;
      currentProgress: number;
      projectedProgress: number;
      simulatedProgress: number;
      goalTarget: number;
      milestone?: string;
    }>;
  };
}

interface WhatIfSimulatorProps {
  questionnaireId: string;
  initialData: any;
  className?: string;
}

const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  questionnaireId,
  initialData,
  className = ""
}) => {
  const [simulationParams, setSimulationParams] = useState<SimulationParams>({
    incomeIncrease: 0,
    expenseReduction: 0,
    additionalSavings: 0,
    investmentBoost: 0,
    goalTarget: initialData?.financial_goals?.target_amount || initialData?.target_amount || 1000000
  });

  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<string>('custom');

  const predefinedScenarios = [
    {
      id: 'conservative',
      name: 'Conservative Growth',
      description: 'Small, achievable improvements',
      params: { incomeIncrease: 5, expenseReduction: 10, additionalSavings: 5, investmentBoost: 0 }
    },
    {
      id: 'moderate',
      name: 'Balanced Approach',
      description: 'Moderate lifestyle changes',
      params: { incomeIncrease: 15, expenseReduction: 20, additionalSavings: 10, investmentBoost: 5 }
    },
    {
      id: 'aggressive',
      name: 'Aggressive Optimization',
      description: 'Significant lifestyle changes',
      params: { incomeIncrease: 30, expenseReduction: 35, additionalSavings: 20, investmentBoost: 15 }
    }
  ];

  const simulationMutation = useMutation({
    mutationFn: async (params: SimulationParams) => {
      const response = await fetch('/api/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionnaireId,
          simulation: params
        }),
      });

      if (!response.ok) {
        throw new Error('Simulation failed');
      }

      return response.json();
    },
    onSuccess: (data: any) => {
      // Ensure the data structure is complete with fallbacks
      const normalizedData: SimulationResult = {
        insights: {
          goalAchievability: data.insights?.goalAchievability || 'Analysis in progress...',
          timeToGoal: data.insights?.timeToGoal || 'Calculating timeline...',
          savingsImpact: data.insights?.savingsImpact || 'Analyzing impact...',
          recommendations: data.insights?.recommendations || ['Simulation data is being processed...']
        },
        projections: {
          monthlyData: data.projections?.monthlyData || [],
          goalTimeline: data.projections?.goalTimeline || []
        }
      };

      setSimulationResult(normalizedData);
      setIsSimulating(false);
    },
    onError: (error) => {
      console.error('Simulation failed:', error);
      setIsSimulating(false);
    }
  });

  const runSimulation = () => {
    setIsSimulating(true);
    simulationMutation.mutate(simulationParams);
  };

  const resetSimulation = () => {
    setSimulationParams({
      incomeIncrease: 0,
      expenseReduction: 0,
      additionalSavings: 0,
      investmentBoost: 0,
      goalTarget: initialData?.financial_goals?.target_amount || initialData?.target_amount || 1000000
    });
    setSimulationResult(null);
    setSelectedScenario('custom');
    setIsSimulating(false);
  };

  const applyScenario = (scenario: any) => {
    setSelectedScenario(scenario.id);
    setSimulationParams({
      ...simulationParams,
      ...scenario.params
    });
  };

  const calculatePotentialSavings = () => {
    const monthlyIncome = initialData?.income?.monthly || 0;
    const monthlyExpenses = initialData?.expenses?.total || 0;

    const newIncome = monthlyIncome * (1 + simulationParams.incomeIncrease / 100);
    const newExpenses = monthlyExpenses * (1 - simulationParams.expenseReduction / 100);
    const additionalMonthlySavings = (simulationParams.additionalSavings / 100) * monthlyIncome;

    return newIncome - newExpenses + additionalMonthlySavings;
  };

  useEffect(() => {
    // Auto-run simulation when parameters change significantly
    const totalChange = simulationParams.incomeIncrease + simulationParams.expenseReduction + 
                       simulationParams.additionalSavings + simulationParams.investmentBoost;

    if (totalChange > 0 && !simulationMutation.isPending) {
      const timer = setTimeout(() => {
        runSimulation();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [simulationParams]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Simulation Controls */}
      <Card className="cosmic-card">
        <CardHeader>
          <CardTitle className="font-orbitron text-xl text-cosmic-gradient flex items-center gap-2">
            <Zap className="w-5 h-5 text-stellar-gold" />
            What If Simulation
            {isSimulating && <div className="cosmic-loader w-4 h-4" />}
          </CardTitle>
          <p className="text-sm text-gray-400">
            Explore how different financial decisions could impact your goals
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Predefined Scenarios */}
          <div>
            <Label className="text-neon-cyan font-semibold mb-3 block">Quick Scenarios</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {predefinedScenarios.map((scenario) => (
                <Card
                  key={scenario.id}
                  className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                    selectedScenario === scenario.id 
                      ? 'border-neon-cyan bg-neon-cyan/10' 
                      : 'border-slate-600 hover:border-neon-cyan/50'
                  }`}
                  onClick={() => applyScenario(scenario)}
                >
                  <CardContent className="p-4 text-center">
                    <h4 className="font-orbitron text-sm font-semibold text-cosmic-gradient mb-1">
                      {scenario.name}
                    </h4>
                    <p className="text-xs text-gray-400">{scenario.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Custom Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-neon-cyan font-semibold">Income Increase (%)</Label>
                <div className="mt-2">
                  <Slider
                    value={[simulationParams.incomeIncrease]}
                    onValueChange={(value) => setSimulationParams({
                      ...simulationParams,
                      incomeIncrease: value[0]
                    })}
                    max={50}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>0%</span>
                    <span className="text-neon-cyan">{simulationParams.incomeIncrease}%</span>
                    <span>50%</span>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-neon-cyan font-semibold">Expense Reduction (%)</Label>
                <div className="mt-2">
                  <Slider
                    value={[simulationParams.expenseReduction]}
                    onValueChange={(value) => setSimulationParams({
                      ...simulationParams,
                      expenseReduction: value[0]
                    })}
                    max={50}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>0%</span>
                    <span className="text-neon-cyan">{simulationParams.expenseReduction}%</span>
                    <span>50%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-neon-cyan font-semibold">Additional Savings (%)</Label>
                <div className="mt-2">
                  <Slider
                    value={[simulationParams.additionalSavings]}
                    onValueChange={(value) => setSimulationParams({
                      ...simulationParams,
                      additionalSavings: value[0]
                    })}
                    max={30}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>0%</span>
                    <span className="text-neon-cyan">{simulationParams.additionalSavings}%</span>
                    <span>30%</span>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-neon-cyan font-semibold">Investment Boost (%)</Label>
                <div className="mt-2">
                  <Slider
                    value={[simulationParams.investmentBoost]}
                    onValueChange={(value) => setSimulationParams({
                      ...simulationParams,
                      investmentBoost: value[0]
                    })}
                    max={25}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>0%</span>
                    <span className="text-neon-cyan">{simulationParams.investmentBoost}%</span>
                    <span>25%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Impact Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-lg">
            <div className="text-center">
              <div className="text-xs text-gray-400 mb-1">Potential Monthly Savings</div>
              <div className="font-mono text-lg text-aurora-green">
                ₹{calculatePotentialSavings().toLocaleString()}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-400 mb-1">Annual Impact</div>
              <div className="font-mono text-lg text-neon-cyan">
                ₹{(calculatePotentialSavings() * 12).toLocaleString()}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-400 mb-1">Goal Progress</div>
              <div className="font-mono text-lg text-stellar-gold">
                {((calculatePotentialSavings() * 12 / simulationParams.goalTarget) * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <Button
              onClick={runSimulation}
              disabled={simulationMutation.isPending}
              className="cosmic-button px-6 py-2"
            >
              {simulationMutation.isPending ? (
                <div className="cosmic-loader w-4 h-4 mr-2" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Run Simulation
            </Button>

            <Button
              onClick={resetSimulation}
              variant="outline"
              className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-slate-900"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Simulation Results */}
      {simulationResult && (
        <div className="space-y-6">
          {/* AI Insights */}
          <Card className="cosmic-card">
            <CardHeader>
              <CardTitle className="font-orbitron text-lg text-cosmic-gradient flex items-center gap-2">
                <Target className="w-5 h-5 text-stellar-gold" />
                AI Analysis Results
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="bg-aurora-green/20 text-aurora-green border border-aurora-green px-2 py-1 rounded text-xs font-semibold mb-2 inline-block">
                      Goal Achievability
                    </div>
                    <p className="text-gray-300 text-sm">{simulationResult.insights.goalAchievability || 'Analysis in progress...'}</p>
                  </div>

                  <div>
                    <div className="bg-neon-cyan/20 text-neon-cyan border border-neon-cyan px-2 py-1 rounded text-xs font-semibold mb-2 inline-block">
                      Timeline
                    </div>
                    <p className="text-gray-300 text-sm">{simulationResult.insights.timeToGoal || 'Calculating timeline...'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="bg-cosmic-purple/20 text-cosmic-purple border border-cosmic-purple px-2 py-1 rounded text-xs font-semibold mb-2 inline-block">
                      Savings Impact
                    </div>
                    <p className="text-gray-300 text-sm">{simulationResult.insights.savingsImpact || 'Analyzing impact...'}</p>
                  </div>

                  <div>
                    <div className="bg-stellar-gold/20 text-stellar-gold border border-stellar-gold px-2 py-1 rounded text-xs font-semibold mb-2 inline-block">
                      Recommendations
                    </div>
                    <ul className="space-y-1">
                      {(simulationResult.insights.recommendations || ['Loading recommendations...']).map((rec, index) => (
                        <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 text-aurora-green mt-0.5 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live Transformation Chart */}
          {simulationResult.projections?.monthlyData && (
            <LiveTransformationChart
              data={simulationResult.projections.monthlyData}
              title="Financial Transformation Analysis"
              scenario={selectedScenario}
              isLive={isSimulating}
            />
          )}

          {/* Goal Timeline Chart */}
          {simulationResult.projections?.goalTimeline && (
            <GoalTimelineChart
              data={simulationResult.projections.goalTimeline}
              goalName={initialData?.financialGoals?.[0]?.description || "Financial Goal"}
              targetAmount={simulationParams.goalTarget}
              currentAmount={initialData?.currentSavings || 0}
              projectedDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()}
              simulatedDate={simulationResult.insights?.timeToGoal || 'Calculating...'}
              isSimulating={isSimulating}
            />
          )}
        </div>
      )}

      {/* Error State */}
      {simulationMutation.isError && (
        <Card className="cosmic-card border-nebula-pink">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-nebula-pink mx-auto mb-4" />
            <h3 className="font-orbitron text-lg text-nebula-pink mb-2">Simulation Failed</h3>
            <p className="text-gray-400 text-sm">
              Unable to run the simulation. Please try again or adjust your parameters.
            </p>
            <Button
              onClick={() => simulationMutation.reset()}
              className="mt-4 cosmic-button"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WhatIfSimulator;