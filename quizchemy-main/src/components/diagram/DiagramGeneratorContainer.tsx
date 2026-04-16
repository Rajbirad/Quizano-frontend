import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Loader2, Sparkles, Network } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { makeAuthenticatedFormRequest, makeAuthenticatedRequest } from '@/lib/api-utils';
import { streamTaskStatus } from '@/lib/task-stream';
import mermaid from 'mermaid';
import { trackRecentTool } from '@/utils/recentTools';

export const DiagramGeneratorContainer = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [text, setText] = useState('');
  const [diagramType, setDiagramType] = useState('flowchart');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewSvg, setPreviewSvg] = useState<string | null>(null);
  const mermaidContainerRef = useRef<HTMLDivElement>(null);

  const diagramTypes = [
    { 
      value: 'flowchart', 
      label: 'Flowchart',
      description: 'Process flows with start, decision, and end nodes',
      example: 'graph TD\n    A[Start] --> B{Decision}\n    B -->|Yes| C[Process]\n    B -->|No| D[Alternative]\n    C --> E[End]\n    D --> E\n    style A fill:#86efac\n    style B fill:#fbbf24\n    style C fill:#60a5fa\n    style D fill:#f472b6\n    style E fill:#a78bfa'
    },
    { 
      value: 'class', 
      label: 'Class Diagram',
      description: 'Object-oriented design with classes and relationships',
      example: 'classDiagram\n    class User {\n        +String name\n        +login()\n    }\n    class Admin {\n        +manage()\n    }\n    class Customer {\n        +purchase()\n    }\n    class Product {\n        +String title\n        +float price\n    }\n    User <|-- Admin\n    User <|-- Customer\n    Customer --> Product\n    style User fill:#93c5fd,stroke:#000,stroke-width:2px\n    style Admin fill:#a5f3fc,stroke:#000,stroke-width:2px\n    style Customer fill:#bae6fd,stroke:#000,stroke-width:2px\n    style Product fill:#fde68a,stroke:#000,stroke-width:2px'
    },
    { 
      value: 'pie', 
      label: 'Pie Chart',
      description: 'Data distribution in circular segments',
      example: 'pie title Distribution\n    "Category A" : 40\n    "Category B" : 30\n    "Category C" : 20\n    "Category D" : 10'
    },
    { 
      value: 'sequence', 
      label: 'Sequence Diagram',
      description: 'Interactions between objects over time',
      example: '%%{init: {"theme":"base", "themeVariables": {"actorBkg":"#3b82f6","actorBorder":"#1e40af","actorTextColor":"#fff","actorLineColor":"#64748b","signalColor":"#1e293b","signalTextColor":"#1e293b","labelBoxBkgColor":"#10b981","labelBoxBorderColor":"#059669","labelTextColor":"#fff","noteBkgColor":"#fef3c7","noteBorderColor":"#f59e0b","noteTextColor":"#78350f"}}}%%\nsequenceDiagram\n    participant U as User\n    participant S as System\n    participant D as Database\n    U->>S: Request\n    S->>D: Query\n    D-->>S: Data\n    S-->>U: Response\n    Note over U: Initiates request\n    Note over D: Fetches data'
    },
    { 
      value: 'er', 
      label: 'ER Diagram',
      description: 'Database entities and their relationships',
      example: '%%{init: {"theme":"base", "themeVariables": {"primaryColor":"#93c5fd","primaryTextColor":"#000","primaryBorderColor":"#1e40af","lineColor":"#3b82f6","secondaryColor":"#a5f3fc","tertiaryColor":"#fde68a"}}}%%\nerDiagram\n    USER ||--o{ ORDER : places\n    ORDER ||--|{ ITEM : contains\n    PRODUCT ||--o{ ITEM : references\n    USER {\n        int id\n        string name\n    }\n    ORDER {\n        int id\n        date orderDate\n    }\n    PRODUCT {\n        int id\n        string name\n        float price\n    }'
    },
    { 
      value: 'state', 
      label: 'State Diagram',
      description: 'State transitions in a system',
      example: 'stateDiagram-v2\n    [*] --> Idle\n    Idle --> Processing\n    Processing --> Complete\n    Complete --> [*]\n    Complete --> Idle\n    style Idle fill:#ddd6fe\n    style Processing fill:#93c5fd\n    style Complete fill:#86efac'
    },
    { 
      value: 'user-journey', 
      label: 'User Journey Diagram',
      description: 'User experience and emotions through a process',
      example: 'journey\n    title User Journey\n    section Discovery\n      Search: 5: User\n      Click: 4: User\n    section Purchase\n      Checkout: 3: User'
    },
    { 
      value: 'quadrant', 
      label: 'Quadrant Chart',
      description: '2x2 matrix for prioritization',
      example: 'quadrantChart\n    title Priority Matrix\n    x-axis Low Effort --> High Effort\n    y-axis Low Impact --> High Impact\n    quadrant-1 Plan\n    quadrant-2 Do First\n    quadrant-3 Do Later\n    quadrant-4 Eliminate\n    Task A: [0.3, 0.7]\n    Task B: [0.7, 0.8]'
    },
    { 
      value: 'timeline', 
      label: 'Timeline Diagram',
      description: 'Chronological events on a timeline',
      example: '%%{init: {"theme":"base", "themeVariables": {"fontSize":"18px"}}}%%\ntimeline\n    title Project Timeline\n    2024 Q1 : Planning Phase\n          : Requirements\n    2024 Q2 : Development\n          : Backend APIs\n    2024 Q3 : Testing\n          : QA Review\n    2024 Q4 : Launch\n          : Production'
    },
    { 
      value: 'block', 
      label: 'Block Diagram',
      description: 'System components in blocks with connections',
      example: 'block-beta\n    columns 3\n    Input["Input"]\n    Process["Process"]\n    Output["Output"]\n    Validate["Validate"]\n    Store["Store"]\n    Display["Display"]\n    Input --> Process\n    Process --> Output\n    Process --> Validate\n    Validate --> Store\n    Store --> Display'
    },
    { 
      value: 'xy', 
      label: 'XY Chart',
      description: 'Line or bar charts with X and Y axes',
      example: '%%{init: {"theme":"base", "themeVariables": {"xyChart": {"plotColorPalette": "#3b82f6"}}}}%%\nxychart-beta\n    title Project Progress Over Time\n    x-axis [Jan, Feb, Mar, Apr, May, Jun]\n    y-axis "Completion %" 0 --> 100\n    line [15, 35, 55, 72, 88, 100]'
    },
    { 
      value: 'gantt', 
      label: 'Gantt Chart',
      description: 'Project timeline with tasks and dependencies',
      example: '%%{init: {"theme":"base", "themeVariables": {"fontSize":"16px","primaryColor":"#3b82f6","primaryTextColor":"#fff","primaryBorderColor":"#1e40af","lineColor":"#64748b","secondaryColor":"#10b981","tertiaryColor":"#f59e0b"}}}%%\ngantt\n    title Project Development Schedule\n    dateFormat YYYY-MM-DD\n    section Research\n    Market Analysis      :done, a1, 2024-01-01, 10d\n    Requirements         :done, a2, 2024-01-11, 12d\n    section Design\n    UI/UX Design         :active, a3, 2024-01-23, 15d\n    Architecture         :active, a4, 2024-01-23, 15d\n    section Development\n    Backend API          :a5, 2024-02-07, 25d\n    Frontend Build       :a6, 2024-02-07, 25d\n    Database Setup       :a7, 2024-02-07, 15d\n    section Testing\n    Unit Testing         :a8, 2024-03-03, 10d\n    Integration Test     :a9, 2024-03-13, 8d\n    section Deployment\n    Staging Release      :a10, 2024-03-21, 5d\n    Production Launch    :a11, 2024-03-26, 3d'
    },
    { 
      value: 'bar', 
      label: 'Bar Chart',
      description: 'Horizontal or vertical bar charts',
      example: '%%{init: {"theme":"base", "themeVariables": {"xyChart": {"plotColorPalette": "#3b82f6, #10b981, #f59e0b, #ef4444"}}}}%%\nxychart-beta\n    title Sales by Region\n    x-axis [North, South, East, West]\n    y-axis "Revenue (k)" 0 --> 100\n    bar [65, 45, 80, 55]'
    },
  ];

  const selectedDiagram = useMemo(() => 
    diagramTypes.find(d => d.value === diagramType),
    [diagramType]
  );

  // Initialize mermaid
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      securityLevel: 'loose',
    });
  }, []);

  // Render preview diagram
  useEffect(() => {
    if (!selectedDiagram) return;
    setPreviewSvg(null);
    const renderPreview = async () => {
      try {
        const id = `preview-${Date.now()}`;
        const { svg } = await mermaid.render(id, selectedDiagram.example, mermaidContainerRef.current ?? undefined);
        setPreviewSvg(svg);
      } catch (error) {
        console.error('Preview render error:', error);
        setPreviewSvg('<div class="text-center text-sm text-muted-foreground p-4">Preview not available</div>');
      }
    };
    renderPreview();
  }, [diagramType, selectedDiagram]);

  const pollTaskStatus = async (taskId: string): Promise<any> => {
    const event = await streamTaskStatus(taskId);
    const statusData = event as any;
    // Format 1: { status, result: { mermaidCode, ... } }
    // Format 2: { status, mermaidCode, ... } (flat)
    const result = statusData.mermaidCode ? statusData : (statusData.result ?? statusData);
    if (!result?.mermaidCode) throw new Error('No diagram data in result');
    return result;
  };

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast({
        title: 'Input Required',
        description: 'Please enter a description for your diagram.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    try {
      const formData = new FormData();
      formData.append('text', text);
      formData.append('diagram_type', diagramType);

      const response = await makeAuthenticatedFormRequest(
        '/api/diagram/generate',
        formData,
        'POST'
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate diagram');
      }

      const data = await response.json();

      if (data.task_id) {
        // Async: poll for result
        const result = await pollTaskStatus(data.task_id);
        trackRecentTool('/app/ai-diagram');
        navigate('/app/diagram-result', {
          state: { diagram: result }
        });
      } else if (data.success) {
        // Sync fallback (legacy)
        trackRecentTool('/app/ai-diagram');
        navigate('/app/diagram-result', {
          state: { diagram: data }
        });
      } else {
        throw new Error(data.message || 'Failed to generate diagram');
      }
    } catch (error) {
      console.error('Error generating diagram:', error);
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Unable to generate diagram. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const examplePrompts = [
    "Customer support ticket workflow",
    "User authentication flow",
    "E-commerce order processing system",
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Hidden off-screen container for mermaid rendering — prevents body-level DOM injection */}
      <div ref={mermaidContainerRef} aria-hidden="true" style={{ position: 'absolute', left: '-9999px', top: '-9999px', overflow: 'hidden', width: 0, height: 0 }} />
      {/* Left Column - Input Section */}
      <div className="space-y-6">
        {/* Diagram Type Selection */}
        <div className="space-y-2">
          <Label htmlFor="diagram-type" className="text-base font-semibold">
            Diagram Type
          </Label>
          <Select value={diagramType} onValueChange={setDiagramType}>
            <SelectTrigger id="diagram-type" className="h-12 rounded-2xl">
              <SelectValue placeholder="Select diagram type" />
            </SelectTrigger>
            <SelectContent>
              {diagramTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Text Input */}
        <div className="space-y-2">
          <Label htmlFor="text-input" className="text-base font-semibold">
            Description
          </Label>
          <Textarea
            id="text-input"
            placeholder="Describe the process, flow, or concept you want to visualize. For example: 'User authentication flow with login, verification, and dashboard access'"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            className="resize-none border-2 border-input focus-visible:ring-primary rounded-3xl px-5 py-4"
          />
        </div>

        {/* Example Prompts */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Quick Examples:</Label>
          <div className="flex flex-wrap gap-2">
            {examplePrompts.map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setText(prompt)}
                className="text-xs h-8"
              >
                {prompt}
              </Button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !text.trim()}
          className="w-full h-12 text-base font-semibold"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generating Your Diagram...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Generate Diagram
            </>
          )}
        </Button>
      </div>

      {/* Right Column - Preview Section */}
      <div className="lg:sticky lg:top-8 h-fit">
        <Card className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 border-2 rounded-3xl">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div>
                <h3 className="text-lg font-semibold">{selectedDiagram?.label}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedDiagram?.description}
                </p>
              </div>
            </div>

            {/* Preview Diagram */}
            <div className="relative bg-white rounded-2xl border-2 border-slate-200 overflow-hidden p-4">
              {previewSvg ? (
                <div
                  className="flex items-center justify-center h-[400px] w-full [&>svg]:max-w-full [&>svg]:max-h-[400px] [&>svg]:h-auto [&>svg]:w-auto"
                  dangerouslySetInnerHTML={{ __html: previewSvg }}
                />
              ) : (
                <div className="flex items-center justify-center h-[400px] w-full">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 mx-auto animate-spin text-slate-400" />
                    <p className="text-sm text-slate-500 mt-2">Loading preview...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
