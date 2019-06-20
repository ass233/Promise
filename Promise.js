function Promise(executor) {
  let self = this;
  self.status = 'pending';　　//promise默认就是等待状态
  self.value = undefined;　　 //存放成功回调的值
  self.reason = undefined;　　//存放失败回调的值

  self.onResolved = [];　　//专门存放成功的回调函数
  self.onRejected = [];　　//存放失败的回调函数

  function resolve(value) {　　//promise成功走这个函数
    if (self.status === 'pending') {
      self.value = value;
      self.status = 'resolved';
      self.onResolved.forEach(fn => fn());
    }
  }
  function reject(reason) {　　//promise失败走这个函数
    if (self.status === 'pending') {
      self.reason = reason;
      self.status = 'rejected';
      self.onRejected.forEach(fn => fn());
    }
  }
  try {
    executor(resolve, reject);
  } catch (e) {
    reject(e);
  }
}
//确定then里面的成功/失败函数执行的结果和返回的promise2是什么关系
//ps:promise a+里面确实有很多的槽点  比如这个x、y和promise2什么的都是那里面规定的
function resolvePromise(promise2, x, resolve, reject) {
  if (promise2 === x) {
    return reject(new TypeError('循环引用'));
  }
  let called;
  if (x != null && (typeof x === 'object' || typeof x === 'function')) {
    try {
      let then = x.then; // 如何判断是promise 就判断又没then方法 
      if (typeof then === 'function') {
        then.call(x, (y) => {
          if (called) return;
          called = true;
          resolvePromise(promise2, y, resolve, reject);
        }, (e) => {
          if (called) return;
          called = true;
          reject(e);
        });
      } else {
        resolve(x);
      }
    } catch (e) {
      if (called) return;
      called = true;
      reject(e);
    }
  } else {
    resolve(x);
  }
}
//promise的then方法
Promise.prototype.then = function (onfulfilled, onrejected) {
  onfulfilled = typeof onfulfilled == 'function' ? onfulfilled : val => val;
  onrejected = typeof onrejected === 'function' ? onrejected : err => {
    throw err;
  }
  let self = this;

  let promise2;　　//返回新的promise就是promise2  
  promise2 = new Promise((resolve, reject) => {
    if (self.status === 'resolved') {
      setTimeout(() => { // 目的是为了实现异步
        try {
          let x = onfulfilled(self.value);
          resolvePromise(promise2, x, resolve, reject);
        } catch (e) {
          reject(e);
        }
      }, 0);
    }
    if (self.status === 'rejected') {
      setTimeout(() => {
        try {
          let x = onrejected(self.reason);
          resolvePromise(promise2, x, resolve, reject); // 解析x 和 promise2的关系
        } catch (e) {
          reject(e);
        }
      }, 0);
    }
    if (self.status === 'pending') {
      self.onResolved.push(function () {
        setTimeout(() => {
          try {
            let x = onfulfilled(self.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      });
      self.onRejected.push(function () {
        setTimeout(() => {
          try {
            let x = onrejected(self.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      });
    }
  })
  return promise2;
}
//实现promise原生方法
Promise.all = function (promises) {
  return new Promise((resolve, reject) => {
    let results = []; 
　　 let i = 0;
    function processData(index, data) {
      results[index] = data; // let arr = []  arr[2] = 100
      if (++i === promises.length) {
        resolve(results);
      }
    }
    for (let i = 0; i < promises.length; i++) {
      let p = promises[i];
      p.then((data) => { // 成功后把结果和当前索引 关联起来
        processData(i, data);
      }, reject);
    }
  })
}
Promise.race = function (promises) {
  return new Promise((resolve, reject) => {
    for (let i = 0; i < promises.length; i++) {
      let p = promises[i];
      p.then(resolve, reject);
    }
  })
}
Promise.prototype.catch = function (onrejected) {
  return this.then(null, onrejected)
}
Promise.reject = function (reason) {
  return new Promise((resolve, reject) => {
    reject(reason)
  })
}
Promise.resolve = function (value) {
  return new Promise((resolve, reject) => {
    resolve(value);
  })
}

Promise.defer = Promise.deferred = function () {
  let dfd = {};
  dfd.promise = new Promise((resolve, reject) => {
    dfd.resolve = resolve;
    dfd.reject = reject;
  });
  return dfd;
}
module.exports = Promise