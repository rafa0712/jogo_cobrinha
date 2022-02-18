export default function createKeydownListener(){
    document.addEventListener('keydown', handleKeydown)            
    let state = {
        observers:[],
        snakeId:null
    }

    function registerSnake(snakeId){
        state.snakeId = snakeId
    }

    function subscribe(observerFunction){
        state.observers.push(observerFunction)
    }

    function handleKeydown(e){
        if (e.repeat)
            return
        let keypress = e.key

        for (let observerFunction of state.observers){
            observerFunction({type:keypress == ' ' ? 'increase-snake-speed' : 'change-direction', keypress, snakeId:state.snakeId})
        }
    }
    return {
        subscribe,
        registerSnake
    }
}