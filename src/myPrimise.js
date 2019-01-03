const isFunction = (variable) => {
    typeof variable==='function'
}
class Myprimise{
    constructor(handle){
        if(!isFunction(handle)){
            throw new Error('必须是函数')
        }
        this.status = 'pending'
        this.value = undefined
        this.fulfilledQueues = []
        this.rejectedQueues = []
        try{
            handle(this.resolve.bind(this),this.reject.bind(this))
        }catch(err){
            this.reject(err)
        }
    }
    resolve(val){
        // if(this.status !== 'pending') return
        // const run =() => {
        //     this.status='fulfill'
        //     this.value=val
        //     let cb;
        //     while (cb = this.fulfilledQueues.shift()) {
        //       cb(val)
        //     }
        // }
        const run = () => {
            if(this.status !== 'pending') return
            const runFulfilled = (value) => {
                let cb;
                while (cb = this.fulfilledQueues.shift()) {
                    cb(value)
                }
            }
            const runRejected = (error) => {
                let cb;
                while (cb = this.rejectedQueues.shift()) {
                    cb(error)
                }
            }
            if (val instanceof MyPromise) {
                val.then(value => {
                  this.value = value
                  this.status = 'fulfill'
                  runFulfilled(value)
                }, err => {
                  this.value = err
                  this.status = 'rejected'
                  runRejected(err)
                })
              } else {
                this.value = val
                this.status = 'fulfill'
                runFulfilled(val)
              }
        }
        setTimeout(() => run(), 0)
    }
    reject(err){
        if(this.status !== 'pending') return
        const run =() => {
            this.status='rejected'
            this.value = err
            while (cb = this.rejectedQueues.shift()) {
                cb(err)
            }
        }
        setTimeout(() => run(), 0)
    }
    then(onFulfilled,onRejected){
        const {value,status} = this;
        return new Myprimise((onFulfilledNext,onRejectedNext) => {
            let thfulfill = (value) => {
                if(!isFunction(onFulfilled)){
                    onFulfilledNext(value);
                }else{
                    let res = onFulfilled(value)
                    if(res instanceof MyPromise){
                        res.then(onFulfilledNext,onRejectedNext)
                    }else{
                        onFulfilledNext(res)
                    }
                }
            }
            let threject = (err) => {
                if(!isFunction(onRejected)){
                    onRejectedNext(err)
                }else{
                    let res = onRejected(err)
                    if(res instanceof MyPromise){
                        res.then(onFulfilledNext, onRejectedNext)
                    }else{
                        onRejectedNext(res)
                    }
                }
            }
            switch(status){
                case 'pending':
                    this.fulfilledQueues.push(thfulfill)
                    this.rejectedQueues.push(threject)
                    break;
                case 'fulfill':
                    thfulfill(value)
                    break;
                case 'rejected':
                    threject(value)
                    break;
            }
        })
    }
    catch(catchreject){
        return this.then(undefined,catchreject);
    }
    finally(fin){
        return this.then(
        value  => MyPromise.resolve(fin()).then(() => value),
        reason => MyPromise.resolve(fin()).then(() => { throw reason })
        );
    }
    static resolve (value) {
        if(value instanceof Myprimise){
            return value;
        }
        return new Myprimise(resolve => resolve(value))
    }
    static reject(value){
        return new Myprimise((resolve,reject) => reject(value) )
    }
    static race (list){
        
    }
}

export default Myprimise;