import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Button } from '@mui/material';
import StockPage from './pages/StockPage';
import CorrelationHeatmap from './pages/CorrelationHeatmap';

function App() {
  return (
    <Router>
      <div>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" style={{ flexGrow: 1 }}>
              Stock Price Aggregation
            </Typography>
            <Button color="inherit" component={Link} to="/">
              Stock Page
            </Button>
            <Button color="inherit" component={Link} to="/correlation">
              Correlation Heatmap
            </Button>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" style={{ marginTop: '20px' }}>
          <Routes>
            <Route path="/" element={<StockPage />} />
            <Route path="/correlation" element={<CorrelationHeatmap />} />
          </Routes>
        </Container>
      </div>
    </Router>
  );
}

export default App;
