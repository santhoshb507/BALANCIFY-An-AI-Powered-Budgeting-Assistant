import { useState } from 'react';
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "./lib/queryClient";
import HomePage from '@/pages/HomePage';
import { QuestionnairePage } from '@/pages/QuestionnairePage';
import { DashboardPage } from '@/pages/DashboardPage';
import { AnalysisResult } from '@/types/financial';

type AppState = 'home' | 'questionnaire' | 'dashboard';

function App() {
  const [currentState, setCurrentState] = useState<AppState>('home');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [questionnaireData, setQuestionnaireData] = useState<any>(null); // Added to store questionnaire data

  const handleStartMission = () => {
    setCurrentState('questionnaire');
  };

  const handleQuestionnaireComplete = (result: AnalysisResult, data: any) => { // Added data parameter
    setAnalysisResult(result);
    setQuestionnaireData(data); // Store questionnaire data
    setCurrentState('dashboard');
  };

  const handleStartNew = () => {
    setAnalysisResult(null);
    setQuestionnaireData(null); // Clear questionnaire data
    setCurrentState('home');
  };

  const renderCurrentPage = () => {
    switch (currentState) {
      case 'home':
        return <HomePage onStartMission={handleStartMission} />;
      case 'questionnaire':
        return <QuestionnairePage onComplete={handleQuestionnaireComplete} />;
      case 'dashboard':
        return analysisResult && questionnaireData && (
          <DashboardPage 
            analysisResult={analysisResult} 
            questionnaireData={questionnaireData} // Pass questionnaireData
            onStartNew={handleStartNew}
          />
        );
      default:
        return <HomePage onStartMission={handleStartMission} />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-gradient-to-br from-[#0B0B1F] via-[#1A1A3A] to-[#2D1B69]">
          {renderCurrentPage()}
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;