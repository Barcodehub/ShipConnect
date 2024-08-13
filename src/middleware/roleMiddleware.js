const Role = require('../models/Role');

exports.hasRole = (...roles) => {
    return async (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
  
      const userRoles = await Role.find({ _id: { $in: req.user.roles } });
      const userRoleNames = userRoles.map(role => role.name);
  
      if (!roles.some(role => userRoleNames.includes(role))) {
        return res.status(403).json({ message: 'Forbidden' });
      }
  
      next();
    };
  };
  
  exports.isCommunityModerator = async (req, res, next) => {
    try {
      const communityId = req.params.id;
      const userId = req.user.id;
  
      const community = await Community.findById(communityId);
      if (!community) {
        return res.status(404).json({ message: 'Community not found' });
      }
  
      if (community.creator.toString() === userId || community.moderators.includes(userId)) {
        next();
      } else {
        res.status(403).json({ message: 'User is not a moderator of this community' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error checking moderator status', error: error.message });
    }
  };