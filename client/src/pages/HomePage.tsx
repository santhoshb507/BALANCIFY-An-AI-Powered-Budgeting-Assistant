import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSession } from '@/hooks/useSession';
import { useToast } from '@/hooks/use-toast';
import { Rocket, Sparkles, Brain, TrendingUp, Shield, Zap, ChevronRight, Star, Globe, RefreshCw, Trash2 } from 'lucide-react';

interface HomePageProps {
  onStartMission?: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onStartMission }) => {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const { session, hasActiveSession, endSession } = useSession();
  const { toast } = useToast();

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleContinueSession = () => {
    if (hasActiveSession()) {
      toast({
        title: "Session Restored",
        description: `Welcome back! Continuing your questionnaire from step ${(session?.currentStep || 0) + 1}.`,
      });
      onStartMission?.();
    }
  };

  const handleEndSession = () => {
    if (hasActiveSession()) {
      endSession();
      toast({
        title: "Session Ended",
        description: "Your previous session has been cleared. You can start fresh now.",
      });
    }
  };

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Advanced machine learning algorithms analyze your spending patterns and provide personalized insights for optimal financial decisions.",
      color: "var(--neon-cyan)",
      gradient: "from-cyan-400 to-blue-600"
    },
    {
      icon: TrendingUp,
      title: "Predictive Modeling",
      description: "Forecast your financial future with sophisticated algorithms that predict trends and help you plan for upcoming expenses.",
      color: "var(--cosmic-purple)",
      gradient: "from-purple-400 to-pink-600"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Bank-level encryption and privacy protection ensure your financial data remains completely secure and confidential.",
      color: "var(--stellar-gold)",
      gradient: "from-yellow-400 to-orange-600"
    }
  ];

  const stats = [
    { value: "10M+", label: "Financial Insights Generated", icon: Brain },
    { value: "95%", label: "Accuracy in Predictions", icon: TrendingUp },
    { value: "50K+", label: "Users Trust Us", icon: Shield },
    { value: "24/7", label: "AI Monitoring", icon: Zap }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Floating Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${6 + Math.random() * 4}s`
            }}
          >
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400 opacity-60 animate-pulse" />
          </div>
        ))}
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        <div className={`max-w-6xl mx-auto text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          
          {/* Main Title */}
          <div className="mb-8 relative">
            <h1 className="font-orbitron text-6xl md:text-8xl font-black mb-6 relative">
              <span className="text-cosmic-gradient animate-pulse-neon">
                BALANCIFY
              </span>
              <div className="absolute -top-4 -right-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400 animate-pulse opacity-80" />
              </div>
            </h1>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-neon animate-pulse" />
              <span className="text-aurora-gradient font-space text-xl font-semibold tracking-wider">
                AI BUDGETING ASSISTANT
              </span>
              <Sparkles className="w-6 h-6 text-neon animate-pulse" />
            </div>
          </div>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed font-space">
            Experience the future of financial management with 
            <span className="text-neon font-semibold"> AI-powered insights</span>, 
            <span className="text-neon-purple font-semibold"> 3D visualizations</span>, and 
            <span className="text-neon-pink font-semibold"> personalized recommendations</span> 
            that adapt to your lifestyle.
          </p>

          {/* Session Recovery Section */}
          {hasActiveSession() && (
            <Card className="mb-8 mx-auto max-w-2xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-500/30 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <RefreshCw className="w-5 h-5 text-neon-cyan animate-spin" />
                  <h3 className="text-lg font-semibold text-neon-cyan">Session Recovery Available</h3>
                </div>
                <p className="text-gray-300 mb-4">
                  Found an active session from {session?.userName}. You can continue from step {(session?.currentStep || 0) + 1} 
                  or start fresh.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={handleContinueSession}
                    className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-6 py-2 group"
                  >
                    <RefreshCw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-300" />
                    Continue Session
                  </Button>
                  <Button 
                    onClick={handleEndSession}
                    variant="outline"
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-400 px-6 py-2"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    End Session
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Button 
              onClick={onStartMission}
              className="cosmic-button px-10 py-4 text-lg font-semibold group relative overflow-hidden"
            >
              <Rocket className="w-6 h-6 mr-2 group-hover:rotate-12 transition-transform" />
              {hasActiveSession() ? 'Start New Analysis' : 'Launch Financial Analysis'}
              <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              className="px-8 py-4 text-lg border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-slate-900 transition-all duration-300 backdrop-blur-sm"
            >
              <Globe className="w-5 h-5 mr-2" />
              Explore Demo
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
            {stats.map((stat, index) => (
              <Card key={index} className="cosmic-card p-6 text-center transform-3d scale-hover">
                <CardContent className="p-0">
                  <stat.icon className="w-8 h-8 mx-auto mb-3 text-neon" />
                  <div className="font-orbitron text-2xl font-bold text-cosmic-gradient mb-1">
                    {stat.value}
                  </div>
                  <p className="text-sm text-gray-400 font-space">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-neon-cyan rounded-full flex justify-center">
            <div className="w-1 h-3 bg-neon-cyan rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-orbitron text-4xl md:text-5xl font-bold text-center mb-16 text-nebula-gradient">
            Revolutionary Features
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className={`cosmic-card p-8 transform-3d transition-all duration-500 hover:scale-105 ${
                  currentFeature === index ? 'animate-glow' : ''
                }`}
              >
                <CardContent className="p-0 text-center">
                  <div className="mb-6 relative">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-slate-800 to-slate-700 flex items-center justify-center relative overflow-hidden">
                      <feature.icon 
                        className="w-10 h-10 z-10" 
                        style={{ color: feature.color }}
                      />
                      <div 
                        className="absolute inset-0 rounded-full opacity-20"
                        style={{ background: `linear-gradient(135deg, ${feature.color}, transparent)` }}
                      />
                    </div>
                  </div>
                  <h3 className="font-orbitron text-xl font-bold mb-4 text-cosmic-gradient">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed font-space">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-orbitron text-4xl md:text-5xl font-bold text-center mb-16 text-aurora-gradient">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection Lines */}
            <div className="hidden md:block absolute top-1/2 left-1/4 w-1/2 h-0.5 bg-gradient-to-r from-neon-cyan via-cosmic-purple to-neon-pink transform -translate-y-1/2" />
            
            {[
              {
                step: "01",
                title: "Complete Questionnaire",
                description: "Answer comprehensive questions about your financial goals, spending habits, and lifestyle preferences.",
                icon: "🚀"
              },
              {
                step: "02", 
                title: "AI Analysis",
                description: "Our advanced AI processes your data using machine learning to identify patterns and opportunities.",
                icon: "🧠"
              },
              {
                step: "03",
                title: "Get Insights",
                description: "Receive personalized recommendations, 3D visualizations, and actionable insights for better financial decisions.",
                icon: "✨"
              }
            ].map((item, index) => (
              <div key={index} className="text-center relative z-10">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-slate-800 to-slate-700 flex items-center justify-center text-4xl relative overflow-hidden cosmic-card">
                  <span className="z-10">{item.icon}</span>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/20 to-purple-400/20" />
                </div>
                <div className="font-orbitron text-2xl font-bold mb-2 text-neon">
                  {item.step}
                </div>
                <h3 className="font-orbitron text-xl font-bold mb-4 text-cosmic-gradient">
                  {item.title}
                </h3>
                <p className="text-gray-300 leading-relaxed font-space">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="cosmic-card p-12 relative overflow-hidden">
            <CardContent className="p-0 relative z-10">
              <div className="mb-8">
                <Star className="w-16 h-16 mx-auto text-stellar-gold animate-pulse mb-4" />
                <h2 className="font-orbitron text-3xl md:text-4xl font-bold mb-4 text-cosmic-gradient">
                  Ready to Transform Your Finances?
                </h2>
                <p className="text-xl text-gray-300 mb-8 font-space">
                  Join thousands of users who've revolutionized their financial planning with AI-powered insights.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={onStartMission}
                  className="cosmic-button px-8 py-4 text-lg font-semibold group"
                >
                  <Rocket className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                  Start Your Financial Journey
                </Button>
              </div>
            </CardContent>
            
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/5 via-purple-400/5 to-pink-400/5" />
          </Card>
        </div>
      </section>
    </div>
  );
};

export default HomePage;