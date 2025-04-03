const express = require('express');
const cors = require('cors');
const bodyParser = require ('body-parser');
require('dotenv').config();


const userRoutes = require('./routes/users');
const transactionRoutes = require('./routes/transactions');
const categoryRoutes = require('./routes/categories');

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());


app.use('/api/users', userRoutes);

/*

app.use('/api/categories', categoryRoutes);
app.use('/api/transations', transactionRoutes);
*/

app.get('/', (req, res) => {
    res.send('Finance Tracker API is running');
})

app.listen(PORT, () => {
    console.log(`SERVER RUNNING ON PORT ${PORT}`);
})