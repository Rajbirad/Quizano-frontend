import React from "react";
import { useLocation } from "react-router-dom";
import { FileText, BookOpen, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import ReactMarkdown from "react-markdown";

interface QAPair {
  question: string;
  solution_process: string;
  answer: string;
}

interface HomeworkResult {
  success: boolean;
  qa_pairs: QAPair[];
  num_questions: number;
  topic_focus: string | null;
  source_file: string;
  message: string;
}

const AiHomeworkResult: React.FC = () => {
  const location = useLocation();
  const result = location.state?.result as HomeworkResult;

  if (!result) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Results Found</h1>
          <p className="text-muted-foreground">Please upload a document to generate homework help.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col items-center text-center mb-6">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold gradient-text">Homework Analysis</h1>
          <Sparkles className="h-6 w-6 text-primary animate-pulse-gentle" />
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <FileText className="h-4 w-4" />
          <p>{result.source_file}</p>
        </div>
        <p className="text-muted-foreground mt-2">{result.message}</p>
      </div>

      <ScrollArea className="h-[calc(100vh-16rem)] w-full rounded-lg border p-4">
        <div className="space-y-6">
          {result.qa_pairs.map((qa, index) => (
            <Card key={index} className="w-full">
              <CardHeader className="pb-3">
                <h3 className="text-lg font-semibold">Question {index + 1}</h3>
                <p className="text-muted-foreground">{qa.question}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {qa.solution_process && qa.solution_process.trim() && (
                  <>
                    <div>
                      <h4 className="font-medium mb-2">Solution Process</h4>
                      <div className="text-muted-foreground prose prose-sm max-w-none">
                        <ReactMarkdown>{qa.solution_process}</ReactMarkdown>
                      </div>
                    </div>
                    <Separator />
                  </>
                )}
                <div>
                  <h4 className="font-medium mb-2">Answer</h4>
                  <div className="text-muted-foreground">
                    <ReactMarkdown>{qa.answer}</ReactMarkdown>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default AiHomeworkResult;
