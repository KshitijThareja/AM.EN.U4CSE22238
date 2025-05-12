# Afford Medical (Full-Stack Test)

## Overview
This is a full-stack web application for analyzing stock prices and their correlations. The backend is built with Node.js and Express, providing APIs to fetch stock price data and calculate correlations between stock pairs. The frontend is a React application using Material-UI for styling, Recharts for stock price charts, and a custom grid-based heatmap for visualizing stock correlations.

## Project Structure
```
AM.EN.U4CSE22238/
├── 1/
│   ├── index.js              # Express server with stock price and correlation APIs
│   ├── package.json          # Backend dependencies and scripts
│   └── .env                 # Environment variables (not included in repo)
├── 2/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── StockPage.js        # Component for stock price analysis
│   │   │   └── CorrelationHeatmap.js # Component for correlation heatmap
│   │   ├── App.js                  # Main app with routing
│   │   ├── index.js                # React entry point
│   │   └── index.css               # Global styles
│   ├── package.json                # Frontend dependencies and scripts
│   └── public/
└── README.md                       # This file
```

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd <repo-folder>
```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd 1
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `1/` directory with the following variables:
   ```env
   EMAIL=your-email
   NAME=your-name
   ROLL_NO=your-roll-number
   ACCESS_CODE=your-access-code
   CLIENT_ID=your-client-id
   CLIENT_SECRET=your-client-secret
   ```
   Replace the placeholders with your credentials for the evaluation service API.
4. Start the backend server:
   ```bash
   npm start
   ```
   The server will run on `http://localhost:5000`.

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd 2
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the React development server:
   ```bash
   npm start
   ```
   The frontend will run on `http://localhost:3000`.


## API Details
The backend provides two main API endpoints:

### 1. Average Stock Price
- **Method**: GET
- **URL**: `http://localhost:5000/stocks/{TICKER}`
- **Query Parameters**:
  - `minutes`: Time interval (optional, default: 50)
- **Example**:
  ```
  GET http://localhost:5000/stocks/AMD?minutes=30
  ```
- **Response**:
  ```json
  {
    "averageStockPrice": 453.569744,
    "priceHistory": [
      {
        "price": 231.95296,
        "lastUpdatedAt": "2025-05-08T04:26:27.4658491Z"
      },
      ...
    ]
  }
  ```

### 2. Stock Price Correlation
- **Method**: GET
- **URL**: `http://localhost:5000/stockcorrelation`
- **Query Parameters**:
  - `minutes`: Time interval (optional, default: 50)
  - `ticker`: Two stock tickers (required, e.g., `ticker=AMD&ticker=GOOGL`)
- **Example**:
  ```
  GET http://localhost:5000/stockcorrelation?minutes=50&ticker=AMD&ticker=GOOGL
  ```
- **Response**:
  ```json
  {
    "correlation": -0.9367,
    "stocks": {
      "AMD": {
        "averagePrice": 204.000025,
        "priceHistory": [
          {
            "price": 231.95296,
            "lastUpdatedAt": "2025-05-08T04:26:27.4658491Z"
          },
          ...
        ]
      },
      "GOOGL": {
        "averagePrice": 458.606756,
        "priceHistory": [
          {
            "price": 680.59766,
            "lastUpdatedAt": "2025-05-09T02:04:27.464908465Z"
          },
          ...
        ]
      }
    }
  }
  ```

*Note*: The full list of stocks (commented out in `CorrelationHeatmap.js`) can be enabled by uncommenting the `AVAILABLE_STOCKS` object.

## Technologies Used
- **Backend**:
  - Node.js
  - Express
  - Axios
  - dotenv
- **Frontend**:
  - React
  - Material-UI
  - Recharts
  - Axios
  - React Router
