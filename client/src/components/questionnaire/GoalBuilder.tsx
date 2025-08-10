import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, Target, Clock, Star } from 'lucide-react';

interface FinancialGoal {
  description: string;
  target_amount: number;
  timeline_months: number;
  priority: "high" | "medium" | "low";
  category: "emergency" | "investment" | "purchase" | "retirement" | "education" | "other";
  reasoning?: string;
}

interface GoalBuilderProps {
  value: FinancialGoal[];
  onChange: (goals: FinancialGoal[]) => void;
}

export function GoalBuilder({ value, onChange }: GoalBuilderProps) {
  const [goals, setGoals] = useState<FinancialGoal[]>(value.length > 0 ? value : [{
    description: "",
    target_amount: 500000,
    timeline_months: 24,
    priority: "high",
    category: "emergency",
    reasoning: ""
  }]);

  const addGoal = () => {
    const newGoal: FinancialGoal = {
      description: "",
      target_amount: 100000,
      timeline_months: 12,
      priority: "medium",
      category: "other",
      reasoning: ""
    };
    const updatedGoals = [...goals, newGoal];
    setGoals(updatedGoals);
    onChange(updatedGoals);
  };

  const removeGoal = (index: number) => {
    const updatedGoals = goals.filter((_, i) => i !== index);
    setGoals(updatedGoals);
    onChange(updatedGoals);
  };

  const updateGoal = (index: number, field: keyof FinancialGoal, value: any) => {
    const updatedGoals = goals.map((goal, i) => 
      i === index ? { ...goal, [field]: value } : goal
    );
    setGoals(updatedGoals);
    onChange(updatedGoals);
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <Star className="w-4 h-4 text-red-400" />;
      case 'medium': return <Star className="w-4 h-4 text-yellow-400" />;
      case 'low': return <Star className="w-4 h-4 text-green-400" />;
      default: return <Star className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-gray-300 font-semibold">Financial Goals</Label>
        <Button
          type="button"
          onClick={addGoal}
          variant="outline"
          size="sm"
          className="text-neon-cyan border-neon-cyan hover:bg-neon-cyan/10"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Goal
        </Button>
      </div>

      {goals.map((goal, index) => (
        <Card key={index} className="cosmic-card border-slate-600">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-orbitron text-cosmic-gradient flex items-center gap-2">
                <Target className="w-4 h-4" />
                Goal {index + 1}
                {getPriorityIcon(goal.priority)}
              </CardTitle>
              {goals.length > 1 && (
                <Button
                  type="button"
                  onClick={() => removeGoal(index)}
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:bg-red-400/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-gray-300 text-sm">Goal Description</Label>
              <Input
                value={goal.description}
                onChange={(e) => updateGoal(index, 'description', e.target.value)}
                placeholder="e.g., Emergency Fund, House Purchase"
                className="bg-gray-800/50 border-gray-600 focus:border-neon-cyan text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300 text-sm flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  Target Amount (₹)
                </Label>
                <Input
                  type="number"
                  value={goal.target_amount}
                  onChange={(e) => updateGoal(index, 'target_amount', parseFloat(e.target.value) || 0)}
                  placeholder="1000000"
                  className="bg-gray-800/50 border-gray-600 focus:border-neon-cyan text-white"
                />
              </div>

              <div>
                <Label className="text-gray-300 text-sm flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Timeline (Months) - Max 20 years
                </Label>
                <Input
                  type="number"
                  value={goal.timeline_months}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 1;
                    const clampedValue = Math.min(Math.max(value, 1), 600);
                    updateGoal(index, 'timeline_months', clampedValue);
                  }}
                  placeholder="24"
                  min="1"
                  max="240"
                  className="bg-gray-800/50 border-gray-600 focus:border-neon-cyan text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300 text-sm">Priority</Label>
                <Select
                  value={goal.priority}
                  onValueChange={(value: any) => updateGoal(index, 'priority', value)}
                >
                  <SelectTrigger className="bg-gray-800/50 border-gray-600 focus:border-neon-cyan text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="low">Low Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-gray-300 text-sm">Category</Label>
                <Select
                  value={goal.category}
                  onValueChange={(value: any) => updateGoal(index, 'category', value)}
                >
                  <SelectTrigger className="bg-gray-800/50 border-gray-600 focus:border-neon-cyan text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="emergency">Emergency Fund</SelectItem>
                    <SelectItem value="purchase">Major Purchase</SelectItem>
                    <SelectItem value="investment">Investment</SelectItem>
                    <SelectItem value="retirement">Retirement</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-gray-300 text-sm">Reason for choosing this goal</Label>
              <Textarea
                value={goal.reasoning || ""}
                onChange={(e) => updateGoal(index, 'reasoning', e.target.value)}
                placeholder="e.g., Need emergency fund for financial security, planning to buy a house in 2 years..."
                className="bg-gray-800/50 border-gray-600 focus:border-neon-cyan text-white"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}