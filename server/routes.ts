import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { questionnaireDataSchema, insertQuestionnaireSchema, insertFinancialAnalysisSchema } from "@shared/schema";
import { analyzeFinancialData } from "./services/gemini";
import { generateFinancialReport } from "./services/pdfGenerator";

export async function registerRoutes(app: Express): Promise<Server> {

  // Submit questionnaire and get analysis
  app.post("/api/questionnaire", async (req, res) => {
    try {
      // Validate questionnaire data
      const validatedData = questionnaireDataSchema.parse(req.body);

      // Store questionnaire
      const questionnaire = await storage.createQuestionnaire({
        userId: null, // For now, no user authentication
        data: validatedData,
      });

      // Analyze financial data with AI
      const analysisResult = await analyzeFinancialData(validatedData);

      // Store analysis
      const financialAnalysis = await storage.createFinancialAnalysis({
        questionnaireId: questionnaire.id,
        aiInsights: JSON.stringify(analysisResult.insights),
        spendingBreakdown: analysisResult.spendingBreakdown,
        needsWantsAnalysis: analysisResult.needsWantsAnalysis,
        recommendations: analysisResult.recommendations,
        goalTimeline: analysisResult.goalTimeline,
      });

      res.json({
        questionnaireId: questionnaire.id,
        analysisId: financialAnalysis.id,
        ...analysisResult,
      });
    } catch (error: any) {
      console.error("Error processing questionnaire:", error);
      res.status(400).json({
        error: "Failed to process questionnaire",
        details: error.message
      });
    }
  });

  // Get analysis by questionnaire ID
  app.get("/api/analysis/:questionnaireId", async (req, res) => {
    try {
      const { questionnaireId } = req.params;

      const questionnaire = await storage.getQuestionnaire(questionnaireId);
      if (!questionnaire) {
        return res.status(404).json({ error: "Questionnaire not found" });
      }

      const analysis = await storage.getFinancialAnalysis(questionnaireId);
      if (!analysis) {
        return res.status(404).json({ error: "Analysis not found" });
      }

      res.json({
        questionnaire,
        analysis,
      });
    } catch (error: any) {
      console.error("Error getting analysis:", error);
      res.status(500).json({
        error: "Failed to get analysis",
        details: error.message
      });
    }
  });

  // Generate and download PDF report
  app.get("/api/report/:questionnaireId", async (req, res) => {
    try {
      const { questionnaireId } = req.params;

      const analysis = await storage.getFinancialAnalysis(questionnaireId);
      if (!analysis) {
        return res.status(404).json({ error: "Analysis not found" });
      }

      const pdfBuffer = await generateFinancialReport(analysis);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=financial-report-${questionnaireId}.pdf`);
      res.send(pdfBuffer);
    } catch (error: any) {
      console.error("Error generating PDF:", error);
      res.status(500).json({
        error: "Failed to generate PDF report",
        details: error.message
      });
    }
  });

  // Simulate what-if scenarios
  app.post("/api/simulate", async (req, res) => {
    try {
      const { questionnaireId, simulation } = req.body;

      const questionnaire = await storage.getQuestionnaire(questionnaireId);
      if (!questionnaire) {
        return res.status(404).json({ error: "Questionnaire not found" });
      }

      // Get original analysis for comparison
      const originalData = questionnaire.data as any;
      const originalAnalysis = await analyzeFinancialData(originalData);

      // Apply simulation adjustments to the original data
      const adjustedData = {
        ...originalData,
        monthly_income: originalData.monthly_income * (1 + simulation.incomeIncrease / 100),
        preferred_savings: originalData.preferred_savings + (simulation.additionalSavings / 100 * originalData.monthly_income),
        monthly_investment: originalData.monthly_investment * (1 + simulation.investmentBoost / 100),
        // Reduce expenses based on expense reduction percentage
        housing_expenses: originalData.housing_expenses * (1 - simulation.expenseReduction / 100),
        dining_monthly: originalData.dining_monthly * (1 - simulation.expenseReduction / 100),
        shopping_monthly: originalData.shopping_monthly * (1 - simulation.expenseReduction / 100),
        subscription_cost: originalData.subscription_cost * (1 - simulation.expenseReduction / 100),
      };

      // Re-analyze with adjusted data, with fallback for quota issues
      let simulatedAnalysis;
      try {
        simulatedAnalysis = await analyzeFinancialData(adjustedData);
      } catch (error: any) {
        // Fallback analysis when API quota is exceeded
        console.warn('AI Analysis failed, using fallback:', error.message);
        simulatedAnalysis = {
          insights: {
            spendingPatterns: 'Improved spending efficiency with your adjustments.',
            optimizationOpportunities: 'Further optimization possible with consistent tracking.',
            investmentRecommendations: 'Consider diversified investment portfolio based on your risk profile.',
            riskAnalysis: 'Moderate risk level with improved financial discipline.',
            goalAchievability: 'Goals are more achievable with current adjustments.'
          },
          recommendations: {
            immediate: ['Track all expenses', 'Set up automatic savings'],
            shortTerm: ['Build emergency fund', 'Optimize subscriptions'],
            longTerm: ['Increase investment allocation', 'Plan for major purchases'],
            emergencyFund: 'Build 6 months of expenses as emergency fund',
            investmentStrategy: 'Diversify across equity and debt instruments'
          }
        };
      }

      // Calculate comparison metrics
      const originalMonthlySavings = originalData.preferred_savings + originalData.monthly_investment;
      const newMonthlySavings = adjustedData.preferred_savings + adjustedData.monthly_investment;
      const savingsIncrease = newMonthlySavings - originalMonthlySavings;
      const timeToGoalMonths = Math.ceil(simulation.goalTarget / newMonthlySavings);

      // Generate monthly projection data for charts
      const monthlyData = [];
      for (let month = 1; month <= 24; month++) {
        const beforeScenario = originalMonthlySavings * month;
        const afterScenario = newMonthlySavings * month;
        monthlyData.push({
          month: `Month ${month}`,
          beforeScenario,
          afterScenario,
          goalTarget: simulation.goalTarget,
          savings: newMonthlySavings,
          difference: afterScenario - beforeScenario,
        });
      }

      // Generate goal timeline data
      const goalTimeline = [];
      for (let month = 1; month <= Math.min(timeToGoalMonths + 6, 60); month++) {
        const currentProgress = originalMonthlySavings * month;
        const projectedProgress = originalMonthlySavings * month;
        const simulatedProgress = newMonthlySavings * month;

        goalTimeline.push({
          month: `Month ${month}`,
          currentProgress,
          projectedProgress,
          simulatedProgress,
          goalTarget: simulation.goalTarget,
          milestone: month % 12 === 0 ? `Year ${month / 12}` : undefined,
        });
      }

      // Process individual goals from the questionnaire data
      const updatedGoals = originalData.financial_goals.map((goal: any) => {
        const goalTargetAmount = goal.amount;
        const goalTimePeriodMonths = Math.ceil(goalTargetAmount / newMonthlySavings);
        return {
          ...goal,
          timeToAchieve: `${Math.floor(goalTimePeriodMonths / 12)} years and ${goalTimePeriodMonths % 12} months`,
          progress: (newMonthlySavings / goalTargetAmount) * 100, // Simplified progress indicator
        };
      });


      // Format response in expected structure
      res.json({
        insights: {
          goalAchievability: simulatedAnalysis.insights.goalAchievability,
          timeToGoal: `${timeToGoalMonths} months`,
          savingsImpact: `₹${savingsIncrease.toLocaleString()} additional monthly savings`,
          recommendations: simulatedAnalysis.recommendations.immediate.concat(
            simulatedAnalysis.recommendations.shortTerm
          ).slice(0, 3)
        },
        projections: {
          monthlyData,
          goalTimeline
        },
        individualGoals: updatedGoals
      });
    } catch (error: any) {
      console.error("Error running simulation:", error);
      res.status(500).json({
        error: "Failed to run simulation",
        details: error.message
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}