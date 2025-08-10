import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CosmicBackground } from '@/components/ui/cosmic-background';
import { SpendingChart } from '@/components/charts/SpendingChart';
import { NeedWantChart } from '@/components/charts/NeedWantChart';
import { CashFlowChart } from '@/components/charts/CashFlowChart';
import GoalTimelineChart from '@/components/charts/GoalTimelineChart';
import FinancialGoalsChart from '@/components/charts/FinancialGoalsChart';
import { AIInsights } from '@/components/dashboard/AIInsights';
import WhatIfSimulator from '@/components/WhatIfSimulator';
import { ComparisonTable } from '@/components/dashboard/ComparisonTable';
import { AnalysisResult } from '@/types/financial';
import { Download, RotateCcw, LogOut, Target, Home, Zap } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import IndividualGoalChart from '@/components/charts/IndividualGoalChart';
import OverallGoalsTimeline from '@/components/charts/OverallGoalsTimeline';
import { useSession } from '@/hooks/useSession';

interface DashboardPageProps {
  analysisResult: AnalysisResult;
  onStartNew: () => void;
  onBackToHome?: () => void;
}

export function DashboardPage({ analysisResult, onStartNew, onBackToHome }: DashboardPageProps) {
  const { toast } = useToast();
  const { session, endSession } = useSession();

  const handleEndSession = () => {
    endSession();
    onStartNew();
    toast({
      title: "Session Ended",
      description: "Your session has been ended. You can start a new analysis anytime.",
    });
  };
  
  const downloadReport = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/report/${analysisResult.questionnaireId}`);
      if (!response.ok) throw new Error('Failed to generate report');
      return response.blob();
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financial-report-${analysisResult.questionnaireId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Report Downloaded",
        description: "Your financial analysis report has been downloaded successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Download Failed",
        description: "There was an error generating your report. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Chart colors
  const spendingColors = [
    '#00F5FF', // Neon Cyan
    '#6B46C1', // Purple
    '#D946EF', // Magenta
    '#10B981', // Green
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Violet
    '#06D6A0', // Emerald
    '#F97316', // Orange
    '#84CC16', // Lime
  ];

  const needsColors = ['#00F5FF', '#06D6A0', '#10B981', '#059669'];
  const wantsColors = ['#D946EF', '#F59E0B', '#EF4444', '#8B5CF6'];

  // Prepare comparison data with null safety
  const savings = analysisResult.spendingBreakdown.savings || 0;
  const entertainment = analysisResult.spendingBreakdown.entertainment || 0;
  const investments = analysisResult.spendingBreakdown.investments || 0;
  const timeToGoal = analysisResult.goalTimeline?.timeToGoal || 12;
  
  const comparisonData = [
    {
      category: "Monthly Savings",
      before: savings,
      after: savings * 1.3,
      impact: savings * 0.3,
      unit: "currency" as const,
    },
    {
      category: "Entertainment Spending",
      before: entertainment,
      after: entertainment * 0.7,
      impact: -entertainment * 0.3,
      unit: "currency" as const,
    },
    {
      category: "Investment Allocation",
      before: investments,
      after: investments * 1.25,
      impact: investments * 0.25,
      unit: "currency" as const,
    },
    {
      category: "Goal Timeline",
      before: timeToGoal,
      after: Math.round(timeToGoal * 0.8),
      impact: -Math.round(timeToGoal * 0.2),
      unit: "months" as const,
    },
  ];

  const totalExpenses = Object.values(analysisResult.spendingBreakdown).reduce((sum, val) => sum + (val || 0), 0) - (analysisResult.spendingBreakdown.savings || 0) - (analysisResult.spendingBreakdown.investments || 0);

  return (
    <div className="min-h-screen relative">
      <CosmicBackground />
      
      <div className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4">
          {/* Dashboard Header with Session */}
          <div className="flex justify-between items-start mb-12">
            <div className="text-center flex-1">
              <h2 className="font-orbitron text-4xl font-bold mb-4">
                <span className="neon-text text-neon-cyan">Mission Analysis</span>
              </h2>
              {session?.userName && (
                <p className="text-neon-cyan text-lg mb-2">
                  Welcome back, {session.userName}!
                </p>
              )}
              <p className="text-xl text-gray-300">Your Financial Cosmos Mapped</p>
            </div>
            
            <div className="flex gap-3">
              {onBackToHome && (
                <Button
                  onClick={onBackToHome}
                  variant="outline"
                  className="cosmic-button border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              )}
              <Button
                onClick={handleEndSession}
                variant="outline"
                className="cosmic-button border-red-500 text-red-400 hover:bg-red-500/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                End Session
              </Button>
            </div>
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Overall Spending Pie Chart */}
            <Card className="glass-effect border-white/20">
              <CardContent className="p-6">
                <SpendingChart
                  data={analysisResult.spendingBreakdown}
                  title="🚀 Overall Spending Distribution"
                  colors={spendingColors}
                />
              </CardContent>
            </Card>

            {/* Need vs Want Chart */}
            <Card className="glass-effect border-white/20">
              <CardContent className="p-6">
                <NeedWantChart
                  needsPercentage={analysisResult.needsWantsAnalysis.needsPercentage}
                  wantsPercentage={analysisResult.needsWantsAnalysis.wantsPercentage}
                />
              </CardContent>
            </Card>
          </div>

          {/* Secondary Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Needs Breakdown */}
            <Card className="glass-effect border-white/20">
              <CardContent className="p-6">
                <SpendingChart
                  data={analysisResult.needsWantsAnalysis.needs}
                  title="💡 Essential Needs"
                  colors={needsColors}
                />
              </CardContent>
            </Card>

            {/* Wants Breakdown */}
            <Card className="glass-effect border-white/20">
              <CardContent className="p-6">
                <SpendingChart
                  data={analysisResult.needsWantsAnalysis.wants}
                  title="🎯 Lifestyle Wants"
                  colors={wantsColors}
                />
              </CardContent>
            </Card>

            {/* Cash Flow */}
            <Card className="glass-effect border-white/20">
              <CardContent className="p-6">
                <CashFlowChart
                  income={totalExpenses + (analysisResult.spendingBreakdown.savings || 0) + (analysisResult.spendingBreakdown.investments || 0)}
                  expenses={totalExpenses}
                  investments={analysisResult.spendingBreakdown.investments || 0}
                  savings={analysisResult.spendingBreakdown.savings || 0}
                />
              </CardContent>
            </Card>
          </div>

          {/* AI Insights Section */}
          <div className="mb-8">
            <AIInsights insights={analysisResult.insights} />
          </div>

          {/* Financial Goals Chart */}
          {analysisResult.financialGoals && analysisResult.financialGoals.length > 0 && (
            <div className="mb-8">
              <FinancialGoalsChart 
                goals={analysisResult.financialGoals}
                monthlySavings={analysisResult.spendingBreakdown.savings + analysisResult.spendingBreakdown.investments}
              />
            </div>
          )}



          {/* Individual Goal Analysis */}
          {analysisResult.financialGoals && analysisResult.financialGoals.length > 0 && (
            <div className="mb-8">
              <div className="text-center mb-8">
                <h3 className="font-orbitron text-2xl font-bold mb-4">
                  <span className="neon-text text-neon-cyan flex items-center justify-center gap-2">
                    <Target className="w-6 h-6" />
                    Individual Goal Analysis
                  </span>
                </h3>
                <p className="text-gray-300">Detailed breakdown and timeline for each of your financial goals</p>
              </div>
              
              <div className="space-y-8">
                {analysisResult.financialGoals.map((goal, index) => (
                  <IndividualGoalChart
                    key={goal.id || index}
                    goal={goal}
                    monthlySavings={analysisResult.spendingBreakdown.savings + analysisResult.spendingBreakdown.investments}
                    goalIndex={index}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Overall Goals Timeline */}
          {analysisResult.financialGoals && analysisResult.financialGoals.length > 1 && (
            <div className="mb-8">
              <OverallGoalsTimeline
                goals={analysisResult.financialGoals}
                monthlySavings={analysisResult.spendingBreakdown.savings + analysisResult.spendingBreakdown.investments}
              />
            </div>
          )}

          {/* Primary Goal Timeline (only for single goal, to avoid duplication) */}
          {(!analysisResult.financialGoals || analysisResult.financialGoals.length <= 1) && (
            <Card className="cosmic-card mb-8">
              <CardContent className="p-8">
                <GoalTimelineChart
                  data={analysisResult.goalTimeline.milestones.map((milestone, index) => ({
                    month: `Month ${milestone.month}`,
                    currentProgress: milestone.amount,
                    projectedProgress: milestone.amount + (analysisResult.goalTimeline.monthlyContribution * (index + 1)),
                    simulatedProgress: 0,
                    goalTarget: analysisResult.goalTimeline.targetAmount,
                    milestone: milestone.description
                  }))}
                  goalName={analysisResult.financialGoals?.[0]?.description || "Primary Financial Goal"}
                  targetAmount={analysisResult.goalTimeline.targetAmount}
                  currentAmount={analysisResult.goalTimeline.currentSavings}
                  monthlyContribution={analysisResult.goalTimeline?.monthlyContribution || 0}
                  actualSavings={analysisResult.spendingBreakdown?.savings || 0}
                  projectedDate={`${new Date().getFullYear() + Math.ceil(analysisResult.goalTimeline.timeToGoal / 12)}-12-31`}
                />
              </CardContent>
            </Card>
          )}

          {/* Before/After Comparison */}
          <div className="mb-8">
            <ComparisonTable data={comparisonData} />
          </div>

          {/* What If Simulation */}
          <div className="mb-8">
            <WhatIfSimulator
              questionnaireId={analysisResult.questionnaireId || `session-${Date.now()}`}
              initialData={{
                income: { monthly: analysisResult.monthlyIncome || 0 },
                expenses: { total: analysisResult.totalExpenses || 0 },
                currentSavings: analysisResult.goalTimeline?.currentSavings || 0,
                financialGoals: analysisResult.financialGoals || [],
                spendingBreakdown: analysisResult.spendingBreakdown || {}
              }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-6">
            <Button
              onClick={() => downloadReport.mutate()}
              disabled={downloadReport.isPending}
              className="px-8 py-4 bg-gradient-to-r from-neon-green to-cosmic-500 rounded-lg font-semibold hover:from-neon-green/80 hover:to-cosmic-400 transition-all duration-300 transform hover:scale-105"
            >
              <Download className="mr-3 w-5 h-5" />
              {downloadReport.isPending ? 'Generating...' : 'Download Mission Report (PDF)'}
            </Button>
            
            <Button
              onClick={onStartNew}
              variant="outline"
              className="px-8 py-4 glass-effect border-white/20 rounded-lg font-semibold hover:border-neon-cyan transition-all duration-300"
            >
              <RotateCcw className="mr-3 w-5 h-5" />
              New Mission
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
