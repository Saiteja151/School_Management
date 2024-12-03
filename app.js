require('dotenv').config();

// Use the environment variables
const express = require('express');
const db = require('./db');

const app = express();
app.use(express.json());

const dbHost = process.env.DB_HOST;

app.get('/', (req, res) => {
  res.send(`Database Host: ${dbHost}`);
//   res.send('Database connection is working!');
});

app.post('/addSchool', (req, res) => {
    const { name, address, latitude, longitude } = req.body;

    // Validate input
    if (!name || !address || !latitude || !longitude) {
        return res.status(400).send({ error: 'All fields are required.' });
    }

    // Insert into the database
    const query = 'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)';
    db.query(query, [name, address, latitude, longitude], (err, results) => {
        if (err) {
            console.error('Error inserting school:', err.message);
            return res.status(500).send({ error: 'Database error.' });
        }
        res.status(201).send({ message: 'School added successfully!', schoolId: results.insertId });
    });
});

// List Schools API
app.get('/listSchools', (req, res) => {
    const { latitude, longitude } = req.query;

    // Validate input
    if (!latitude || !longitude) {
        return res.status(400).send({ error: 'Latitude and longitude are required.' });
    }

    // Fetch schools from the database
    const query = 'SELECT id, name, address, latitude, longitude FROM schools';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching schools:', err.message);
            return res.status(500).send({ error: 'Database error.' });
        }

        // Calculate distances and sort by proximity
        const schools = results.map((school) => {
            const distance = Math.sqrt(
                Math.pow(school.latitude - latitude, 2) + Math.pow(school.longitude - longitude, 2)
            );
            return { ...school, distance };
        });

        schools.sort((a, b) => a.distance - b.distance);

        res.send(schools);
    });
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});















// console.log('Node.js is working!');
// console.log('require is:', typeof require);
// console.log('Environment Variable:', process.env.DB_HOST);