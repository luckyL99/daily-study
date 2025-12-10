原型链就是：当对象访问一个不存在的属性时，会沿着 __proto__ 指向的原型一级一级向上查找，直到找到属性或到达 null 的那条链。

普通对象 obj
    |
    v
obj.__proto__ === Object.prototype
    |
    v
Object.prototype.__proto__ === null


构造函数 Person
    |
    v
Person.__proto__ === Function.prototype
    |
    v
Function.prototype.__proto__ === Object.prototype
    |
    v
null


对象实例 p
   |
   v
p.__proto__ === Person.prototype


构造函数.prototype.__proto__ === Object.prototype
Object.__proto__ → Function.prototype
Object.constructor === Function
Function.constructor === Function
