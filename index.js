const express = require('express');
const axios = require('axios');
const cors = require("cors")
// const { log } = require('console');
const app = express();
require('dotenv').config();
// const port = 3300;
const port = process.env.PORT || 3300;
// app.use(cors)
app.use(cors());
app.use(loger)

app.get('/',(req,res)=>{
    console.log("fucc");
    res.send("Index")
})

const userRouter = require("./routes/users")

app.use('/users',userRouter)
app.use('/pay',userRouter)


function loger(req,res,next){
    console.log(req.originalUrl);
    next()
}
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
