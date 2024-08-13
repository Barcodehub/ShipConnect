const User = require('../models/User');
const Message = require('../models/chattingModel/Message');

const setupSocketIO = (io) => {
  io.on('connection', (socket) => {
    console.log('New client connected');
    
    socket.on('join', (userId) => {
      socket.join(userId);
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

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
};

module.exports = setupSocketIO;