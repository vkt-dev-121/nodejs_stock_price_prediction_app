const express = require('express');
const StockPresentor = require('./presentors/stockPresentor')
const path = require('path');

const app = express();
const PORT = 3000;
const stockPresentor = new StockPresentor();

// load stock data and train model
stockPresentor.loadDataAndTrainModel('./stocks_data.csv');

// serve statuic files
app.use(express.static(path.join(__dirname, 'public')));

app.get('/predict', async (req,res) => {
    const date = req.query.date;
    const predictedPrice = await stockPresentor.predictStockPrice(date);
    res.json({date, predictedPrice})
})

app.listen(PORT, () => {
    console.log('Server is running')
})