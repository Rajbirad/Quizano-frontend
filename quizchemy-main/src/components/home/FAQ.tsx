
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const FAQ: React.FC = () => {
  const faqs = [
    {
      question: "Is it free to use?",
      answer: "Yes, we offer a free basic plan that includes limited flashcards and AI queries. Premium plans are available for unlimited access to all features."
    },
    {
      question: "How does AI generate flashcards?",
      answer: "Our AI technology scans your documents, extracts key concepts, and creates flashcards based on important information. It uses natural language processing to identify definitions, facts, and relationships between concepts."
    },
    {
      question: "Can I use it on mobile devices?",
      answer: "Yes, our platform works on all devices including smartphones, tablets, and computers. You can study on the go!"
    },
    {
      question: "What file formats are supported?",
      answer: "We support PDFs, Word documents (DOCX), images (JPG, PNG), text files, and even YouTube video links for generating study materials."
    },
    {
      question: "How accurate is the AI tutor?",
      answer: "Our AI tutor is trained on vast educational resources and provides high-quality explanations for most academic subjects. It continuously improves through user feedback."
    },
    {
      question: "Can I share my flashcards with others?",
      answer: "Yes, premium users can create and share study sets with classmates, students, or study groups through a simple link."
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-muted-foreground">
            Have questions? We've got answers!
          </p>
        </div>
        
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left text-lg font-medium">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};
