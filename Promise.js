const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';
function Promise(exector){
    let self = this;
    self.status = PENDING;
    self.onResolvedCallbacks = [];
    self.onRejeckedCallbacks = [];
    function resolve( value){
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
        let x = onFulfilled(self.value)
    }
    if(self.status == REJECTED){
        let x = onRejected(self.value)
    }
    if(self.status == PENDING){
        self.onResolvedCallbacks.push(function(){
            let x = onFulfilled(self.value)
        })
        self.onRejeckedCallbacks.push(function(){
            let x = onRejected(self.value)
        })
    }
}

module.exports = Promise;