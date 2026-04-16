import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, AlertCircle, Download, Eye } from 'lucide-react';
import { useFileContext } from './FileContext';
import { renderAsync } from 'docx-preview';

export const DocumentViewer: React.FC = () => {
  const { selectedFile } = useFileContext();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [docxRendered, setDocxRendered] = useState<boolean>(false);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const docxContainerRef = useRef<HTMLDivElement>(null);

  console.log('🆕 NEW DocumentViewer loaded! Version with enhanced preview system');

  console.log('DocumentViewer render:', {
    hasSelectedFile: !!selectedFile,
    selectedFile: selectedFile ? {
      id: selectedFile.id,
      name: selectedFile.name,
      type: selectedFile.type,
      size: selectedFile.size,
      hasOriginalFile: !!selectedFile.originalFile,
      originalFileType: selectedFile.originalFile?.type,
      originalFileSize: selectedFile.originalFile?.size,
      contentPreview: selectedFile.content ? selectedFile.content.substring(0, 100) + '...' : 'NO CONTENT',
      contentStartsWith: selectedFile.content ? {
        wordDocument: selectedFile.content.startsWith('[Word document'),
        errorReading: selectedFile.content.startsWith('[Error reading'),
        noTextContent: selectedFile.content.startsWith('[No text content')
      } : null
    } : null,
    pdfUrl,
    error
  });

  // Process different file types when selectedFile changes
  useEffect(() => {
    console.log('DocumentViewer: selectedFile changed:', {
      hasFile: !!selectedFile,
      fileName: selectedFile?.name,
      fileType: selectedFile?.type,
      hasOriginalFile: !!selectedFile?.originalFile,
      fileSize: selectedFile?.originalFile?.size
    });

    // Reset all states
    setPdfUrl(null);
    setDocxRendered(false);
    setTextContent(null);
    setIsProcessing(false);
    setError(null);
    
    // Clear docx container
    if (docxContainerRef.current) {
      docxContainerRef.current.innerHTML = '';
    }

    if (!selectedFile?.originalFile) {
      if (selectedFile) {
        // Show loading state instead of error when file is being loaded
        setIsProcessing(true);
      }
      return;
    }

    const processFile = async () => {
      let processingHandled = false;
      
      try {
        setIsProcessing(true);

        // Handle PDF files
        if (selectedFile.type === 'application/pdf') {
          const url = URL.createObjectURL(selectedFile.originalFile);
          setPdfUrl(url);
          setIsProcessing(false);
          console.log('PDF URL created successfully:', url);
          
          // Cleanup function will be called on next effect or unmount
          return () => {
            URL.revokeObjectURL(url);
          };
        }
        
        // Handle DOCX files - render with docx-preview
        else if (
          selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          selectedFile.name.toLowerCase().endsWith('.docx')
        ) {
          console.log('📄 Processing DOCX file for preview...');
          
          // Wait for the container to be available
          const waitForContainer = () => {
            return new Promise<void>((resolve, reject) => {
              let attempts = 0;
              const maxAttempts = 100; // 5 seconds max wait (100 * 50ms)
              
              const checkContainer = () => {
                attempts++;
                console.log(`🔍 Checking for DOCX container... Attempt ${attempts}/${maxAttempts}`, {
                  containerExists: !!docxContainerRef.current,
                  containerElement: docxContainerRef.current
                });
                
                if (docxContainerRef.current) {
                  console.log('✅ DOCX container found!');
                  resolve();
                } else if (attempts >= maxAttempts) {
                  console.error('❌ DOCX container not found after maximum attempts');
                  reject(new Error('DOCX container not available after timeout'));
                } else {
                  setTimeout(checkContainer, 50); // Check every 50ms
                }
              };
              checkContainer();
            });
          };

          try {
            await waitForContainer();
            
            console.log('📄 DOCX container ready, rendering...');
            
            const arrayBuffer = await selectedFile.originalFile.arrayBuffer();
            
            await renderAsync(arrayBuffer, docxContainerRef.current!, undefined, {
              className: "docx-preview",
              inWrapper: false,
              ignoreWidth: false,
              ignoreHeight: false,
              ignoreFonts: false,
              breakPages: true,
              ignoreLastRenderedPageBreak: true,
              experimental: false,
              trimXmlDeclaration: true,
              debug: false
            });
            
            setDocxRendered(true);
            setIsProcessing(false); // Set processing false immediately after DOCX rendering
            processingHandled = true; // Mark that we handled the processing state
            console.log('✅ DOCX rendered successfully');
          } catch (containerError) {
            console.error('❌ Container wait failed:', containerError);
            setError('Failed to prepare document container for preview');
            setIsProcessing(false);
            processingHandled = true;
            return;
          }
        }
        
        // Handle DOC files - show limitation message
        else if (
          selectedFile.type === 'application/msword' ||
          selectedFile.name.toLowerCase().endsWith('.doc')
        ) {
          setError('Legacy .DOC format requires Microsoft Word for full preview. Please convert to .DOCX for better preview support.');
        }
        
        // Handle text files
        else if (
          selectedFile.type.startsWith('text/') ||
          selectedFile.name.toLowerCase().match(/\.(txt|md|json|js|jsx|ts|tsx|css|html|xml|csv|yml|yaml|log)$/)
        ) {
          console.log('📄 Processing text file for preview...');
          const text = await selectedFile.originalFile.text();
          setTextContent(text);
          console.log('✅ Text content loaded successfully');
        }
        
        // Handle other file types
        else {
          setError(`Preview not available for ${selectedFile.type || 'this file type'}`);
        }
      } catch (err) {
        console.error('Error processing file:', err);
        setError(`Failed to process file: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        // Only set processing false if we haven't already handled it
        if (!processingHandled) {
          setIsProcessing(false);
        }
      }
    };

    let cleanup: (() => void) | undefined;

    processFile().then(cleanupFn => {
      cleanup = cleanupFn;
    });
    
    // Return cleanup function
    return () => {
      if (typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, [selectedFile]);

  if (!selectedFile) {
    return (
      <Card className="h-full p-8 flex flex-col items-center justify-center text-center">
        <FileText className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No Document Selected</h3>
        <p className="text-muted-foreground">Upload a document to view it here</p>
      </Card>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <Card className="h-full p-8 flex flex-col items-center justify-center text-center">
        <AlertCircle className="h-16 w-16 text-destructive mb-4" />
        <h3 className="text-lg font-medium mb-2">Error Loading Document</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <p className="text-sm text-muted-foreground">
          File: {selectedFile.name} ({selectedFile.type})
        </p>
      </Card>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Document Full Preview - utilizing full height */}
      <div className="flex-1 min-h-0">
        <div className="h-full">
          {/* PDF Preview */}
          {pdfUrl ? (
            <iframe
              src={`${pdfUrl}#navpanes=0&scrollbar=1&zoom=page-width`}
              className="w-full h-full border-0 block"
              title={`PDF Viewer - ${selectedFile.name}`}
            />
          ) 
          
          /* DOCX Preview - Always render container for DOCX files */
          : (selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
             selectedFile.name.toLowerCase().endsWith('.docx')) ? (
            <div className="h-full overflow-auto">
              
              {/* DOCX Container */}
              <div className="relative">
                {/* Loading overlay when processing */}
                {isProcessing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-muted-foreground">Preparing document preview...</p>
                  </div>
                )}
                
                {/* DOCX Content Container */}
                <div 
                  ref={docxContainerRef}
                  className="docx-container"
                >
                  <style dangerouslySetInnerHTML={{
                    __html: `
                      .docx-container section {
                        box-shadow: 0 1px 3px rgba(0,0,0,0.12) !important;
                        margin: 0.75rem auto !important;
                      }
                      .docx-container * {
                        hyphens: none !important;
                        -webkit-hyphens: none !important;
                      }
                    `
                  }} />
                </div>
              </div>
            </div>
          )
          
          /* Processing state for non-DOCX files */
          : isProcessing ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-muted-foreground">Processing document preview...</p>
            </div>
          ) 
          
          /* Text File Preview */
          : textContent !== null ? (
            <div className="h-full p-6">
              <div className="flex items-center justify-between mb-4 pb-2 border-b">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-medium">Text Document</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{selectedFile.name}</span>
                  <Button
                    onClick={() => {
                      const url = URL.createObjectURL(selectedFile.originalFile!);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = selectedFile.name;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
              <div className="h-full overflow-y-auto overflow-x-hidden">
                <pre 
                  className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded-lg h-full overflow-y-auto overflow-x-hidden"
                  style={{ 
                    fontSize: '13px',
                    lineHeight: '1.5',
                    color: '#1f2937'
                  }}
                >
                  {textContent}
                </pre>
              </div>
            </div>
          )
          
          /* Image Preview */
          : selectedFile.type.startsWith('image/') ? (
            <div className="flex items-center justify-center h-full p-4">
              <img 
                src={URL.createObjectURL(selectedFile.originalFile || new Blob([selectedFile.content], { type: selectedFile.type }))}
                alt="Document preview"
                className="max-w-full max-h-full object-contain shadow-lg rounded-lg"
              />
            </div>
          ) 
          
          /* Fallback for unsupported files */
          : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Document Preview</h3>
              <p className="text-muted-foreground mb-4">{selectedFile.name}</p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-w-md mb-4">
                <p className="text-sm text-gray-800">
                  {error || 'Preview not available for this file type. The document will still be processed for AI analysis.'}
                </p>
              </div>
              {selectedFile.originalFile && (
                <Button
                  onClick={() => {
                    const url = URL.createObjectURL(selectedFile.originalFile!);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = selectedFile.name;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  variant="outline"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download Original File
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};