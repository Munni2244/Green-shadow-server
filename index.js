const express = require('express')
const app = express()
const cors = require('cors')
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

require('dotenv').config()


const port = process.env.PORT || 4000;

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.crn6x.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
  try {
    await client.connect();

    const database = client.db("GreenShadow");
    const productsCollection = database.collection("products");
    const reviewsCollection = database.collection("reviews");
    const orderCollection = database.collection("allOrder");
    const userCollection = database.collection("userInfo");

    ///get products
    app.get('/products', async (req, res) => {
      const cursor = await productsCollection.find({}).toArray();
      res.send(cursor)

    })
    ///get all orders
    app.get('/allOrders', async (req, res) => {
      const cursor = await orderCollection.find({}).toArray();
      res.send(cursor)

    })
    //get single data
    app.get('/products/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const cursor = await productsCollection.findOne(query);
      res.send(cursor)

    })
    //get my products
    app.get('/orders/:email', async (req, res) => {
      const result = await orderCollection.find({ email: req.params.email }).toArray();
      // console.log("find my data");
      res.send(result);

    });
    app.delete('/orders/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      console.log(result);
      res.send(result);

    })

    ///manage remove products
    app.delete('/products/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
      // console.log(result);
      res.send(result);

    })

    // add product 
    app.post('/addProducts', async (req, res) => {
      const docs = req.body;
      const result = await productsCollection.insertOne(docs);
      console.log(result);
      res.send(result)


    })
    // add reviews 
    app.post('/addReview', async (req, res) => {
      const docs = req.body;
      const result = await reviewsCollection.insertOne(docs);
      console.log(result);
      res.send(result)


    })
    /// post order
    app.post('/orders', async (req, res) => {
      const docs = req.body;
      const result = await orderCollection.insertOne(docs);
      console.log(result);
      res.send(result)


    })

    /// get reviews
    app.get('/review', async (req, res) => {
      const cursor = await reviewsCollection.find({}).toArray();
      // console.log('review data');
      res.send(cursor)

    })

    ///approve  order
    app.put('/updateOrders/:id', async (req, res) => {
      const id = req.params.id;
      const updateMethod = req.body;
      const filter = { _id: ObjectId(id) };
      const result = await orderCollection.updateOne(filter, {
        $set: {
          status: 'Approve'
        }
      })
      res.send(result)

    })

    /// post user info
    app.post('/addUserInfo', async (req, res) => {
      const docs = req.body;
      const result = await userCollection.insertOne(docs);
      // console.log(result);
      res.send(result)

    })

    app.put('/makeAdmin', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: 'admin' } };
      const doc = await userCollection.updateOne(filter, updateDoc)

      res.send(doc)


    })

    ///check admin 
    app.get('/users/:email', async(req,res)=>{
      const email= req.params.email;
      const  query= {email: email};
      const user= await userCollection.findOne(query);
      let isAdmin= false;
      if(user?.role){
        isAdmin=true;
      }
    // console.log(isAdimn);
      res.send({admin: isAdmin})
    })

  } finally {
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send("Green Shadow !")
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})