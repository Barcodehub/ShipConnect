const User = require('../../models/User');
const FriendRequest = require('../../models/contentModel/FriendRequest');


exports.getMyFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('friends', 'username email profilePicture slug');
    res.json(user.friends);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getUserFriends = async (req, res) => {
  try {
    const userId = req.params.userId; // Obtener userId de los parámetros
    const user = await User.findById(userId)
      .populate('friends', 'username profilePicture slug') // Obtener datos de los amigos
      .sort('-createdAt'); // Si `createdAt` no está en `friends`, puedes omitir `.sort()`

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(user.friends); // Devolver la lista de amigos
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


exports.getFriendshipStatus = async (req, res) => {
  try {
      const { userId } = req.params;
      
      // Verificar si son amigos
      const user = await User.findById(req.user.id);
      if (user.friends.includes(userId)) {
          return res.json({ status: 'friends' });
      }
      
      // Verificar si hay una solicitud pendiente
      const pendingRequest = await FriendRequest.findOne({
          $or: [
              { sender: req.user.id, receiver: userId, status: 'pending' },
              { sender: userId, receiver: req.user.id, status: 'pending' }
          ]
      });
      
      if (pendingRequest) {
          return res.json({ 
              status: 'pending',
              // Indica si el usuario actual envió o recibió la solicitud
              direction: pendingRequest.sender.toString() === req.user.id ? 'sent' : 'received'
          });
      }
      
      // Si no hay relación
      res.json({ status: null });
      
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};



exports.sendFriendRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const existingRequest = await FriendRequest.findOne({
      sender: req.user.id,
      receiver: receiverId,
      status: 'pending'
    });
    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }
    const friendRequest = await FriendRequest.create({
      sender: req.user.id,
      receiver: receiverId
    });
    res.status(201).json(friendRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.respondToFriendRequest = async (req, res) => {
  try {
    const { requestId, status } = req.body;
    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest || friendRequest.receiver.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Friend request not found' });
    }
    friendRequest.status = status;
    await friendRequest.save();
    if (status === 'accepted') {
      await User.findByIdAndUpdate(friendRequest.sender, { $push: { friends: friendRequest.receiver } });
      await User.findByIdAndUpdate(friendRequest.receiver, { $push: { friends: friendRequest.sender } });
    }
    res.json(friendRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getFriendRequests = async (req, res) => {
  try {
    const friendRequests = await FriendRequest.find({ receiver: req.user.id, status: 'pending' })
      .populate('sender', 'username pictureProfile');
    res.json(friendRequests);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


exports.removeFriend = async (req, res) => {
  try {
    const { friendId } = req.params;
    await User.findByIdAndUpdate(req.user.id, { $pull: { friends: friendId } });
    await User.findByIdAndUpdate(friendId, { $pull: { friends: req.user.id } });
    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
