# 《性能优化之通俗易懂学习 requestAnimationFrame 和使用场景举例》

## 一、新技术与问题解决
一项新技术新的技术方案的提出，一定是为了解决某个问题的，或者是对某种方案的优化，比如`window.requestAnimationFrame`这个 API。

## 二、requestAnimationFrame 官方介绍
- `requestAnimationFrame`用处概述：告诉浏览器希望执行一个动画，并且要求浏览器在下次重绘之前调用指定的回调函数更新动画。该方法需要传入一个回调函数作为参数，该回调函数会在浏览器下一次重绘之前执行。
- 官方文档：developer.mozilla.org/zh-CN/docs/…

## 三、前端动画方案及 requestAnimationFrame 的优势
### （一）前端动画方案
1. **css 动画**：
    - `transition`过渡动画。
    - `animation`直接动画（搭配`@keyframes`）。
2. **js 动画**：
    - `setInterval`或`setTimeout`定时器（比如不停地更改 DOM 元素的位置，使其运动起来）。
    - `canvas`动画，搭配 JS 中的定时器去运动起来（canvas 只是一个画笔，然后通过定时器使用这个画笔去画画 - 动画）。
    - `requestAnimationFrame`动画（JS 动画中的较好方案）。
    - 另有`svg`动画标签，不过工作中这种方式比较少，这里不赘述。

### （二）requestAnimationFrame 的优势
在工作中，做动画最优的方案无疑是 CSS 动画，但是某些特定场景下，CSS 动画无法实现需求，此时就要考虑使用 JS 去做动画。`canvas`动画的本质也是定时器动画，使用定时器动画干活存在最大的问题是动画会抖动，体验效果不是非常好。而使用`requestAnimationFrame`去做动画，就不会抖动。

## 四、示例对比定时器动画与 requestAnimationFrame 动画
1. **效果图**：红色 DOM 是定时器实现、绿色 DOM 是`requestAnimationFrame`实现。
2. **代码示例**：
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>requestAnimationFrame_yyds</title>
    <style>
        body {
            box-sizing: border-box;
            background-color: #ccc;
        }
       .box1,
       .box2 {
            position: absolute;
            width: 160px;
            height: 160px;
            line-height: 160px;
            text-align: center;
            color: #fff;
            font-size: 13px;
        }
       .box1 {
            top: 40px;
            background: red;
        }
       .box2 {
            top: 210px;
            background: green;
        }
    </style>
</head>
<body>
    <button class="btn">👉 let's go!</button>
    <div class="box1">定时器动画</div>
    <div class="box2">请求动画帧</div>
    <script>
        // 动画思路：不断修改 dom 元素的 left 值，使其运动起来（动画）
        let box1 = document.querySelector('.box1');
        let box2 = document.querySelector('.box2');
        // setInterval 定时器方式
        function setIntervalFn() {
            let timer = null;
            box1.style.left = '0px';
            timer = setInterval(() => {
                let leftVal = parseInt(box1.style.left);
                if (leftVal >= 720) {
                    clearInterval(timer);
                } else {
                    box1.style.left = leftVal + 1 + 'px';
                }
            }, 17);
        }
        // requestAnimationFrame 请求动画帧方式
        function requestAnimationFrameFn() {
            let timer = null; // 可注掉
            box2.style.left = '0px';
            function callbackFn() {
                let leftVal = parseInt(box2.style.left);
                if (leftVal >= 720) {
                    // 不再继续递归调用即可，就不会继续执行了，下面这个加不加都无所谓，因为影响不到
                    // cancelAnimationFrame 取消请求动画帧，用的极少，看下，下文中的回到顶部组件
                    // 大家会发现并没有使用到这个 api（这样写只是和 clearInterval 做一个对比）
                    // 毕竟，正常情况下，requestAnimationFrame 会自动停下来
                    cancelAnimationFrame(timer); // 可注掉（很少用到）
                } else {
                    box2.style.left = leftVal + 1 + 'px';
                    window.requestAnimationFrame(callbackFn);
                }
            }
            window.requestAnimationFrame(callbackFn);
        }
        // 动画绑定
        let btn = document.querySelector('.btn');
        btn.addEventListener('click', () => {
            setIntervalFn();
            requestAnimationFrameFn();
        });
    </script>
</body>
</html>
```
3. **Chrome 浏览器查看当前帧数命令**：
    - F12 打开控制台。
    - command + shift + p 调出输入面板。
    - 在 Run 输入框中输入：Show frames per second(FPS) meter 回车即可。

## 五、requestAnimationFrame 的语法规则
1. `requestAnimationFrame`和 JS 中的`setTimeout`定时器函数基本一致，不过`setTimeout`可以自由设置间隔时间，而`requestAnimationFrame`的间隔时间是由浏览器自身决定的，大约是 17 毫秒左右。
    - 在控制台输入`window`，然后展开查看其身上的属性，就能找到`requestAnimationFrame`。
    - `requestAnimationFrame`本质上是一个全局`window`对象上的一个属性函数，使用时直接：`window.requestAnimationFrame(callback)`即可。
    - 和定时器一样，其接收的参数`callback`也是一个函数，即下一次重绘之前更新动画帧所调用的函数，在这个函数体中可以写对应的逻辑代码（和定时器类似）。
    - `requestAnimationFrame`也有返回值，返回值是一个整数，主要是定时器的身份证标识，可以使用`window.cancelAnimationFrame()`来取消回调函数执行，相当于定时器中的`clearTimeout()`。
    - 二者也都是只执行一次，想要继续执行，做到类似`setInterval`的效果，需要写成递归的形式。

## 六、为什么定时器会卡，而 requestAnimationFrame 不会卡
### （一）为什么定时器会卡
我们在手机或者电脑显示屏上看东西时，显示屏会默默不停地干活（刷新画面）。普通显示器的刷新率约为 60Hz（每秒刷新 60 次），高档的有 75Hz、90Hz、120Hz、144Hz 等等。刷新率次数越高，显示器显示的图像越清晰、越流畅、越丝滑。动画想要丝滑流畅，需要卡住时间点进行代码操作（代码语句赋值、浏览器重绘），所以只需要每隔 1000 毫秒的 60 分之一（60HZ）即约为 17 毫秒，进行一次动画操作即可。但是定时器的回调函数，会受到 JS 的事件队列宏任务、微任务影响，可能设定的是 17 毫秒执行一次，但是实际上这次是 17 毫秒、下次 21 毫秒、再下次 13 毫秒执行，所以并不是严格的卡住了这个 60HZ 的时间，没有在合适的时间点操作，就会出现绘制不及时的情况，就会有抖动的出现。

### （二）为何 requestAnimationFrame 不会卡
`requestAnimationFrame`能够做到精准严格的卡住显示器刷新的时间，比如普通显示器 60HZ 它会自动对应 17ms 执行一次，比如高级显示器 120HZ，它会自动对应 9ms 执行一次。当然`requestAnimationFrame`只会执行一次，想要使其多次执行，要写成递归的形式。

### （三）为何 `requestAnimationFrame`能够做到精准严格的卡住显示器刷新的时间
`requestAnimationFrame`能精准卡住显示器刷新时间主要有以下原因：

**一、浏览器协调**
浏览器将`requestAnimationFrame`纳入自身渲染循环管理，会在即将进行下一次屏幕重绘之前调用其回调函数，使其执行时机与浏览器渲染节奏紧密结合。根据设备刷新率及自身性能负载，在最佳时间点触发回调以确保动画流畅稳定。

**二、适配硬件特性**
不同显示器刷新率不同，`requestAnimationFrame`能根据当前设备实际刷新率自动调整执行时间间隔，如 60Hz 显示器大约每 16.67 毫秒执行一次回调以同步动画与屏幕刷新，120Hz 显示器则相应缩短执行间隔。

**三、避免不必要操作**
`requestAnimationFrame`只在浏览器确定需要屏幕更新时触发回调，避免不必要的计算和渲染，节省系统资源，确保动画在必要时更新，提高性能和流畅度。

## 七、requestAnimationFrame 应用场景举例 - 回到顶部组件
1. **效果图**：可去作者的网站（ashuai.work:8888/#/myBack）查看效果。
2. **代码**：
```html
<template>
    <transition name="fade-transform">
        <div
            v-show="visible"
            class="backWrap"
            :style="{
                bottom: bottom + 'px',
                right: right + 'px',
            }"
            @click="goToTop"
        >
            <slot></slot>
        </div>
    </transition>
</template>
<script>
export default {
    name: "myBack",
    props: {
        bottom: {
            type: Number,
            default: 72,
        },
        right: {
            type: Number,
            default: 72,
        },
        // 回到顶部出现的滚动高度位置
        showHeight: {
            type: Number,
            default: 240,
        },
        // 拥有滚动条的那个 dom 元素的 id 或者 class，用于下方选中操作更改滚动条滚动距离
        scrollBarDom: String,
    },
    data() {
        return {
            visible: false,
            scrollDom: null,
        };
    },
    mounted() {
        if (document.querySelector(this.scrollBarDom)) {
            this.scrollDom = document.querySelector(this.scrollBarDom);
            // 不用给 window 绑定监听滚动事件，给对应滚动条元素绑定即可
            this.scrollDom.addEventListener("scroll", this.isShowGoToTop, true);
        }
    },
    beforeDestroy() {
        // 最后要解除监听滚动事件
        this.scrollDom.removeEventListener("scroll", this.isShowGoToTop, true);
    },
    methods: {
        isShowGoToTop() {
            // 获取滚动的元素，即有滚动条的那个元素
            if (this.scrollDom.scrollTop > 20) {
                this.visible = true;
            } else {
                this.visible = false;
            }
        },
        goToTop() {
            // 获取滚动的元素，即有滚动条的那个元素
            let scrollDom = document.querySelector(this.scrollBarDom);
            // 获取垂直滚动的距离，看看滚动了多少了，然后不断地修改滚动距离直至为 0
            let scrollDistance = scrollDom.scrollTop;
            /**
             * window.requestAnimationFrame 兼容性已经可以了，正常都有的
             * */
            if (window.requestAnimationFrame) {
                let fun = () => {
                    scrollDom.scrollTop = scrollDistance -= 36;
                    if (scrollDistance > 0) {
                        window.requestAnimationFrame(fun); // 只执行一次，想多次执行需要再调用
                    } else {
                        scrollDom.scrollTop = 0;
                    }
                };
                window.requestAnimationFrame(fun);
                return;
            }
            /**
             * 没有 requestAnimationFrame 的话，就用定时器去更改滚动条距离，使之滚动
             * */
            let timer2 = setInterval(() => {
                scrollDom.scrollTop = scrollDistance -= 36;
                if (scrollDistance <= 0) {
                    clearInterval(timer2);
                    scrollDom.scrollTop = 0;
                }
            }, 17);
        },
    },
};
</script>
<style lang='less' scoped>
.backWrap {
    position: fixed;
    cursor: pointer;
    width: 42px;
    height: 42px;
    background: #9cc2e5;
    border-radius: 4px;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.5s;
}
// 过渡效果
.fade-transform-leave-active,
.fade-transform-enter-active {
    transition: all 0.36s;
}
.fade-transform-enter {
    opacity: 0;
    transform: translateY(-5px);
}
.fade-transform-leave-to {
    opacity: 0;
    transform: translateY(5px);
}
</style>
```
3. **GitHub 仓库地址**：github.com/shuirongshu…。另外，有一个做滚动的插件库，叫做`vue-seamless-scroll`，其内部实现原理也是基于`requestAnimationFrame`实现的。

## 八、类比学习 reduce 循环解决了 forEach 循环可能需要一个初始变量的问题
比如有了`forEach`循环，为啥还又新推出一个`reduce`循环呢？原因是某些场景下，`reduce`循环解决了`forEach`循环还需要再定义一个变量的问题。比如给一个数组求和，`forEach`写法需要定义一个`total`变量，而`reduce`写法比`forEach`少写了一个变量。
1. `forEach`写法：
```javascript
let arr = [1, 3, 5, 7, 9];
function forEachFn(params) {
    let total = 0;
    params.forEach((num) => {
        total = total + num;
    });
    return total;
}
let res1 = forEachFn(arr);
console.log(res1);
```
2. `reduce`写法：
```javascript
let arr = [1, 3, 5, 7, 9];
function reduceFn(params) {
    return params.reduce((temp, num) => {
        temp = temp + num;
        return temp;
    }, 0);
}
let res2 = reduceFn(arr);
console.log(res2);
```

