import { GenerateSimilarQuestionsResponse, TaskStatusResponse } from '../types/similar-questions';

export async function generateSimilarQuestions(question: string): Promise<GenerateSimilarQuestionsResponse> {
  const formData = new FormData();
  formData.append('question', question);
  formData.append('max_questions', '5');

  const response = await fetch('/api/generate-similar-questions', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to generate similar questions');
  }

  return response.json();
}

export async function checkTaskStatus(taskId: string): Promise<TaskStatusResponse> {
  const response = await fetch(`/api/task-status/${taskId}`);

  if (!response.ok) {
    throw new Error('Failed to check task status');
  }

  return response.json();
}