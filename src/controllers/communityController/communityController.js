const Community = require('../../models/communityModel/Community');
const User = require('../../models/User');

exports.createCommunity = async (req, res) => {
  try {
    const { name, description, privacy } = req.body;
    const newCommunity = new Community({
      name,
      description,
      privacy,
      creator: req.user.id,
      members: [req.user.id]
    });
    const community = await newCommunity.save();
    await User.findByIdAndUpdate(req.user.id, { $push: { community: newCommunity._id } });
    res.json(community);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getPublicCommunities = async (req, res) => {
  try {
    const communities = await Community.find({ privacy: 'public' }).populate('creator', 'name');
    res.json(communities);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.joinCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ msg: 'Community not found' });
    }
    if (community.privacy === 'private') {
      if (!community.pendingRequests.includes(req.user.id)) {
        community.pendingRequests.push(req.user.id);
        await community.save();
        return res.json({ msg: 'Join request sent' });
      } else {
        return res.status(400).json({ msg: 'Join request already sent' });
      }
    } else {
      if (!community.members.includes(req.user.id)) {
        community.members.push(req.user.id);
        await community.save();
        return res.json({ msg: 'Joined community' });
      } else {
        return res.status(400).json({ msg: 'Already a member' });
      }
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.approveJoinRequest = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ msg: 'Community not found' });
    }
    if (community.creator.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    const index = community.pendingRequests.indexOf(req.params.userId);
    if (index > -1) {
      community.pendingRequests.splice(index, 1);
      community.members.push(req.params.userId);
      await community.save();
      
      // Actualizar el documento del usuario
      await User.findByIdAndUpdate(req.params.userId, { $push: { community: community._id } });
      
      res.json({ msg: 'Request approved' });
    } else {
      res.status(400).json({ msg: 'No pending request for this user' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};


exports.assignModerator = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const community = await Community.findById(id);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // Check if the requester is the creator of the community
    if (community.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the community creator can assign moderators' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the user is a member of the community
    if (!community.members.includes(userId)) {
      return res.status(400).json({ message: 'User must be a member of the community to be assigned as moderator' });
    }

    // Check if the user is already a moderator
    if (community.moderators.includes(userId)) {
      return res.status(400).json({ message: 'User is already a moderator of this community' });
    }

    // Assign the user as a moderator
    community.moderators.push(userId);
    await community.save();

    res.status(200).json({ message: 'Moderator assigned successfully', community });
  } catch (error) {
    res.status(500).json({ message: 'Error assigning moderator', error: error.message });
  }
};



exports.updateCommunity = async (req, res) => {
  try {
    let community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ msg: 'Community not found' });
    
    // Verificar si el usuario es el creador de la comunidad
    if (community.creator.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    const { name, description, privacy } = req.body;
    community = await Community.findByIdAndUpdate(
      req.params.id,
      { name, description, privacy },
      { new: true }
    );

    res.json(community);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.deleteCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ msg: 'Community not found' });
    
    // Verificar si el usuario es el creador de la comunidad
    if (community.creator.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await Community.deleteOne({ _id: req.params.id });
    res.json({ msg: 'Community removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};