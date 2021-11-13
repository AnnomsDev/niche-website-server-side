const express = require('express')
const { MongoClient } = require('mongodb');
const cors = require('cors')
require('dotenv').config()
const ObjectId = require('mongodb').ObjectId


const port = process.env.PORT || 5000
const app = express()

// Middlewire
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.q3v5j.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect()
        console.log('DB connected')

        const database = client.db('drone-land')
        const usersCollecton = database.collection('users')
        const productsCollection = database.collection('products')
        const ordersCollection = database.collection('orders')
        const reviewsCollection = database.collection('reviews')


        // PUT API - set user info to db 
        app.put('/users', async (req, res) => {
            const user = req.body;
            console.log('user put hit: user - ', user)

            const result = await usersCollecton.updateOne({ email: user.email }, { $set: user }, { upsert: true })
            res.json(result)
        })

        // GET API - get user by email
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email
            const user = await usersCollecton.findOne({ email })

            res.json(user)
        })

        // PUT API - set admin role by email
        app.put('/mkadmin/:email', async (req, res) => {
            const email = req.params.email
            const requester = req.body.requester

            const requesterAccount = await usersCollecton.findOne({ email: requester })
            if (requesterAccount.role === 'admin') {
                const result = await usersCollecton.updateOne({ email }, { $set: { role: 'admin' } })

                res.json(result)
            }
            else (
                res.status(401).json({ message: 'you are not authorized to make admin' })
            )
        })




        // GET API - all products
        app.get('/products', async (req, res) => {
            const limit = parseInt(req?.query?.limit) || 0
            const products = await productsCollection.find({}).limit(limit).toArray()

            res.json(products)
        })

        //GET API - single product by id
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id
            const product = await productsCollection.findOne({ _id: ObjectId(id) })

            res.json(product)
        })

        // POST API - add product
        app.post('/products', async (req, res) => {
            const product = req.body

            console.log(product)
            const result = await productsCollection.insertOne(product)
            res.json(result)

        })

        // DELETE API - delete product by id
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id
            const result = await productsCollection.deleteOne({ _id: ObjectId(id) })

            res.json(result)
        })






        // POST API - place a single order 
        app.post('/orders', async (req, res) => {
            const order = req.body
            order.status = 'panding'
            const result = await ordersCollection.insertOne(order)
            res.json(result)

        })

        //GET API - get all orders
        app.get('/orders', async (req, res) => {
            const orders = await ordersCollection.find({}).toArray()

            res.json(orders)
        })

        // GET API - get orders by email
        app.get('/orders/:email', async (req, res) => {
            const email = req.params.email
            const orders = await ordersCollection.find({ email }).toArray()

            res.json(orders)
        })

        // PUT API - Change status by id
        app.put('/orders/:id', async (req, res) => {
            console.log('change status hit')
            const id = req.params.id
            const result = await ordersCollection.updateOne({ _id: ObjectId(id) }, { $set: { status: 'Shifted' } })

            res.json(result)
        })

        // DELETE API - delete order by id 
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id
            const result = await ordersCollection.deleteOne({ _id: ObjectId(id) })

            res.json(result)
        })


        // POST API - add review
        app.post('/reviews', async (req, res) => {
            const review = req.body
            const result = await reviewsCollection.insertOne(review)

            res.json(result)
        })


        // GET API - all reviews
        app.get('/reviews', async (req, res) => {
            const reviews = await reviewsCollection.find({}).toArray()
            res.json(reviews)
        })




    }
    finally {
        // client.close();
    }
}
run().catch(console.dir)






//Default GET API
app.get('/', (req, res) => {
    res.send('Drone-land server is running')
})


app.listen(port, () => {
    console.log('Drone-land server is running on port', port)
})