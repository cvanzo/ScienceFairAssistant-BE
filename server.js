require('dotenv').config();
const app = require('./app');

// Define the port the server will run on
const PORT = process.env.PORT || 3333;

// Start the server and listen on the defined port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
