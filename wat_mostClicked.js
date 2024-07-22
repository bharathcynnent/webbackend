// const MostClickedActions = require("../models/wat_mostClickedActions");
// const User = require("../models/wat_userModel");


// const mostClickedActions = async (req, res) => {
//     try {
//       const client = req.params.clientName
//       const users = await User.find({'userInfo.clientName': client});

//       if(users.length === 0){
//         return res.json({ message: `No data found for the client name: ${client}.` });
//     }
//       // Check if there is an existing document in the "mostviewedpage" collection
//       const existingMostViewedPage = await MostClickedActions.findOne();
  
//       // Function to calculate the most clicked screen
//       const getMostClickedButtons = (data) => {
//         const buttonCounts = {};
      
//         // Iterate through the data to calculate counts for each button
//         data.forEach(item => {
//           if (item.userEvents) {
//             item.userEvents.forEach(event => {
//               if (event.screens) {
//                 Object.values(event.screens).forEach(screen => {
//                   Object.entries(screen).forEach(([button, count]) => {
//                     if (!buttonCounts[button]) {
//                       buttonCounts[button] = 0;
//                     }
//                     buttonCounts[button] += count;
//                   });
//                 });
//               }
//             });
//           }
//         });
      
//         // Sort the buttons based on counts in descending order
//         const sortedButtons = Object.keys(buttonCounts).sort((a, b) => buttonCounts[b] - buttonCounts[a]);
      
//         // Create the result object
//         const mostClickedButtons = sortedButtons.map(button => ({ ButtonName: button, count: buttonCounts[button] }));
      
//         return { mostClickedButtons };
//       };
      
//       // Call the function to get the most clicked buttons
//       const result = getMostClickedButtons(users);
//       //console.log(result);
      
//       //If there is an existing document, update it; otherwise, create a new one
//       if (existingMostViewedPage) {
//         await MostClickedActions.updateOne({}, result);
//       } else {
//         const mostViewedPage = new MostClickedActions(result);
//         await mostViewedPage.save();
//       }
  
//       res.json(result.mostClickedButtons);
//     } catch (error) {
//       console.error('Error processing most viewed page data:', error);
//       res.status(500).json({ message: 'Internal Server Error' });
//     }
//   };

//   module.exports = {mostClickedActions}

const mongoose = require('mongoose');
const MostClickedActions = require("../models/wat_mostClickedActions");
const User = require("../models/wat_userModel");

// Function to calculate the most clicked buttons
const getMostClickedButtons = (data) => {
  const buttonCounts = {};

  data.forEach(item => {
    if (item.userEvents) {
      item.userEvents.forEach(event => {
        if (event.screens) {
          Object.values(event.screens).forEach(screen => {
            Object.entries(screen).forEach(([button, count]) => {
              if (!buttonCounts[button]) {
                buttonCounts[button] = 0;
              }
              buttonCounts[button] += count;
            });
          });
        }
      });
    }
  });

  const sortedButtons = Object.keys(buttonCounts).sort((a, b) => buttonCounts[b] - buttonCounts[a]);
  const mostClickedButtons = sortedButtons.map(button => ({ ButtonName: button, count: buttonCounts[button] }));

  return { mostClickedButtons };
};

// Function to handle updating the MostClickedActions collection
const updateMostClickedActions = async () => {
  try {
    const users = await User.find();
    const result = getMostClickedButtons(users);

    const existingMostViewedPage = await MostClickedActions.findOne();
    if (existingMostViewedPage) {
      await MostClickedActions.updateOne({}, result);
    } else {
      const mostViewedPage = new MostClickedActions(result);
      await mostViewedPage.save();
    }
  } catch (error) {
    console.error('Error updating most clicked actions:', error);
  }
};

// Set up change stream to listen for changes on the User collection
const userChangeStream = User.watch();

userChangeStream.on('change', async (change) => {
  console.log('Change detected in User collection:', change);
  await updateMostClickedActions();
});

// Express route to manually trigger update
const mostClickedActions = async (req, res) => {
  try {
    const client = req.params.clientName;
    const users = await User.find({'userInfo.clientName': client});

    if (users.length === 0) {
      return res.json({ message: `No data found for the client name: ${client}.` });
    }

    const result = getMostClickedButtons(users);

    const existingMostViewedPage = await MostClickedActions.findOne();
    if (existingMostViewedPage) {
      await MostClickedActions.updateOne({}, result);
    } else {
      const mostViewedPage = new MostClickedActions(result);
      await mostViewedPage.save();
    }

    res.json(result.mostClickedButtons);
  } catch (error) {
    console.error('Error processing most viewed page data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = { mostClickedActions };
