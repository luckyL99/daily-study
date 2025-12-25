Promise 是 ES6 引入的一种异步编程解决方案，用来解决回调地狱问题。
// "传统的回调地狱："

ajax('/api/user', function(user) {
  ajax('/api/posts/' + user.id, function(posts) {
    ajax('/api/comments/' + posts[0].id, function(comments) {
      ajax('/api/likes/' + comments[0].id, function(likes) {
        // 嵌套太深，难以维护
        console.log(likes);
      });
    });
  });
});


它代表一个异步操作的最终完成或失败，以及它的结果值。

Promise 有三种状态：
- pending（进行中）
- fulfilled（已成功）
- rejected（已失败）

状态一旦改变就不能再变，只能从 pending 变为 fulfilled 或 rejected。"

1. // "Promise 的基本用法是这样的："

const promise = new Promise((resolve, reject) => {
  // 异步操作
  setTimeout(() => {
    const success = true;
    if (success) {
      resolve('成功的结果');  // 状态变为 fulfilled
    } else {
      reject('失败的原因');   // 状态变为 rejected
    }
  }, 1000);
});

// 使用 then 和 catch 处理结果
promise
  .then(result => {
    console.log(result);  // 成功时执行
  })
  .catch(error => {
    console.log(error);   // 失败时执行
  })
  .finally(() => {
    console.log('无论成功失败都执行');
  });

"Promise 的优势是可以链式调用，避免回调嵌套。"


2. // "Promise 支持链式调用，每个 then 返回新的 Promise："

fetch('/api/user')
  .then(response => response.json())    // 返回新 Promise
  .then(user => fetch(`/api/posts/${user.id}`))  // 返回新 Promise
  .then(response => response.json())
  .then(posts => {
    console.log(posts);
  })
  .catch(error => {
    // 捕获链上任何一个错误
    console.error(error);
  });
```
```
"关键点是：
1. 每个 then 返回一个新的 Promise
2. 后面的 then 接收前面 then 的返回值
3. 链上任何一个地方出错，都会被最后的 catch 捕获"


3. // "Promise.all 并发执行多个 Promise，全部成功才成功："
使用场景： "比如页面需要同时加载多个数据，全部加载完才渲染。"

const promise1 = fetch('/api/user');
const promise2 = fetch('/api/posts');
const promise3 = fetch('/api/comments');

Promise.all([promise1, promise2, promise3])
  .then(([user, posts, comments]) => {
    // 全部成功，按顺序返回结果
    console.log(user, posts, comments);
  })
  .catch(error => {
    // 任何一个失败就会走到这里
    console.error('有请求失败了', error);
  });

4. // "Promise.race 返回最快完成的那个："
使用场景： "可以用来实现请求超时控制。"

const request = fetch('/api/data');
const timeout = new Promise((_, reject) => 
  setTimeout(() => reject('超时'), 5000)
);

Promise.race([request, timeout])
  .then(data => console.log(data))
  .catch(err => console.log(err));  // 5秒后超时


##############
Promise 的错误处理机制

// "Promise 的错误有两种捕获方式："

方式1: then 的第二个参数
promise.then(
  result => console.log(result),
  error => console.error(error)  // 只能捕获 promise 本身的错误
);

方式2: catch（推荐）
promise
  .then(result => {
    // 这里的错误也能被 catch 捕获
    throw new Error('处理出错');
  })
  .catch(error => {
    // 能捕获 promise 和 then 中的错误
    console.error(error);
  });


"一般推荐用 catch，因为：
1. 能捕获链上所有错误
2. 包括 then 回调中的同步错误
3. 代码更清晰"


#### Promise 的常见陷阱 #####
"陷阱1: 忘记 return"
"陷阱2: 忘记 catch"


#### 手写promise #######

简易版
class MyPromise {
  constructor(executor) {
    // 初始状态
    this.state = 'pending';
    this.value = undefined;   // 成功的值
    this.reason = undefined;  // 失败的原因
    
    // resolve 函数
    const resolve = (value) => {
      // 状态只能改变一次
      if (this.state === 'pending') {
        this.state = 'fulfilled';
        this.value = value;
      }
    };
    
    // reject 函数
    const reject = (reason) => {
      if (this.state === 'pending') {
        this.state = 'rejected';
        this.reason = reason;
      }
    };
    
    // 立即执行 executor
    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }
  
  // then 方法
  then(onFulfilled, onRejected) {
    if (this.state === 'fulfilled') {
      onFulfilled(this.value);
    }
    
    if (this.state === 'rejected') {
      onRejected(this.reason);
    }
  }
}


支持异步
class MyPromise {
  constructor(executor) {
    this.state = 'pending';
    this.value = undefined;
    this.reason = undefined;
    
    // 🔥 新增：存储回调函数的数组
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];
    
    const resolve = (value) => {
      if (this.state === 'pending') {
        this.state = 'fulfilled';
        this.value = value;
        // 🔥 执行所有成功回调
        this.onFulfilledCallbacks.forEach(fn => fn());
      }
    };
    
    const reject = (reason) => {
      if (this.state === 'pending') {
        this.state = 'rejected';
        this.reason = reason;
        // 🔥 执行所有失败回调
        this.onRejectedCallbacks.forEach(fn => fn());
      }
    };
    
    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }
  
  then(onFulfilled, onRejected) {
    if (this.state === 'fulfilled') {
      onFulfilled(this.value);
    }
    
    if (this.state === 'rejected') {
      onRejected(this.reason);
    }
    
    // 🔥 如果是 pending，先把回调存起来
    if (this.state === 'pending') {
      this.onFulfilledCallbacks.push(() => {
        onFulfilled(this.value);
      });
      
      this.onRejectedCallbacks.push(() => {
        onRejected(this.reason);
      });
    }
  }
}