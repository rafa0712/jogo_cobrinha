export default function createGame(){
    let state = {
        snakes:{
        },
        foods:{

        },
        screen:{
            width:30,
            height:30,
        },
        defaultIntervalDuration: 100,
        speedIntervalDuration:40 
    }

    const observers = []

    function subscribe(obsFun){
        observers.push(obsFun)
    }

    function notifyAll(command){
        for (let observer of observers){
            observer(command)
        }
    }

    function generateRandomPosition(w, h){
        return {
            x:Math.floor(Math.random() * w),
            y:Math.floor(Math.random() * h),
        }
    }

    function addSnake({id, positions}){
        if (!positions){
            positions = []
            let {x,y} = generateRandomPosition(state.screen.width, state.screen.height)
            positions.push({x, y})
            positions.push({x, y: y - 1})
            positions.push({x, y: y - 2})
        }
        state.snakes[id] = positions
        let snake = state.snakes[id]
        notifyAll({
            type:'add-snake',
            positions:snake,
            id
        })
        snake.currentDirection = ['up','right','down','left'][Math.floor(Math.random() * 4)]
        snake.currentIntervalDuration = state.defaultIntervalDuration
        snake.currentInterval = setInterval(()=>{
            moveSnake(id)
        }, snake.currentIntervalDuration)
        //Speed mode
        snake.currentSpeedInterval = setInterval(() => {});
        snake.refs = []
        
       
    }

    function removeSnake(snakeId){
        let snake = state.snakes[snakeId]
        if (!snake)
            return
        clearInterval(snake.currentInterval)
        clearInterval(snake.currentSpeedInterval)
        Reflect.deleteProperty(state.snakes, snakeId)
        notifyAll({
            type:'remove-snake',
            snakeId
        })
        
        
        
        return Object.assign(snake, {})
    }

    function moveSnake(snakeId){
        let handlers = {
            up(snake){//y
                let head = snake[0]
                if (head.y == 0){
                    head.y = state.screen.height - 1
                }else{
                    head.y -= 1
                }
            },
            right(snake){//x
                let head = snake[0]
                if (head.x == state.screen.width - 1){
                    head.x = 0
                }else{
                    head.x += 1
                }
            },
            down(snake){//y
                let head = snake[0]
                if (head.y == state.screen.height - 1){
                    head.y = 0
                }else{
                    head.y += 1
                }
            },
            left(snake){//x
                let head = snake[0]
                if (head.x == 0){
                    head.x = state.screen.width - 1
                }else{
                    head.x -= 1
                }
            }

        }
        let snake = state.snakes[snakeId]
        let headLastPos = Object.assign({}, snake[0])
        let tailLastPos = Object.assign({}, snake.slice(-1))
        let chosen = handlers[snake.currentDirection]
        chosen(snake)
        moveTheFullSnakeBody(snakeId, headLastPos, snake.slice(1))
        checkIncreaseSnakeSize(snake, tailLastPos)
        checkPlayerCollision(snakeId)
        notifyAll({
            type:'move-snake',
            positions:snake,
            snakeId
        })
        
    }

    function moveTheFullSnakeBody(snakeId, headLastPos, body){
        if (!body?.length)
            return
        const fakebody = [headLastPos, ...body]
        for (let c = fakebody.length - 1; c > 0; c--){
            state.snakes[snakeId][c] = fakebody[c-1]
        }
        
    }

    function checkIncreaseSnakeSize(snake, tailLastPos){
        let [{x:snakeX, y:snakeY}] = snake
        if (snake.length >= state.screen.width - Math.floor(1/5 * state.screen.width)){
            return
        }
        for (let foodId in state.foods){
            let {x, y} = state.foods[foodId]
            if (snakeX == x && snakeY == y){
                removeFood(foodId)
                snake.push(tailLastPos)
            }

        }
    }

    function checkPlayerCollision(snakeId){
        let [snake] = state.snakes[snakeId]
        for (let enemyId in state.snakes){
            if (enemyId == snakeId)
                continue
            let enemy = state.snakes[enemyId]
            for (let {x, y} of enemy){
                if (x == snake.x && y == snake.y){
                    let positions = removeSnake(snakeId)
                    for (let position of positions){
                        addFood({
                            id:String(Math.random()) + Date.now(),
                            x:position.x,
                            y:position.y
                        })
                    }
                    console.log(`Snake with id: ${snakeId} has lost the game.`)
                    return
                }
            }
        }
    }

    function changeSnakeDirection({keypress, snakeId}){
        const handlers = {
            ArrowUp(snake){
                if (snake.currentDirection == 'down') return
                snake.currentDirection = 'up'
                //console.log(`Setting ${snakeId} direction up`)
            },
            ArrowRight(snake){
                if (snake.currentDirection == 'left') return
                snake.currentDirection = 'right'
                //console.log(`Setting ${snakeId} direction right`)
            },
            ArrowDown(snake){
                if (snake.currentDirection == 'up') return
                snake.currentDirection = 'down'
                //console.log(`Setting ${snakeId} direction down`)
            },
            ArrowLeft(snake){
                if (snake.currentDirection == 'right') return
                snake.currentDirection = 'left'
                //console.log(`Setting ${snakeId} direction left`)
            }
        }
        const chosen = handlers[keypress]
        let snake = state.snakes[snakeId]
        console.log(chosen, snakeId)
        if (chosen && snake){
            chosen(snake)
            console.log('the direction was changed successfully')
            // notifyAll({
            //     type:'change-direction',
            //     snakeId,
            //     direction:snake.currentDirection
            // })
        }
    }

    function increaseSnakeSpeed({keypress, snakeId}){
        let snake = state.snakes[snakeId]
        
        if (snake && snake.length <= 3 || keypress != ' ' || snake.currentIntervalDuration == state.speedIntervalDuration){
            return
        }
        clearInterval(snake.currentInterval)
        
        let result = snake.pop()
        let x,y
        if (result['0']){
            result = result['0']
            x = result.x
            y = result.y
        }
        else{
            x = result.x
            y = result.y
        }
        
        addFood({x,y})
        snake.currentIntervalDuration = state.speedIntervalDuration
        snake.currentInterval = setInterval(()=>{
            if (snake.length <= 3){
                stopIncreaseSnakeSpeed({snakeId:snakeId, keypress})
            }
            moveSnake(snakeId)
        }, snake.currentIntervalDuration)
        snake.currentSpeedInterval = setInterval(() => {
            if (snake.length <= 3){
                return
            }
            let removed = snake.pop()
            let x,y;
            if (removed['0']){
                x = removed['0'].x
                y = removed['0'].y
            }else{
                x = removed.x
                y = removed.y
            }

            
            addFood({x, y})
        }, 500);
        
        

    }

    function stopIncreaseSnakeSpeed({keypress, snakeId}){
        let snake = state.snakes[snakeId]
        if (!snake){
            return
        }
        if (snake.currentIntervalDuration == state.defaultIntervalDuration){// se por algum motivo estiver no modo normal
            return
        } 
        if (keypress != ' '){
            return
        }
        
        clearInterval(snake.currentInterval)
        clearInterval(snake.currentSpeedInterval)
        snake.currentIntervalDuration = state.defaultIntervalDuration
        snake.currentInterval = setInterval(()=>{
            moveSnake(snakeId)
        }, snake.currentIntervalDuration) // voltando ao normal
    }
    
    

    function addFood({id, x, y}){
        if (!id){
            id = Math.random().toString() + Date.now()
        }
        if (!x){
            x = generateRandomPosition(state.screen.width, state.screen.height).x
        }
        if (!y){
            y = generateRandomPosition(state.screen.width, state.screen.height).y
        }
        state.foods[id] = {x,y}
        notifyAll({
            type:'add-food',
            id,
            x,
            y
        })
    }


    function removeFood(id){
        Reflect.deleteProperty(state.foods, id)
        notifyAll({
            type:'remove-food',
            id
        })
    }

    function renderState(){
        console.clear()
        console.log('[=>] Snakes')
        for (let snakeId in state.snakes){
            let snake = state.snakes[snakeId]
            console.log(`\t${snakeId} | Size: ${snake.length}`)
        }
    }

    return {
        state,
        addSnake,
        checkIncreaseSnakeSize,
        changeSnakeDirection,
        addFood,
        increaseSnakeSpeed,
        generateRandomPosition,                                                                                                       
        stopIncreaseSnakeSpeed,
        removeSnake,
        subscribe,
        renderState
    }
}