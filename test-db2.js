const axios = require('axios');
async function run() {
    try {
        const res = await axios.get('http://localhost:3000/api/v1/market/assets');
        console.log("SUCCESS");
    } catch (e) {
        console.error(e.response ? e.response.data : e.message);
    }
}
run();
