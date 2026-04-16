import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit3, FileDown, Copy, Check, X, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const QuizSimilarQuestions: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { originalQuestion, similarQuestions: initialQuestions } = location.state || {
    originalQuestion: '',
    similarQuestions: []
  };

  const [questions, setQuestions] = useState<string[]>(initialQuestions);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyToClipboard = () => {
    const content = `Original Question:\n${originalQuestion}\n\nSimilar Questions:\n${questions.map((q: string, i: number) => `${i + 1}. ${q}`).join('\n\n')}`;
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to clipboard",
      description: "Questions copied to clipboard"
    });
  };

  const handleDownloadTXT = () => {
    const content = `Original Question:\n${originalQuestion}\n\nSimilar Questions:\n${questions.map((q: string, i: number) => `${i + 1}. ${q}`).join('\n\n')}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `similar-questions-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download complete",
      description: "Questions saved as TXT file"
    });
  };

  const handleDownloadJSON = () => {
    const data = {
      originalQuestion: originalQuestion,
      similarQuestions: questions,
      generatedAt: new Date().toISOString(),
      totalQuestions: questions.length
    };
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `similar-questions-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download complete",
      description: "Questions saved as JSON file"
    });
  };

  const handleCopy = (question: string, index: number) => {
    navigator.clipboard.writeText(question);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditValue(questions[index]);
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && editValue.trim()) {
      const updatedQuestions = [...questions];
      updatedQuestions[editingIndex] = editValue.trim();
      setQuestions(updatedQuestions);
      setEditingIndex(null);
      setEditValue('');
      toast({
        title: "Updated",
        description: "Question updated successfully"
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditValue('');
  };

  return (
    <div className="container max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Similar Questions</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <FileDown className="h-4 w-4" />
              <span className="font-medium">Download</span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleDownloadTXT} className="cursor-pointer">
              <FileDown className="h-4 w-4 mr-2" />
              <span>Download as TXT</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDownloadJSON} className="cursor-pointer">
              <FileDown className="h-4 w-4 mr-2" />
              <span>Download as JSON</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyToClipboard} className="cursor-pointer">
              <Copy className="h-4 w-4 mr-2" />
              <span>Copy to Clipboard</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-4">
        {questions.map((question: string, index: number) => (
          <Card key={index} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <span className="text-base font-medium text-muted-foreground w-6 flex-shrink-0 mt-0.5">
                  {index + 1}.
                </span>
                {editingIndex === index ? (
                  <div className="flex-1 space-y-2">
                    <textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full min-h-[3rem] p-2 text-base leading-relaxed border border-input bg-background rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Edit question..."
                      rows={Math.max(2, Math.ceil(editValue.length / 80))}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleSaveEdit}
                        className="h-8"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                        className="h-8"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-base leading-relaxed">{question}</p>
                )}
              </div>
              {editingIndex !== index && (
                <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(question, index)}
                    className={`h-8 w-8 p-0 hover:bg-primary/10 transition-colors ${
                      copiedIndex === index ? 'text-green-600 bg-green-50' : 'hover:text-primary'
                    }`}
                    title={copiedIndex === index ? "Copied!" : "Copy question"}
                  >
                    {copiedIndex === index ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(index)}
                    className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                    title="Edit question"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {questions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No questions generated yet.</p>
          <Button 
            onClick={() => navigate('/quiz/similar')} 
            className="mt-4"
          >
            Generate Questions
          </Button>
        </div>
      )}
    </div>
  );
};

export default QuizSimilarQuestions;