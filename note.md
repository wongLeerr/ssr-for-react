1. middleware 本质是一个函数，接受两个需要使用 middleware 解决的参数，该 middleware 方法返回一个方法，返回的方法中已注入参数 next ，返回的方法中依旧返回一个方法，实现使用 next 对其进行调用，next 是实现中间件串行执行的一种方法，实现上一个中间件处理完毕之后交给下一个中间件继续进行处理的目的。
    ```javascript
        const middleware = (dispatch,getState) => {
        return (next) => {
            return (action) => { 
                return next(action)
            }
        }
    }
    ``` 