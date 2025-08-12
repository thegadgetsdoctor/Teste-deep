const Visit = require('../models/Visit');

exports.createVisit = async (req, res) => {
  const { name, document } = req.body;
  try {
    const visit = new Visit({ name, document, createdBy: req.user.id });
    await visit.save();
    res.status(201).json(visit);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getVisits = async (req, res) => {
  try {
    const visits = await Visit.find().populate('createdBy', 'username');
    res.json(visits);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.exitVisit = async (req, res) => {
  try {
    const visit = await Visit.findById(req.params.id);
    if (!visit) return res.status(404).json({ msg: 'Visit not found' });
    visit.exitTime = new Date();
    await visit.save();
    res.json(visit);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};
