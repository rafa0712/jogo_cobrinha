import express from 'express'
import http from 'http'
import cors from 'cors'
import createGame from './utils/game.js'
import {Server} from 'socket.io'
import { readFileSync } from 'fs'
const app = express()
const server = http.createServer(app)
const sockets = new Server(server)
app.use(cors())
app.use(express.static('./public'))

const game = createGame()

app.get('/mobile/:snakeId', async (req, res)=>{
    let {snakeId} = req.params
    let snake = game.state.snakes[snakeId]
    if (!snake){
        return res.status(404).send()
    }
    let file = readFileSync('./views/mobile.html')
    res.setHeader('Content-Type','text/html')
    return res.send(file)

})

game.subscribe((command)=>{
    sockets.emit(command.type, command)
})



sockets.on('connection', socket=>{
    let snakeId = socket.id

    socket.on('disconnect', ()=>{
        let wasStillAlive = game.removeSnake(socket.id)
        if (wasStillAlive){
            for (let c=0;c<wasStillAlive.length;c++){
                game.addFood({})
            }
            for (let ref of wasStillAlive.refs){
                sockets.to(ref).emit('forceDisconnect')
            }
        }
        console.log(`[-] Snake ${snakeId} disconnected.`)
    })



    socket.on('setup-type', (command)=>{
        let {type} = command
        if (type == 'game'){
            game.addSnake({id:snakeId})
            socket.emit('setup', game.state)
        }else{
            snakeId = command.snakeId
            let snake = game.state.snakes[snakeId]
            if (snake){
                snake.refs.push(socket.id)
            }
        }
        console.log(`[+] Snake ${snakeId} connected.`)
        

        
        

        socket.on('change-direction', (command)=>{
            console.log(command, 'change direction')
            let {keypress} = command
            game.changeSnakeDirection({keypress, snakeId})
        })

        socket.on('increase-snake-speed', (command)=>{
            const {id:snakeId} = socket
            const {keypress} = command
            game.increaseSnakeSpeed({snakeId, keypress})
        })

        socket.on('stop-increase-snake-speed', command=>{
            const {id:snakeId} = socket
            const {keypress} = command
            game.stopIncreaseSnakeSpeed({keypress, snakeId})
        })

    })
    
    
})







server.listen(8001, ()=>{console.log('Listening on 8001...')})