
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flashcard } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Trophy, Zap, BookOpen, Star, ThumbsUp, ThumbsDown } from 'lucide-react';

interface StudyStatsProps {
  cards: Flashcard[];
  masteryPercentage: number;
  streak: number;
  xpPoints: number;
}

export const StudyStats: React.FC<StudyStatsProps> = ({
  cards,
  masteryPercentage,
  streak,
  xpPoints
}) => {
  // Calculate card statistics
  const masteredCards = cards.filter(card => card.difficulty < 0.3).length;
  const difficultCards = cards.filter(card => card.difficulty > 0.7).length;
  const inProgressCards = cards.length - masteredCards - difficultCards;
  
  // Mastery levels for gamification
  const getMasteryLevel = (xp: number) => {
    if (xp < 50) return 'Beginner';
    if (xp < 100) return 'Apprentice';
    if (xp < 200) return 'Adept';
    if (xp < 500) return 'Expert';
    return 'Master';
  };
  
  const masteryLevel = getMasteryLevel(xpPoints);
  
  return (
    <div className="w-full max-w-2xl">
      <h3 className="text-xl font-semibold mb-4 text-center">Your Study Stats</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              Study Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1 text-sm">
                  <span>Mastery</span>
                  <span>{masteryPercentage}%</span>
                </div>
                <Progress value={masteryPercentage} className="h-2" />
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-md bg-green-50 dark:bg-green-900/20">
                  <ThumbsUp className="h-4 w-4 text-green-500 mx-auto mb-1" />
                  <p className="font-semibold text-green-600 dark:text-green-400">{masteredCards}</p>
                  <p className="text-xs text-muted-foreground">Mastered</p>
                </div>
                
                <div className="p-2 rounded-md bg-blue-50 dark:bg-blue-900/20">
                  <BookOpen className="h-4 w-4 text-blue-500 mx-auto mb-1" />
                  <p className="font-semibold text-blue-600 dark:text-blue-400">{inProgressCards}</p>
                  <p className="text-xs text-muted-foreground">Learning</p>
                </div>
                
                <div className="p-2 rounded-md bg-red-50 dark:bg-red-900/20">
                  <ThumbsDown className="h-4 w-4 text-red-500 mx-auto mb-1" />
                  <p className="font-semibold text-red-600 dark:text-red-400">{difficultCards}</p>
                  <p className="text-xs text-muted-foreground">Difficult</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-2 rounded-md bg-amber-50 dark:bg-amber-900/20">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  <span>Study Streak</span>
                </div>
                <span className="font-semibold">{streak} days</span>
              </div>
              
              <div className="flex items-center justify-between p-2 rounded-md bg-blue-50 dark:bg-blue-900/20">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-500" />
                  <span>Total XP</span>
                </div>
                <span className="font-semibold">{xpPoints} points</span>
              </div>
              
              <div className="flex items-center justify-between p-2 rounded-md bg-purple-50 dark:bg-purple-900/20">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-purple-500" />
                  <span>Level</span>
                </div>
                <span className="font-semibold">{masteryLevel}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg text-center">
        <p className="text-sm text-muted-foreground">Continue your studying to earn more achievements and XP!</p>
      </div>
    </div>
  );
};
