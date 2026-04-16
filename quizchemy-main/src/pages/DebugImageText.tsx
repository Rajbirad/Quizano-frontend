import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const DebugImageText: React.FC = () => {
  const navigate = useNavigate();

  const testWithSampleData = () => {
    console.log('🧪 MANUAL TEST - Creating sample extracted text data');
    
    const sampleExtractedText = `**Definition:** Artificial Intelligence (AI) refers to the simulation of human intelligence in machines that are programmed to think and learn like humans.

**Key Components:**
- Machine Learning: AI systems that can learn and improve from experience
- Natural Language Processing: Understanding and generating human language
- Computer Vision: Interpreting and understanding visual information

**How it Works:**
1. Data Collection: Gathering relevant information
2. Algorithm Selection: Choosing appropriate AI models
3. Training: Teaching the system using sample data
4. Testing and Validation: Ensuring accuracy and reliability

**Classification Breakdown:**

- Simple Reflex Agents: React to current percept only
- Model-Based Reflex Agents: Maintain internal state
- Goal-Based Agents: Work towards specific objectives
- Utility-Based Agents: Make decisions based on utility functions
- Learning Agents: Improve performance through experience`;

    console.log('🧪 MANUAL TEST - Sample text created, navigating to ImageTextResult');
    
    // Navigate to ImageTextResult with sample data
    navigate('/app/image-text-result', {
      state: {
        extractedText: sampleExtractedText,
        imageFile: { name: 'test-image.png' },
        confidence: 0.95
      }
    });
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <Card>
        <CardContent className="p-8">
          <h1 className="text-2xl font-bold mb-4">Debug Image Summarizer</h1>
          <p className="text-muted-foreground mb-6">
            This page allows you to test the image text result parsing without uploading an image.
            Click the button below to navigate to the result page with sample problematic text.
          </p>
          
          <div className="space-y-4">
            <Button onClick={testWithSampleData} className="w-full">
              Test with Sample Problematic Text
            </Button>
            
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Sample Text Contains:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• ** formatting that should be converted to bold</li>
                <li>• Bullet lists that should render as proper blocks</li>
                <li>• Numbered lists that should be formatted correctly</li>
                <li>• Multiple sections with headings</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DebugImageText;
