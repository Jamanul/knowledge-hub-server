const express = require('express')
const app =express()
const cors =require('cors')
const port = process.env.port || 5000
//middleware
app.use(cors())
app.use(express.json())

app.get('/',async (req,res)=>{
    res.send('knowledge hub server')
})

app.listen(port,()=>{
    console.log('the  app is listening on port',port)
})