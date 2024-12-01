const User = require('../models/User');
const Message = require('../models/chattingModel/Message');

const setupSocketIO = (io) => {
  io.on('connection', (socket) => {
    console.log('New client connected');
    
    socket.on('join', async (userId) => {
      try {
        // Actualiza el estado de conexión
        await User.findByIdAndUpdate(userId, { isOnline: true });
        socket.join(userId);
        console.log(`User ${userId} is online`);
      } catch (error) {
        console.error('Error joining user:', error);
      }
    });

    socket.on('sendMessage', async ({ senderId, receiverId, content }) => {
      try {
        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);

        if (sender.friends.includes(receiverId)) {
          const newMessage = new Message({
            sender: senderId,
            receiver: receiverId,
            content
          });
          await newMessage.save();

          io.to(receiverId).emit('newMessage', newMessage);
        }
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });

    socket.on('disconnect', async () => {
      const userId = Object.keys(socket.rooms).find((room) => room !== socket.id);
      if (userId) {
        try {
          // Actualiza el estado de conexión
          await User.findByIdAndUpdate(userId, { isOnline: false });
          console.log(`User ${userId} is offline`);
        } catch (error) {
          console.error('Error disconnecting user:', error);
        }
      }
    });
  });
};

module.exports = setupSocketIO;