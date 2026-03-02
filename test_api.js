import axios from 'axios';

async function testApi() {
    try {
        console.log("Checking NGOs...");
        const ngos = await axios.get('http://localhost:8085/api/ngo/all');
        console.log("NGOs count:", ngos.data.length);
        console.log("NGO Sample:", JSON.stringify(ngos.data[0], null, 2));

        console.log("\nChecking Agencies...");
        const agencies = await axios.get('http://localhost:8085/api/government/all');
        console.log("Agencies count:", agencies.data.length);
        console.log("Agency Sample:", JSON.stringify(agencies.data[0], null, 2));
    } catch (err) {
        console.error("API Error:", err.message);
        if (err.response) {
            console.error("Status:", err.response.status);
            console.error("Data:", err.response.data);
        }
    }
}

testApi();
