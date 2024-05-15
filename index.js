const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app =express()
const cors =require('cors')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const cookieParser = require('cookie-parser')
const port = process.env.port || 5000
//middleware
app.use(cors({
  origin:['http://localhost:5174','http://localhost:5175','https://knowledge-hub-8809f.web.app'],
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())
app.get('/',async (req,res)=>{
    res.send('knowledge hub server')
})


const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
};


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
    const borrowedBookCollection =database.collection("borrowedBook")
    const subCategoryCollection =database.collection("subCategory")




    const loggedInfo =async(req,res,next)=>{
      console.log('middleware',req.url)
      next()
    }

    const verifyToken=async(req,res,next)=>{
      const token = req.cookies?.token 
      //console.log(token)
      if(!token){
        return res.status(401).send({message: 'no access'})
      }
      jwt.verify(token,process.env.USER_ACCESS_SECRET,(err,decoded)=>{
        if(err){
          return res.status(401).send({message:'no access'})
        }
        req.user= decoded
        next()
      })
    }

    app.post('/jwt',async(req,res)=>{
      const user =req.body
      //console.log(user)
      const token =jwt.sign(user,process.env.USER_ACCESS_SECRET,{expiresIn:'1h'})
      res
      .cookie('token',token,cookieOptions)
      .send({success:true})
    })


    app.post('/logout',async(req,res)=>{
      const user =req.body
      res.clearCookie('token',{maxAge:0}).send({success:true})
    })



    // Send a ping to confirm a successful connection
    app.get("/all-banner",async(req,res)=>{
      const cursor = bannerCollection.find()
      const result = await cursor.toArray()
      res.send(result)
    })
    app.post("/all-borrowed-books",async(req,res)=>{
      const borrowedBook =req.body
      const query2 ={email: borrowedBook.email}
      const result3 =await borrowedBookCollection.find(query2).toArray()
      console.log("email count",result3.length)
      const query= {name: borrowedBook.name}
      const result2 =await borrowedBookCollection.find(query).toArray()
      console.log(result2.length)
      if(result3.length>0 && result2.length>0){
        return
      }
      else{
         const result =await borrowedBookCollection.insertOne(borrowedBook)
      res.send(result)
      }
    })
    app.delete('/all-borrowed-books/:id',async(req,res)=>{
        const id =req.params.id
        const query ={_id: new ObjectId(id)}
        const result = await borrowedBookCollection.deleteOne(query)
        res.send(result)
    })
    app.get('/all-borrowed-books',async(req,res)=>{
      console.log(req.query)
      let query ={}
      if(req.query?.email){
        query= {email:req.query.email}
      }
      const cursor = borrowedBookCollection.find(query)
      const result =await cursor.toArray()
      res.send(result)
    })
    app.get("/all-category",async(req,res)=>{
      const cursor = subCategoryCollection.find()
      const result = await cursor.toArray()
      res.send(result)
    })
    //book related data
    app.post("/all-books",verifyToken,async(req,res)=>{
      console.log('middle',req.user)
      //console.log(req.user)
       console.log('tok tok token',req.cookies.token)
      if(!req.user){
        return res.status(403).send({message:'not accessible'})
      }
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
    app.patch('/all-returned-books/:id',async(req,res)=>{
      const id = req.params.id
      const borrowedBook =req.body

      const query3 ={email: borrowedBook.email}
      const result3 =await borrowedBookCollection.find(query3).toArray()
      console.log("email count",result3.length)

      const query2= {name: borrowedBook.name}
      const result2 =await borrowedBookCollection.find(query2).toArray()
      console.log(result2.length)
      if(result3.length>0 && result2.length>0){
        return res.send(result2)
      }
      //const quantity =req.body
      else{
        console.log(req.body)
      const query= {_id: new ObjectId(id)}
      const updateDoc ={
         $inc: { quantity: -1 } 
      }
      const result =await bookCollection.updateOne(query,updateDoc)
      res.send(result)
      }
    })
    app.patch('/all-returned-books-test/:id',async(req,res)=>{
      const book = req.body
      //console.log('quantity got increased',book)
      //console.log(req.body)
      const query= {name: book.name}
      const updateDoc ={
         $inc: { quantity: 1 } 
      }
      const result =await bookCollection.updateOne(query,updateDoc)
      res.send(result)
    })

    app.get("/all-books",async(req,res)=>{
      // const category = req.query?.category;
      //console.log(req.query)
      let query ={}
      if(req.query?.category){
        query ={category: req.query.category}
      }
      const cursor = bookCollection.find(query)
      const result = await cursor.toArray()
      res.send(result)
    })


    app.get("/all-books-test",verifyToken,async(req,res)=>{
      console.log('middle',req.user)
      //console.log(req.user)
       console.log('tok tok token',req.cookies.token)
      if(!req.user){
        return res.status(403).send({message:'not accessible'})
      }
      const cursor =bookCollection.find()
      const result = await cursor.toArray()
      res.send(result)
    })
    app.put('/all-books/:id',async(req,res)=>{
      const id =req.params.id
      const book =req.body
      const query= {_id: new ObjectId(id)}
      const options = { upsert: true };
      const updateDoc = {
        $set: {
            name: book.name,
            image_url: book.image_url,
            quantity :book.quantity,
            author : book.author,
            rating : book.rating,
            short_description: book.short_description,
            long_description : book.long_description,
            category: book.category
        },
      };
      const result =await bookCollection.updateOne(query,updateDoc,options)
      res.send(result)
    })
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);


app.listen(port,()=>{
    console.log('the  app is listening on port',port)
})