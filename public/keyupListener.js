export default function createKeydownListener(){
    document.addEventListener('keyup', handleKeyup)            
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

    function handleKeyup(e){
        if (e.repeat)
            return
        let keypress = e.key

        for (let observerFunction of state.observers){
            observerFunction({type:'stop-increase-snake-speed', keypress, snakeId:state.snakeId})
        }
    }
    return {
        subscribe,
        registerSnake
    }
}