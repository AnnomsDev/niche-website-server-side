const express = require('express')
const port = process.env.PORT || 5000
const app = express()

app.get('/', (req, res) => {
    res.send('Drone-land server is running')
})


app.listen(port, () => {
    console.log('Drone-land server is running on port', port)
})