import cron from 'node-cron';
import user from '../models/user';

export const startScheduledTasks = () => {
  // Run every day at midnight
  cron.schedule('0 0 * * *', async () => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    try {
        // deletes any unverified users after 7 days of creating their account
        const result = await user.deleteMany({
        isVerified: false,
        createdAt: { $lt: sevenDaysAgo }
      });
      
      console.log(`Deleted ${result.deletedCount} unverified users`);
    } catch (error) {
      console.error('Error deleting unverified users:', error);
    }
  });
};