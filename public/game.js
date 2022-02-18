export default function createGame(){
    let state = {
        snakes:{
        },
        foods:{

        },
    }

    function setState(newState){
        Object.assign(state, newState)
    }

    

    function addSnake({id, positions}){
        state.snakes[id] = positions
    }

    function removeSnake({snakeId}){
        let snake = state.snakes[snakeId]
        if (!snake)
            return
        Reflect.deleteProperty(state.snakes, snakeId)
        return Object.assign(snake, {})
    }

    
    

    function addFood({id, x, y}){
        state.foods[id] = {x,y}
    }


    function removeFood({id}){
        Reflect.deleteProperty(state.foods, id)
    }

    return {
        state,
        addSnake,
        addFood,
        setState,
        removeSnake,
        removeFood

    }
}