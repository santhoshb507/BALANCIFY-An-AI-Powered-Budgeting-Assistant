import { QuestionForm } from '@/components/questionnaire/QuestionForm';
import { CosmicBackground } from '@/components/ui/cosmic-background';
import { useQuestionnaire } from '@/hooks/useQuestionnaire';
import { Question, FinancialData } from '@/types/financial';
import { useEffect } from 'react';
import { useSession } from '@/hooks/useSession';
import { useToast } from '@/hooks/use-toast';

const questions: Question[] = [
  {
    title: "Personal Information & Income",
    fields: [
      { type: "text", label: "Your Name", id: "name", placeholder: "Enter your full name" },
      { type: "number", label: "Monthly Income (₹)", id: "monthly_income", placeholder: "50000" },
      { type: "radio", label: "Do you have side income?", id: "side_income", options: ["Yes", "No"] },
      { type: "number", label: "Side Income Amount (₹)", id: "side_income_amount", placeholder: "10000", condition: "side_income=Yes" },
      { type: "select", label: "Do you get bonuses/variable pay?", id: "bonus_pay", options: ["Yes", "No", "Sometimes"] }
    ]
  },
  {
    title: "Living Situation & Rent",
    fields: [
      { type: "radio", label: "Housing Status", id: "housing_status", options: ["Rent", "Own", "Living with family"] },
      { type: "number", label: "Monthly Housing Expenses (₹)", id: "housing_expenses", placeholder: "15000" },
      { type: "range", label: "Utility Bills (Monthly)", id: "utility_bills", min: 0, max: 10000, step: 500 },
      { type: "number", label: "Number of People in Home", id: "household_size", placeholder: "3" }
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
      { type: "range", label: "Impulse Shopping Scale", id: "impulse_shopping", min: 1, max: 5, step: 1 },
      { type: "select", label: "Online Shopping Frequency", id: "online_shopping", options: ["Daily", "Weekly", "Monthly", "Rarely"] }
    ]
  },
  {
    title: "Subscriptions & Entertainment",
    fields: [
      { type: "checkbox", label: "Active Subscriptions", id: "subscriptions", options: ["Netflix", "Spotify", "Gym", "Amazon Prime", "Other OTT"] },
      { type: "number", label: "Total Monthly Subscription Cost (₹)", id: "subscription_cost", placeholder: "1500" },
      { type: "range", label: "Entertainment Hours per Week", id: "entertainment_hours", min: 0, max: 50, step: 5 }
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
      { type: "checkbox", label: "Financial Goal Priorities", id: "financial_goals", options: ["Emergency Fund (High Priority)", "House Purchase (High Priority)", "Retirement Planning (Medium Priority)", "Education Fund (Medium Priority)", "Investment Growth (Low Priority)", "Travel Fund (Low Priority)"] }
    ]
  },
  {
    title: "Budgeting Behavior & Mindset",
    fields: [
      { type: "radio", label: "Do you track spending?", id: "track_spending", options: ["Yes", "No"] },
      { type: "range", label: "Impulse Control", id: "impulse_control", min: 1, max: 5, step: 1 },
      { type: "range", label: "Saving Behavior", id: "saving_behavior", min: 1, max: 10, step: 1 },
      { type: "radio", label: "Financial Risk Taking", id: "risk_taking", options: ["Low", "Medium", "High"] }
    ]
  },
  {
    title: "Commitment & Willingness",
    fields: [
      { type: "range", label: "Willingness to reduce expenses", id: "expense_reduction", min: 1, max: 10, step: 1 },
      { type: "number", label: "Preferred Monthly Savings (₹)", id: "preferred_savings", placeholder: "10000" },
      { type: "range", label: "Financial Discipline Level", id: "financial_discipline", min: 1, max: 5, step: 1 }
    ]
  }
];

interface QuestionnairePageProps {
  onComplete: (analysisResult: any) => void;
}

export function QuestionnairePage({ onComplete }: QuestionnairePageProps) {
  const { session, createSession, hasActiveSession } = useSession();
  const { toast } = useToast();
  const {
    currentStep,
    formData,
    updateFormData,
    nextStep,
    prevStep,
    submitQuestionnaire,
    isSubmitting,
    analysisResult,
    error,
  } = useQuestionnaire();

  // Show session recovery notification on first render
  useEffect(() => {
    if (hasActiveSession() && session) {
      toast({
        title: "Session Restored",
        description: `Welcome back! Your progress has been restored from step ${(session.currentStep || 0) + 1}.`,
      });
    }
  }, []); // Only run once on mount

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  // Simple form change handler with session creation
  const handleFormChange = (newData: any) => {
    console.log('Form change detected:', newData);
    updateFormData(newData);
    
    // Create session when user enters a name (length > 1)
    if (newData.name && typeof newData.name === 'string' && newData.name.length > 1) {
      if (!session) {
        console.log('Creating new session for:', newData.name);
        createSession(newData.name);
      } else if (session.userName !== newData.name) {
        console.log('Updating session for new user:', newData.name);
        createSession(newData.name);
      }
    }
  };

  const handleNext = () => {
    if (currentStep === questions.length - 1) {
      // Submit the questionnaire
      submitQuestionnaire.mutate(formData as any);
    } else {
      nextStep();
    }
  };

  useEffect(() => {
    if (analysisResult) {
      onComplete(analysisResult);
    }
  }, [analysisResult, onComplete]);

  if (isSubmitting) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <CosmicBackground />
        <div className="text-center space-y-6 relative z-10">
          <div className="animate-spin text-6xl">🛰️</div>
          <h2 className="font-orbitron text-2xl font-bold text-neon-cyan">
            Analyzing Your Financial Universe...
          </h2>
          <p className="text-gray-300">Our AI is processing your data to generate personalized insights</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <CosmicBackground />
        <div className="text-center space-y-6 relative z-10">
          <div className="text-6xl">❌</div>
          <h2 className="font-orbitron text-2xl font-bold text-red-400">
            Mission Failed
          </h2>
          <p className="text-gray-300">There was an error processing your data. Please try again.</p>
          <p className="text-red-400 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative py-20">
      <CosmicBackground />
      
      <div className="relative z-10">
        <QuestionForm
          question={currentQuestion}
          data={formData}
          onDataChange={handleFormChange}
          onNext={handleNext}
          onPrev={prevStep}
          isFirst={currentStep === 0}
          isLast={currentStep === questions.length - 1}
          progress={progress}
        />
      </div>
    </div>
  );
}
