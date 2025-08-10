import { useState, useEffect } from 'react';

interface SessionData {
  sessionId: string;
  userName: string;
  startTime: Date;
  isActive: boolean;
  questionnaireCompleted: boolean;
  analysisResult?: any;
  formData?: any; // Store questionnaire progress
  currentStep?: number; // Track questionnaire step
  questionnaireData?: any; // Complete questionnaire responses
}

export function useSession() {
  const [session, setSession] = useState<SessionData | null>(null);

  // Load session from localStorage on mount
  useEffect(() => {
    const savedSession = localStorage.getItem('balancify_session');
    if (savedSession) {
      const parsedSession = JSON.parse(savedSession);
      // Check if session is still valid (within 24 hours)
      const sessionAge = Date.now() - new Date(parsedSession.startTime).getTime();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      if (sessionAge < maxAge && parsedSession.isActive) {
        setSession({
          ...parsedSession,
          startTime: new Date(parsedSession.startTime)
        });
      } else {
        // Clear expired session
        localStorage.removeItem('balancify_session');
      }
    }
  }, []);

  // Save session to localStorage whenever it changes
  useEffect(() => {
    if (session) {
      localStorage.setItem('balancify_session', JSON.stringify(session));
    }
  }, [session]);

  const createSession = (userName: string) => {
    // Always create a fresh session when called
    const newSession: SessionData = {
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userName,
      startTime: new Date(),
      isActive: true,
      questionnaireCompleted: false
    };
    setSession(newSession);
    return newSession;
  };

  const updateSession = (updates: Partial<SessionData>) => {
    if (session) {
      const updatedSession = { ...session, ...updates };
      setSession(updatedSession);
    }
  };

  const saveQuestionnaireProgress = (formData: any, currentStep: number) => {
    if (session) {
      updateSession({ 
        formData: formData,
        currentStep: currentStep
      });
    }
  };

  const saveQuestionnaireData = (questionnaireData: any) => {
    if (session) {
      updateSession({ 
        questionnaireData: questionnaireData,
        questionnaireCompleted: true
      });
    }
  };

  const hasExistingSession = () => {
    return session && session.isActive;
  };

  const hasCompletedQuestionnaire = () => {
    return session && session.questionnaireCompleted && session.questionnaireData;
  };

  const hasAnalysisResult = () => {
    return session && session.analysisResult;
  };

  const completeSession = () => {
    if (session) {
      updateSession({ 
        isActive: false,
        questionnaireCompleted: true 
      });
    }
  };

  const endSession = () => {
    localStorage.removeItem('balancify_session');
    setSession(null);
  };

  const hasActiveSession = () => {
    return session?.isActive && !session?.questionnaireCompleted;
  };

  return {
    session,
    createSession,
    updateSession,
    completeSession,
    endSession,
    hasActiveSession,
    saveQuestionnaireProgress,
    saveQuestionnaireData,
    hasExistingSession,
    hasCompletedQuestionnaire,
    hasAnalysisResult
  };
}