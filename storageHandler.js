const MostClickedActions = require("../models/wat_mostClickedActions");

const storeMostClickedButtons = async (result) => {
  try {
    // Check if there is an existing document in the "mostviewedpage" collection
    const existingMostViewedPage = await MostClickedActions.findOne();

    // If there is an existing document, update it; otherwise, create a new one
    if (existingMostViewedPage) {
      await MostClickedActions.updateOne({}, result);
    } else {
      const mostViewedPage = new MostClickedActions(result);
      await mostViewedPage.save();
    }
  } catch (error) {
    console.error('Error storing most clicked buttons data:', error);
    throw new Error('Error storing data');
  }
};

module.exports = { storeMostClickedButtons };
