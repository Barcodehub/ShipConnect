const User = require('../../models/User');
const Role = require('../../models/Role');

exports.updateRole = async (req, res) => {
    try {
      const { userId, newRoleName } = req.body;
      const user = await User.findById(userId);
      const newRole = await Role.findOne({ name: newRoleName });
  
      if (!user || !newRole) {
        return res.status(404).json({ message: 'User or role not found' });
      }
  
      // Ensure user always has at least one role
      if (user.roles.length === 1 && user.roles[0].equals(newRole._id)) {
        return res.status(400).json({ message: 'User already has this role and must have at least one role' });
      }
  
      // Update the user's roles
      user.roles = [newRole._id];
      await user.save();
  
      res.status(200).json({ message: 'Role updated successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  