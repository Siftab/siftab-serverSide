const express = require('express');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const app = express();

const port = process.env.PORT || 5000;


// middlewear 
app.use(cors())
app.use(express.json());



// MongoCode 

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.i7jrqrv.mongodb.net/?retryWrites=true&w=majority`;
// const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.PASS_DB}@cluster0.i7jrqrv.mongodb.net/?retryWrites=true&w=majority`;
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
    // await client.connect();
    const sifTechProducts = client.db('sifTech').collection('products');
    const sifTechReviews = client.db('sifTech').collection('reviews');
    const sifTechUsers = client.db('sifTech').collection('users');
    const sifTechCart = client.db('sifTech').collection('cart');

    //  fetch brand items

    app.get('/brand/:name', async (req, res) => {
      const brandName = req.params.name;
      const filter = { brand: { $regex: new RegExp('^' + brandName + '$', 'i') } }
      const result = await sifTechProducts.find(filter).toArray();
      res.send(result)



    })
    // fetch single data
    app.get('/productDetails/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const result = await sifTechProducts.findOne(filter);
      res.send(result)
    })

    // ADD PRODUCT
    app.post('/addProduct', async (req, res) => {
      const newProduct = req.body;
      const result = await sifTechProducts.insertOne(newProduct);
      res.send(result)
      // console.log(newProduct)
    })

    // UpdateProduct
    app.put('/updateProduct', async (req, res) => {
      const updatedInfo = req.body;
      const filter = { _id: new ObjectId(updatedInfo._id) }
      const options = { upsert: true }
      const finalUpdate = {
        $set: {
          name: updatedInfo.name,
          brand: updatedInfo.brand,
          type: updatedInfo.type,
          price: updatedInfo.price,
          description: updatedInfo.description,
          rating: updatedInfo.rating,
          imgURL:updatedInfo.imgURL,

            }
      }
      const cartUpdate= await sifTechCart.updateOne(filter,finalUpdate,options)
      const result = await sifTechProducts.updateOne(filter,finalUpdate,options)
      res.send(result)
    })

    // REVIEWS
    app.get('/getReviews', async (req, res) => {
      const result = await sifTechReviews.find().toArray();
      res.send(result)
    })
    app.post('/reviews', async (req, res) => {
      const newReview = req.body;
      const result = await sifTechReviews.insertOne(newReview);
      res.send(result)
    })

    // AddtoCart
    app.post('/addToCart/:id', async (req, res) => {
      const id = req.params.id
      const filter = { _id: new ObjectId(id) };
      const target = await sifTechProducts.findOne(filter);
      const result = await sifTechCart.insertOne(target);
      res.send(result)

    })

    // getCartData
    app.get('/cartData', async (req, res) => {
      const result = await sifTechCart.find().toArray();
      res.send(result)
    })
    // cartDelete
    app.delete(`/cartDelete/:id`, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await sifTechCart.deleteOne(filter);
      res.send(result)
    })


    // USER
    app.post('/user', async (req, res) => {
      const newUser = req.body;
      const result = await sifTechUsers.insertOne(newUser);
      res.send(result)

    })

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send(('server is running sifat perfectly'))

})

app.listen(port, () => {
  console.log('server is running on Port =>', port)
})