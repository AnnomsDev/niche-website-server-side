const express = require('express')
const { MongoClient } = require('mongodb');
const cors = require('cors')
require('dotenv').config()


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



        // PUT API - set user info to db 
        app.put('/users', async (req, res) => {
            const user = req.body;
            console.log('user put hit: user - ', user)

            const result = await usersCollecton.updateOne({ email: user.email }, { $set: user }, { upsert: true })
            res.json(result)
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