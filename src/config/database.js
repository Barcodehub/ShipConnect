const mongoose = require('mongoose');
const Role = require('../models/Role');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Conexión a MongoDB establecida');
    initRoles();
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error);
    process.exit(1);
  }
};

const roles = [
  { name: 'admin', description: 'Administrator with full access' },
  { name: 'user', description: 'Regular user' },
  { name: 'moderator', description: 'Global moderator' },
  { name: 'community_moderator', description: 'Moderator for specific communities' }
];

const initRoles = async () => {
  try {
    for (let role of roles) {
      await Role.findOneAndUpdate({ name: role.name }, role, { upsert: true });
    }
    console.log('Roles initialized successfully');
  } catch (error) {
    console.error('Error initializing roles:', error);
  }
};

module.exports = connectDB;