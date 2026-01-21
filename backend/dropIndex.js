// const mongoose = require('mongoose');
// require('dotenv').config();

// async function dropIndex() {
//     try {
//         // Connect to MongoDB
//         await mongoose.connect(process.env.MONGO_URL);
//         console.log('Connected to MongoDB');

//         // Get the database instance
//         const db = mongoose.connection.db;
        
//         // Drop the index
//         await db.collection('registeredusers').dropIndex('photo_1');
//         console.log('✅ Successfully dropped photo_1 index');
        
//         // List all indexes to verify (using the correct method)
//         const indexes = await db.collection('registeredusers').indexes();
//         console.log('📊 Current indexes:');
//         indexes.forEach(index => {
//             console.log(`- ${index.name}:`, index.key);
//         });
        
//     } catch (error) {
//         if (error.codeName === 'IndexNotFound') {
//             console.log('ℹ️  photo_1 index already removed or never existed');
//         } else {
//             console.log('❌ Error:', error.message);
//         }
//     } finally {
//         await mongoose.connection.close();
//         console.log('Connection closed');
//     }
// }

// dropIndex();