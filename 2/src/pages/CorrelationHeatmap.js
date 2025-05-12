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
    Grid,
    Tooltip
} from '@mui/material';

// Uncomment the following line to use the stock data from the server
const AVAILABLE_STOCKS = {
    'AMD': 'Advanced Micro Devices, Inc.',
    'GOOGL': 'Alphabet Inc. Class A',
    'GOOG': 'Alphabet Inc. Class C',
    // 'AMZN': 'Amazon.com, Inc.',
    // 'AMGN': 'Amgen Inc.',
    // 'AAPL': 'Apple Inc.',
    // 'BRKB': 'Berkshire Hathaway Inc.',
    // 'BKNG': 'Booking Holdings Inc.',
    // 'AVGO': 'Broadcom Inc.',
    // 'CSX': 'CSX Corporation',
    // 'LLY': 'Eli Lilly and Company',
    // 'MAR': 'Marriott International, Inc.',
    // 'MRVL': 'Marvell Technology, Inc.',
    // 'META': 'Meta Platforms, Inc.',
    // 'MSFT': 'Microsoft Corporation',
    // 'NVDA': 'Nvidia Corporation',
    // 'PYPL': 'PayPal Holdings, Inc.',
    // '2330TW': 'TSMC',
    // 'TSLA': 'Tesla, Inc.',
    // 'V': 'Visa Inc.'
};

const TIME_INTERVALS = [10, 30, 50, 70, 90];

const getCorrelationColor = (correlation) => {
    if (correlation === null) return '#FFFFFF';

    // Strong negative correlation (dark red to light red)
    if (correlation < -0.5) return '#8B0000';
    if (correlation < -0.3) return '#FF4500';
    if (correlation < -0.1) return '#FF6347';

    // Weak or no correlation (white or light colors)
    if (correlation >= -0.1 && correlation <= 0.1) return '#FFFFFF';

    // Strong positive correlation (light green to dark green)
    if (correlation <= 0.3) return '#90EE90';
    if (correlation <= 0.5) return '#3CB371';
    return '#006400';
};

function CorrelationHeatmap() {
    const [selectedMinutes, setSelectedMinutes] = useState(50);
    const [correlationMatrix, setCorrelationMatrix] = useState(null);
    const [stockDetails, setStockDetails] = useState({});
    const [loading, setLoading] = useState(false);
    const [hoveredStock, setHoveredStock] = useState(null);

    const stockTickers = Object.keys(AVAILABLE_STOCKS);

    useEffect(() => {
        async function fetchCorrelations() {
            setLoading(true);
            try {
                const matrix = {};
                const details = {};

                for (let i = 0; i < stockTickers.length; i++) {
                    for (let j = i + 1; j < stockTickers.length; j++) {
                        const ticker1 = stockTickers[i];
                        const ticker2 = stockTickers[j];

                        const response = await axios.get(
                            `http://localhost:5000/stockcorrelation?minutes=${selectedMinutes}&ticker=${ticker1}&ticker=${ticker2}`
                        );

                        const correlation = response.data.correlation;

                        if (!matrix[ticker1]) matrix[ticker1] = {};
                        if (!matrix[ticker2]) matrix[ticker2] = {};
                        matrix[ticker1][ticker2] = correlation;
                        matrix[ticker2][ticker1] = correlation;

                        details[ticker1] = {
                            averagePrice: response.data.stocks[ticker1].averagePrice,
                            priceHistory: response.data.stocks[ticker1].priceHistory
                        };
                        details[ticker2] = {
                            averagePrice: response.data.stocks[ticker2].averagePrice,
                            priceHistory: response.data.stocks[ticker2].priceHistory
                        };
                    }
                }

                setCorrelationMatrix(matrix);
                setStockDetails(details);
            } catch (error) {
                console.error('Error fetching correlations:', error);
            }
            setLoading(false);
        }

        fetchCorrelations();
    }, [selectedMinutes]);

    const handleMinutesChange = (event) => {
        setSelectedMinutes(event.target.value);
    };

    const calculateStdDev = (priceHistory) => {
        if (!priceHistory || priceHistory.length === 0) return 0;

        const mean = priceHistory.reduce((sum, entry) => sum + entry.price, 0) / priceHistory.length;
        const variance = priceHistory.reduce((sum, entry) => sum + Math.pow(entry.price - mean, 2), 0) / priceHistory.length;
        return Math.sqrt(variance);
    };

    return (
        <Box sx={{ width: '100%', typography: 'body1' }}>
            <Typography variant="h4" gutterBottom>
                Stock Price Correlation Heatmap
            </Typography>

            <Grid container spacing={2} sx={{ marginBottom: 2 }}>
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
                <Typography>Loading correlation data...</Typography>
            ) : correlationMatrix ? (
                <Card>
                    <CardContent>
                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(${stockTickers.length + 1}, 1fr)`,
                            gap: 1
                        }}>
                            <Box />

                            {stockTickers.map(ticker => (
                                <Box
                                    key={ticker}
                                    sx={{
                                        textAlign: 'center',
                                        fontWeight: 'bold',
                                        backgroundColor: hoveredStock === ticker ? '#f0f0f0' : 'transparent'
                                    }}
                                    onMouseEnter={() => setHoveredStock(ticker)}
                                    onMouseLeave={() => setHoveredStock(null)}
                                >
                                    {ticker}
                                </Box>
                            ))}

                            {stockTickers.map(rowTicker => (
                                <React.Fragment key={rowTicker}>
                                    <Box
                                        sx={{
                                            alignSelf: 'center',
                                            fontWeight: 'bold',
                                            backgroundColor: hoveredStock === rowTicker ? '#f0f0f0' : 'transparent'
                                        }}
                                        onMouseEnter={() => setHoveredStock(rowTicker)}
                                        onMouseLeave={() => setHoveredStock(null)}
                                    >
                                        {rowTicker}
                                    </Box>

                                    {stockTickers.map(colTicker => {
                                        const correlation = rowTicker === colTicker
                                            ? 1
                                            : (correlationMatrix[rowTicker]?.[colTicker] ?? null);

                                        return (
                                            <Tooltip
                                                key={colTicker}
                                                title={
                                                    rowTicker === colTicker
                                                        ? 'Same Stock'
                                                        : correlation !== null
                                                            ? `Correlation: ${correlation.toFixed(4)}`
                                                            : 'No correlation data'
                                                }
                                                placement="top"
                                            >
                                                <Box
                                                    sx={{
                                                        backgroundColor: getCorrelationColor(correlation),
                                                        height: '40px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        border: '1px solid #e0e0e0'
                                                    }}
                                                >
                                                    {rowTicker === colTicker
                                                        ? '1.0000'
                                                        : correlation !== null
                                                            ? correlation.toFixed(4)
                                                            : 'N/A'}
                                                </Box>
                                            </Tooltip>
                                        );
                                    })}
                                </React.Fragment>
                            ))}
                        </Box>
                    </CardContent>
                </Card>
            ) : (
                <Typography>No correlation data available</Typography>
            )}

            {hoveredStock && stockDetails[hoveredStock] && (
                <Card sx={{ marginTop: 2 }}>
                    <CardContent>
                        <Typography variant="h6">
                            {hoveredStock} - {AVAILABLE_STOCKS[hoveredStock]}
                        </Typography>
                        <Typography>
                            Average Price: ${stockDetails[hoveredStock].averagePrice.toFixed(2)}
                        </Typography>
                        <Typography>
                            Price Standard Deviation: ${calculateStdDev(stockDetails[hoveredStock].priceHistory).toFixed(2)}
                        </Typography>
                        <Typography>
                            Total Price Points: {stockDetails[hoveredStock].priceHistory.length}
                        </Typography>
                    </CardContent>
                </Card>
            )}
        </Box>
    );
}

export default CorrelationHeatmap;