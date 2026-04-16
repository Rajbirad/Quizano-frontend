// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
  APP_URL: import.meta.env.VITE_APP_URL || 'http://localhost:8083',
  OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY || '',
  ENDPOINTS: {
    // Auth endpoints
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    
    // Quiz endpoints
    QUIZ_FROM_PDF: '/api/generate-quiz-from-pdf',
    QUIZ_FROM_FILE: '/api/generate-quiz-from-file',
    QUIZ_FROM_TEXT: '/api/generate-quiz-from-text',
    QUIZ_FROM_URL: '/api/generate-quiz-from-url',
    QUIZ_FROM_SUBJECT: '/api/generate-quiz-subject',
    
    // Notes endpoints
    NOTES_FROM_FILE: '/api/generate-notes-from-file',
    NOTES_FROM_TEXT: '/api/generate-notes-from-text',
    NOTES_FROM_URL: '/api/generate-notes-from-url',
    NOTES_FROM_VIDEO: '/api/generate-notes-from-video',
    NOTES_FROM_YOUTUBE: '/api/generate-notes-from-youtube',
    
    // Podcast endpoints
    PODCAST_GENERATE: '/api/podcast/generate',
    
    // Text-to-Speech endpoints
    TTS_GENERATE: '/api/tts/generate',
  }
};
