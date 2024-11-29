const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const protectedRoutes = require("./routes/protected");
const cors = require("cors");

dotenv.config();

const app = express();

// const corsOptions = {
//     origin: 'http://localhost:3001', // Allow only this origin
//     methods: 'GET,POST,PUT,DELETE', // Allowed HTTP methods
//     allowedHeaders: 'Content-Type,Authorization', // Allowed headers
//   };
// Enable CORS

app.use(cors());

app.use(bodyParser.json());

app.use("/auth", authRoutes);
// Protected routes
app.use("/protected", protectedRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
