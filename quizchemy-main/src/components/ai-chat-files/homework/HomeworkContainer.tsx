import React from "react";
import { HomeworkUploader } from "./HomeworkUploader";
import { useNavigate } from "react-router-dom";

export const HomeworkContainer: React.FC = () => {
  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="w-full max-w-3xl mx-auto">
        <HomeworkUploader />
        
        {/* Popular Use Cases */}
        <div className="mt-36">
          <h2 className="text-2xl font-medium mb-8 text-center">Popular Use Cases</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-lg text-center space-y-4">
              <div className="w-12 h-12 mx-auto">
                <img src="/icons/study.svg" alt="" className="w-full h-full" />
              </div>
              <h3 className="text-lg font-semibold">Study Guides</h3>
              <p className="text-muted-foreground">
                Generate comprehensive Q&A pairs from your study materials for better understanding.
              </p>
            </div>
            <div className="glass-panel p-6 rounded-lg text-center space-y-4">
              <div className="w-12 h-12 mx-auto">
                <img src="/icons/Questions.svg" alt="" className="w-full h-full" />
              </div>
              <h3 className="text-lg font-semibold">Practice Questions</h3>
              <p className="text-muted-foreground">
                Create tailored practice questions with detailed explanations and solutions.
              </p>
            </div>
            <div className="glass-panel p-6 rounded-lg text-center space-y-4">
              <div className="w-12 h-12 mx-auto">
                <img src="/icons/question-and-answer.svg" alt="" className="w-full h-full" />
              </div>
              <h3 className="text-lg font-semibold">Exam Preparation</h3>
              <p className="text-muted-foreground">
                Transform your notes into interactive Q&A format for effective exam review.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
