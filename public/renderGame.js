export default function renderGame(game, currentSnakeId){
    const gameScreen = document.querySelector('#screen')
    const context = gameScreen.getContext('2d')
    context.fillStyle = 'white'
    context.clearRect(0,0,gameScreen.width,gameScreen.height)
    for (let snakeId in game.state.snakes){
        let snake = game.state.snakes[snakeId]
        for (let pos in snake){
            let {x,y} = snake[pos]
            if (pos == 0){
                context.fillStyle = snakeId == currentSnakeId ? 'black' : 'red'
            }
            else if (pos > 0 && pos < 3){
                context.fillStyle = snakeId == currentSnakeId ? '#261210' : 'orange'
            }
            else{
                context.fillStyle = snakeId == currentSnakeId ? 'grey' : 'yellow'
            }
            context.fillRect(x, y, 1,1)
        }

    }
    for (let foodId in game.state.foods){
        let {x,y} = game.state.foods[foodId]
        context.fillStyle = 'red'
        context.fillRect(x, y, 1, 1)
    }
    requestAnimationFrame(()=>{
        renderGame(game, currentSnakeId)
    })
}