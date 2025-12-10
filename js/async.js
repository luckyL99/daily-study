1. async 函数永远返回 Promise。
里面 return x 相当于 return Promise.resolve(x)。

// async function foo() {
//   return 10;
// }
// 等价于
// function foo() {
//   return Promise.resolve(10)
// }

2. await 做了什么
async function test() {
  console.log('A');
  const x = await something;
  console.log('B');
}
可以粗暴地理解为：
function test() {
  console.log('A');
  return Promise.resolve(something).then(() => {
    console.log('B');
  });
}

await 会：

  把 something 变成一个 Promise（如果本来就不是）

  在这里“暂停”后面的代码

  相当于给这个 Promise 写了一个 then 回调：回调里就是 await 后半截代码

这个回调就是一个 微任务。

所以：

❗ await 后面的代码，一定是微任务，不会在同步阶段执行。

3. await 和 Promise.then 谁先注册谁先执行

4. async + await 执行顺序的口诀： “async 里：await 前同步，await 后微任务”

5. async/await + 普通 Promise.then 混用
   

练习1
console.log(1);

async function foo() {
  console.log(2);
  await Promise.resolve();
  console.log(3);
  await null;
  console.log(4);
}

foo();

console.log(5);

1 2 5 3 4

练习2 
console.log('A');

Promise.resolve().then(() => {
  console.log('B');
  return Promise.resolve();
}).then(() => {
  console.log('C');
});

(async () => {
  console.log('D');
  await Promise.resolve();
  console.log('E');
})();

console.log('F');

A D F B E C

练习3：
console.log(1);

setTimeout(async () => {
  console.log(2);
  await Promise.resolve();
  console.log(3);
}, 0);

Promise.resolve().then(() => console.log(4));

console.log(5);

1 5 4 2 3