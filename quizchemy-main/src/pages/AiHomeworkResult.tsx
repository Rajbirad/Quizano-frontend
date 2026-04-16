import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Copy, Download, ArrowLeft, BookOpen, HelpCircle, CheckCircle } from 'lucide-react';
import { toast } from '@/lib/toast';

interface QAPair {
  question: string;
  answer: string;
}

const AiHomeworkResult: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());

  const { questions, totalQuestions, fileName } = location.state || {};

  if (!questions || questions.length === 0) {
    navigate('/app/ai-homework');
    return null;
  }

  const toggleQuestion = (index: number) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedQuestions(newExpanded);
  };

  const handleCopy = () => {
    const content = questions.map((qa: QAPair, index: number) => 
      `Question ${index + 1}: ${qa.question}\nAnswer: ${qa.answer}\n\n`
    ).join('');
    
    navigator.clipboard.writeText(content);
    toast.success("Questions and answers copied to clipboard");
  };

  const handleDownload = () => {
    const content = questions.map((qa: QAPair, index: number) => 
      `Question ${index + 1}: ${qa.question}\nAnswer: ${qa.answer}\n\n`
    ).join('');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `homework-questions-${fileName?.split('.')[0] || 'document'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Homework questions downloaded successfully");
  };

  const handleStartOver = () => {
    navigate('/app/ai-homework');
  };

  return (
    <div className="container max-w-4xl mx-auto px-6 py-8">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent">
            Homework Generated Successfully
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">
          {totalQuestions} questions generated from {fileName}
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Generated Questions & Answers
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCopy}>
                <Copy className="h-4 w-4 mr-2" />
                Copy All
              </Button>
              <Button onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
          {questions.map((qa: QAPair, index: number) => (
            <Card key={index} className="border-l-4 border-l-primary/20">
              <CardContent className="p-4">
                <div 
                  className="cursor-pointer"
                  onClick={() => toggleQuestion(index)}
                >
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-1 text-xs">
                      Q{index + 1}
                    </Badge>
                    <p className="font-medium leading-relaxed flex-1">
                      {qa.question}
                    </p>
                    <HelpCircle className={`h-4 w-4 text-muted-foreground transition-transform ${expandedQuestions.has(index) ? 'rotate-180' : ''}`} />
                  </div>
                </div>
                
                {expandedQuestions.has(index) && (
                  <>
                    <Separator className="my-3" />
                    <div className="pl-8">
                      <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-2">Answer:</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {qa.answer}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AiHomeworkResult;