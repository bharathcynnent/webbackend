// const MostViewedPage = require("../models/wat_mostViewedPages");
// const User = require("../models/wat_userModel");

// const  screenCount=  async (req, res) => {
//     const users = await User.find();
   
// // Function to process and store N number of data
// async function processAndStoreData(dataArray) {
//     for (const item of dataArray) {
//       const processedData = {
//         userId: item._id,
//         screens: {}
//       };
  
//       item.userEvents.forEach((event) => {
//         Object.entries(event.screens).forEach(([screen, counts]) => {
//           Object.entries(counts).forEach(([btn, count]) => {
//             processedData.screens[screen] = (processedData.screens[screen] || 0) + count;
//           });
//         });
//       });
  
//       console.log("Processed Data:", processedData);
  
//       // Store the processed data in the database (you can customize this part)
//       await storeDataInDatabase(processedData);
//     }
//   }
      
// // Function to store data in the database
//     async function storeDataInDatabase(processedData) {
//     // Your database connection and insertion code here
//     console.log(`Storing data in the database for userId: ${processedData.userId}`);
//   }   
// // Call the function to process and store data
//     processAndStoreData(users);
      
// };


// const mostViewedPage = async (req, res) => {
//   try {
//     const client = req.params.clientName;
//     const users = await User.find({ 'userInfo.clientName': client });
//     if (users.length === 0) {
//       return res.json({ message: `No data found for the client name: ${client}.` });
//     }

//     const getMostClickedScreen = (data) => {
//       const screenCounts = {};
//       let totalCount = 0;

//       // Calculate total count and counts for each screen
//       data.forEach(item => {
//         if (item.userEvents) {
//           item.userEvents.forEach(event => {
//             if (event.screens) {
//               Object.entries(event.screens).forEach(([screen, counts]) => {
//                 if (!screenCounts[screen]) {
//                   screenCounts[screen] = 0;
//                 }
//                 Object.values(counts).forEach(count => {
//                   screenCounts[screen] += count;
//                   totalCount += count;
//                 });
//               });
//             }
//           });
//         }
//       });

//       // Calculate percentages for each screen
//       const mostViewedPages = Object.keys(screenCounts).map(screen => ({
//         pageName: screen,
//         percentage: ((screenCounts[screen] / totalCount) * 100).toFixed(2)

//         //percentage: Math.round((screenCounts[screen] / totalCount) * 100) -- Calculate percentage and round to the nearest integer
//         // percentage: ((screenCounts[screen] / totalCount) * 100).toFixed(2) --- Calculate percentage and round to 2 decimal places
//       }));

//       // Sort the screens based on counts in descending order
//       mostViewedPages.sort((a, b) => b.percentage - a.percentage);

//       return { mostViewedPages };
//     };

//     const result = getMostClickedScreen(users);
//     res.json(result.mostViewedPages);
//   } catch (error) {
//     console.error('Error processing most viewed page data:', error);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// };

// module.exports = {screenCount, mostViewedPage}


const mongoose = require('mongoose');
const MostViewedPage = require("../models/wat_mostViewedPages");
const User = require("../models/wat_userModel");

// Function to calculate the most viewed pages
const getMostViewedPages = (data) => {
  const screenCounts = {};
  let totalCount = 0;

  data.forEach(item => {
    if (item.userEvents) {
      item.userEvents.forEach(event => {
        if (event.screens) {
          Object.entries(event.screens).forEach(([screen, counts]) => {
            if (!screenCounts[screen]) {
              screenCounts[screen] = 0;
            }
            Object.values(counts).forEach(count => {
              screenCounts[screen] += count;
              totalCount += count;
            });
          });
        }
      });
    }
  });

  const mostViewedPages = Object.keys(screenCounts).map(screen => ({
    pageName: screen,
    percentage: ((screenCounts[screen] / totalCount) * 100).toFixed(2)
  }));

  mostViewedPages.sort((a, b) => b.percentage - a.percentage);

  return { mostViewedPages };
};

// Function to handle updating the MostViewedPage collection
const updateMostViewedPages = async () => {
  try {
    const users = await User.find();
    const result = getMostViewedPages(users);

    const existingMostViewedPage = await MostViewedPage.findOne();
    if (existingMostViewedPage) {
      await MostViewedPage.updateOne({}, result);
    } else {
      const  mostviewedpage = new MostViewedPage(result);
      await  mostviewedpage.save();
    }
  } catch (error) {
    console.error('Error updating most viewed pages:', error);
  }
};

// Set up change stream to listen for changes on the User collection
const userChangeStream = User.watch();

userChangeStream.on('change', async (change) => {
  console.log('Change detected in User collection:', change);
  await updateMostViewedPages();
});

// Express route to manually trigger update
const mostviewedpage = async (req, res) => {
  try {
    const client = req.params.clientName;
    const users = await User.find({'userInfo.clientName': client});

    if (users.length === 0) {
      return res.json({ message: `No data found for the client name: ${client}.` });
    }

    const result = getMostViewedPages(users);

    const existingMostViewedPage = await MostViewedPage.findOne();
    if (existingMostViewedPage) {
      await MostViewedPage.updateOne({}, result);
    } else {
      const  mostviewedpage = new MostViewedPage(result);
      await  mostviewedpage.save();
    }

    res.json(result.mostViewedPages);
  } catch (error) {
    console.error('Error processing most viewed page data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = { mostviewedpage };



