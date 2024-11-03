import { User } from '../models/User';
import { Goal } from '../models/Goal';
import { SocialConnection } from '../models/SocialConnection';
import { notificationService } from './NotificationService';

class SocialService {
  async shareGoal(userId: number, goalId: number, shareOptions: ShareOptions) {
    try {
      const goal = await Goal.findByPk(goalId);
      if (!goal || goal.userId !== userId) {
        throw new Error('Goal not found or unauthorized');
      }

      // Create social share
      const share = await SocialShare.create({
        userId,
        goalId,
        visibility: shareOptions.visibility,
        message: shareOptions.message,
        allowComments: shareOptions.allowComments
      });

      // Notify connections
      if (shareOptions.visibility === 'connections') {
        const connections = await this.getUserConnections(userId);
        for (const connection of connections) {
          await notificationService.createNotification(
            connection.followerId,
            'goal_shared',
            `${connection.follower.username} shared a fitness goal!`
          );
        }
      }

      return share;
    } catch (error) {
      console.error('Error sharing goal:', error);
      throw error;
    }
  }

  async getSharedGoals(userId: number) {
    try {
      const connections = await this.getUserConnections(userId);
      const connectionIds = connections.map(c => c.followerId);

      return await SocialShare.findAll({
        where: {
          [Op.or]: [
            { userId: connectionIds, visibility: 'connections' },
            { visibility: 'public' }
          ]
        },
        include: [
          { model: Goal },
          { model: User, attributes: ['id', 'username', 'avatar'] },
          { 
            model: SocialInteraction,
            include: [{ model: User, attributes: ['id', 'username'] }]
          }
        ],
        order: [['createdAt', 'DESC']]
      });
    } catch (error) {
      console.error('Error fetching shared goals:', error);
      throw error;
    }
  }

  async addInteraction(userId: number, shareId: number, type: 'like' | 'comment', content?: string) {
    try {
      const share = await SocialShare.findByPk(shareId);
      if (!share) throw new Error('Share not found');

      const interaction = await SocialInteraction.create({
        userId,
        shareId,
        type,
        content
      });

      // Notify goal owner
      if (userId !== share.userId) {
        await notificationService.createNotification(
          share.userId,
          'social_interaction',
          `Someone ${type}d your shared goal`
        );
      }

      return interaction;
    } catch (error) {
      console.error('Error adding interaction:', error);
      throw error;
    }
  }
}

export const socialService = new SocialService(); 