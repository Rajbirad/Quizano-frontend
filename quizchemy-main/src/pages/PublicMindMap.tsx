import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Network, ArrowLeft } from 'lucide-react';
import D3MindMap from '@/components/ai-chat-files/D3MindMap';
import { getThemeById } from '@/utils/mindmap-themes';
import { makeAuthenticatedRequest } from '@/lib/api-utils';

interface MindMapNode {
  name: string;
  children: MindMapNode[];
}

interface MindMapData {
  name: string;
  children: MindMapNode[];
}

const PublicMindMap = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const navigate = useNavigate();
  const [mindMapData, setMindMapData] = useState<MindMapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMindMap = async () => {
      if (!shareId) {
        setError('Invalid share link');
        setLoading(false);
        return;
      }

      try {
        const response = await makeAuthenticatedRequest(`/api/mindmap/${shareId}`, {
          method: 'GET',
        });
        
        if (!response.ok) {
          throw new Error('Mindmap not found');
        }

        const data = await response.json();
        setMindMapData(data.mindmap);
      } catch (err) {
        console.error('Error fetching mindmap:', err);
        setError('Failed to load mindmap');
      } finally {
        setLoading(false);
      }
    };

    fetchMindMap();
  }, [shareId]);

  if (loading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Network className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
            <p className="text-muted-foreground">Loading mind map...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !mindMapData) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Network className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-semibold mb-2">Mindmap Not Available</p>
            <p className="text-muted-foreground mb-4">This mindmap is not publicly accessible or does not exist.</p>
            <Button onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Network className="h-8 w-8 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold">Shared Mind Map</h1>
        </div>
        <p className="text-muted-foreground mt-4">
          {mindMapData.name.replace(/^["']|["']$/g, '')}
        </p>
      </div>

      <Card className="glass-panel border-0 shadow-lg p-6">
        <div className="h-[700px] relative bg-white rounded-lg">
          <D3MindMap summary={mindMapData} theme={getThemeById('default')} />
        </div>
      </Card>

      <div className="mt-6 flex justify-center">
        <Button onClick={() => navigate('/')} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </div>
    </div>
  );
};

export default PublicMindMap;
