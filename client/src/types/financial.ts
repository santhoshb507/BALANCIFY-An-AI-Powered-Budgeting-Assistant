export interface QuestionField {
  type: 'number' | 'text' | 'textarea' | 'radio' | 'checkbox' | 'select' | 'range' | 'goal-builder';
  label: string;
  id: string;
  placeholder?: string;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  condition?: string;
}

export interface Question {
  title: string;
  fields: QuestionField[];
}

export interface FinancialData {
  // Salary & Income
  monthly_income: number;
  side_income: "Yes" | "No";
  side_income_amount?: number;
  bonus_pay: "Yes" | "No" | "Sometimes";
  
  // Living Situation & Rent
  housing_status: "Rent" | "Own" | "Living with family";
  housing_expenses: number;
  utility_bills: number;
  household_size: number;
  
  // Food & Dining
  groceries_weekly: number;
  dining_monthly: number;
  food_ordering: "Daily" | "Few times a week" | "Rarely";
  
  // Shopping Habits
  shopping_monthly: number;
  impulse_shopping: number;
  online_shopping: "Daily" | "Weekly" | "Monthly" | "Rarely";
  
  // Subscriptions & Entertainment
  subscriptions: string[];
  subscription_cost: number;
  entertainment_hours: number;
  
  // Travel & Transportation
  commute_cost: number;
  transport_mode: "Public Transport" | "Own Vehicle" | "Both";
  transport_monthly: number;
  
  // Debt / Loans
  has_loans: "Yes" | "No";
  loan_repayment?: number;
  loan_type?: "Education" | "Car" | "Home" | "Personal" | "Credit Card";
  
  // Investments & Financial Goals
  investment_types: string[];
  monthly_investment: number;
  financial_goals: string;
  parsed_financial_goals?: FinancialGoal[];
  
  // Budgeting Behavior & Mindset
  track_spending: "Yes" | "No";
  impulse_control: number;
  saving_behavior: number;
  risk_taking: "Low" | "Medium" | "High";
  
  // Commitment & Willingness
  expense_reduction: number;
  preferred_savings: number;
  financial_discipline: number;
}

export interface FinancialGoal {
  id: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  priority: 'high' | 'medium' | 'low';
  category: 'emergency' | 'investment' | 'purchase' | 'retirement' | 'education' | 'other';
}

export interface AnalysisResult {
  questionnaireId: string;
  analysisId: string;
  insights: {
    spendingPatterns: string;
    optimizationOpportunities: string;
    investmentRecommendations: string;
    riskAnalysis: string;
    goalAchievability: string;
  };
  spendingBreakdown: {
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
  };
  needsWantsAnalysis: {
    needs: Record<string, number>;
    wants: Record<string, number>;
    needsPercentage: number;
    wantsPercentage: number;
  };
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
    emergencyFund: string;
    investmentStrategy: string;
  };
  goalTimeline: {
    currentSavings: number;
    targetAmount: number;
    monthlyContribution: number;
    timeToGoal: number;
    milestones: {
      month: number;
      amount: number;
      description: string;
    }[];
  };
  financialGoals: FinancialGoal[];
}

export interface SimulationAdjustments {
  preferred_savings?: number;
  subscription_cost?: number;
  entertainment_hours?: number;
  shopping_monthly?: number;
  dining_monthly?: number;
}
