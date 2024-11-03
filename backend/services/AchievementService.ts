import { Achievement } from '../models/Achievement';
import { UserAchievement } from '../models/UserAchievement';
import { notificationService } from './NotificationService';

class AchievementService {
  private readonly ACHIEVEMENTS = {
    // Measurement Achievements
    FIRST_MEASUREMENT: {
      id: 'FIRST_MEASUREMENT',
      name: 'Getting Started',
      description: 'Record your first measurement',
      icon: '📏',
      type: 'measurement',
      condition: 1
    },
    MEASUREMENT_MASTER: {
      id: 'MEASUREMENT_MASTER',
      name: 'Measurement Master',
      description: 'Record 100 measurements',
      icon: '🎯',
      type: 'measurement',
      condition: 100
    },

    // Streak Achievements
    WEEK_STREAK: {
      id: 'WEEK_STREAK',
      name: 'Week Warrior',
      description: 'Maintain a 7-day streak',
      icon: '🔥',
      type: 'streak',
      condition: 7
    },
    MONTH_STREAK: {
      id: 'MONTH_STREAK',
      name: 'Monthly Master',
      description: 'Maintain a 30-day streak',
      icon: '🌟',
      type: 'streak',
      condition: 30
    },

    // Goal Achievements
    GOAL_SETTER: {
      id: 'GOAL_SETTER',
      name: 'Goal Setter',
      description: 'Set your first goal',
      icon: '🎯',
      type: 'goal',
      condition: 1
    },
    GOAL_CRUSHER: {
      id: 'GOAL_CRUSHER',
      name: 'Goal Crusher',
      description: 'Complete 5 goals',
      icon: '💪',
      type: 'goal',
      condition: 5
    },

    // XP Achievements
    XP_MILESTONE_1: {
      id: 'XP_MILESTONE_1',
      name: 'Rising Star',
      description: 'Reach 1000 XP',
      icon: '⭐',
      type: 'xp',
      condition: 1000
    },
    XP_MILESTONE_2: {
      id: 'XP_MILESTONE_2',
      name: 'Elite Achiever',
      description: 'Reach 5000 XP',
      icon: '🌟',
      type: 'xp',
      condition: 5000
    }
  };

  async checkAchievement(userId: number, type: string, value: number) {
    try {
      const relevantAchievements = Object.values(this.ACHIEVEMENTS)
        .filter(a => a.type === type && value >= a.condition);

      for (const achievement of relevantAchievements) {
        const existing = await UserAchievement.findOne({
          where: { userId, achievementId: achievement.id }
        });

        if (!existing) {
          await this.unlockAchievement(userId, achievement);
        }
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
      throw error;
    }
  }

  private async unlockAchievement(userId: number, achievement: any) {
    try {
      await UserAchievement.create({
        userId,
        achievementId: achievement.id,
        unlockedAt: new Date()
      });

      // Notify user
      await notificationService.createNotification(
        userId,
        'achievement_unlocked',
        `🎉 Achievement Unlocked: ${achievement.name}!`
      );

      // Award bonus XP for achievement
      await gamificationService.awardXP(userId, 'ACHIEVEMENT_UNLOCKED', 1);

      return achievement;
    } catch (error) {
      console.error('Error unlocking achievement:', error);
      throw error;
    }
  }

  async getUserAchievements(userId: number) {
    try {
      const userAchievements = await UserAchievement.findAll({
        where: { userId }
      });

      return Object.values(this.ACHIEVEMENTS).map(achievement => ({
        ...achievement,
        unlocked: userAchievements.some(ua => ua.achievementId === achievement.id),
        unlockedAt: userAchievements.find(ua => ua.achievementId === achievement.id)?.unlockedAt
      }));
    } catch (error) {
      console.error('Error fetching user achievements:', error);
      throw error;
    }
  }
}

export const achievementService = new AchievementService(); 