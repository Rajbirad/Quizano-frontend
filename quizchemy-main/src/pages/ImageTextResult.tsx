import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MarkdownViewer } from '@/components/MarkdownViewer';
import StructuredContent from '@/components/StructuredContent';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, Download, ArrowLeft, FileText, Image, CheckCircle, Sparkles, Eye, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ImageTextResult: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  console.log('🎬 COMPONENT - ImageTextResult component rendered');
  console.log('🎬 COMPONENT - location.state:', location.state);
  
  const { extractedText, imageFile, confidence } = location.state || {};
  const [copied, setCopied] = React.useState(false);

  console.log('🎬 COMPONENT - extractedText:', extractedText);
  console.log('🎬 COMPONENT - imageFile:', imageFile);
  console.log('🎬 COMPONENT - confidence:', confidence);

  if (!extractedText) {
    console.log('❌ COMPONENT - No extractedText, redirecting to image-transcription');
    navigate('/app/image-transcription');
    return null;
  }

  // Handle structured response from new API
  let structuredData = null;
  let textContent = '';
  
  // Check if we have the new structured format
  if (extractedText && typeof extractedText === 'object' && extractedText.sections) {
    console.log('🎯 COMPONENT - Found new structured format');
    structuredData = extractedText;
  } else if (extractedText && typeof extractedText === 'string') {
    // Try to parse as JSON in case it was stringified
    try {
      const parsed = JSON.parse(extractedText);
      if (parsed && parsed.sections) {
        structuredData = parsed;
      } else {
        textContent = extractedText;
      }
    } catch {
      textContent = extractedText;
    }
  } else {
    // Handle old format or plain text
    textContent = typeof extractedText === 'string' ? extractedText : 
      (extractedText?.content || extractedText?.text || JSON.stringify(extractedText));
    console.log('🔧 COMPONENT - textContent processed:', textContent?.substring(0, 200));
  }

  const parseTextToStructuredContent = (text: string) => {
    console.log('🔍 PARSING - Raw text received:', text);
    console.log('🔍 PARSING - Text length:', text.length);
    console.log('🔍 PARSING - First 300 chars:', text.substring(0, 300));
    
    const sections = [];
    
    // More aggressive pattern matching for the specific text format
    const patterns = [
      {
        pattern: /\*\*Definition:\*\*\s*(.+?)(?=\s*\*\*[A-Z]|\s*$)/s,
        heading: "Definition",
        icon: "📝"
      },
      {
        pattern: /\*\*Key Components:\*\*\s*(.+?)(?=\s*\*\*How it Works|\s*\*\*[A-Z]|\s*$)/s,
        heading: "Key Components", 
        icon: "🔧"
      },
      {
        pattern: /\*\*How it Works:\*\*\s*(.+?)(?=\s*\*\*[A-Z]|\s*$)/s,
        heading: "How it Works",
        icon: "⚙️"
      },
      {
        pattern: /\*\*Classification Breakdown:\*\*\s*(.+?)(?=\s*\*\*[A-Z]|\s*$)/s,
        heading: "Types & Classifications",
        icon: "📊"
      },
      {
        pattern: /\*\*Architectural Overview:\*\*\s*(.+?)(?=\s*\*\*[A-Z]|\s*$)/s,
        heading: "System Architecture & Framework",
        icon: "🏗️"
      }
    ];
    
    let processedText = text;
    
    // Try pattern matching first
    for (const { pattern, heading, icon } of patterns) {
      const match = processedText.match(pattern);
      if (match) {
        console.log(`✅ PARSING - Found pattern for ${heading}:`, match[1].substring(0, 100));
        let content = match[1].trim();
        content = cleanSectionContent(content);
        console.log(`🧹 PARSING - Cleaned content for ${heading}:`, content.substring(0, 100));
        
        sections.push({
          heading,
          icon,
          content
        });
        
        // Remove this section from the text to avoid duplication
        processedText = processedText.replace(pattern, '');
      } else {
        console.log(`❌ PARSING - No match for pattern: ${heading}`);
      }
    }
    
    console.log(`🎯 PARSING - Found ${sections.length} sections from patterns`);
    
    // If we didn't find structured sections, break up manually
    if (sections.length === 0) {
      console.log('⚠️ PARSING - No patterns matched, trying manual parsing');
      // Split the text by double asterisk patterns
      const parts = text.split(/(\*\*[^*]+?\*\*)/);
      console.log('🔍 PARSING - Manual parts:', parts.slice(0, 5));
      
      let currentSection = null;
      let currentContent = [];
      
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        
        if (part.match(/^\*\*[^*]+?\*\*$/)) {
          // This is a heading
          if (currentSection) {
            // Save the previous section
            const cleanedContent = cleanSectionContent(currentContent.join(' '));
            console.log(`📝 PARSING - Adding manual section: ${currentSection}`, cleanedContent.substring(0, 100));
            sections.push({
              heading: currentSection,
              icon: getIconForHeading(currentSection),
              content: cleanedContent
            });
          }
          
          currentSection = part.replace(/\*\*/g, '').replace(':', '').trim();
          console.log(`🏷️ PARSING - Found manual heading: ${currentSection}`);
          currentContent = [];
        } else if (part.trim()) {
          // This is content
          currentContent.push(part.trim());
        }
      }
      
      // Add the last section
      if (currentSection && currentContent.length > 0) {
        const cleanedContent = cleanSectionContent(currentContent.join(' '));
        console.log(`📝 PARSING - Adding final manual section: ${currentSection}`, cleanedContent.substring(0, 100));
        sections.push({
          heading: currentSection,
          icon: getIconForHeading(currentSection),
          content: cleanedContent
        });
      }
    }
    
    console.log(`🎯 PARSING - Final result: ${sections.length} sections total`);
    sections.forEach((section, index) => {
      console.log(`Section ${index}: ${section.heading} - Content: ${section.content.substring(0, 100)}`);
    });
    
    return sections;
  };
  
  const getIconForHeading = (heading: string): string => {
    const iconMap: { [key: string]: string } = {
      'Definition': '📝',
      'Key Components': '🔧',
      'How it Works': '⚙️',
      'Classification': '📊',
      'Types': '📊',
      'Architecture': '🏗️',
      'System': '🏗️',
      'Examples': '💡',
      'Benefits': '✅',
      'Use Cases': '🎯',
      'Agents': '🤖'
    };
    
    for (const [key, icon] of Object.entries(iconMap)) {
      if (heading.toLowerCase().includes(key.toLowerCase())) {
        return icon;
      }
    }
    return '📄';
  };
  
  const cleanSectionContent = (content: string): string => {
    let cleaned = content;
    
    // Remove any remaining section headers that leaked into content
    cleaned = cleaned.replace(/\*\*[A-Z][^*]*?\*\*:?\s*/g, '');
    
    // Handle agent type descriptions - convert to proper bullet lists
    cleaned = cleaned.replace(/\s*-\s*([A-Z][^:]+?):\s*([^-]+?)(?=\s*-\s*[A-Z]|\s*$)/g, '\n- **$1:** $2');
    
    // Handle numbered items - keep the ** for parsing but clean format
    cleaned = cleaned.replace(/(\d+)\.\s*\*\*([^*]+?)\*\*\s*-\s*\*\*([^*]+?):\*\*\s*/g, '$1. **$2:** $3');
    
    // Convert standalone dashes to bullet points  
    cleaned = cleaned.replace(/^\s*-\s*/gm, '- ');
    
    // Ensure consistent bold formatting for parsing
    cleaned = cleaned.replace(/\*\*([^*]+?):\*\*/g, '**$1:**');
    cleaned = cleaned.replace(/\*\*([^*]+?)\*\*/g, '**$1**');
    
    // Handle specific agent patterns - ensure proper format for parsing
    cleaned = cleaned.replace(/\s*-\s*Learning Agents:\s*/g, '\n- **Learning Agents:** ');
    cleaned = cleaned.replace(/\s*-\s*Utility-Based Agents:\s*/g, '\n- **Utility-Based Agents:** ');
    cleaned = cleaned.replace(/\s*-\s*Simple Reflex Agents:\s*/g, '\n- **Simple Reflex Agents:** ');
    cleaned = cleaned.replace(/\s*-\s*Goal-Based Agents:\s*/g, '\n- **Goal-Based Agents:** ');
    cleaned = cleaned.replace(/\s*-\s*Model-Based Reflex Agents:\s*/g, '\n- **Model-Based Reflex Agents:** ');
    
    // Clean up excessive whitespace
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    cleaned = cleaned.replace(/^\s+/gm, '');
    
    return cleaned.trim();
  };

  console.log('🔧 COMPONENT - textContent processed:', textContent?.substring(0, 200));

  const getContentForExport = () => {
    if (structuredData && structuredData.sections) {
      let content = structuredData.title ? `${structuredData.title}\n\n` : '';
      structuredData.sections.forEach((section: any) => {
        content += `${section.icon ? section.icon + ' ' : ''}${section.heading}\n`;
        if (section.paragraph) content += `${section.paragraph}\n`;
        if (section.content) {
          content += `${section.content}\n`;
        } else if (Array.isArray(section.items)) {
          section.items.forEach((item: any, i: number) => {
            if (typeof item === 'string') {
              content += `- ${item}\n`;
            } else {
              const label = item.label ? `${item.label}: ` : '';
              const desc = item.description ?? '';
              content += `- ${label}${desc}\n`;
            }
          });
        } else if (Array.isArray(section.steps)) {
          section.steps.forEach((s: any) => {
            content += `${s.step}. ${s.title}${s.description ? ': ' + s.description : ''}\n`;
          });
        }
        content += '\n';
      });
      return content;
    }
    if (textContent) return textContent;
    if (extractedText && typeof extractedText === 'object') {
      return JSON.stringify(extractedText, null, 2);
    }
    return typeof extractedText === 'string' ? extractedText : '';
  };

  const handleCopy = () => {
    const content = getContentForExport();
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const content = getContentForExport();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extracted-text-${imageFile?.name?.split('.')[0] || 'image'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderNotionBlock = (block: any, index: number) => {
    const { type, content, level, style } = block;

    switch (type) {
      case 'heading':
        const HeadingTag = `h${Math.min(level || 1, 6)}` as keyof JSX.IntrinsicElements;
        const headingClasses = {
          1: "text-2xl font-bold text-foreground mt-8 mb-4 flex items-center gap-3",
          2: "text-xl font-semibold text-foreground mt-6 mb-3 flex items-center gap-2",
          3: "text-lg font-medium text-foreground mt-4 mb-2 flex items-center gap-2"
        };
        
        return (
          <HeadingTag key={index} className={headingClasses[level as keyof typeof headingClasses] || headingClasses[3]}>
            <div className={`w-1 h-6 bg-gradient-to-b from-primary to-primary/60 rounded-full ${level === 1 ? 'w-2 h-8' : ''}`} />
            {content}
          </HeadingTag>
        );

      case 'paragraph':
        return (
          <p key={index} className="text-foreground leading-relaxed mb-3 text-base">
            {content}
          </p>
        );

      case 'bullet_list':
        return (
          <ul key={index} className="space-y-2 mb-4 ml-6">
            {content.map((item: string, i: number) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2.5 flex-shrink-0" />
                <span className="text-foreground leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        );

      case 'numbered_list':
        return (
          <ol key={index} className="space-y-2 mb-4 ml-6">
            {content.map((item: string, i: number) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-sm font-semibold text-primary flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <span className="text-foreground leading-relaxed">{item}</span>
              </li>
            ))}
          </ol>
        );

      case 'callout':
        const calloutStyles = {
          info: "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800",
          warning: "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800",
          success: "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800",
          default: "bg-accent/30 border-primary/20"
        };
        
        return (
          <div key={index} className={`${calloutStyles[style as keyof typeof calloutStyles] || calloutStyles.default} rounded-lg p-4 my-4`}>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-primary/20 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles className="h-3 w-3 text-primary" />
              </div>
              <div className="text-foreground leading-relaxed">{content}</div>
            </div>
          </div>
        );

      case 'code_block':
        return (
          <div key={index} className="bg-muted rounded-lg p-4 my-4 border border-border">
            <pre className="text-sm font-mono text-foreground overflow-x-auto">
              <code>{content}</code>
            </pre>
          </div>
        );

      case 'quote':
        return (
          <blockquote key={index} className="pl-4 py-2 my-4 bg-muted/30 rounded-lg">
            <p className="text-foreground/90 italic leading-relaxed">{content}</p>
          </blockquote>
        );

      default:
        return (
          <p key={index} className="text-foreground leading-relaxed mb-3">
            {content}
          </p>
        );
    }
  };

  const renderSection = (section: any, index: number) => {
    const { heading, icon, content } = section;
    
    // Process the content to handle ** formatting and lists
    const processContent = (text: string) => {
      console.log('🧹 SECTION - Processing content:', text.substring(0, 100));
      
      // Split content into lines and process each line
      const lines = text.split('\n').filter(line => line.trim());
      const processedElements = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (!line) continue;
        
        // Handle bold text with ** formatting
        const processedLine = line.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');
        
        // Check line type and render appropriately
        if (line.match(/^[-•*]\s/)) {
          // Bullet list item
          const content = processedLine.replace(/^[-•*]\s*/, '');
          processedElements.push(
            <div key={i} className="flex items-start gap-3 mb-2 ml-4">
              <div className="w-1 h-1 bg-gray-600/80 rounded-full mt-3 flex-shrink-0" />
              <div className="text-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: content }} />
            </div>
          );
        } else if (line.match(/^\d+\.\s/)) {
          // Numbered list item
          const number = line.match(/^(\d+)\./)?.[1];
          const content = processedLine.replace(/^\d+\.\s*/, '');
          processedElements.push(
            <div key={i} className="flex items-start gap-3 mb-2">
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-sm font-semibold text-primary flex-shrink-0 mt-0.5">
                {number}
              </div>
              <div className="text-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: content }} />
            </div>
          );
        } else {
          // Regular paragraph
          processedElements.push(
            <p key={i} className="text-foreground leading-relaxed mb-3 text-base" dangerouslySetInnerHTML={{ __html: processedLine }} />
          );
        }
      }
      
      console.log('🧹 SECTION - Processed', processedElements.length, 'elements');
      return processedElements;
    };
    
    return (
      <div key={index} className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          {icon && <span className="text-2xl">{icon}</span>}
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-primary to-primary/60 rounded-full" />
            {heading}
          </h2>
        </div>
        
        <div className="ml-8">
          {Array.isArray(content) ? (
            <ul className="space-y-3">
              {content.map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-3 ml-4">
                  <div className="w-1 h-1 bg-gray-600/80 rounded-full mt-3 flex-shrink-0" />
                  <span className="text-foreground leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          ) : typeof content === 'object' && content !== null ? (
            <div className="space-y-4">
              {Object.entries(content).map(([key, value]: [string, any], i: number) => (
                <div key={i} className="bg-accent/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="bg-primary/20 text-primary border-0">
                      {key}
                    </Badge>
                  </div>
                  <div className="text-foreground leading-relaxed">
                    {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {processContent(String(content))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    console.log('🚀 RENDER - renderContent called');
    console.log('🚀 RENDER - extractedText type:', typeof extractedText);
    console.log('🚀 RENDER - extractedText value:', extractedText);
    console.log('🚀 RENDER - textContent:', textContent);
    
    // Check if we have structured data from the new API
    if (structuredData && structuredData.sections) {
      console.log('📊 RENDER - Using new structured API data');
      return (
        <StructuredContent 
          title={structuredData.title || "Extracted Content"}
          sections={structuredData.sections}
        />
      );
    }
    
    console.log('🔧 RENDER - About to call parseTextToStructuredContent');
    // Parse the text into structured sections
    const structuredSections = parseTextToStructuredContent(textContent);
    console.log('🔧 RENDER - parseTextToStructuredContent returned:', structuredSections);
    
    if (structuredSections.length > 0) {
      console.log('✅ RENDER - Using StructuredContent component');
      // Determine title from first few words or use a default
      const title = textContent.split(/\n/)[0]?.replace(/\*\*/g, '').trim().substring(0, 50) || "Extracted Content";
      
      return (
        <StructuredContent 
          title={title}
          sections={structuredSections}
        />
      );
    }
    
    console.log('⚠️ RENDER - Falling back to MarkdownViewer');
    // Fallback to the old markdown viewer
    const processedText = preprocessTextContent(textContent);
    
    return (
      <Card className="h-full w-full overflow-hidden">
        <div className="h-full w-full p-4 overflow-y-auto bg-white dark:bg-zinc-950 rounded-md">
          <MarkdownViewer content={processedText} />
        </div>
      </Card>
    );
  };

  const preprocessTextContent = (text: string): string => {
    // Simple fallback preprocessing
    let processedText = text;
    processedText = processedText.replace(/\*\*([^*]+?):\*\*/g, '**$1:**');
    processedText = processedText.replace(/\s*-\s*/g, '\n- ');
    return processedText.trim();
  };

  const formatTextWithStructure = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    const formattedContent = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const nextLine = lines[i + 1]?.trim();
      
      // Main title/heading (all caps or very short with colon)
      if (line.length < 80 && (line === line.toUpperCase() || line.endsWith(':') || 
          (line.length < 50 && nextLine && nextLine.length > line.length))) {
        formattedContent.push(
          <h2 key={i} className="text-2xl font-bold text-foreground mt-6 mb-3 flex items-center gap-3">
            <div className="w-1 h-6 bg-gradient-to-b from-primary to-primary/60 rounded-full" />
            {line.replace(':', '')}
          </h2>
        );
        continue;
      }
      
      // Key Points or numbered items
      if (line.match(/^(Key Point \d+|Point \d+|\d+\.)/i)) {
        formattedContent.push(
          <div key={i} className="mt-4 mb-2">
            <h4 className="font-semibold text-foreground flex items-center gap-2 mb-1">
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">
                {line.match(/\d+/)?.[0] || '•'}
              </div>
              {line}
            </h4>
          </div>
        );
        continue;
      }
      
      // Numbered list items (1., 2., etc.)
      if (line.match(/^\d+\.\s/)) {
        const number = line.match(/^(\d+)\./)?.[1];
        const content = line.replace(/^\d+\.\s*/, '');
        formattedContent.push(
          <div key={i} className="flex items-start gap-3 mb-2 ml-4">
            <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-sm font-semibold text-primary flex-shrink-0 mt-0.5">
              {number}
            </div>
            <p className="text-foreground leading-relaxed">{content}</p>
          </div>
        );
        continue;
      }
      
      // Bullet points
      if (line.match(/^[-•*]\s/)) {
        const content = line.replace(/^[-•*]\s*/, '');
        formattedContent.push(
          <div key={i} className="flex items-start gap-3 mb-2 ml-6">
            <div className="w-1.5 h-1.5 bg-foreground/70 rounded-full mt-2.5 flex-shrink-0" />
            <p className="text-foreground leading-relaxed">{content}</p>
          </div>
        );
        continue;
      }
      
      // Special sections (Definition, Example, etc.)
      if (line.match(/^(Definition|Example|Analogy|Components|Classification|Note|Important):/i)) {
        const [label, ...contentParts] = line.split(':');
        const content = contentParts.join(':').trim();
        formattedContent.push(
          <div key={i} className="bg-accent/30 rounded-lg p-4 my-4">
            <div className="flex items-start gap-3">
              <Badge variant="secondary" className="bg-primary/20 text-primary border-0 flex-shrink-0">
                {label}
              </Badge>
              {content && <div className="text-foreground leading-relaxed">{content}</div>}
            </div>
          </div>
        );
        continue;
      }
      
      // Regular paragraph content
      if (line.length > 20) {
        formattedContent.push(
          <p key={i} className="text-foreground leading-relaxed mb-3 text-base">
            {line}
          </p>
        );
        continue;
      }
      
      // Short lines (likely subheadings)
      formattedContent.push(
        <h5 key={i} className="font-medium text-foreground/80 mt-4 mb-2 flex items-center gap-2">
          <Sparkles className="h-3 w-3 text-primary" />
          {line}
        </h5>
      );
    }
    
    return formattedContent;
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="relative bg-background rounded-lg p-6 shadow-md border border-border min-h-[400px]">
        <div className="absolute top-2 right-2 flex items-center gap-3">
          <button 
            onClick={handleCopy} 
            className="p-2 hover:bg-accent/50 rounded-full transition-colors duration-200 relative"
            title={copied ? 'Copied!' : 'Copy text'}
          >
            {copied
              ? <Check className="h-6 w-6 text-green-500" />
              : <Copy className="h-6 w-6 text-muted-foreground hover:text-foreground" />}
          </button>
          <button 
            onClick={handleDownload} 
            className="p-2 hover:bg-accent/50 rounded-full transition-colors duration-200"
            title="Download as TXT"
          >
            <Download className="h-6 w-6 text-muted-foreground hover:text-foreground" />
          </button>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default ImageTextResult;