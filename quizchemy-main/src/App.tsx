import EditGeneratedFlashcardPage from './pages/EditGeneratedFlashcardPage';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { CreditsProvider } from '@/contexts/CreditsContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { LoadingTransition } from '@/components/ui/page-transition';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import ProfilePage from './pages/ProfilePage';
import Home from './pages/Index';
import Pricing from './pages/Pricing';
import Auth from './pages/Auth';
import FlashcardGenerator from './pages/FlashcardGenerator';
import FolderView from './pages/FolderView';

import FlashcardPreview from './pages/FlashcardPreview';


import QuizPreview from './pages/QuizPreview';
import CreateFlashcard from './pages/CreateFlashcard';
import NotFound from './pages/NotFound';
import AiChatWithFiles from './pages/AiChatWithFiles';
import { VideoProvider } from '@/components/video-summarizer/VideoContext';
import VideoSummarizer from './pages/VideoSummarizer';
import PublicQuiz from './pages/PublicQuiz';
import PublicMindMap from './pages/PublicMindMap';
import VideoAnalysis from './pages/VideoAnalysis';
import AudioTranscription from './pages/AudioTranscription';
import TextToSpeechPage from './pages/TextToSpeechPage';
import ImageTranscription from './pages/ImageTranscription';
import AiNotesGenerator from './pages/AiNotesGenerator';
import AiPodcastGenerator from './pages/AiPodcastGenerator';
import AiMindMapGenerator from './pages/AiMindMapGenerator';
import AiInfographicGenerator from './pages/AiInfographicGenerator';
import AiDiagramGenerator from './pages/AiDiagramGenerator';
import MindMapResult from './pages/MindMapResult';
import PodcastResult from './pages/PodcastResult';
import InfographicResult from './pages/InfographicResult';
import DiagramResult from './pages/DiagramResult';
import ImageTextResult from './pages/ImageTextResult';
import TranscriptionResult from './pages/TranscriptionResult';
import QaGenerator from './pages/QaGenerator';
import QaGeneratorResult from './pages/QaGeneratorResult';
import AiParaphraser from './pages/AiParaphraser';
import GrammarChecker from './pages/GrammarChecker';

// Import AI Slides pages
import AISlidesCustomize from './pages/ai-slides-customize';
import AISlidesGenerate from './pages/ai-slides-generator';

// Import quiz input method pages
import QuizTextGenerator from './pages/QuizTextGenerator';
import QuizUploadGenerator from './pages/QuizUploadGenerator';
import QuizUrlGenerator from './pages/QuizUrlGenerator';
import QuizNewsGenerator from './pages/QuizNewsGenerator';
import QuizVideoGenerator from './pages/QuizVideoGenerator';
import QuizYouTubeGenerator from './pages/QuizYouTubeGenerator';
import QuizImageGenerator from './pages/QuizImageGenerator';
import QuizSubjectGenerator from './pages/QuizSubjectGenerator';
import QuizSimilarGenerator from './pages/QuizSimilarGenerator';
import QuizManualCreator from './pages/QuizManualCreator';
import QuizImportGenerator from './pages/QuizImportGenerator';
import QuizQuizletGenerator from './pages/QuizQuizletGenerator';
import QuizAnkiGenerator from './pages/QuizAnkiGenerator';


// Import new preview pages
import FlashcardGeneratorPreview from './pages/FlashcardGeneratorPreview';
import AiFlashcardGeneratorPreview from './pages/AiFlashcardGeneratorPreview';
import QuizGeneratorPreview from './pages/QuizGeneratorPreview';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ResetPassword from './pages/ResetPassword';
import GoogleOAuthCallback from './pages/GoogleOAuthCallback';
import AuthCallback from './pages/AuthCallback';
import VerifyEmail from './pages/VerifyEmail';
import Blog from './pages/Blog';
import Features from './pages/Features';
import UseCases from './pages/UseCases';
import AiToolsPreview from './pages/AiToolsPreview';
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout';
import { Layout } from '@/components/Layout';
import Dashboard from './pages/Dashboard';
import FlashcardsPage from './pages/FlashcardsPage';
import ActivityPage from './pages/ActivityPage';
import QuizzesPage from './pages/QuizzesPage';
import QuizStudyPage from './pages/QuizStudyPage';
import AiToolsPage from './pages/AiToolsPage';
import AiChatPage from './pages/AiChatPage';
import AiNotesResult from './pages/AiNotesResult';
import Feedback from './pages/Feedback';
import HelpCentre from './pages/HelpCentre';
import AIPresentationPage from './pages/AIPresentationPage';
import AISlidesGenerator from './pages/AISlidesGenerator';
import AIVisualSlidesGenerator from './pages/AIVisualSlidesGenerator';
import AISlidesPresentation from './pages/AISlidesPresentation';
import PresentationViewer from './pages/PresentationViewer';

function App() {
  // Helper to determine if a string is a valid UUID
  const isValidUUID = (uuid: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  return (    <ErrorBoundary>    <AuthProvider>
      <CreditsProvider>
        <Router>
          <Routes>
          <Route path="/" element={<Home />} />
          
          {/* Authenticated Routes */}
          <Route path="/app/dashboard" element={
            <AuthGuard requireAuth={true}>
              <AuthenticatedLayout>
                <Dashboard />
              </AuthenticatedLayout>
            </AuthGuard>
          } />
          <Route path="/app/flashcards" element={
            <AuthGuard requireAuth={true}>
              <AuthenticatedLayout>
                <FlashcardsPage />
              </AuthenticatedLayout>
            </AuthGuard>
          } />
          <Route path="/app/ai-tools" element={
            <AuthGuard requireAuth={true}>
              <AuthenticatedLayout>
                <AiToolsPage />
              </AuthenticatedLayout>
            </AuthGuard>
          } />
          <Route path="/app/ai-chat" element={
            <AuthGuard requireAuth={true}>
              <AuthenticatedLayout>
                <AiChatPage />
              </AuthenticatedLayout>
            </AuthGuard>
          } />
          <Route path="/app/activity" element={
            <AuthGuard requireAuth={true}>
              <AuthenticatedLayout>
                <ActivityPage />
              </AuthenticatedLayout>
            </AuthGuard>
          } />
          <Route path="/app/folder/:folderId" element={
            <AuthGuard requireAuth={true}>
              <AuthenticatedLayout>
                <FolderView />
              </AuthenticatedLayout>
            </AuthGuard>
          } />
          <Route path="/app/feedback" element={
            <AuthGuard requireAuth={true}>
              <AuthenticatedLayout>
                <Feedback />
              </AuthenticatedLayout>
            </AuthGuard>
          } />

          <Route path="/app/profile" element={
            <AuthGuard requireAuth={true}>
              <AuthenticatedLayout>
                <ProfilePage />
              </AuthenticatedLayout>
            </AuthGuard>
          } />

          <Route path="/app/ai-presentation" element={
            <AuthGuard requireAuth={true}>
              <AuthenticatedLayout>
                <AIPresentationPage />
              </AuthenticatedLayout>
            </AuthGuard>
          } />

          <Route path="/app/ai-ppt" element={
            <AuthGuard requireAuth={true}>
              <AuthenticatedLayout>
                <AISlidesGenerator />
              </AuthenticatedLayout>
            </AuthGuard>
          } />

          <Route path="/app/ai-ppt-settings" element={
            <AuthGuard requireAuth={true}>
              <AISlidesCustomize />
            </AuthGuard>
          } />

          <Route path="/app/ai-ppt-generate" element={
            <AuthGuard requireAuth={true}>
              <AISlidesGenerate />
            </AuthGuard>
          } />

          <Route path="/app/ai-slides" element={
            <AuthGuard requireAuth={true}>
              <AuthenticatedLayout>
                <AIVisualSlidesGenerator />
              </AuthenticatedLayout>
            </AuthGuard>
          } />

          <Route path="/app/ai-slides-settings" element={
            <AuthGuard requireAuth={true}>
              <AISlidesCustomize />
            </AuthGuard>
          } />

          <Route path="/app/ai-slides-generate" element={
            <AuthGuard requireAuth={true}>
              <AISlidesGenerate />
            </AuthGuard>
          } />

          <Route path="/app/presentation-viewer" element={
            <AuthGuard requireAuth={true}>
              <PresentationViewer />
            </AuthGuard>
          } />

          {/* Route for flashcard preview with state data */}
          <Route 
            path="/app/flashcard-preview" 
            element={
              <AuthGuard requireAuth={true}>
                <FlashcardPreview />
              </AuthGuard>
            } 
          />
          {/* Public flashcard preview route - no navigation */}
          <Route 
            path="/app/flashcard-preview/:id" 
            element={
              <FlashcardPreview />
            } 
          />
          
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/auth" element={
            <AuthGuard>
              <Auth />
            </AuthGuard>
          } />
          <Route path="/login" element={
            <AuthGuard>
              <Login />
            </AuthGuard>
          } />
          <Route path="/signup" element={
            <AuthGuard>
              <Signup />
            </AuthGuard>
          } />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/auth/verify-email" element={<VerifyEmail />} />
          <Route path="/google-oauth-callback" element={<GoogleOAuthCallback />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/features" element={<Features />} />
        <Route path="/use-cases" element={<UseCases />} />
        <Route path="/help-center" element={<HelpCentre />} />
        
        {/* Preview pages for non-authenticated users */}
        <Route path="/create" element={<FlashcardGeneratorPreview />} />
        <Route path="/generator" element={<AiFlashcardGeneratorPreview />} />
        <Route path="/quiz" element={<QuizGeneratorPreview />} />
        <Route path="/ai-tools" element={<AiToolsPreview />} />
        
        {/* Individual AI tool preview routes */}
        <Route path="/chat-with-files" element={<AiToolsPreview />} />
        <Route path="/video-summarizer" element={<AiToolsPreview />} />
        <Route path="/audio-transcription" element={<AiToolsPreview />} />
        <Route path="/image-transcription" element={<AiToolsPreview />} />
        
        {/* Actual functional pages with AuthenticatedLayout */}
        <Route path="/app/create" element={
          <AuthGuard requireAuth={true}>
            <AuthenticatedLayout>
              <React.Suspense fallback={<div className="flex h-screen items-center justify-center">Loading flashcard creator...</div>}><CreateFlashcard /></React.Suspense>
            </AuthenticatedLayout>
          </AuthGuard>
        } />
        <Route path="/app/generator" element={
          <AuthGuard requireAuth={true}>
            <AuthenticatedLayout>
              <React.Suspense fallback={<div className="flex h-screen items-center justify-center">Loading AI generator...</div>}><FlashcardGenerator isAiMode={true} /></React.Suspense>
            </AuthenticatedLayout>
          </AuthGuard>
        } />
        <Route path="/app/edit-generated" element={
          <AuthGuard requireAuth={true}>
            <AuthenticatedLayout>
              <React.Suspense fallback={<div className="flex h-screen items-center justify-center">Loading AI flashcard editor...</div>}><EditGeneratedFlashcardPage /></React.Suspense>
            </AuthenticatedLayout>
          </AuthGuard>
        } />
        <Route path="/app/flashcard-preview/:id" element={
          <AuthGuard requireAuth={true}>
            <AuthenticatedLayout>
              <React.Suspense fallback={<div className="flex h-screen items-center justify-center">Loading flashcards...</div>}><FlashcardPreview /></React.Suspense>
            </AuthenticatedLayout>
          </AuthGuard>
        } />
        <Route path="/app/flashcard-preview/:id/embed" element={
          <FlashcardPreview isEmbedded={true} />
        } />
          <Route path="/app/quiz" element={
          <AuthGuard requireAuth={true}>
            <AuthenticatedLayout>
              <QuizzesPage />
            </AuthenticatedLayout>
          </AuthGuard>
        } />
                    {/* Public quiz study route - no navigation */}
          <Route path="/app/quiz-study/:id" element={
            <Layout hideNav={true}>
              <QuizStudyPage />
            </Layout>
          } />
        
        {/* Quiz input method pages */}
        <Route path="/quiz/subject" element={
          <AuthGuard requireAuth={true}>
            <AuthenticatedLayout>
              <React.Suspense fallback={<div>Loading...</div>}><QuizSubjectGenerator /></React.Suspense>
            </AuthenticatedLayout>
          </AuthGuard>
        } />
        <Route path="/quiz/similar" element={
          <AuthGuard requireAuth={true}>
            <AuthenticatedLayout>
              <React.Suspense fallback={<div>Loading...</div>}><QuizSimilarGenerator /></React.Suspense>
            </AuthenticatedLayout>
          </AuthGuard>
        } />
        <Route path="/quiz/similar-questions" element={
          <AuthGuard requireAuth={true}>
            <AuthenticatedLayout>
              <React.Suspense fallback={<div>Loading...</div>}>
                {React.createElement(React.lazy(() => import('./pages/QuizSimilarQuestions')))}
              </React.Suspense>
            </AuthenticatedLayout>
          </AuthGuard>
        } />
        <Route path="/quiz/text" element={
          <AuthGuard requireAuth={true}>
            <AuthenticatedLayout>
              <React.Suspense fallback={<div>Loading...</div>}><QuizTextGenerator /></React.Suspense>
            </AuthenticatedLayout>
          </AuthGuard>
        } />
        <Route path="/quiz/upload" element={
          <AuthGuard requireAuth={true}>
            <AuthenticatedLayout>
              <React.Suspense fallback={<div>Loading...</div>}><QuizUploadGenerator /></React.Suspense>
            </AuthenticatedLayout>
          </AuthGuard>
        } />
        <Route path="/quiz/url" element={
          <AuthGuard requireAuth={true}>
            <AuthenticatedLayout>
              <React.Suspense fallback={<div>Loading...</div>}><QuizUrlGenerator /></React.Suspense>
            </AuthenticatedLayout>
          </AuthGuard>
        } />
        <Route path="/quiz/news" element={
          <AuthGuard requireAuth={true}>
            <AuthenticatedLayout>
              <React.Suspense fallback={<div>Loading...</div>}><QuizNewsGenerator /></React.Suspense>
            </AuthenticatedLayout>
          </AuthGuard>
        } />
        <Route path="/quiz/video" element={
          <AuthGuard requireAuth={true}>
            <AuthenticatedLayout>
              <React.Suspense fallback={<div>Loading...</div>}><QuizVideoGenerator /></React.Suspense>
            </AuthenticatedLayout>
          </AuthGuard>
        } />
        <Route path="/quiz/youtube" element={
          <AuthGuard requireAuth={true}>
            <AuthenticatedLayout>
              <React.Suspense fallback={<div>Loading...</div>}><QuizYouTubeGenerator /></React.Suspense>
            </AuthenticatedLayout>
          </AuthGuard>
        } />
        <Route path="/quiz/image" element={
          <AuthGuard requireAuth={true}>
            <AuthenticatedLayout>
              <React.Suspense fallback={<div>Loading...</div>}><QuizImageGenerator /></React.Suspense>
            </AuthenticatedLayout>
          </AuthGuard>
        } />
        <Route path="/quiz/audio" element={
          <AuthGuard requireAuth={true}>
            <AuthenticatedLayout>
              <React.Suspense fallback={<div>Loading...</div>}>
                {React.createElement(React.lazy(() => import('./pages/QuizAudioGenerator')))}
              </React.Suspense>
            </AuthenticatedLayout>
          </AuthGuard>
        } />
        <Route path="/quiz/manual" element={
          <AuthGuard requireAuth={true}>
            <AuthenticatedLayout>
              <React.Suspense fallback={<div>Loading...</div>}><QuizManualCreator /></React.Suspense>
            </AuthenticatedLayout>
          </AuthGuard>
        } />
         <Route path="/quiz/import" element={
          <AuthGuard requireAuth={true}>
            <AuthenticatedLayout>
              <React.Suspense fallback={<div>Loading...</div>}><QuizImportGenerator /></React.Suspense>
            </AuthenticatedLayout>
          </AuthGuard>
        } />
        <Route path="/quiz/quizlet" element={
          <AuthGuard requireAuth={true}>
            <AuthenticatedLayout>
              <React.Suspense fallback={<div>Loading...</div>}><QuizQuizletGenerator /></React.Suspense>
            </AuthenticatedLayout>
          </AuthGuard>
        } />
        <Route path="/quiz/anki" element={
          <AuthGuard requireAuth={true}>
            <AuthenticatedLayout>
              <React.Suspense fallback={<div>Loading...</div>}><QuizAnkiGenerator /></React.Suspense>
            </AuthenticatedLayout>
          </AuthGuard>
        } />
        
        {/* Keep original routes as well for backward compatibility */}
        <Route path="/flashcard-generator" element={<FlashcardGenerator />} />
        
        {/* Removed duplicate route as it's now under /app/flashcard-preview */}
        
        
        <Route path="/app/quiz-preview" element={<React.Suspense fallback={<div>Loading...</div>}><QuizPreview /></React.Suspense>} />
        <Route path="/quiz-preview/:quizId" element={<React.Suspense fallback={<div>Loading...</div>}><PublicQuiz /></React.Suspense>} />
        <Route path="/quiz-study" element={<React.Suspense fallback={<div>Loading...</div>}>{React.createElement(React.lazy(() => import('./pages/QuizStudy')))}</React.Suspense>} />
        <Route path="/mindmap/:shareId" element={<React.Suspense fallback={<div>Loading...</div>}><PublicMindMap /></React.Suspense>} />
        
        {/* AI Tools functional routes with AuthenticatedLayout */}
        <Route path="/app/chat-with-files" element={
          <AuthGuard requireAuth={true}>
            <AuthenticatedLayout>
              <React.Suspense fallback={<div className="flex h-screen items-center justify-center">Loading AI chat...</div>}><AiChatWithFiles /></React.Suspense>
            </AuthenticatedLayout>
          </AuthGuard>
        } />
        <Route path="/app/document-analysis" element={
          <AuthGuard requireAuth={true}>
            <AuthenticatedLayout>
              <React.Suspense fallback={<div className="flex h-screen items-center justify-center">Loading document analysis...</div>}>
                {React.createElement(React.lazy(() => import('./pages/DocumentAnalysis')))}
              </React.Suspense>
            </AuthenticatedLayout>
          </AuthGuard>
        } />
        <Route path="/app/video-summarizer" element={
          <AuthGuard requireAuth={true}>
            <AuthenticatedLayout>
              <VideoProvider>
                <React.Suspense fallback={<div className="flex h-screen items-center justify-center">Loading video summarizer...</div>}><VideoSummarizer /></React.Suspense>
              </VideoProvider>
            </AuthenticatedLayout>
          </AuthGuard>
        } />
        <Route path="/app/video-analysis" element={
          <AuthGuard requireAuth={true}>
            <AuthenticatedLayout>
              <VideoProvider>
                <React.Suspense fallback={<div className="flex h-screen items-center justify-center">Loading video analysis...</div>}><VideoAnalysis /></React.Suspense>
              </VideoProvider>
            </AuthenticatedLayout>
          </AuthGuard>
        } />
        <Route path="/app/audio-transcription" element={
          <AuthGuard requireAuth={true}>
            <AuthenticatedLayout>
              <React.Suspense fallback={<div className="flex h-screen items-center justify-center">Loading audio transcription...</div>}><AudioTranscription /></React.Suspense>
            </AuthenticatedLayout>
          </AuthGuard>
        } />
        <Route path="/app/text-speech" element={
          <AuthGuard requireAuth={true}>
            <AuthenticatedLayout>
              <React.Suspense fallback={<div className="flex h-screen items-center justify-center">Loading text to speech...</div>}><TextToSpeechPage /></React.Suspense>
            </AuthenticatedLayout>
          </AuthGuard>
        } />
        <Route path="/app/transcription-result" element={
          <AuthGuard requireAuth={true}>
            <AuthenticatedLayout>
              <React.Suspense fallback={<div className="flex h-screen items-center justify-center">Loading transcription result...</div>}><TranscriptionResult /></React.Suspense>
            </AuthenticatedLayout>
          </AuthGuard>
        } />
        <Route path="/app/image-transcription" element={
          <AuthGuard requireAuth={true}>
            <AuthenticatedLayout>
              <React.Suspense fallback={<div className="flex h-screen items-center justify-center">Loading image summarizer...</div>}><ImageTranscription /></React.Suspense>
            </AuthenticatedLayout>
          </AuthGuard>
        } />
        <Route path="/app/image-text-result" element={
          <AuthGuard requireAuth={true}>
            <AuthenticatedLayout>
              <React.Suspense fallback={<div className="flex h-screen items-center justify-center">Loading results...</div>}><ImageTextResult /></React.Suspense>
            </AuthenticatedLayout>
          </AuthGuard>
        } />

        {/* AI Homework */}
        {/* Q&A Generator */}
        <Route 
          path="/app/ai-humanizer" 
          element={
            <AuthGuard requireAuth={true}>
              <AuthenticatedLayout>
                <React.Suspense fallback={<div className="flex h-screen items-center justify-center">Loading Q&A Generator...</div>}><QaGenerator /></React.Suspense>
              </AuthenticatedLayout>
            </AuthGuard>
          } 
        />
        
        <Route path="/app/ai-humanizer-result" element={
          <AuthGuard requireAuth={true}>
            <AuthenticatedLayout>
              <React.Suspense fallback={<div className="flex h-screen items-center justify-center">Loading analysis...</div>}><QaGeneratorResult /></React.Suspense>
            </AuthenticatedLayout>
          </AuthGuard>
        } />

        <Route path="/app/ai-paraphraser" element={
          <AuthGuard requireAuth={true}>
            <AuthenticatedLayout>
              <React.Suspense fallback={<div className="flex h-screen items-center justify-center">Loading Paraphraser...</div>}><AiParaphraser /></React.Suspense>
            </AuthenticatedLayout>
          </AuthGuard>
        } />

        <Route path="/app/grammar-checker" element={
          <AuthGuard requireAuth={true}>
            <AuthenticatedLayout>
              <React.Suspense fallback={<div className="flex h-screen items-center justify-center">Loading Grammar Checker...</div>}><GrammarChecker /></React.Suspense>
            </AuthenticatedLayout>
          </AuthGuard>
        } />
        
        {/* Notes Generator */}
        <Route path="/app/notes-generator" element={
          <AuthGuard requireAuth={true}>
            <AuthenticatedLayout>
              <React.Suspense fallback={<div className="flex h-screen items-center justify-center">Loading notes generator...</div>}><AiNotesGenerator /></React.Suspense>
            </AuthenticatedLayout>
          </AuthGuard>
        } />

        <Route path="/app/notes-result" element={
          <AuthGuard requireAuth={true}>
            <AuthenticatedLayout>
              <React.Suspense fallback={<div className="flex h-screen items-center justify-center">Loading notes result...</div>}><AiNotesResult /></React.Suspense>
            </AuthenticatedLayout>
          </AuthGuard>
        } />
        
        {/* AI Podcast Generator */}
        <Route path="/app/ai-podcast" element={
          <AuthGuard requireAuth={true}>
            <AuthenticatedLayout>
              <React.Suspense fallback={<div className="flex h-screen items-center justify-center">Loading podcast generator...</div>}><AiPodcastGenerator /></React.Suspense>
            </AuthenticatedLayout>
          </AuthGuard>
        } />

        {/* AI MindMap Generator */}
        <Route path="/app/ai-mindmap" element={
          <AuthGuard requireAuth={true}>
            <AuthenticatedLayout>
              <React.Suspense fallback={<div className="flex h-screen items-center justify-center">Loading mindmap generator...</div>}><AiMindMapGenerator /></React.Suspense>
            </AuthenticatedLayout>
          </AuthGuard>
        } />

        {/* AI Infographic Generator */}
        <Route path="/app/ai-infographic" element={
          <AuthGuard requireAuth={true}>
            <AuthenticatedLayout>
              <React.Suspense fallback={<div className="flex h-screen items-center justify-center">Loading infographic generator...</div>}><AiInfographicGenerator /></React.Suspense>
            </AuthenticatedLayout>
          </AuthGuard>
        } />

        {/* AI Diagram Generator */}
        <Route path="/app/ai-diagram" element={
          <AuthGuard requireAuth={true}>
            <AuthenticatedLayout>
              <React.Suspense fallback={<div className="flex h-screen items-center justify-center">Loading diagram generator...</div>}><AiDiagramGenerator /></React.Suspense>
            </AuthenticatedLayout>
          </AuthGuard>
        } />

        <Route path="/app/infographic-result" element={
          <AuthGuard requireAuth={true}>
            <AuthenticatedLayout>
              <InfographicResult />
            </AuthenticatedLayout>
          </AuthGuard>
        } />

        <Route path="/app/diagram-result" element={
          <AuthGuard requireAuth={true}>
            <AuthenticatedLayout>
              <DiagramResult />
            </AuthenticatedLayout>
          </AuthGuard>
        } />

        <Route path="/app/mindmap-result" element={
          <AuthGuard requireAuth={true}>
            <AuthenticatedLayout>
              <React.Suspense fallback={<div className="flex h-screen items-center justify-center">Loading mindmap...</div>}><MindMapResult /></React.Suspense>
            </AuthenticatedLayout>
          </AuthGuard>
        } />

        <Route path="/app/podcast-result" element={
          <AuthGuard requireAuth={true}>
            <AuthenticatedLayout>
              <React.Suspense fallback={<div className="flex h-screen items-center justify-center">Loading podcast result...</div>}><PodcastResult /></React.Suspense>
            </AuthenticatedLayout>
          </AuthGuard>
        } />

        <Route path="/app/podcast/:id" element={
          <AuthGuard requireAuth={true}>
            <AuthenticatedLayout>
              <React.Suspense fallback={<div className="flex h-screen items-center justify-center">Loading podcast...</div>}><PodcastResult /></React.Suspense>
            </AuthenticatedLayout>
          </AuthGuard>
        } />
        
        <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      </CreditsProvider>
    </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
