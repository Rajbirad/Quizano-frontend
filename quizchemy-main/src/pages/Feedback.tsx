import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Send } from 'lucide-react';

const Feedback = () => {
  const [feedback, setFeedback] = useState({
    type: '',
    subject: '',
    message: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Here you would typically send the feedback to your backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: "Feedback submitted!",
        description: "Thank you for your feedback. We'll review it and get back to you if needed.",
      });

      // Reset form
      setFeedback({
        type: '',
        subject: '',
        message: '',
        email: ''
      });
    } catch (error) {
      toast({
        title: "Error submitting feedback",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFeedback(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-medium">Submit Feedback</h1>
          <p className="text-muted-foreground">
            Help us improve Quizano by sharing your thoughts and suggestions
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="feedback-type">Feedback Type</Label>
              <Select value={feedback.type} onValueChange={(value) => handleChange('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select feedback type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bug">Bug Report</SelectItem>
                  <SelectItem value="feature">Feature Request</SelectItem>
                  <SelectItem value="improvement">Improvement Suggestion</SelectItem>
                  <SelectItem value="general">General Feedback</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Brief description of your feedback"
                value={feedback.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Please provide detailed feedback here..."
                value={feedback.message}
                onChange={(e) => handleChange('message', e.target.value)}
                required
                rows={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={feedback.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Leave your email if you'd like us to follow up with you
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting || !feedback.type || !feedback.subject || !feedback.message}
            >
              {isSubmitting ? (
                "Submitting..."
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Feedback
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Other Ways to Reach Us</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold">Email Support</h4>
            <p className="text-sm text-muted-foreground">support@quizano.com</p>
          </div>
          <div>
            <h4 className="font-semibold">Help Center</h4>
            <p className="text-sm text-muted-foreground">
              Visit our help center for FAQs and detailed guides
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Feedback;