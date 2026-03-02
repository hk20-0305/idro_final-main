const { MongoClient } = require('mongodb');

async function checkData() {
    const url = 'mongodb://localhost:27017';
    const client = new MongoClient(url);

    try {
        await client.connect();
        const db = client.db('idro_db');

        console.log("Checking NGOs Collection...");
        const ngos = await db.collection('ngos').find({}).toArray();
        console.log(`Found ${ngos.length} NGOs:`);
        ngos.forEach(n => console.log(`- ${n.ngoName} (ID: ${n.ngoId})`));

        console.log("\nChecking Agencies Collection...");
        const agencies = await db.collection('government_agencies').find({}).toArray();
        console.log(`Found ${agencies.length} Agencies:`);
        agencies.forEach(a => console.log(`- ${a.agencyName} (ID: ${a.agencyId})`));

    } catch (err) {
        console.error("Database Error:", err.message);
    } finally {
        await client.close();
    }
}

checkData();
