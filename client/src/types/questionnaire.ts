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
  defaultValue?: any;
}

export interface Question {
  title: string;
  fields: QuestionField[];
}

export const questions: Question[] = [
  {
    title: "Salary & Income",
    fields: [
      { type: "number", label: "Monthly Income (₹)", id: "monthly_income", placeholder: "50000" },
      { type: "radio", label: "Do you have side income?", id: "side_income", options: ["Yes", "No"] },
      { type: "number", label: "Side Income Amount (₹)", id: "side_income_amount", placeholder: "10000", condition: "side_income=Yes" },
      { type: "select", label: "Bonuses/Variable Pay?", id: "bonus_pay", options: ["Yes", "No", "Sometimes"] }
    ]
  },
  {
    title: "Living Situation & Rent",
    fields: [
      { type: "radio", label: "Housing Status", id: "housing_status", options: ["Rent", "Own", "Living with family"] },
      { type: "number", label: "Monthly Housing Expenses (₹)", id: "housing_expenses", placeholder: "15000" },
      { type: "range", label: "Utility Bills (Monthly ₹)", id: "utility_bills", min: 0, max: 10000, step: 500 },
      { type: "number", label: "Number of People in Home", id: "household_size", placeholder: "3", defaultValue: 1 }
    ]
  },
  {
    title: "Food & Dining",
    fields: [
      { type: "number", label: "Weekly Groceries (₹)", id: "groceries_weekly", placeholder: "2000" },
      { type: "number", label: "Monthly Dining Out (₹)", id: "dining_monthly", placeholder: "3000" },
      { type: "select", label: "Food Ordering Frequency", id: "food_ordering", options: ["Daily", "Few times a week", "Rarely"] }
    ]
  },
  {
    title: "Shopping Habits",
    fields: [
      { type: "number", label: "Monthly Clothing & Personal Care (₹)", id: "shopping_monthly", placeholder: "2500" },
      { type: "range", label: "Impulse Shopping (1-5)", id: "impulse_shopping", min: 1, max: 5, step: 1 },
      { type: "select", label: "Online Shopping Frequency", id: "online_shopping", options: ["Daily", "Weekly", "Monthly", "Rarely"] }
    ]
  },
  {
    title: "Subscriptions & Entertainment",
    fields: [
      { type: "checkbox", label: "Active Subscriptions", id: "subscriptions", options: ["Netflix", "Spotify", "Gym", "Amazon Prime", "Other OTT"] },
      { type: "number", label: "Total Monthly Subscription Cost (₹)", id: "subscription_cost", placeholder: "1500" },
      { type: "range", label: "Entertainment Hours/Week", id: "entertainment_hours", min: 0, max: 50, step: 5 }
    ]
  },
  {
    title: "Travel & Transportation",
    fields: [
      { type: "number", label: "Daily Commute Cost (₹)", id: "commute_cost", placeholder: "200" },
      { type: "radio", label: "Transportation Mode", id: "transport_mode", options: ["Public Transport", "Own Vehicle", "Both"] },
      { type: "number", label: "Monthly Transport Expense (₹)", id: "transport_monthly", placeholder: "3000" }
    ]
  },
  {
    title: "Debt / Loans",
    fields: [
      { type: "radio", label: "Do you have loans/EMIs?", id: "has_loans", options: ["Yes", "No"] },
      { type: "number", label: "Monthly Repayment (₹)", id: "loan_repayment", placeholder: "8000", condition: "has_loans=Yes" },
      { type: "select", label: "Loan Type", id: "loan_type", options: ["Education", "Car", "Home", "Personal", "Credit Card"], condition: "has_loans=Yes" }
    ]
  },
  {
    title: "Investments & Financial Goals",
    fields: [
      { type: "checkbox", label: "Investment Types", id: "investment_types", options: ["Fixed Deposits", "Stocks", "Mutual Funds", "Crypto", "Gold"] },
      { type: "number", label: "Monthly Investment Amount (₹)", id: "monthly_investment", placeholder: "5000" },
      { type: "textarea", label: "Long-term Financial Goals", id: "financial_goals", placeholder: "House purchase, retirement planning..." }
    ]
  },
  {
    title: "Budgeting Behavior & Mindset",
    fields: [
      { type: "radio", label: "Do you track spending?", id: "track_spending", options: ["Yes", "No"] },
      { type: "range", label: "Impulse Control (1-5)", id: "impulse_control", min: 1, max: 5, step: 1 },
      { type: "range", label: "Saving Behavior (1-10)", id: "saving_behavior", min: 1, max: 10, step: 1 },
      { type: "radio", label: "Financial Risk Taking", id: "risk_taking", options: ["Low", "Medium", "High"] }
    ]
  },
  {
    title: "Commitment & Willingness",
    fields: [
      { type: "range", label: "Willingness to reduce expenses (1-10)", id: "expense_reduction", min: 1, max: 10, step: 1 },
      { type: "number", label: "Preferred Monthly Savings (₹)", id: "preferred_savings", placeholder: "10000" },
      { type: "range", label: "Financial Discipline Level (1-5)", id: "financial_discipline", min: 1, max: 5, step: 1 }
    ]
  }
];
