const express = require('express')
const bodyParser = require('body-parser');
const { dbConnection } = require('./server');
const cors = require('cors');
const http = require('http');
const { updateData, user, getUsersData } = require('./controllers/wat_updateController');
const {mostviewedpage } = require('./controllers/wat_mostViewed');
const { mostClickedActions } = require('./controllers/wat_mostClicked');
const { mapData, getAllMapData, usersByCountry } = require('./controllers/wat_mapDataController');
const { saveDeviceData, getAllUserDeviceData, mostUsedDevices } = require('./controllers/wat_deviceDataController');
const { clientData, getUsersByClientName } = require('./controllers/wat_dashboardController');
const { getUserEvents, dateFilter, getweeklyData, getmonthlyData } = require('./controllers/wat_dateController');
const { createQuestions, getQuestions } = require('./controllers/botControllers/bot_questionsController');
const { createOffers, getOffers } = require('./controllers/botControllers/bot_offersController');
const { createAnimations, getAnimations } = require('./controllers/botControllers/bot_animationsController');
const { submitData, getSubmittedData } = require('./controllers/botControllers/bot_submitDataController');
const {MostViewedBrowsers} = require('./controllers/wat_mostbroswer')
const DeviceData = require('./models/wat_deviceData')
const MostClickedActions = require('./models/wat_mostClickedActions')
const MapData = require('./models/wat_mapData')
const BrowserCount = require('./models/wat_mostviewedbrowser')
const mostViewedPages = require('./models/wat_mostViewedPages')
const User = require('./models/wat_userModel')
const WebSocket = require('ws');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const port = 5000;

//Middleware
app.use(bodyParser.json());
app.use(cors()); 

//Database connection
dbConnection()

//main api 
app.post('/config', user) 
app.post('/updateUserEvents/:userId', updateData)  
app.get('/getUsersData', getUsersData)

//admin page charts data collection api
//app.get('/screenCount', screenCounts);
app.get('/mostViewedPage/:clientName', mostviewedpage);
app.get('/mostUsedBrowsers/:clientName', MostViewedBrowsers)
app.get('/mostClickedActions/:clientName', mostClickedActions)
app.get('/mostUsedDevices/:clientName', mostUsedDevices)
app.get('/usersByCountry/:clientName', usersByCountry)

//new development
app.post('/saveMapData',mapData)
app.get('/getAllMapData/:clientName', getAllMapData)

app.post('/saveDeviceData',saveDeviceData)
app.get('/getAllDeviceData/:clientName', getAllUserDeviceData)
  
app.get('/getAllClients',clientData);
app.get('/getUsersByClientName/:clientName', getUsersByClientName)

//date  
app.get('/getDates/:userId', dateFilter)
app.get('/getUserEvents/:userId/:date', getUserEvents)
app.get('/getWeeklyData/:userId', getweeklyData)
app.get('/getMonthlyData/:userId', getmonthlyData)

//Chat-Bot
app.post('/chatBot/questions/:clientName', createQuestions);
app.post('/chatBot/offers/:clientName',createOffers);
app.post('/chatBot/animations/:clientName',createAnimations);
app.post('/chatBot/submitData/:clientName',submitData);

app.get('/chatBot/getoffers/:clientName', getOffers);
app.get('/chatBot/getQuestions/:clientName', getQuestions);
app.get('/chatBot/getAnimations/:clientName', getAnimations);
app.post('/chatBot/getBotData',getSubmittedData);



// Setup change stream
const changeStream0 = DeviceData.watch();
const changeStream1 = MostClickedActions.watch();
const changeStream2 = MapData.watch();
const changeStream3 = mostViewedPages.watch();
const changeStream4 = BrowserCount.watch();
const changeStream5 = User.watch();


const sendChange = (change, collectionName) => {
  const selectedClient = change.fullDocument?.clientName || null; 
  const message = { collection: collectionName, change, selectedClient };
  console.log('Change detected:', message);
  wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(message));
      }
  });
};

changeStream0.on('change', (change) => {
    sendChange(change, 'devicedatas');
});

changeStream1.on('change', (change) => {
    sendChange(change, 'mostclickedactions');
});

changeStream2.on('change', (change) => {
    sendChange(change, 'mapdatas');
});

changeStream3.on('change', (change) => {
    sendChange(change, 'mostviewedpages');
});

changeStream4.on('change', (change) => {
    sendChange(change, 'browsercounts');
});

changeStream5.on('change', (change) => {
    if (change.operationType === 'insert') {
      sendChange(change, 'browsercounts'); 
    }
  });

// Setup WebSocket connection
wss.on('connection', (ws) => {
    console.log('Client connected');
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

app.listen(port, () => {
  console.log(`Server is running on localhost:${port}`);
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});