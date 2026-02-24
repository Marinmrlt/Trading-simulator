const axios = require('axios');

async function test() {
    try {
        const res = await axios.post('http://localhost:3000/api/v1/backtest/run', {
            symbol: "AAPL", timeframe: "1d", initialCapital: 10000, strategy: "SMA_CROSS", limit: 100,
            parameters: { shortPeriod: 10, longPeriod: 50 }
        });
        console.log("SUCCESS! Trades evaluated:", res.data.data.trades.length);
        console.log("Final Equity:", res.data.data.metrics.finalEquity);
    } catch (e) {
        console.error("ERROR:", e.response ? e.response.data : e.message);
    }
}
test();
