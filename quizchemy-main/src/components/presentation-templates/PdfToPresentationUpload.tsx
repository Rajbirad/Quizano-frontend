import React, { useState } from 'react';
import { Upload, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { usePdfToPresentation } from '@/hooks/use-pdf-to-presentation';

const THEMES = [
  { id: 'modern', name: 'Modern' },
  { id: 'modern-gradient', name: 'Modern Gradient' },
  { id: 'dark', name: 'Dark' },
  { id: 'classic', name: 'Classic' },
  { id: 'minimalist', name: 'Minimalist' },
];

export const PdfToPresentationUpload: React.FC<{
  onPresentationGenerated?: (presentation: any) => void;
}> = ({ onPresentationGenerated }) => {
  const { generatePresentation, loading, error, presentation } = usePdfToPresentation();
  const [file, setFile] = useState<File | null>(null);
  const [numSlides, setNumSlides] = useState(7);
  const [theme, setTheme] = useState('modern-gradient');
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles[0]?.type === 'application/pdf') {
      setFile(droppedFiles[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📝 Form submitted');
    console.log('File:', file);
    console.log('NumSlides:', numSlides);
    console.log('Theme:', theme);
    
    if (!file) {
      console.warn('⚠️ No file selected');
      return;
    }

    console.log('🔄 Calling generatePresentation...');
    const result = await generatePresentation({
      file,
      numSlides,
      theme,
      includeAgenda: false,
    });

    console.log('📦 Result:', result);
    if (result && onPresentationGenerated) {
      console.log('✅ Calling callback with presentation');
      onPresentationGenerated(result);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Title */}
      <h2 className="text-3xl font-bold mb-2 text-slate-900">Generate Presentation from PDF</h2>
      <p className="text-slate-600 mb-8">Upload a PDF file and let AI create beautiful presentation slides</p>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-900 font-semibold">Error</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Success Alert */}
      {presentation && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-green-900 font-semibold">Success!</p>
            <p className="text-green-700 text-sm">
              Presentation generated in {presentation.processing_time?.toFixed(2)}s with{' '}
              {presentation.slides.length} slides
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50'
          }`}
        >
          <Upload className="w-12 h-12 mx-auto mb-3 text-slate-400" />
          <p className="text-slate-900 font-semibold mb-1">
            {file ? file.name : 'Drop your PDF here or click to browse'}
          </p>
          <p className="text-slate-600 text-sm mb-4">PDF files only (Max 50MB)</p>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
            id="pdf-input"
          />
          <label
            htmlFor="pdf-input"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer font-medium"
          >
            Choose PDF
          </label>
        </div>

        {file && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-900 font-semibold">
              ✓ {file.name} ({(file.size / 1024 / 1024).toFixed(2)}MB)
            </p>
          </div>
        )}

        {/* Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Number of Slides */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Number of Slides
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="3"
                max="20"
                value={numSlides}
                onChange={(e) => setNumSlides(parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="w-12 text-center font-bold text-blue-600 text-lg">{numSlides}</span>
            </div>
            <p className="text-slate-600 text-xs mt-1">Recommended: 5-10 slides</p>
          </div>

          {/* Theme Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Theme</label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {THEMES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!file || loading}
          className={`w-full py-3 rounded-lg font-semibold text-white transition-colors ${
            !file || loading
              ? 'bg-slate-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader className="w-5 h-5 animate-spin" />
              Generating presentation...
            </div>
          ) : (
            'Generate Presentation'
          )}
        </button>

        {/* Info */}
        <p className="text-xs text-slate-600 text-center">
          ⚙️ Your file will be processed by our AI engine. Processing time: ~15-30 seconds
        </p>
      </form>
    </div>
  );
};
