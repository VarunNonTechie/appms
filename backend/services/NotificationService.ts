import nodemailer from 'nodemailer';
import { User } from '../models/User';
import { Notification } from '../models/Notification';
import { EmailTemplate } from '../types/email';

class NotificationService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async createNotification(userId: number, type: string, message: string) {
    try {
      const notification = await Notification.create({
        userId,
        type,
        message,
        read: false
      });

      // Send email notification if user has email notifications enabled
      const user = await User.findByPk(userId);
      if (user?.emailNotifications) {
        await this.sendEmailNotification(user.email, type, message);
      }

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  private async sendEmailNotification(email: string, type: string, message: string) {
    const template = this.getEmailTemplate(type, message);
    
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: template.subject,
      html: template.html
    });
  }

  private getEmailTemplate(type: string, message: string): EmailTemplate {
    const templates: Record<string, EmailTemplate> = {
      reminder: {
        subject: 'Measurement Reminder',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Measurement Reminder</h2>
            <p>${message}</p>
            <a href="${process.env.APP_URL}/measure" style="display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 4px;">
              Take Measurements
            </a>
          </div>
        `
      },
      recommendation: {
        subject: 'New Measurement Recommendation',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>New Recommendation</h2>
            <p>${message}</p>
            <a href="${process.env.APP_URL}/recommendations" style="display: inline-block; padding: 10px 20px; background: #28a745; color: white; text-decoration: none; border-radius: 4px;">
              View Recommendations
            </a>
          </div>
        `
      }
    };

    return templates[type] || templates.reminder;
  }
}

export const notificationService = new NotificationService(); 