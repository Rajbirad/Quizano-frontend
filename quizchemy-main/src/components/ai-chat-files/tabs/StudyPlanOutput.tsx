import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Clock, CheckCircle, Brain, Calendar, PenTool, BookText, FileText, GraduationCap } from 'lucide-react';
import { useFileContext } from '../FileContext';
import { useToast } from '@/hooks/use-toast';
import { API_URL } from '@/lib/api-utils';

interface StudyPlanData {
  duration: number;
  dailyTasks: Array<{
    day: number;
    task: string;
    type: string;
    icon: any;
    content: {
      goal: string;
      concepts: string[];
      practice: string[];
    };
  }>;
}

const getIconForType = (type: string = 'study') => {
  switch (type.toLowerCase()) {
    case 'reading':
      return BookOpen;
    case 'quiz':
      return Brain;
    case 'practice':
      return PenTool;
    case 'review':
      return CheckCircle;
    case 'assignment':
      return FileText;
    case 'assessment':
      return GraduationCap;
    case 'notes':
      return BookText;
    default:
      return Clock;
  }
};

export const StudyPlanOutput: React.FC = () => {
  const { selectedFile } = useFileContext();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [duration, setDuration] = useState('7');
  const [studyPlan, setStudyPlan] = useState<StudyPlanData | null>(null);

  const generateStudyPlan = async () => {
    if (!selectedFile) {
      toast({
        title: "No document selected",
        description: "Please select a document first"
      });
      return;
    }

    setIsGenerating(true);

    const documentId = (selectedFile as any)?.chatData?.document_id;
    if (!documentId) {
      toast({
        title: "Error",
        description: "Document ID not found",
        variant: "destructive"
      });
      setIsGenerating(false);
      return;
    }

    // Call the study plan API
    const formData = new FormData();
    
    // Add the original file if available
    if (selectedFile?.originalFile instanceof File) {
      formData.append('file', selectedFile.originalFile);
      console.log('Adding file to study plan request:', {
        name: selectedFile.originalFile.name,
        size: selectedFile.originalFile.size,
        type: selectedFile.originalFile.type
      });
    } else {
      console.log('No original file found for study plan');
    }
    
    formData.append('document_id', documentId);
    formData.append('duration', duration);

    try {
      const { makeAuthenticatedFormRequest } = await import('@/lib/api-utils');
      const response = await makeAuthenticatedFormRequest(`${API_URL}/api/document/study-plan`, formData);
      
      if (!response.ok) {
        const errorText = await response.text();
        toast({
          title: "Error generating study plan",
          description: errorText,
          variant: "destructive"
        });
        setIsGenerating(false);
        return;
      }

      const data = await response.json();
      
      const studyPlanText = data.study_plan;
      const expectedDays = parseInt(duration);
      
      // Clean up and normalize the study plan text
      const cleanStudyPlanText = studyPlanText
        .replace(/Continue the plan.*$/s, '') // Remove "Continue the plan" and everything after
        .replace(/\n{3,}/g, '\n\n') // Normalize multiple newlines
        .trim();
      
      // Improved regex to capture all days correctly
      const dayRegex = /Day (\d+)(?:\s*[–-][^\n]*)?[\r\n]+([\s\S]*?)(?=Day \d+|$)/g;
      const daysWithNumbers = [];
      let match;

      while ((match = dayRegex.exec(cleanStudyPlanText)) !== null) {
        const dayNumber = match[1];
        const content = match[2].trim();
        
        // Parse sections with improved handling
        const extractSection = (text: string, sectionName: string) => {
          const sectionPattern = new RegExp(`${sectionName}:\\s*([\\s\\S]*?)(?=\\s*(?:Goal:|Concepts to Learn:|Practice:|$))`, 's');
          const sectionMatch = text.match(sectionPattern);
          return sectionMatch ? sectionMatch[1].trim() : '';
        };

        const parseList = (text: string) => {
          if (!text) return [];
          return text
            .split('\n')
            .map(line => line.trim())
            .filter(line => line && (/^\d+\./.test(line) || line.startsWith('-')))
            .map(line => line.replace(/^[-\d]+\.\s*|-\s*/, '').trim())
            .filter(Boolean); // Remove empty lines
        };

        const sections = {
          goal: extractSection(content, 'Goal'),
          concepts: parseList(extractSection(content, 'Concepts to Learn')),
          practice: parseList(extractSection(content, 'Practice'))
        };

        daysWithNumbers.push({ 
          dayNumber,
          content: sections
        });
      }

      // Sort by day number and ensure we have all days up to expectedDays
      const sortedDays = Array.from({ length: expectedDays }, (_, i) => {
        const dayNumber = (i + 1).toString();
        const existingDay = daysWithNumbers.find(d => d.dayNumber === dayNumber);
        return existingDay || { 
          dayNumber, 
          content: {
            goal: '',
            concepts: [],
            practice: []
          }
        };
      });
      
      // Create the plan data with all days
      const planData = {
        duration: parseInt(duration),
        dailyTasks: sortedDays.map(({ content, dayNumber }) => {
          return {
            day: parseInt(dayNumber),
            task: `Day ${dayNumber} Study Plan`,
            type: 'study',
            icon: getIconForType('study'),
            content: content
          };
        })
      };
      
      setStudyPlan(planData);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate study plan",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    };
  };

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="animate-pulse flex space-x-2 mb-4">
          <div className="h-3 w-3 bg-primary rounded-full"></div>
          <div className="h-3 w-3 bg-primary rounded-full"></div>
          <div className="h-3 w-3 bg-primary rounded-full"></div>
        </div>
        <p className="text-muted-foreground">Creating your personalized study plan...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Plan Your Learning</h2>
        <p className="text-muted-foreground">Get a structured approach to mastering this document</p>
      </div>

      {!studyPlan ? (
        <Card>
          <CardHeader>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Study Duration:</label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 Days (Intensive)</SelectItem>
                  <SelectItem value="7">7 Days (Recommended)</SelectItem>
                  <SelectItem value="14">14 Days (Detailed)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={generateStudyPlan} className="w-full">
              Generate Study Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardHeader className="sticky top-0 z-50 bg-background border-b pb-4">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span className="text-base font-medium">Your {studyPlan.duration}-Day Study Plan</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="min-h-[400px] max-h-[calc(100vh-200px)] overflow-y-auto pt-8 mt-2">
              <div className="space-y-6 h-full">
                {studyPlan.dailyTasks.map((task: any, index: number) => {
                  const IconComponent = task.icon;
                  
                  return (
                    <div key={index} className="mb-8 last:mb-0">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-full bg-primary/10">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="text-base font-medium text-gray-800 dark:text-gray-200">Day {task.day}</h3>
                      </div>
                      
                      <div className="space-y-6 pl-12">
                        {/* Goal Section */}
                        {task.content.goal && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-primary" />
                              <h4 className="font-medium text-sm text-primary">Today's Goal</h4>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {task.content.goal}
                            </p>
                          </div>
                        )}

                        {/* Concepts Section */}
                        {task.content.concepts.length > 0 && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Brain className="h-4 w-4 text-primary" />
                              <h4 className="font-medium text-sm text-primary">Concepts to Learn</h4>
                            </div>
                            <div className="space-y-2">
                              {task.content.concepts.map((concept, idx) => (
                                <div key={idx} className="text-sm flex items-start gap-2 text-gray-600 dark:text-gray-400">
                                  <span className="text-primary">{idx + 1}.</span>
                                  <span>{concept}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Practice Section */}
                        {task.content.practice.length > 0 && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <PenTool className="h-4 w-4 text-primary" />
                              <h4 className="font-medium text-sm text-primary">Practice Activities</h4>
                            </div>
                            <div className="space-y-2">
                              {task.content.practice.map((practice, idx) => (
                                <div key={idx} className="text-sm flex items-start gap-2 text-gray-600 dark:text-gray-400">
                                  <span className="text-primary">{idx + 1}.</span>
                                  <span>{practice}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center mt-4 sticky bottom-0 bg-background py-4">
            <Button variant="outline" onClick={() => setStudyPlan(null)}>
              Customize Plan
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};