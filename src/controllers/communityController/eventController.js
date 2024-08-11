const Event = require('../../models/communityModel/Event');
const Community = require('../../models/communityModel/Community');
const User = require('../../models/User');

exports.createEvent = async (req, res) => {
  try {
    const community = await Community.findById(req.params.communityId);
    if (!community) {
      return res.status(404).json({ msg: 'Community not found' });
    }
    if (!community.members.includes(req.user.id)) {
      return res.status(401).json({ msg: 'Must be a community member to create events' });
    }
    const { title, description, date } = req.body;
    const newEvent = new Event({
      title,
      description,
      date,
      community: req.params.communityId,
      creator: req.user.id
    });
    const event = await newEvent.save();
    await User.findByIdAndUpdate(req.user.id, { $push: { events: newEvent._id } });
    res.json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getEvents = async (req, res) => {
  try {
    const community = await Community.findById(req.params.communityId);
    if (!community) {
      return res.status(404).json({ msg: 'Community not found' });
    }
    if (!community.members.includes(req.user.id) && community.privacy === 'private') {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    const events = await Event.find({ community: req.params.communityId }).populate('creator', 'name');
    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};