
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

export const HeroButtons: React.FC = () => {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  return (
    <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
      <Button 
        size="lg" 
        className="group gradient-button"
        onClick={() => navigate('/signup')}
      >
        Get Started for Free
        <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Button>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <div className="aspect-video w-full bg-muted rounded-md overflow-hidden">
            <iframe 
              className="w-full h-full" 
              src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
              title="Product Demo" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
