const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const app = require('./app');

if (!process.env.CONNECTION_STRING) {
    console.error("Error: CONNECTION_STRING environment variable is not set");
    process.exit(1);  // Exit the process with an error code
}

mongoose.connect(process.env.CONNECTION_STRING, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
})
.then(() => {
    console.log('Database Connection is successful');
})
.catch((err) => {
    console.log(err);
});

// Start the server
app.listen(4000, () => {
    console.log('server is running http://localhost:4000');
});
