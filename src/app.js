import express from "express"
import cors from "cors"
import joi from "joi"
import { MongoClient,ObjectId } from "mongodb"
import dotenv from "dotenv"
import dayjs from "dayjs"
const app = express()

app.use(express.json())
app.use(cors())
dotenv.config()


const mongoClient = new MongoClient(process.env.DATABASE_URL)
try {
    await mongoClient.connect()
    console.log("MongoDB conectado!")
} catch (err) {
    console.log(err.message)
}
const db = mongoClient.db()

app.get("/participants", async (req,res) =>{
    try{
        const participants = await db.collection("participants").find().toArray()
        res.send(participants)
    }catch(err){
        res.status(500).send(err.message)
    }
})

app.post("/participants", async (req,res) =>{
    const { name } = req.body

    const nameSchema = joi.object({
        name:joi.string().required()
    })

    const validation = nameSchema.validate(req.body)
    if(validation.error) return res.sendStatus(422)

    try{
        const user = await db.collection("participants").findOne({name: name})
        if(user) return res.sendStatus(409)
        await db.collection("participants").insertOne({
            name:name,
            lastStatus: Date.now()
        })

        await db.collection("messages").insertOne({ 
            from: name,
            to: 'Todos',
            text: 'entra na sala...',
            type: 'status',
            time: dayjs().format("HH:mm:ss")
    })

        res.sendStatus(201)
    }catch(err){
        res.sendStatus(500).send(err.message)
    }
})

app.get("/messages", async (req,res) =>{
    try{
        const messages = await db.collection("messages").find().toArray()
        res.send(messages)
    }catch(err){
        res.status(500).send(err.message)
    }
})



app.listen(5000, console.log("Servidor rodando Porta 5000"))