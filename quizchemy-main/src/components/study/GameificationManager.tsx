
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface GameificationManagerProps {
  children: (gameProps: {
    streak: number;
    xpPoints: number;
    earnedAchievement: string | null;
  }) => React.ReactNode;
}

export const GameificationManager: React.FC<GameificationManagerProps> = ({ children }) => {
  const { toast } = useToast();
  const [streak, setStreak] = useState(0);
  const [xpPoints, setXpPoints] = useState(0);
  const [earnedAchievement, setEarnedAchievement] = useState<string | null>(null);

  // Load game data from localStorage
  useEffect(() => {
    const savedBookmarks = localStorage.getItem('bookmarkedCards');
    
    // Load streak and XP data
    const savedStreak = localStorage.getItem('studyStreak');
    const savedXP = localStorage.getItem('studyXP');
    
    if (savedStreak) setStreak(JSON.parse(savedStreak));
    if (savedXP) setXpPoints(JSON.parse(savedXP));
    
    // Check if user studied today
    const lastStudyDate = localStorage.getItem('lastStudyDate');
    const today = new Date().toDateString();
    
    if (lastStudyDate !== today) {
      localStorage.setItem('lastStudyDate', today);
      
      // Increment streak if consecutive days
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toDateString();
      
      if (lastStudyDate === yesterdayString) {
        const newStreak = streak + 1;
        setStreak(newStreak);
        localStorage.setItem('studyStreak', JSON.stringify(newStreak));
        
        // Check for streak achievements
        if (newStreak === 3) {
          setEarnedAchievement('3-Day Streak!');
          toast({
            title: "Achievement Unlocked!",
            description: "3-Day Study Streak! Keep going! 🔥",
          });
        } else if (newStreak === 7) {
          setEarnedAchievement('7-Day Streak!');
          toast({
            title: "Achievement Unlocked!",
            description: "Weekly Warrior! 7-Day Study Streak! 🔥🔥🔥",
          });
        }
      } else {
        // Reset streak if not consecutive
        setStreak(1);
        localStorage.setItem('studyStreak', JSON.stringify(1));
      }
    }
  }, [toast, streak]);

  return children({
    streak,
    xpPoints,
    earnedAchievement
  });
};
