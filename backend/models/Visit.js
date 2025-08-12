const mongoose = require('mongoose');

const VisitSchema = new mongoose.Schema({
  name: { type: String, required: true },
  document: { type: String, required: true },
  entryTime: { type: Date, default: Date.now },
  exitTime: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

module.exports = mongoose.model('Visit', VisitSchema);
