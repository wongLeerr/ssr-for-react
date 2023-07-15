
 function createStore(reducer,enhancer) {

     if (enhancer) {
         return enhancer(createStore)(reducer)
     }
     
    let state = null
    let listeners = []

    function dispatch(action) {
        state = reducer(state, action)
        // 执行每一个订阅者，即更新它们的状态为最新
        listeners.forEach(listener => listener())
    }

    function getState() {
        return state
    }

    // 订阅事件，该函数返回值是取消事件的方法
    function subscribe(listener) {
        listeners.push(listener)

        return function unsubscribe() {
            let index = listeners.indexOf(listener)
            listeners.splice(index,1)
        }
    }

    dispatch({
        type:'INIT'
    })

    return {
        dispatch,
        subscribe,
        getState
    }
}


const middleware = (dispatch,getState) => {

    return (next) => {
        
        return (action) => { 
            return next(action)
        }

    }

}

// 调用形式可能是 applyMiddlewares(a,b,c,...)
const applyMiddlewares = (...middlewares) => {
    return (createStore) => {
        return (reducer) => {
            // 增强 dispatch 使其具有接受函数的能力
            const store = createStore(reducer)

            const middlewareAPI = {
                getState: store.getState,
                dispatch : (action,...args) => store.dispatch(action,...args)
            }

            const middlewareChain = middlewares.map((middleware) => 
                middleware(middlewareAPI)
            )

            const dispatch = compose(...middlewareChain)(store.dispatch)

            return {
                ...store,
                dispatch
            }



        }
    }
}

function compose(...funcs) {
    if (funcs.length === 0) {
        // 没有中间件
        return args => args
    }

    if (funcs.length === 1) {
        // 只有一个中间件
        return funcs[0]
    }

    return funcs.reduce((prev,next) => (...args) => prev(next(...args)))

}

function logger({ dispatch , getState }) {
    return next => action => {
        const prevState = getState()
        console.log('start loging ...')
        console.log('prev state', prevState)
        console.log('action', action)
        const result = next(action)
        const nextState = getState()
        console.log('next state', nextState)
        console.log('end loging ...')
        return result
    }
}

// 测试用例
const reducer = (preState, action) => {
    switch (action.type) {
        case 'inc':
            return preState + 1
        case 'dec':
            return preState - 1
        default:
            return 0
    }

}

const store = createStore(reducer,applyMiddlewares(logger))

const { subscribe , dispatch , getState} = store

subscribe(() => {
    const state = getState()
    console.log(state)
})

dispatch({
    type: 'dec',
})