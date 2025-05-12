const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Authorization headers 
const AUTH_CONFIG = {
    email: process.env.EMAIL,
    name: process.env.NAME,
    rollNo: process.env.ROLL_NO,
    accessCode: process.env.ACCESS_CODE,
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
};

const BASE_URL = 'http://20.244.56.144/evaluation-service';

let accessToken = null;
let expiresIn = null;

async function token_valid() {
    if (accessToken && expiresIn && Date.now() < expiresIn) {
        return accessToken;
    }

    try {
        const response = await axios.post(`${BASE_URL}/auth`, AUTH_CONFIG, {
            timeout: 10000
        });
        accessToken = response.data.access_token;

        expiresIn = Date.now() + (response.data.expires_in * 1000) - (5 * 60 * 1000); // Keeping some buffer time

        return accessToken;
    } catch (error) {
        console.error('Authentication failed with error:', error);
        throw new Error('Error obtaining authentication token');
    }
}

async function fetchPrices(ticker, minutes) {
    const token = await token_valid();

    try {
        const response = await axios.get(
            `${BASE_URL}/stocks/${ticker}?minutes=${minutes}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                timeout: 10000
            }
        );
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            accessToken = null;
            tokenExpiration = null;

            try {
                const token = await getValidToken();
                const response = await axios.get(
                    `${BASE_URL}/stocks/${ticker}?minutes=${minutes}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        },
                        timeout: 10000
                    }
                );
                return response.data;
            } catch (retryError) {
                console.error(`Error fetching stock prices for ${ticker} after retry:`, retryError);
                throw retryError;
            }
        }

        console.error(`Error fetching stock prices for ${ticker}:`, error);
        throw error;
    }
}

function avgPrice(priceHistory) {
    if (!priceHistory || priceHistory.length === 0) return 0;

    const total = priceHistory.reduce((sum, entry) => sum + entry.price, 0);
    return total / priceHistory.length;
}

function findCorr(stockA, stockB) {
    const minLength = Math.min(stockA.length, stockB.length);
    const reducedA = stockA.slice(0, minLength);
    const reducedB = stockB.slice(0, minLength); // Ensures both stocks have the same length for finding correlation

    const meanA = reducedA.reduce((sum, entry) => sum + entry.price, 0) / minLength;
    const meanB = reducedB.reduce((sum, entry) => sum + entry.price, 0) / minLength;

    let cov = 0;
    let varA = 0;
    let varB = 0;

    for (let i = 0; i < minLength; i++) {
        const devA = reducedA[i].price - meanA;
        const devB = reducedB[i].price - meanB;
        cov += devA * devB;
        varA += devA * devA;
        varB += devB * devB;
    }

    cov /= (minLength - 1);
    varA /= (minLength - 1);
    varB /= (minLength - 1);
    const stdA = Math.sqrt(varA);
    const stdB = Math.sqrt(varB);

    return cov / (stdA * stdB);
}

// API-1: Average stock price in the last 'm' minutes
app.get('/stocks/:ticker', async (req, res) => {
    try {
        const { ticker } = req.params;
        const minutes = parseInt(req.query.minutes) || 50;

        const priceHistoryResponse = await fetchPrices(ticker, minutes);

        const priceHistory = priceHistoryResponse;
        const averageStockPrice = avgPrice(priceHistory);

        res.json({
            averageStockPrice,
            priceHistory
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to retrieve stock prices',
            details: error.message
        });
    }
});

// API-2: Stock price correlation
app.get('/stockcorrelation', async (req, res) => {
    try {
        const { ticker } = req.query;
        const minutes = parseInt(req.query.minutes) || 50;

        if (!ticker || !Array.isArray(ticker) || ticker.length !== 2) {
            return res.status(400).json({ error: 'API requires 2 tickers for analysis' });
        }

        const stockAData = await fetchPrices(ticker[0], minutes);
        const stockBData = await fetchPrices(ticker[1], minutes);

        const correlation = findCorr(stockAData, stockBData);

        // Response format
        res.json({
            correlation,
            stocks: {
                [ticker[0]]: {
                    averagePrice: avgPrice(stockAData),
                    priceHistory: stockAData
                },
                [ticker[1]]: {
                    averagePrice: avgPrice(stockBData),
                    priceHistory: stockBData
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to calculate stock correlation',
            details: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Stock price API on port: ${PORT}`);
});

module.exports = app;