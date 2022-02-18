export default function createClickListener(){
    document.addEventListener('click', handleClick)            

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

    function handleClick(e){
        let element = e.srcElement
        let direction = element.classList[0]
        if (!direction) return
        direction = direction.replace('button-','')
        if (!['up','right','down','left'].includes(direction)){
            return
        }
        direction = `Arrow${direction[0].toUpperCase() + direction.slice(1)}`
        console.log(direction)
        for (let observerFunction of state.observers){
            observerFunction({type:'change-direction', snakeId:state.snakeId, keypress:direction})
        }
    }
    return {
        subscribe,
        registerSnake
    }
}