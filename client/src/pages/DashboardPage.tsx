import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CosmicBackground } from '@/components/ui/cosmic-background';
import { SpendingChart } from '@/components/charts/SpendingChart';
import { NeedWantChart } from '@/components/charts/NeedWantChart';
import { CashFlowChart } from '@/components/charts/CashFlowChart';
import GoalTimelineChart from '@/components/charts/GoalTimelineChart';
import { AIInsights } from '@/components/dashboard/AIInsights';
import WhatIfSimulator from '@/components/WhatIfSimulator';
import { ComparisonTable } from '@/components/dashboard/ComparisonTable';
import { AnalysisResult } from '@/types/financial';
import { Download, RotateCcw } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import FinancialGoalsChart from '@/components/charts/FinancialGoalsChart';


interface DashboardPageProps {
  analysisResult: AnalysisResult;
  onStartNew: () => void;
}

export function DashboardPage({ analysisResult, onStartNew }: DashboardPageProps) {
  const { toast } = useToast();

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

  // Prepare comparison data
  const comparisonData = [
    {
      category: "Monthly Savings",
      before: analysisResult.spendingBreakdown.savings,
      after: analysisResult.spendingBreakdown.savings * 1.3,
      impact: analysisResult.spendingBreakdown.savings * 0.3,
      unit: "currency" as const,
    },
    {
      category: "Entertainment Spending",
      before: analysisResult.spendingBreakdown.entertainment,
      after: analysisResult.spendingBreakdown.entertainment * 0.7,
      impact: -analysisResult.spendingBreakdown.entertainment * 0.3,
      unit: "currency" as const,
    },
    {
      category: "Investment Allocation",
      before: analysisResult.spendingBreakdown.investments,
      after: analysisResult.spendingBreakdown.investments * 1.25,
      impact: analysisResult.spendingBreakdown.investments * 0.25,
      unit: "currency" as const,
    },
    {
      category: "Goal Timeline",
      before: analysisResult.goalTimeline.timeToGoal,
      after: Math.round(analysisResult.goalTimeline.timeToGoal * 0.8),
      impact: -Math.round(analysisResult.goalTimeline.timeToGoal * 0.2),
      unit: "months" as const,
    },
  ];

  const totalExpenses = Object.values(analysisResult.spendingBreakdown).reduce((sum, val) => sum + val, 0) - analysisResult.spendingBreakdown.savings - analysisResult.spendingBreakdown.investments;

  // Placeholder data for charts (replace with actual data from analysisResult)
  const goalTimelineData = [
    { month: "Jan", currentProgress: 50000, projectedProgress: 55000, simulatedProgress: 0, goalTarget: 1000000 },
    { month: "Feb", currentProgress: 65000, projectedProgress: 70000, simulatedProgress: 0, goalTarget: 1000000 },
    { month: "Mar", currentProgress: 80000, projectedProgress: 85000, simulatedProgress: 0, goalTarget: 1000000 },
    { month: "Apr", currentProgress: 95000, projectedProgress: 100000, simulatedProgress: 0, goalTarget: 1000000 },
    { month: "May", currentProgress: 110000, projectedProgress: 115000, simulatedProgress: 0, goalTarget: 1000000 },
    { month: "Jun", currentProgress: 125000, projectedProgress: 130000, simulatedProgress: 0, goalTarget: 1000000 }
  ];

  const cashFlowData = {
    income: totalExpenses + analysisResult.spendingBreakdown.savings + analysisResult.spendingBreakdown.investments,
    expenses: totalExpenses,
    investments: analysisResult.spendingBreakdown.investments,
    savings: analysisResult.spendingBreakdown.savings,
  };

  return (
    <div className="min-h-screen relative">
      <CosmicBackground />

      <div className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4">
          {/* Dashboard Header */}
          <div className="text-center mb-12">
            <h2 className="font-orbitron text-4xl font-bold mb-4">
              <span className="neon-text text-neon-cyan">Mission Analysis</span>
            </h2>
            <p className="text-xl text-gray-300">Your Financial Cosmos Mapped</p>
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
                  data={cashFlowData}
                />
              </CardContent>
            </Card>
          </div>

          {/* AI Insights Section */}
          <div className="mb-8">
            <AIInsights insights={analysisResult.insights} />
          </div>

          {/* What-If Simulator */}
          <div className="mb-8">
            <WhatIfSimulator
              questionnaireId={analysisResult.questionnaireId}
              initialData={{
                income: { monthly: 100000 },
                expenses: { total: 75000 },
                currentSavings: 50000,
                financialGoals: [{ targetAmount: 1000000, description: "Emergency Fund" }],
                spendingBreakdown: analysisResult.spendingBreakdown
              }}
            />
          </div>

          {/* Goal Timeline */}
          <Card className="cosmic-card mb-8">
            <CardContent className="p-8">
              <GoalTimelineChart
                data={goalTimelineData}
                goalName="Emergency Fund"
                targetAmount={1000000}
                currentAmount={50000}
                projectedDate="2025-12-31"
              />
            </CardContent>
          </Card>

          {/* Financial Goals Chart */}
          {analysisResult.individualGoals && analysisResult.individualGoals.length > 0 && (
            <div className="mb-8">
              <FinancialGoalsChart goals={analysisResult.individualGoals} />
            </div>
          )}

          {/* Before/After Comparison */}
          <div className="mb-8">
            <ComparisonTable data={comparisonData} />
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