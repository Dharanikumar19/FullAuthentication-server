require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();

//middleware
app.use(express.json());
app.use(cors());
app.use(cookieParser());

//Routes
app.use('/user', require("./routes/userRouter"))

//connect to db
const URI = process.env.MONGODB_URL
mongoose.connect(URI, {
    useNewUrlParser : true,
    useUnifiedTopology : true
}, err => {
    if(err) throw err;
    console.log("database connected successfully")
})


app.use("/", (req,res,next) => {
    res.json({message : "Server is up and running"})
})

const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=> {console.log("Server is running on port", PORT)})
