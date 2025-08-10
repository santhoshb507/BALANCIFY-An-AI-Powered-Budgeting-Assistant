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
import TransformationAnalysis from './TransformationAnalysis';

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
  // Calculate actual current savings from spending breakdown (real user data)
  const spendingBreakdown = initialData?.spendingBreakdown || {};
  
  // Calculate total expenses from actual spending categories (excluding savings)
  const totalExpenses = (spendingBreakdown.housing || 0) + 
                       (spendingBreakdown.food || 0) + 
                       (spendingBreakdown.transportation || 0) + 
                       (spendingBreakdown.entertainment || 0) + 
                       (spendingBreakdown.shopping || 0) + 
                       (spendingBreakdown.subscriptions || 0) + 
                       (spendingBreakdown.loans || 0) + 
                       (spendingBreakdown.investments || 0) + 
                       (spendingBreakdown.other || 0);
  
  // Current income = total expenses + current savings
  const currentSavings = spendingBreakdown.savings || 0;
  const currentIncome = totalExpenses + currentSavings;
  const actualCurrentSavings = currentSavings;
  
  // Debug logging to verify we're using real user data
  console.log('WhatIf Simulator - Calculated from Real Spending Data:', {
    currentIncome,
    totalExpenses, 
    actualCurrentSavings,
    spendingBreakdown,
    calculation: `Income (${currentIncome}) = Expenses (${totalExpenses}) + Savings (${currentSavings})`
  });
  
  const [simulationParams, setSimulationParams] = useState<SimulationParams>({
    incomeIncrease: 0,
    expenseReduction: 0,
    additionalSavings: 0,
    investmentBoost: 0,
    goalTarget: initialData?.financialGoals?.reduce((sum: number, goal: any) => sum + goal.targetAmount, 0) || 1000000
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
        // API failed, generate local simulation results
        return generateLocalSimulation(params);
      }

      return response.json();
    },
    onSuccess: (data: any) => {
      // Ensure the data structure is complete with fallbacks
      const normalizedData: SimulationResult = {
        insights: {
          goalAchievability: data.insights?.goalAchievability || 'With your optimized plan, your goals become more achievable.',
          timeToGoal: data.insights?.timeToGoal || `With improvements, you could reach your goals faster than your current trajectory.`,
          savingsImpact: data.insights?.savingsImpact || `Your optimized savings plan could significantly boost your financial progress.`,
          recommendations: data.insights?.recommendations || [
            'Focus on the income increase strategy for maximum impact',
            'Gradually reduce expenses in non-essential categories', 
            'Maintain consistent investment contributions',
            'Track progress monthly to stay on target'
          ]
        },
        projections: {
          monthlyData: data.projections?.monthlyData || [],
          goalTimeline: generateGoalTimeline()
        }
      };

      setSimulationResult(normalizedData);
      setIsSimulating(false);
    },
    onError: (error) => {
      console.error('Simulation failed:', error);
      // Generate fallback simulation result
      const fallbackResult = generateLocalSimulation(simulationParams);
      setSimulationResult(fallbackResult);
      setIsSimulating(false);
    }
  });

  const generateLocalSimulation = (params: SimulationParams): SimulationResult => {
    const potentialSavings = calculatePotentialSavings();
    const timeToGoal = Math.ceil(params.goalTarget / potentialSavings);
    
    return {
      insights: {
        goalAchievability: `With your current income of ₹${currentIncome.toLocaleString()} and optimized strategy, your financial goals are achievable.`,
        timeToGoal: `At ₹${potentialSavings.toLocaleString()} monthly savings, you could reach your ₹${params.goalTarget.toLocaleString()} goal in approximately ${timeToGoal} months.`,
        savingsImpact: `Your optimized plan could generate ₹${(potentialSavings * 12).toLocaleString()} annually, representing a ${Math.round(((potentialSavings - actualCurrentSavings) / actualCurrentSavings) * 100)}% improvement over current savings.`,
        recommendations: [
          params.incomeIncrease > 0 ? `Income boost of ${params.incomeIncrease}% adds ₹${Math.round(currentIncome * params.incomeIncrease / 100).toLocaleString()} monthly` : 'Consider income growth opportunities',
          params.expenseReduction > 0 ? `Expense reduction of ${params.expenseReduction}% saves ₹${Math.round(totalExpenses * params.expenseReduction / 100).toLocaleString()} monthly` : 'Look for expense optimization areas',
          'Maintain regular investment contributions for long-term growth',
          'Review and adjust strategy quarterly based on progress'
        ]
      },
      projections: {
        monthlyData: [],
        goalTimeline: generateGoalTimeline()
      }
    };
  };

  const generateGoalTimeline = () => {
    const months = 24;
    const potentialSavings = calculatePotentialSavings();
    
    return Array.from({ length: months }, (_, i) => ({
      month: `Month ${i + 1}`,
      currentProgress: actualCurrentSavings + (actualCurrentSavings * (i + 1)),
      projectedProgress: actualCurrentSavings + (potentialSavings * (i + 1)),
      simulatedProgress: actualCurrentSavings + (potentialSavings * (i + 1)),
      goalTarget: simulationParams.goalTarget,
      milestone: i % 6 === 0 ? `${Math.round((i + 1) / 6)} Quarter Progress` : undefined
    }));
  };

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
      goalTarget: initialData?.financialGoals?.[0]?.targetAmount || initialData?.financialGoals?.[0]?.target_amount || 500000
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
    // Calculate the increased income from raise/promotion
    const incomeIncrease = currentIncome * (simulationParams.incomeIncrease / 100);
    const newIncome = currentIncome + incomeIncrease;
    
    // Calculate reduced expenses
    const expenseReduction = totalExpenses * (simulationParams.expenseReduction / 100);
    const newExpenses = totalExpenses - expenseReduction;
    
    // Calculate additional savings (separate from income/expense changes)
    const additionalMonthlySavings = (simulationParams.additionalSavings / 100) * currentIncome;
    
    // Calculate investment boost on existing investments
    const currentInvestments = initialData?.spendingBreakdown?.investments || 0;
    const investmentBoost = currentInvestments * (simulationParams.investmentBoost / 100);
    
    // Total potential monthly savings = new savings capability + additional efforts + investment boost
    const totalPotentialSavings = (newIncome - newExpenses) + additionalMonthlySavings + investmentBoost;
    
    return Math.max(0, totalPotentialSavings);
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

          {/* Current vs Optimized Comparison Chart */}
          {simulationResult.projections?.goalTimeline && (
            <Card className="cosmic-card">
              <CardHeader>
                <CardTitle className="font-orbitron text-lg text-stellar-gold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Current vs Optimized Target Progress
                </CardTitle>
                <p className="text-sm text-gray-400">
                  Compare your current trajectory with the optimized financial plan
                </p>
              </CardHeader>
              <CardContent>
                <GoalTimelineChart
                  data={simulationResult.projections.goalTimeline}
                  goalName="Current vs Optimized Progress"
                  targetAmount={simulationParams.goalTarget}
                  currentAmount={initialData?.currentSavings || 0}
                  projectedDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                />
              </CardContent>
            </Card>
          )}

          {/* Individual Goal Progress Charts */}
          {initialData?.financialGoals && initialData.financialGoals.length > 0 && (
            <div className="space-y-6">
              <h3 className="font-orbitron text-xl text-cosmic-gradient mb-4">Individual Goal Analysis</h3>
              {initialData.financialGoals.map((goal: any, index: number) => {
                // Calculate remaining amount needed for this goal
                const remainingAmount = Math.max(0, goal.targetAmount - (goal.currentAmount || 0));
                
                // Calculate monthly savings allocated to this goal (divide total savings by number of goals)
                const currentMonthlySavingsPerGoal = actualCurrentSavings / initialData.financialGoals.length;
                const optimizedMonthlySavingsPerGoal = calculatePotentialSavings() / initialData.financialGoals.length;
                
                // Calculate time to goal based on remaining amount and monthly allocation
                // Only use fallback if monthly savings is 0 or negative
                const currentTimeToGoal = currentMonthlySavingsPerGoal <= 0 
                  ? 999 
                  : Math.ceil(remainingAmount / currentMonthlySavingsPerGoal);
                const optimizedTimeToGoal = optimizedMonthlySavingsPerGoal <= 0 
                  ? 999 
                  : Math.ceil(remainingAmount / optimizedMonthlySavingsPerGoal);
                
                // Debug logging
                console.log(`Goal ${index + 1} (${goal.description}):`, {
                  targetAmount: goal.targetAmount,
                  currentAmount: goal.currentAmount || 0,
                  remainingAmount,
                  currentMonthlySavingsPerGoal,
                  optimizedMonthlySavingsPerGoal,
                  currentTimeToGoal,
                  optimizedTimeToGoal,
                  actualCurrentSavings,
                  potentialSavings: calculatePotentialSavings()
                });
                
                return (
                  <Card key={goal.id || index} className="cosmic-card">
                    <CardHeader>
                      <CardTitle className="text-lg text-neon-cyan flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Goal {index + 1}: {goal.description}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                        <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                          <div className="text-xs text-gray-400 mb-1">Target Amount</div>
                          <div className="font-mono text-lg text-stellar-gold">₹{goal.targetAmount.toLocaleString()}</div>
                        </div>
                        <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                          <div className="text-xs text-gray-400 mb-1">Current Amount</div>
                          <div className="font-mono text-lg text-neon-cyan">₹{(goal.currentAmount || 0).toLocaleString()}</div>
                        </div>
                        <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                          <div className="text-xs text-gray-400 mb-1">Time to Goal</div>
                          <div className="font-mono text-lg text-neon-cyan">
                            {currentTimeToGoal >= 999 ? '∞' : `${currentTimeToGoal} months`}
                          </div>
                        </div>
                        <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                          <div className="text-xs text-gray-400 mb-1">Optimized Time</div>
                          <div className="font-mono text-lg text-aurora-green">
                            {optimizedTimeToGoal >= 999 ? '∞' : `${optimizedTimeToGoal} months`}
                          </div>
                        </div>
                        <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                          <div className="text-xs text-gray-400 mb-1">Time Saved</div>
                          <div className="font-mono text-lg text-cosmic-purple">
                            {(currentTimeToGoal >= 999 || optimizedTimeToGoal >= 999) 
                              ? 'N/A' 
                              : `${Math.max(0, currentTimeToGoal - optimizedTimeToGoal)} months`}
                          </div>
                        </div>
                      </div>
                      <GoalTimelineChart
                        data={simulationResult.projections.goalTimeline.map((item, i) => ({
                          ...item,
                          goalTarget: goal.targetAmount
                        }))}
                        goalName={goal.description}
                        targetAmount={goal.targetAmount}
                        currentAmount={0}
                        projectedDate={`${new Date().getFullYear() + Math.ceil(optimizedTimeToGoal / 12)}-12-31`}
                      />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Overall Goals Achievement Timeline */}
          {initialData?.financialGoals && initialData.financialGoals.length > 1 && (
            <Card className="cosmic-card">
              <CardHeader>
                <CardTitle className="font-orbitron text-xl text-cosmic-gradient flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-stellar-gold" />
                  Overall Goals Achievement Timeline
                </CardTitle>
                <p className="text-gray-400">Combined analysis of all financial goals</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                    <div className="text-xs text-gray-400 mb-1">Total Goals</div>
                    <div className="font-mono text-lg text-neon-cyan">{initialData.financialGoals.length}</div>
                  </div>
                  <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                    <div className="text-xs text-gray-400 mb-1">Total Target</div>
                    <div className="font-mono text-lg text-stellar-gold">₹{initialData.financialGoals.reduce((sum: number, goal: any) => sum + goal.targetAmount, 0).toLocaleString()}</div>
                  </div>
                  <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                    <div className="text-xs text-gray-400 mb-1">Last Goal Monthly Savings</div>
                    <div className="font-mono text-lg text-aurora-green">₹{Math.round(calculatePotentialSavings()).toLocaleString()}</div>
                  </div>
                  <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                    <div className="text-xs text-gray-400 mb-1">Optimized Time to Goal</div>
                    <div className="font-mono text-lg text-cosmic-purple">{Math.ceil(initialData.financialGoals.reduce((sum: number, goal: any) => sum + goal.targetAmount, 0) / calculatePotentialSavings())} months</div>
                  </div>
                </div>
                <GoalTimelineChart
                  data={simulationResult.projections.goalTimeline}
                  goalName="All Financial Goals Combined"
                  targetAmount={initialData.financialGoals.reduce((sum: number, goal: any) => sum + goal.targetAmount, 0)}
                  currentAmount={0}
                  projectedDate={`${new Date().getFullYear() + Math.ceil(initialData.financialGoals.reduce((sum: number, goal: any) => sum + goal.targetAmount, 0) / calculatePotentialSavings() / 12)}-12-31`}
                />
              </CardContent>
            </Card>
          )}

          {/* Transformation Analysis */}
          {initialData?.financialGoals && initialData.financialGoals.length > 0 && (
            <TransformationAnalysis
              goals={initialData.financialGoals}
              currentMonthlySavings={actualCurrentSavings}
              simulatedMonthlySavings={calculatePotentialSavings()}
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