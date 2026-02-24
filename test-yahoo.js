const { YahooFinance } = require('yahoo-finance2');
const yahooFinance = new YahooFinance();

async function test() {
    try {
        const quote = await yahooFinance.quote('AAPL');
        console.log("Success", quote.regularMarketPrice);
    } catch (e) {
        console.log("ERROR MESSAGE:", e.message);
    }
}
test();
