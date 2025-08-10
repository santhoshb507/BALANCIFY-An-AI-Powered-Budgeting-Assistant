import { GoogleGenAI } from "@google/genai";
import { QuestionnaireData } from "@shared/schema";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface FinancialInsights {
  spendingPatterns: string;
  optimizationOpportunities: string;
  investmentRecommendations: string;
  riskAnalysis: string;
  goalAchievability: string;
}

export interface SpendingBreakdown {
  housing: number;
  food: number;
  transportation: number;
  entertainment: number;
  shopping: number;
  subscriptions: number;
  loans: number;
  investments: number;
  savings: number;
  other: number;
}

export interface NeedsWantsAnalysis {
  needs: {
    housing: number;
    food_essential: number;
    transportation: number;
    utilities: number;
    loan_payments: number;
  };
  wants: {
    dining_out: number;
    entertainment: number;
    shopping: number;
    subscriptions: number;
    other: number;
  };
  needsPercentage: number;
  wantsPercentage: number;
}

export interface Recommendations {
  immediate: string[];
  shortTerm: string[];
  longTerm: string[];
  emergencyFund: string;
  investmentStrategy: string;
}

export interface GoalTimeline {
  currentSavings: number;
  targetAmount: number;
  monthlyContribution: number;
  timeToGoal: number;
  milestones: {
    month: number;
    amount: number;
    description: string;
  }[];
}

export async function analyzeFinancialData(data: QuestionnaireData): Promise<{
  insights: FinancialInsights;
  spendingBreakdown: SpendingBreakdown;
  needsWantsAnalysis: NeedsWantsAnalysis;
  recommendations: Recommendations;
  goalTimeline: GoalTimeline;
  individualGoals: {
    description: string;
    amount: number;
    timeToAchieve: number;
    monthlyRequired: number;
    feasibility: string;
  }[];
}> {
  try {
    // Calculate spending breakdown
    const spendingBreakdown = calculateSpendingBreakdown(data);
    
    // Analyze needs vs wants
    const needsWantsAnalysis = analyzeNeedsVsWants(data, spendingBreakdown);
    
    // Parse and analyze individual goals
    const parsedGoals = parseFinancialGoals(data.financial_goals);
    const individualGoals = calculateIndividualGoals(parsedGoals, spendingBreakdown, data);
    
    // Calculate goal timeline
    const goalTimeline = calculateGoalTimeline(data, spendingBreakdown);
    
    // Generate AI insights
    const insights = await generateAIInsights(data, spendingBreakdown, needsWantsAnalysis);
    
    // Generate recommendations
    const recommendations = await generateRecommendations(data, spendingBreakdown, needsWantsAnalysis);
    
    return {
      insights,
      spendingBreakdown,
      needsWantsAnalysis,
      recommendations,
      goalTimeline,
      individualGoals,
    };
  } catch (error) {
    throw new Error(`Failed to analyze financial data: ${error}`);
  }
}

function calculateSpendingBreakdown(data: QuestionnaireData): SpendingBreakdown {
  const monthlyGroceries = data.groceries_weekly * 4;
  const loanPayment = data.has_loans === "Yes" ? (data.loan_repayment || 0) : 0;
  
  return {
    housing: data.housing_expenses + data.utility_bills,
    food: monthlyGroceries + data.dining_monthly,
    transportation: data.transport_monthly,
    entertainment: calculateEntertainmentCost(data),
    shopping: data.shopping_monthly,
    subscriptions: data.subscription_cost,
    loans: loanPayment,
    investments: data.monthly_investment,
    savings: data.preferred_savings,
    other: Math.max(0, data.monthly_income - (
      data.housing_expenses + data.utility_bills +
      monthlyGroceries + data.dining_monthly +
      data.transport_monthly +
      calculateEntertainmentCost(data) +
      data.shopping_monthly +
      data.subscription_cost +
      loanPayment +
      data.monthly_investment +
      data.preferred_savings
    ))
  };
}

function calculateEntertainmentCost(data: QuestionnaireData): number {
  // Estimate entertainment cost based on hours and spending patterns
  const baseRate = data.impulse_shopping * 500; // Base rate per impulse level
  const frequencyMultiplier = data.entertainment_hours / 10;
  return Math.round(baseRate * frequencyMultiplier);
}

function analyzeNeedsVsWants(data: QuestionnaireData, spending: SpendingBreakdown): NeedsWantsAnalysis {
  const needs = {
    housing: spending.housing,
    food_essential: Math.round(spending.food * 0.7), // 70% of food is essential
    transportation: spending.transportation,
    utilities: data.utility_bills,
    loan_payments: spending.loans,
  };
  
  const wants = {
    dining_out: Math.round(spending.food * 0.3), // 30% of food is dining out
    entertainment: spending.entertainment,
    shopping: spending.shopping,
    subscriptions: spending.subscriptions,
    other: spending.other,
  };
  
  const totalNeeds = Object.values(needs).reduce((sum, val) => sum + val, 0);
  const totalWants = Object.values(wants).reduce((sum, val) => sum + val, 0);
  const totalSpending = totalNeeds + totalWants;
  
  return {
    needs,
    wants,
    needsPercentage: Math.round((totalNeeds / totalSpending) * 100),
    wantsPercentage: Math.round((totalWants / totalSpending) * 100),
  };
}

function parseFinancialGoals(goalsString: string): { description: string; amount: number }[] {
  const goals: { description: string; amount: number }[] = [];
  
  // Split by comma and parse each goal
  const goalParts = goalsString.split(',').map(g => g.trim());
  
  for (const goalPart of goalParts) {
    // Look for patterns like "Purchase house for 400000" or "Car 500000"
    const match = goalPart.match(/(.+?)(?:for\s+)?(\d+)$/i);
    if (match) {
      const description = match[1].trim();
      const amount = parseInt(match[2]);
      if (description && amount > 0) {
        goals.push({ description, amount });
      }
    }
  }
  
  return goals;
}

function calculateIndividualGoals(
  goals: { description: string; amount: number }[],
  spending: SpendingBreakdown,
  data: QuestionnaireData
): {
  description: string;
  amount: number;
  timeToAchieve: number;
  monthlyRequired: number;
  feasibility: string;
}[] {
  const availableForGoals = data.preferred_savings + (data.monthly_investment * 0.3); // 30% of investment can go to goals
  
  return goals.map(goal => {
    // Calculate time to achieve based on available savings
    const monthlyRequired = goal.amount / 60; // Assume 5 years max
    const timeToAchieve = Math.ceil(goal.amount / availableForGoals);
    
    // Determine feasibility
    let feasibility = 'High';
    if (monthlyRequired > availableForGoals * 0.8) {
      feasibility = 'Low';
    } else if (monthlyRequired > availableForGoals * 0.5) {
      feasibility = 'Medium';
    }
    
    return {
      description: goal.description,
      amount: goal.amount,
      timeToAchieve: Math.min(timeToAchieve, 120), // Max 10 years
      monthlyRequired: Math.round(monthlyRequired),
      feasibility
    };
  });
}

function calculateGoalTimeline(data: QuestionnaireData, spending: SpendingBreakdown): GoalTimeline {
  const totalExpenses = Object.values(spending).reduce((sum, val) => sum + val, 0) - spending.savings;
  const monthlySavings = data.monthly_investment + data.preferred_savings;
  const targetAmount = data.preferred_savings * 120; // Assume 10-year goal
  
  const timeToGoal = Math.ceil(targetAmount / monthlySavings);
  
  const milestones = [];
  for (let i = 1; i <= Math.min(timeToGoal, 60); i += 12) {
    milestones.push({
      month: i,
      amount: monthlySavings * i,
      description: `Year ${Math.ceil(i/12)} milestone`,
    });
  }
  
  return {
    currentSavings: 0, // Assuming starting fresh
    targetAmount,
    monthlyContribution: monthlySavings,
    timeToGoal,
    milestones,
  };
}

async function generateAIInsights(
  data: QuestionnaireData,
  spending: SpendingBreakdown,
  needsWants: NeedsWantsAnalysis
): Promise<FinancialInsights> {
  const prompt = `
  Analyze this financial profile and provide insights:
  
  Income: ₹${data.monthly_income}
  Spending Breakdown: ${JSON.stringify(spending)}
  Needs vs Wants: ${needsWants.needsPercentage}% needs, ${needsWants.wantsPercentage}% wants
  Financial Discipline: ${data.financial_discipline}/5
  Risk Tolerance: ${data.risk_taking}
  Investment Types: ${data.investment_types.join(', ')}
  
  Provide insights in JSON format with these fields:
  - spendingPatterns: analysis of spending behavior
  - optimizationOpportunities: areas for improvement
  - investmentRecommendations: investment advice based on risk profile
  - riskAnalysis: financial risk assessment
  - goalAchievability: assessment of goal achievability
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          spendingPatterns: { type: "string" },
          optimizationOpportunities: { type: "string" },
          investmentRecommendations: { type: "string" },
          riskAnalysis: { type: "string" },
          goalAchievability: { type: "string" },
        },
        required: ["spendingPatterns", "optimizationOpportunities", "investmentRecommendations", "riskAnalysis", "goalAchievability"],
      },
    },
    contents: prompt,
  });

  const rawJson = response.text;
  if (rawJson) {
    return JSON.parse(rawJson);
  } else {
    throw new Error("Empty response from AI model");
  }
}

async function generateRecommendations(
  data: QuestionnaireData,
  spending: SpendingBreakdown,
  needsWants: NeedsWantsAnalysis
): Promise<Recommendations> {
  const prompt = `
  Based on this financial profile, provide actionable recommendations:
  
  Income: ₹${data.monthly_income}
  Spending: ${JSON.stringify(spending)}
  Willingness to reduce expenses: ${data.expense_reduction}/10
  Financial goals: ${data.financial_goals}
  
  Provide recommendations in JSON format:
  - immediate: array of immediate actions (1-3 months)
  - shortTerm: array of short-term goals (3-12 months)
  - longTerm: array of long-term strategies (1+ years)
  - emergencyFund: emergency fund recommendation
  - investmentStrategy: investment strategy recommendation
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          immediate: { type: "array", items: { type: "string" } },
          shortTerm: { type: "array", items: { type: "string" } },
          longTerm: { type: "array", items: { type: "string" } },
          emergencyFund: { type: "string" },
          investmentStrategy: { type: "string" },
        },
        required: ["immediate", "shortTerm", "longTerm", "emergencyFund", "investmentStrategy"],
      },
    },
    contents: prompt,
  });

  const rawJson = response.text;
  if (rawJson) {
    return JSON.parse(rawJson);
  } else {
    throw new Error("Empty response from AI model");
  }
}
