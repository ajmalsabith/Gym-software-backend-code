const Membership = require('../Model/AssignMembershipModel');
const User = require('../Model/UserModel');

class CronController {
  /**
   * Check memberships daily and delete expired ones
   */
  static async checkExpiredMemberships() {
    try {
      const memberships = await Membership.find({}).populate('playerId');
      const now = new Date();

      for (const membership of memberships) {
        if (!membership.startDate || !membership.endDate) continue;

        if (membership.endDate < now) {
          const playerId = membership.playerId?._id;

          // Update user subscription info
          if (playerId) {
            await User.findByIdAndUpdate(playerId, {
              subscriptionId: null,
              subscriptionStatus: 'expired',
            });
          }

          // Delete the membership
        //   await Membership.findByIdAndDelete(membership._id);

          console.log(`Deleted expired membership for player ${membership.playerId?.name}`);
        }
      }
    } catch (error) {
      console.error('Error checking expired memberships:', error);
    }
  }
}

module.exports = CronController;
