const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  name: String,
  description: String,
  imageUrl: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


module.exports = mongoose.model('Image', imageSchema);
