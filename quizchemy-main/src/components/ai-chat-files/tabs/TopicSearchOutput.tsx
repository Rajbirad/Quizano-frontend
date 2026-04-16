
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileSearch } from 'lucide-react';
import { useFileContext } from '../FileContext';
import { useToast } from '@/hooks/use-toast';

export const TopicSearchOutput: React.FC = () => {
  const { selectedFile } = useFileContext();
  const { toast } = useToast();
  const [searchResult, setSearchResult] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const searchTopic = () => {
    if (!selectedFile) {
      toast({
        title: "No document selected",
        description: "Please upload and select a document first.",
        variant: "destructive"
      });
      return;
    }
    
    if (!searchTerm.trim()) {
      toast({
        title: "No search term",
        description: "Please enter a topic to search for.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSearching(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      // Mock result
      setSearchResult(`Here are the sections of the document related to "${searchTerm}":\n\nSection 1: Lorem ipsum dolor sit amet, consectetur adipiscing elit.\n\nSection 2: Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`);
      setIsSearching(false);
      
      toast({
        title: "Search completed",
        description: `Found results for "${searchTerm}"`
      });
    }, 2000);
  };

  return (
    <div className="h-[600px] flex flex-col">
      {isSearching ? (
        <div className="flex flex-col items-center justify-center py-6 flex-1">
          <div className="animate-pulse flex space-x-2 mb-4">
            <div className="h-3 w-3 bg-primary rounded-full"></div>
            <div className="h-3 w-3 bg-primary rounded-full"></div>
            <div className="h-3 w-3 bg-primary rounded-full"></div>
          </div>
          <p className="text-muted-foreground">Searching document...</p>
        </div>
      ) : searchResult ? (
        <div className="flex-1 overflow-auto p-6 border rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Search Results</h3>
            <Button variant="outline" size="sm" onClick={() => setSearchResult(null)}>
              New Search
            </Button>
          </div>
          <div className="whitespace-pre-wrap">
            {searchResult}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 max-w-md mx-auto">
          <FileSearch className="h-12 w-12 mx-auto text-primary/80 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Find Specific Topic</h3>
          <p className="text-muted-foreground mb-4">
            Search for specific topics or information within your document.
          </p>
          <div className="w-full space-y-4">
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter a topic to search for..."
              className="w-full px-4 py-2 border rounded-md"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  searchTopic();
                }
              }}
            />
            <Button onClick={searchTopic} className="w-full">
              Search Document
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
