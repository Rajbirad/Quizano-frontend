import { useState, useCallback } from 'react';
import { makeAuthenticatedFormRequest } from '@/lib/api-utils';

interface PresentationSlide {
  id?: string;
  type: string;
  layout: string;
  content: Record<string, any>;
}

interface Theme {
  id?: string;
  name?: string;
}

interface PresentationMetadata {
  processing_time?: number;
  source?: string;
  method?: string;
  sections_processed?: number;
  coverage?: string;
}

interface PresentationResponse {
  id: string;
  title: string;
  summary?: string;
  theme: string | Theme;
  slides: PresentationSlide[];
  metadata?: PresentationMetadata;
  processing_time?: number;
  correlation_id?: string;
  // Legacy fields for backward compatibility
  success?: boolean;
  presentationId?: string;
  message?: string;
  created_at?: string;
}

interface GeneratePresentationOptions {
  file: File;
  numSlides?: number;
  theme?: string;
  includeAgenda?: boolean;
}

export const usePdfToPresentation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [presentation, setPresentation] = useState<PresentationResponse | null>(null);

  const generatePresentation = useCallback(
    async (options: GeneratePresentationOptions) => {
      // Validation
      if (!options.file) {
        setError('PDF file is required');
        return null;
      }

      if (options.file.type !== 'application/pdf') {
        setError('Only PDF files are supported');
        return null;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log('🚀 [usePdfToPresentation] Starting presentation generation');

        // Create FormData
        const formData = new FormData();
        formData.append('file', options.file);
        formData.append('num_slides', options.numSlides?.toString() || '7');
        formData.append('theme', options.theme || 'modern');
        formData.append('include_agenda', 'false'); // Always false per requirements

        console.log('📝 [usePdfToPresentation] FormData prepared:', {
          fileName: options.file.name,
          numSlides: options.numSlides || 7,
          theme: options.theme || 'modern',
        });

        // Make API request using authenticated form request
        const response = await makeAuthenticatedFormRequest(
          'http://localhost:8083/api/presentations/from-file',
          formData
        );

        console.log('📡 [usePdfToPresentation] API Response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('❌ [usePdfToPresentation] API Error:', errorData);
          throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data: PresentationResponse = await response.json();

        console.log('✅ [usePdfToPresentation] API Response:', data);

        // Check for new format (has id and slides directly) or old format (has success field)
        if (data.success === false) {
          throw new Error(data.message || 'Failed to generate presentation');
        }

        // Validate new format response has required fields
        if (!data.id || !data.slides || !Array.isArray(data.slides)) {
          throw new Error('Invalid presentation data received from API');
        }

        setPresentation(data);
        console.log('🎉 [usePdfToPresentation] Presentation generated successfully with', data.slides.length, 'slides');
        return data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        console.error('❌ [usePdfToPresentation] Error:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setPresentation(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    generatePresentation,
    loading,
    error,
    presentation,
    reset,
  };
};
