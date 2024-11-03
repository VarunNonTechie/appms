import { User } from '../models/User';
import { Achievement } from '../models/Achievement';
import { UserProgress } from '../models/UserProgress';
import { notificationService } from './NotificationService';

interface XPEvent {
  type: string;
  points: number;
  description: string;
}

class GamificationService {
  private readonly XP_EVENTS: Record<string, XPEvent> = {
    MEASUREMENT_ADDED: { type: 'measurement', points: 10, description: 'Added new measurement' },
    GOAL_CREATED: { type: 'goal', points: 20, description: 'Created new goal' },
    GOAL_ACHIEVED: { type: 'goal', points: 100, description: 'Achieved a goal' },
    STREAK_MAINTAINED: { type: 'streak', points: 15, description: 'Maintained measurement streak' },
    PROFILE_COMPLETED: { type: 'profile', points: 50, description: 'Completed profile information' },
    SOCIAL_SHARE: { type: 'social', points: 5, description: 'Shared progress' },
    MILESTONE_REACHED: { type: 'milestone', points: 30, description: 'Reached a milestone' }
  };

  private readonly LEVELS = {
    calculateLevel: (xp: number) => Math.floor(Math.sqrt(xp / 100)),
    calculateNextLevelXP: (level: number) => Math.pow(level + 1, 2) * 100
  };

  async awardXP(userId: number, eventType: string, multiplier: number = 1) {
    try {
      const event = this.XP_EVENTS[eventType];
      if (!event) throw new Error('Invalid event type');

      const userProgress = await UserProgress.findOne({ where: { userId } });
      const oldLevel = this.LEVELS.calculateLevel(userProgress.xp);
      
      // Award XP
      const pointsAwarded = Math.round(event.points * multiplier);
      userProgress.xp += pointsAwarded;
      
      // Check for level up
      const newLevel = this.LEVELS.calculateLevel(userProgress.xp);
      if (newLevel > oldLevel) {
        await this.handleLevelUp(userId, newLevel);
      }

      await userProgress.save();

      // Check for XP-based achievements
      await this.checkXPAchievements(userId, userProgress.xp);

      return {
        pointsAwarded,
        newXP: userProgress.xp,
        level: newLevel,
        leveledUp: newLevel > oldLevel
      };
    } catch (error) {
      console.error('Error awarding XP:', error);
      throw error;
    }
  }

  private async handleLevelUp(userId: number, newLevel: number) {
    await notificationService.createNotification(
      userId,
      'level_up',
      `Congratulations! You've reached level ${newLevel}!`
    );

    // Unlock level-specific rewards
    await this.unlockLevelRewards(userId, newLevel);
  }

  private async unlockLevelRewards(userId: number, level: number) {
    const rewards = {
      5: 'custom_themes',
      10: 'advanced_analytics',
      15: 'social_features',
      20: 'premium_badges'
    };

    if (rewards[level]) {
      await User.update(
        { unlockedFeatures: sequelize.fn('array_append', sequelize.col('unlockedFeatures'), rewards[level]) },
        { where: { id: userId } }
      );
    }
  }

  async getProgress(userId: number) {
    const userProgress = await UserProgress.findOne({ where: { userId } });
    const level = this.LEVELS.calculateLevel(userProgress.xp);
    const nextLevelXP = this.LEVELS.calculateNextLevelXP(level);

    return {
      currentXP: userProgress.xp,
      level,
      nextLevelXP,
      progress: (userProgress.xp - (level * level * 100)) / (nextLevelXP - (level * level * 100))
    };
  }

  async updateStreak(userId: number) {
    const userProgress = await UserProgress.findOne({ where: { userId } });
    const lastUpdate = new Date(userProgress.lastActivity);
    const now = new Date();
    
    if (this.isConsecutiveDay(lastUpdate, now)) {
      userProgress.streak += 1;
      if (userProgress.streak > userProgress.longestStreak) {
        userProgress.longestStreak = userProgress.streak;
      }
    } else if (!this.isSameDay(lastUpdate, now)) {
      userProgress.streak = 1;
    }

    userProgress.lastActivity = now;
    await userProgress.save();

    // Check for streak-based achievements
    await this.checkStreakAchievements(userId, userProgress.streak);

    return userProgress.streak;
  }

  private isConsecutiveDay(date1: Date, date2: Date): boolean {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1;
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.toDateString() === date2.toDateString();
  }
}

export const gamificationService = new GamificationService(); 