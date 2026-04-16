
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

export const Testimonials: React.FC = () => {
  const testimonials = [
    {
      name: "Alex Johnson",
      role: "Medical Student",
      image: "https://i.pravatar.cc/150?img=11",
      text: "This platform helped me ace my exams! The AI tutor explained complex medical concepts better than my textbooks.",
      stars: 5
    },
    {
      name: "Sarah Williams",
      role: "Computer Science Major",
      image: "https://i.pravatar.cc/150?img=5",
      text: "AI tutor explains concepts better than my professors! I've improved my grades significantly since using this platform.",
      stars: 5
    },
    {
      name: "Michael Chen",
      role: "History Teacher",
      image: "https://i.pravatar.cc/150?img=8",
      text: "Flashcard generation from PDFs saves me hours! I use it to create study materials for my students.",
      stars: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Language Learner",
      image: "https://i.pravatar.cc/150?img=9",
      text: "The multi-language feature is a game-changer for language learning. I can study vocabulary in context easily.",
      stars: 5
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of students who have transformed their study experience
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow border">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name} 
                    className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
                  />
                  <div>
                    <h3 className="font-semibold">{testimonial.name}</h3>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    <div className="flex mt-1">
                      {[...Array(testimonial.stars)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="italic">"{testimonial.text}"</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <h3 className="text-xl font-medium mb-6">Trusted by students and educators worldwide</h3>
          <div className="flex flex-wrap justify-center gap-8 opacity-70">
            <img src="https://via.placeholder.com/120x40?text=University" alt="University" className="h-10" />
            <img src="https://via.placeholder.com/120x40?text=Academy" alt="Academy" className="h-10" />
            <img src="https://via.placeholder.com/120x40?text=Institute" alt="Institute" className="h-10" />
            <img src="https://via.placeholder.com/120x40?text=School" alt="School" className="h-10" />
          </div>
        </div>
      </div>
    </section>
  );
};
