export interface GenerateSimilarQuestionsResponse {
  success: boolean;
  task_id: string;
  status: string;
  message: string;
  estimated_time: string;
  check_status_url: string;
  correlation_id: string;
  original_question: string;
  max_questions: number;
  processing_type: string;
}

export interface TaskStatusResponse {
  task_id: string;
  status: 'pending' | 'processing' | 'completed';
  error: string;
  updated_at: string;
  source: string;
  meta?: {
    step: string;
  };
  result?: {
    status: string;
    result_id: string;
    similar_questions: string[];
    num_questions: number;
    task_id: string;
  };
}

export interface TransformedSimilarQuestion {
  question: string;
  similarityScore: number;
}