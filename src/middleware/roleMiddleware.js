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
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  
    const communityId = req.params.communityId;
    const user = await User.findById(req.user._id);
  
    if (!user.moderatedCommunities.includes(communityId)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
  
    next();
  };