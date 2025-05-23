import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box,
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Card,
    CardContent,
    Grid
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AVAILABLE_STOCKS = {
    'AMD': 'Advanced Micro Devices, Inc.',
    'GOOGL': 'Alphabet Inc. Class A',
    'GOOG': 'Alphabet Inc. Class C',
    'AMZN': 'Amazon.com, Inc.',
    'AMGN': 'Amgen Inc.',
    'AAPL': 'Apple Inc.',
    'BRKB': 'Berkshire Hathaway Inc.',
    'BKNG': 'Booking Holdings Inc.',
    'AVGO': 'Broadcom Inc.',
    'CSX': 'CSX Corporation',
    'LLY': 'Eli Lilly and Company',
    'MAR': 'Marriott International, Inc.',
    'MRVL': 'Marvell Technology, Inc.',
    'META': 'Meta Platforms, Inc.',
    'MSFT': 'Microsoft Corporation',
    'NVDA': 'Nvidia Corporation',
    'PYPL': 'PayPal Holdings, Inc.',
    '2330TW': 'TSMC',
    'TSLA': 'Tesla, Inc.',
    'V': 'Visa Inc.'
};

const values = Object.values(AVAILABLE_STOCKS)

const TIME_INTERVALS = [10, 30, 50, 70, 90];

function StockPage() {
    const [selectedStock, setSelectedStock] = useState('NVDA');
    const [selectedMinutes, setSelectedMinutes] = useState(50);
    const [stockData, setStockData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchStockData() {
            setLoading(true);
            try {
                const response = await axios.get(`http://localhost:5000/stocks/${selectedStock}?minutes=${selectedMinutes}`);
                // Preprocess data for chart (add index for x-axis)
                const processedData = response.data.priceHistory.map((entry, index) => ({
                    ...entry,
                    index: index + 1,
                    formattedTime: new Date(entry.lastUpdatedAt).toLocaleTimeString()
                }));

                setStockData({
                    ...response.data,
                    processedData
                });
            } catch (error) {
                console.error('Error fetching stock data:', error);
            }
            setLoading(false);
        }

        fetchStockData();
    }, [selectedStock, selectedMinutes]);

    const handleStockChange = (event) => {
        setSelectedStock(event.target.value);
    };

    const handleMinutesChange = (event) => {
        setSelectedMinutes(event.target.value);
    };

    return (
        <Box sx={{ width: '100%', typography: 'body1' }}>
            <Typography variant="h4" gutterBottom>
                Stock Price Analysis
            </Typography>

            <Grid container spacing={2} sx={{ marginBottom: 2 }}>
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                        <InputLabel>Stock</InputLabel>
                        <Select
                            value={selectedStock}
                            label="Stock"
                            onChange={handleStockChange}
                        >
                            {Object.entries(AVAILABLE_STOCKS).map(([ticker, name]) => (
                                <MenuItem key={ticker} value={ticker}>
                                    {ticker} - {name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                        <InputLabel>Time Interval (Minutes)</InputLabel>
                        <Select
                            value={selectedMinutes}
                            label="Time Interval (Minutes)"
                            onChange={handleMinutesChange}
                        >
                            {TIME_INTERVALS.map((minutes) => (
                                <MenuItem key={minutes} value={minutes}>
                                    {minutes} Minutes
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>

            {loading ? (
                <Typography>Loading stock data...</Typography>
            ) : stockData ? (
                <Grid container spacing={2}>
                    <Grid item xs={12} md={8}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">
                                    {AVAILABLE_STOCKS[selectedStock]} Stock Price Chart
                                </Typography>
                                <ResponsiveContainer width="100%" height={400}>
                                    <LineChart data={stockData.processedData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="formattedTime"
                                            label={{ value: 'Time', position: 'insideBottom', offset: -5 }}
                                        />
                                        <YAxis
                                            label={{
                                                value: 'Stock Price',
                                                angle: -90,
                                                position: 'insideLeft'
                                            }}
                                        />
                                        <Tooltip
                                            labelFormatter={(label) => `Time: ${label}`}
                                            formatter={(value, name, props) => [
                                                `${value.toFixed(2)}`,
                                                name === 'price' ? 'Stock Price' : name
                                            ]}
                                        />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="price"
                                            stroke="#8884d8"
                                            activeDot={{ r: 8 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">Stock Details</Typography>
                                <Typography>
                                    Average Price: ${stockData.averageStockPrice.toFixed(2)}
                                </Typography>
                                <Typography>
                                    Total Price Points: {stockData.priceHistory.length}
                                </Typography>
                                <Typography>
                                    Lowest Price: ${Math.min(...stockData.priceHistory.map(p => p.price)).toFixed(2)}
                                </Typography>
                                <Typography>
                                    Highest Price: ${Math.max(...stockData.priceHistory.map(p => p.price)).toFixed(2)}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            ) : (
                <Typography>No stock data available</Typography>
            )}
        </Box>
    );
}

export default StockPage;