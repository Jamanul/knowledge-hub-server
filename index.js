const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app =express()
const cors =require('cors')
require('dotenv').config()
const port = process.env.port || 5000
//middleware
app.use(cors({
  origin:['http://localhost:5174','http://localhost:5175'],
  credentials:true
}))
app.use(express.json())

app.get('/',async (req,res)=>{
    res.send('knowledge hub server')
})

// const cookieOptions = {
//   httpOnly: true,
//   secure: process.env.NODE_ENV === "production",
//   sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
// };


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dibths0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    //await client.connect();
    const database = client.db("knowledge-hub");
    const bannerCollection = database.collection("banner");
    const bookCollection =database.collection("book")
    // Send a ping to confirm a successful connection
    app.get("/all-banner",async(req,res)=>{
      const cursor = bannerCollection.find()
      const result = await cursor.toArray()
      res.send(result)
    })
    //book related data
    app.post("/all-books",async(req,res)=>{
      const book =req.body
      const result =await bookCollection.insertOne(book)
      res.send(result)
    })
    app.get('/all-books/:id',async(req,res)=>{
      const id = req.params.id
      const query= {_id: new ObjectId(id)}
      const result = await bookCollection.findOne(query)
      res.send(result)
    })

    app.get("/all-books",async(req,res)=>{
      const cursor =bookCollection.find()
      const result = await cursor.toArray()
      res.send(result)
    })
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);


app.listen(port,()=>{
    console.log('the  app is listening on port',port)
})