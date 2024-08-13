const User = require('./models/User');
const Role = require('./models/Role');
const bcrypt = require('bcrypt');

const initAdmin = async () => {
  try {
    // Check if there are any users in the database
    const userCount = await User.countDocuments();

    if (userCount === 0) {
      // Find the admin role
      const adminRole = await Role.findOne({ name: 'admin' });

      if (!adminRole) {
        console.error('Admin role not found. Please ensure roles are initialized.');
        return;
      }

      // Create the admin user
      const adminUser = new User({
        username: 'admin',
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        roles: [adminRole._id]
      });

      await adminUser.save();
      console.log('Default admin user created successfully');
    } else {
      console.log('Users already exist. Skipping admin user creation.');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

module.exports = initAdmin;