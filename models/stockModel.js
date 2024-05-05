const tf = require('@tensorflow/tfjs'); require('@tensorflow/tfjs-node');
const csv = require('csv-parser')
const fs  = require('fs')

class StockModel {
    constructor() {
        this.model = null;
    }

    async loadStockData(filePath){
        const stockData = [];
        return new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                      .pipe(csv())
                      .on('data', (row) => {
                         stockData.push(row);
                      })
                      .on('end', () => {
                        console.log('Stock data loaded successfully')
                         resolve(stockData)
                      })
                      .on('error', (err) => {
                         reject(err);
                      })
        })
    }

    async trainModel(stockData) {
        // convert stockData to tensor
        const dates = stockData.map(row => new Date(row.Date).getTime());
        const prices = stockData.map(row => row.Close);
        const inputTensor = tf.tensor2d(dates, [dates.length,1]);
        const outputTensor = tf.tensor2d(prices, [prices.length,1]);

        // define and compile model
        this.model = tf.sequential();
        this.model.add(tf.layers.dense({ units : 1, inputShape: [1] }));
        this.model.compile({ loss: 'meanSquaredError', aptimizer: 'sgd' })

        // Train 
        await this.model.fit(inputTensor,outputTensor , {epoche: 100})

        console.log('Model trained successfully');
    }

    async predictStockPrice(date){
        if(!this.model){
            throw new Error('Model not trained yet');
        }

        const inputDate = new Date(date).getTime();
        const inputTensor = tf.tensor2d([inputDate], [1,1]);
        const predictedPriceTensor = this.model.predict(inputTensor);
        const predictedPrice = predictedPriceTensor.dataSync()[0]

        return predictedPrice;
    }
}

module.exports = StockModel;