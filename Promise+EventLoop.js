JS 是 单线程 的：

同一时间只能干一件事。

但是浏览器/Node 环境是多线程的，会把不同任务安排到不同队列，然后 事件循环(Event Loop) 控制执行顺序。
JS 的任务分三类：
  🧩 1. 同步任务（Synchronous）立即执行
  🧩 2. 微任务（Microtask）   
        Promise.then
        Promise.catch
        Promise.finally
        async/await 中 await 后续代码
        queueMicrotask
  🧩 3. 宏任务（Macrotask）
        setTimeout
        setInterval
        setImmediate
        整个 script 脚本本身就是一个宏任务
        I/O 任务

同步 > 当前微任务队列全部 > 下一个宏任务 > 该宏任务产生的微任务全部 > 下一个宏任务 ...

🧩 1. Promise executor 是同步执行的
    new Promise((resolve) => {
      console.log(1); // 立刻执行
    });

🧩 2. then/catch/finally 回调是微任务
    Promise.resolve().then(() => console.log(1));

🧩 3. Promise 状态一旦改变就不可逆
    resolve(1);
    resolve(2); // 无效

🧩 4. Promise 链式 then 的规则
    一个 then 执行完后，下一个 then 会加入微任务队列：
    Promise.resolve()
    .then(() => { console.log(1); }) // 微任务 M1
    .then(() => { console.log(2); }) // 微任务 M2（M1 执行后才加入）

🧩  async 函数的执行阶段划分
    async function test() {
      console.log(1);   // 同步
      await A;
      console.log(2);   // 微任务
      await B;
      console.log(3);   // 微任务
    }
    进入 async 函数，遇到 await 之前全是同步代码
    遇到 await 后暂停
    将 await 后面的部分拆成微任务执行

🧩  await 和 Promise.then 的队列顺序
    两者都是微任务，区别在：
    跟 Promise.resolve.then 同一步生成的微任务，会按代码顺序入队。
    await 会在执行到它时才生成微任务。
    Promise.resolve().then(() => console.log('then'));
    async function f() {
      await null;
      console.log('await');
    }
    f();
    //  then  await

1. 运行所有同步代码
2. 执行所有微任务（Promise.then / await 后）直到清空
3. 执行下一个宏任务（如 setTimeout）
4. 执行该宏任务产生的所有微任务
5. 回到步骤 3，进入下一轮循环


万能模板
① 按顺序扫描代码，把每一行标“任务类型”
  console.log()
  → 同步任务(Sync)

  Promise executor(new Promise((resolve)=>{...}))的内容
  → 同步任务(Sync)

  .then(...), .catch(...) 回调
  → 微任务(Microtask)

  async 函数里的 await 后面的内容
  → 也是 微任务

  setTimeout(...)
  → 宏任务(Macrotask)

② 同步代码按顺序执行

  遇到：
    同步 console.log

    Promise executor 内的代码

    定义各种 then / timeout（只是注册，不执行回调）

  都立刻执行。

  记录：

    同步输出了什么

    创建了哪些微任务（按顺序）

    创建了哪些宏任务（按顺序）

③ 同步执行完后 → 开始处理微任务队列

  关键规则：

    微任务必须全部执行完，才能执行下一个宏任务

    微任务里还可以创建微任务，继续排队

④ 微任务执行时要注意：微任务可能再创建新微任务
  → 新微任务也必须在宏任务前执行

⑤ 微任务执行完 → 执行当前的宏任务队列（如 setTimeout）

  宏任务可能再创建更多：

    同步任务

    微任务

    再下一轮宏任务

  每个宏任务完成后，要再回到 微任务阶段。

⑥ 宏任务中若有新的微任务，必须立即执行

  宏任务 1 → 执行微任务 → 宏任务 2 → 执行微任务 → ...

⑦ Promise 状态只会被第一次 resolve 或 reject 决定，状态被锁住，不会改变。

await 会“把后面的代码拆成微任务”

练习题：
1. 
console.log(1);

async function foo() {
  console.log(2);
  return 10;
}

foo().then(res => console.log(res));

console.log(3);

1 2 3 10

2. 
async function test() {
  console.log('A');
  await Promise.resolve();
  console.log('B');
}

test().then(() => {
  console.log('C');
});

console.log('D');

A D B C 

3.
console.log(1);

Promise.resolve().then(() => {
  console.log(2);
  return Promise.resolve();
}).then(() => {
  console.log(3);
});

async function run() {
  console.log(4);
  await null;
  console.log(5);
}

run();

console.log(6);
1 4 6 2 5 3 

4.
console.log('X');

setTimeout(() => {
  console.log('Y');
  Promise.resolve().then(() => console.log('Z'));
});

Promise.resolve().then(() => console.log('A'));

console.log('B');
X B A Y Z

5. 
console.log(1);

setTimeout(() => {
  console.log(2);
}, 0);

Promise.resolve()
  .then(() => {
    console.log(3);
    return Promise.resolve();
  })
  .then(() => {
    console.log(4);
  });

async function test() {
  console.log(5);
  await Promise.resolve();
  console.log(6);
}

test();

console.log(7);

1 5 7 3 4 6 2
