// const BrowserCount = require('../models/wat_mostviewedbrowser'); 
// const User = require("../models/wat_userModel");

// const MostViewedBrowsers  =  async (req, res) => {
//   try {
//       const client = req.params.clientName
//       const users = await User.find({ 'userInfo.clientName': client });
//       if(users.length === 0){
//         return res.json({ message: `No data found for the client name: ${client}.` });
//     }
//       // Group users by browserName and count occurrences
//       const browserCounts = await User.aggregate([
//         { $match: { 'userInfo.clientName': client } },
//         { $group: { _id: '$userInfo.browserName', count: { $sum: 1 } } },
//         { $project: { _id: 0, browserName: '$_id', count: 1 } },
//         { $sort: { count: -1 } }
//       ]);
  
//       res.json(browserCounts);
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: 'Internal Server Error' });
//     }
// }
  
//   module.exports = {MostViewedBrowsers}
const BrowserCount = require('../models/wat_mostviewedbrowser'); 
const User = require("../models/wat_userModel");


const MostViewedBrowsers  =  async (req, res) => {
  try {
    const client = req.params.clientName;
    const users = await User.find({ 'userInfo.clientName': client });

    if (users.length === 0) {
      return res.json({ message: `No data found for the client name: ${client}.` });
    }

    // Group users by browserName and count occurrences
    const browserCounts = await User.aggregate([
      { $match: { 'userInfo.clientName': client } },
      { $group: { _id: '$userInfo.browserName', count: { $sum: 1 } } },
      { $project: { _id: 0, browserName: '$_id', count: 1 } },
      { $sort: { count: -1 } }
    ]);

    // Store the aggregation results in the new collection
    const browserCountDocs = browserCounts.map(browserCount => ({
      clientName: client,
      browserName: browserCount.browserName,
      count: browserCount.count
    }));

    await BrowserCount.insertMany(browserCountDocs);

    res.json(browserCounts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = { MostViewedBrowsers };

