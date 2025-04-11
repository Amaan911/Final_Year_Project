const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());

// ✅ Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "public")));  

// ✅ Stock API Route
app.get("/stock/:symbol", async (req, res) => {
    try {
        const { symbol } = req.params;
        const response = await axios.get(
            `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?region=IN&interval=1d&range=1y`
        );

        let stockData = response.data.chart.result[0];

        if (!stockData || !stockData.meta || !stockData.indicators.quote[0]) {
            return res.status(500).json({ error: "Invalid stock data" });
        }

        let meta = stockData.meta;
        let indicators = stockData.indicators.quote[0];

        let price = meta.regularMarketPrice || "N/A";
        let name = meta.longName || symbol;

        let highs = indicators.high?.filter((h) => h !== null && h !== undefined) || [];
        let lows = indicators.low?.filter((l) => l !== null && l !== undefined) || [];

        let fiftyTwoWeekHigh = highs.length ? Math.max(...highs) : "N/A";
        let fiftyTwoWeekLow = lows.length ? Math.min(...lows) : "N/A";

        res.json({ 
            symbol, 
            name, 
            currentPrice: price, 
            fiftyTwoWeekHigh, 
            fiftyTwoWeekLow, 
            timestamp: stockData.timestamp, 
            close: indicators.close 
        });
    } catch (error) {
        console.error("Error fetching stock data:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to fetch stock data" });
    }
});

// ✅ Start the server
app.listen(3000, () => console.log("Server running on http://localhost:3000"));
