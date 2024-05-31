const express = require('express')
const HomepassController = require('./controllers/homepassController')
const app = express()
const port = 3000
const cors = require('cors')

app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json());

app.get('/api/homepass', HomepassController.getAllHomepassRequests)
app.post('/api/homepass', HomepassController.createHomepassRequest)
app.get('/api/homepass/:id', HomepassController.getHomepassRequestById)
app.put('/api/homepass/:id', HomepassController.updateHomepassRequest)

app.listen(port, () => {
    console.log(`NISA app listening on port ${port}`)
})