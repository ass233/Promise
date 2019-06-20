const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';
function Promise(exector){
    let self = this;
    self.status = PENDING;
    self.onResolvedCallbacks = [];
    self.onRejeckedCallbacks = [];
    function resolve( value){
        if(value instanceof Promise){
            return value.then(resolve,reject)
        }
        if(self.status == PENDING){
            self.status = FULFILLED
            self.value = value
            self.onResolvedCallbacks.forEach(cb => cb(self.value));
        }
    }
    function reject(reason){
        if(self.status == PENDING){
            self.status = REJECTED
            self.value = reason
            self.onRejeckedCallbacks.forEach(cb =>cb(self.value))
        }
    }
    try{
        exector(resolve,reject)
    }catch(e){
        reject(e)
    }
}
Promise.prototype.then = function(onFulfilled,onRejected){
    onFulfilled = typeof onFulfilled == 'function'?onFulfilled:value => value;
    onRejected  = typeof onRejected  == 'function'?onRejected:reason => {throw reason}
    let self = this;
    let promise2;
    if(self.status == FULFILLED){
        return promise2 = new Promise(function(resolve,reject){
            setTimeout(function(){
                try{
                    let x = onFulfilled(self.value);
                    resolvePromise(promise2,x,resolve,reject);
                }catch(e){
                    reject(e);
                }
            })
        })
    }
    function resolvePromise(promise2,x,resolve,reject){
        if(promise2 == x){
            return reject(new TypeError('循环引用'))
        }
        let called = false;
        // if(x instanceof Promise){
        //     setTimeout(function(){
        //         if(x.status == 'pending'){
        //             x.then(function(y){
        //                 resolvePromise(promise2,y,resolve,reject)
        //             },reject)
        //         }else{
        //             x.then(resolve,reject)
        //         }
        //     })

        // }else 
        if(x != null && ((typeof x == 'object') || (typeof x == 'undefined'))){
            try {
                let then = x.then()
                if(typeof then == 'function'){
                    then.call(x,function(y){
                        if(called) return;
                        called = true;
                        //成功回调
                        resolvePromise(promise2,y,resolve,reject)
                    },function(err){
                        if(called) return;
                        called = true;
                        //失败回调
                        reject(err)
                    })
                }else{
                    resolve(x)
                }
            } catch (e) {
                if(called) return;
                called = true;
                reject(e)
            }
        }else{
            resolve(x)
        }
    }
    if(self.status == REJECTED){
        return promise2 = new Promise(function(resolve,reject){
            setTimeout(function(){
                try {
                    let x = onRejected(self.value)
                } catch (e) {
                    reject(e)
                }
            })
        })

    }
    if(self.status == PENDING){
        return promise2 = new Promise(function(resolve,reject){
            setTimeout(function(){
                try {
                    self.onResolvedCallbacks.push(function(){
                        let x = onFulfilled(self.value);
                        resolvePromise(promise2,x,resolve,reject);
                    })
                } catch (e) {
                    reject(e)
                }
            })
    
            setTimeout(function(){
                try {
                    self.onRejeckedCallbacks.push(function(){
                        let x = onRejected(self.value)
                        resolvePromise(promise2,x,resolve,reject);
                    })
                } catch (e) {
                    reject(e)
                }
            })
        })

    }
}
Promise.prototype.catch = function(){
    this.then(null,onRejected)
}
Promise.deferred = Promise.defer = function(){
    let defer = {}
    defer.promise = new Promise(function(resolve,reject){
        defer.resolve = resolve;
        defer.reject = reject;
    })
    return defer
}
module.exports = Promise;