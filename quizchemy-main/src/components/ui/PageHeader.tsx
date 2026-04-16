import { Sparkles } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description: string;
  showSparkles?: boolean;
  className?: string;
}

export function PageHeader({
  title,
  description,
  showSparkles = true,
  className = ""
}: PageHeaderProps) {
  return (
    <div className={`flex flex-col items-center space-y-6 mb-10 ${className}`}>
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-center relative">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-600 to-blue-600 relative shiny-gradient">
          {title}
        </span>
        {showSparkles && (
          <div className="absolute -right-12 top-1 hidden md:block">
            <Sparkles className="h-8 w-8 text-primary animate-pulse-gentle" />
          </div>
        )}
      </h1>
      <p className="text-base text-muted-foreground text-center max-w-2xl">
        {description}
      </p>
    </div>
  );
}
