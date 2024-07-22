const mongoose = require('mongoose');

const BrowserCountSchema = new mongoose.Schema({
  clientName: String,
  browserName: String,
  count: Number
}, { timestamps: true });

const BrowserCount = mongoose.model('BrowserCount', BrowserCountSchema);
module.exports = BrowserCount; 
