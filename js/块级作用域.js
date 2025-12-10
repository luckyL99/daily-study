作用域 → 作用域链 → 执行上下文 → 变量提升

# 作用域
    JS 一共有三种作用域：
      1. 全局作用域（Global Scope）
      2. 函数作用域（Function Scope）
      3. 块级作用域（Block Scope）

# 词法作用域（Lexical Scope）静态作用域, 作用域由代码定义位置决定，而不是由运行时调用方式决定。
# 作用域链（Scope Chain）:每个作用域都有一个指向“父作用域”的引用,这形成 作用域链。
    当你访问一个变量时：
      1. 先查当前作用域
      2. 查父作用域
      3. 一直找到全局作用域
      4. 没找到就报错
# 执行上下文（Execution Context）:执行上下文是 JS 在执行代码前创建的“运行环境”。
    JS 有三类执行上下文：
      1. 全局执行上下文
      2. 函数执行上下文
      3. eval 执行上下文（不常用）
    每个执行上下文中包含三部分：
      1. 变量环境（Variable Environment）, 存 var 声明的变量、函数声明。
      2. 词法环境（Lexical Environment）, 存 let / const 声明的变量。
      3. this 绑定
  执行 JavaScript 的时候，V8 会维护一个「执行上下文栈」：每次调用函数，JS 会创建新的执行上下文压入栈顶。   

# 变量提升（Hoisting）:变量提升是执行上下文创建过程中的行为
  JS 在执行代码前，会先做“预扫描”，把：
    var 声明全部提前
    函数声明整体提前
    let/const 声明不会提升（但会进入 TDZ: 暂时性死区）

  

函数/块级作用域：

var → Variable Environment（变量环境）
let/const → Lexical Environment（词法环境）

全局作用域：

var → ObjectRecord（对象式环境记录）→ 挂载到 window
let/const → DeclarativeRecord（声明式环境记录）→ 独立存储

核心原因：
分开存储是为了实现不同的语义：

var 的变量提升和函数作用域
let/const 的暂时性死区和块级作用域
全局 var 的 window 属性绑定

