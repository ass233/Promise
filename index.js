let MyPromise = require('./Promise')
let p1 = new MyPromise(function(resolve,reject){
    setTimeout(function(){
        let num = 1;
        if(num<.5){
            resolve(num);
        }else{
            reject('失败');
        }
    })
})

p1.then(function(data){
    console.log(data);
},function(reason){
    console.log(reason)
}).then(function(data){
    console.log(data)
},function(reason){
    console.log(reason)
});