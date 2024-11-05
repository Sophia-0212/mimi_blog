# 后端一次性返回 10 万条数据的处理方案

## 一、问题描述
面试官：后端一次性返回 10 万条数据给你，你如何处理？

## 二、问题考察点
1. 考察前端如何处理大量数据。
2. 考察候选人对于大量数据的性能优化。
3. 考察候选人处理问题的思考方式。文末会提供完整代码，供大家更好的理解。

## 三、使用 express 创建一个十万条数据的接口
若是对 express 相关不太熟悉的话，有空可以看看笔者的这一篇全栈文章（还有完整代码哦）：《Vue+Express+Mysql 全栈项目之增删改查、分页排序导出表格功能》。
```javascript
route.get("/bigData", (req, res) => {
    res.header('Access-Control-Allow-Origin', '*'); // 允许跨域
    let arr = [] // 定义数组，存放十万条数据
    for (let i = 0; i < 100000; i++) { // 循环添加十万条数据
        arr.push({
            id: i + 1,
            name: '名字' + (i + 1),
            value: i + 1,
        })
    }
    res.send({ code: 0, msg: '成功', data: arr }) // 将十万条数据返回之
})
```

## 四、点击按钮，发请求，获取数据，渲染到表格上
## 五、方案一：直接渲染所有数据
如果请求到 10 万条数据直接渲染，页面会卡死的，很显然，这种方式是不可取的。
```javascript
<template>
  <div>
    <el-button :loading="loading" @click="plan">点击请求加载</el-button>
    <el-table :data="arr">
      <el-table-column type="index" label="序" />
      <el-table-column prop="id" label="ID" />
      <el-table-column prop="name" label="名字" />
      <el-table-column prop="value" label="对应值" />
    </el-table>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const arr = ref([]);
const loading = ref(false);

const plan = async () => {
  loading.value = true;
  const res = await axios.get('http://ashuai.work:10000/bigData');
  arr.value = res.data.data;
  loading.value = false;
};
</script>
```

## 六、方案二：使用定时器分组分批分堆依次渲染（定时加载、分堆思想）
1. 正常来说，十万条数据请求，需要 2 秒到 10 秒之间（有可能更长，取决于数据具体内容）。
2. 前端请求到 10 万条数据以后，先不着急渲染，先将 10 万条数据分堆分批次。比如一堆存放 10 条数据，那么十万条数据就有一万堆。使用定时器，一次渲染一堆，渲染一万次即可。这样做的话，页面就不会卡死了。
3. **分组分批分堆函数（一堆分 10 个）**：
```javascript
<template>
  <div>
    <el-button :loading="loading" @click="plan">点击请求加载</el-button>
    <el-table :data="arr">
      <el-table-column type="index" label="序" />
      <el-table-column prop="id" label="ID" />
      <el-table-column prop="name" label="名字" />
      <el-table-column prop="value" label="对应值" />
    </el-table>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

// 分组分批分堆函数
function averageFn(arr) {
  let i = 0;
  let result = [];
  while (i < arr.length) {
    result.push(arr.slice(i, i + 10));
    i = i + 10;
  }
  return result;
}

const arr = ref([]);
const loading = ref(false);

const plan = async () => {
  loading.value = true;
  const res = await axios.get('http://ashuai.work:10000/bigData');
  const twoDArr = averageFn(res.data.data);
  for (let i = 0; i < twoDArr.length; i++) {
    setTimeout(() => {
      arr.value = [...arr.value,...twoDArr[i]];
    }, 1000 * i);
  }
  loading.value = false;
};
</script>
```
这种方式，相当于在很短的时间内创建许多个定时任务去处理，定时任务太多了，也耗费资源啊。实际上，这种方式就有了大数据量分页的思想。

## 七、方案三：使用 requestAnimationFrame 替代定时器去做渲染
关于 requestAnimationFrame 比定时器的优点，道友们可以看笔者的这篇文章：《性能优化之通俗易懂学习 requestAnimationFrame 和使用场景举例》。
反正大家遇到定时器的时候，就可以考虑一下，是否可以使用请求动画帧进行优化执行渲染？
如果使用请求动画帧的话，就要修改一下代码写法了，前面的不变化，plan 方法中的写法变一下即可，注意注释：
```javascript
<template>
  <div>
    <el-button :loading="loading" @click="plan">点击请求加载</el-button>
    <el-table :data="arr">
      <el-table-column type="index" label="序" />
      <el-table-column prop="id" label="ID" />
      <el-table-column prop="name" label="名字" />
      <el-table-column prop="value" label="对应值" />
    </el-table>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

// 分组分批分堆函数
function averageFn(arr) {
  let i = 0;
  let result = [];
  while (i < arr.length) {
    result.push(arr.slice(i, i + 10));
    i = i + 10;
  }
  return result;
}

const arr = ref([]);
const loading = ref(false);

const plan = async () => {
  loading.value = true;
  const res = await axios.get('http://ashuai.work:10000/bigData');
  loading.value = false;
  const twoDArr = averageFn(res.data.data);
  const use2DArrItem = (page) => {
    if (page > twoDArr.length - 1) {
      console.log("每一项都获取完了");
      return;
    }
    requestAnimationFrame(() => {
      arr.value = [...arr.value,...twoDArr[page]];
      use2DArrItem(page + 1);
    });
  };
  use2DArrItem(0);
};
</script>
```

## 八、方案四：搭配分页组件，前端进行分页（每页展示一堆，分堆思想）
1. 这种方式，笔者曾经遇到过，当时的对应场景是数据量也就几十条，后端直接把几十条数据丢给前端，让前端去分页。后端不做分页的原因是。他当时临时有事情请假了，所以就前端去做分页了。
2. 数据量大的情况下，这种方式，也是一种解决方案。思路也是在所有数据的基础上进行截取。
3. **简要代码如下**：
```javascript
getShowTableData() {
    // 获取截取开始索引
    let begin = (this.pageIndex - 1) * this.pageSize;
    // 获取截取结束索引
    let end = this.pageIndex * this.pageSize;
    // 通过索引去截取，从而展示
    this.showTableData = this.allTableData.slice(begin, end);
}
```
完整案例代码，请看笔者的这篇文章：《后端一次性返回所有的数据，让前端截取展示做分页》。
实际上，这种大任务拆分成许多小任务，这种方式，做法，应用的思想就是分片的方式（时间），在别的场景，比如大文件上传的时候，也有这种思想，比如一个 500MB 的大文件，拆分成 50 个小文件，一个是 10MB 这样...至于大文件上传的文章，那就等笔者有空了再写呗...

## 九、方案五：表格滚动触底加载（滚动到底，再加载一堆）
1. 这里重点就是我们需要去判断，何时滚动条触底。判断方式主要有两种：
    - scrollTop + clientHeight >= innerHeight。
    - new MutationObserver()去观测。
    - 目前市面上主流的一些插件的原理，大致是这两种。
2. 笔者举例的这是，是使用的插件 v-el-table-infinite-scroll，本质上这个插件是一个自定义指令。对应 npm 地址：www.npmjs.com/package/el-…。当然也有别的插件，如 vue-scroller 等：一个意思，不赘述。
3. 注意，触底加载也是要分堆的，将发请求获取到的十万条数据，进行分好堆，然后每触底一次，就加载一堆即可。
4. **在 el-table 中使用 el-table-infinite-scroll 指令步骤**：
    - 安装，注意版本号（区分 vue2 和 vue3）：`cnpm install --save el-table-infinite-scroll@1.0.10`。
    - 注册使用指令插件：
    ```javascript
    // 使用无限滚动插件
    import elTableInfiniteScroll from 'el-table-infinite-scroll';
    Vue.use(elTableInfiniteScroll);
    ```
    - 因为是一个自定义指令，所以直接写在 el-table 标签上即可：
    ```html
    <el-table
        v-el-table-infinite-scroll="load"
        :data="tableData"
    >
        <el-table-column prop="id" label="ID" />
        <el-table-column prop="name" label="名字" />
    </el-table>
    ```
    - async load()方法：触底加载，展示数据...。
5. **案例代码**：
```html
<template>
    <div class="box">
        <el-table
            v-el-table-infinite-scroll="load"
            height="600"
            :data="tableData"
            border
            style="width: 80%"
            v-loading="loading"
            element-loading-text="数据量太大啦，客官稍后..."
            element-loading-spinner="el-icon-loading"
            element-loading-background="rgba(255, 255, 255, 0.5)"
            :header-cell-style="{
            height: '24px',
            lineHeight: '24px',
            color: '#606266',
            background: '#F5F5F5',
            fontWeight: 'bold',
            }"
        >
            <el-table-column type="index" label="序" />
            <el-table-column prop="id" label="ID" />
            <el-table-column prop="name" label="名字" />
            <el-table-column prop="value" label="对应值" />
        </el-table>
    </div>
</template>
<script>
// 分堆函数
function averageFn(arr) {
    let i = 0;
    let result = [];
    while (i < arr.length) {
        result.push(arr.slice(i, i + 10)); // 一次截取 10 个用于分堆
        i = i + 10; // 这 10 个截取完，再准备截取下 10 个
    }
    return result;
}
import axios from "axios";
export default {
    data() {
        return {
            allTableData: [], // 初始发请求获取所有的数据
            tableData: [], // 要展示的数据
            loading: false
        };
    },
    // 第一步，发请求，获取大量数据，并转成二维数组，分堆分组分块存储
    async created() {
        this.loading = true;
        const res = await axios.get("http://ashuai.work:10000/bigData");
        this.allTableData = averageFn(res.data.data); // 使用分堆函数，存放二维数组
        // this.originalAllTableData = this.allTableData // 也可以存一份原始值，留作备用，都行的
        this.loading = false;
        // 第二步，操作完毕以后，执行触底加载方法
        this.load();
    },
    methods: {
        // 初始会执行一次，当然也可以配置，使其不执行
        async load() {
            console.log("自动多次执行之，首次执行会根据高度去计算要执行几次合适");
            // 第五步，触底加载相当于把二维数组的每一项取出来用，取完用完时 return 停止即可
            if (this.allTableData.length == 0) {
                console.log("没数据啦");
                return;
            }
            // 第三步，加载的时候，把二维数组的第一项取出来，拼接到要展示的表格数据中去
            let arr = this.allTableData[0];
            this.tableData = this.tableData.concat(arr);
            // 第四步，拼接展示以后，再把二维数组的第一项的数据删除即可
            this.allTableData.shift();
        },
    },
};
</script>
```

## 十、方案六：使用无限加载/虚拟列表进行展示
1. **什么是虚拟列表？**
所谓的虚拟列表实际上是前端障眼法的一种表现形式。看到的好像所有的数据都渲染了，实际上只渲染可视区域的部分罢了。有点像我们看电影，我们看的话，是在一块电影屏幕上，一秒一秒的看（不停的放映）。但是实际上电影有俩小时，如果把两个小时的电影都铺开的话，那得需要多少块电影屏幕呢？同理，如果 10 万条数据都渲染，那得需要多少 dom 节点元素呢？所以我们只给用户看，他当下能看到的。如果用户要快进或快退（下拉滚动条或者上拉滚动条），再把对应的内容呈现在电影屏幕上（呈现在可视区域内）。这样就实现了看着像是所有的 dom 元素每一条数据都有渲染的障眼法效果了。关于前端障眼法，在具体工作中，如果能够巧妙使用，会大大提升我们的开发效率的。
2. **写一个简单的虚拟列表**：
# 虚拟列表组件

## 一、HTML 结构
```html
<template>
    <!-- 虚拟列表容器 -->
    <div
        class="virtualListWrap"
        ref="virtualListWrap"
        @scroll="handleScroll"
        :style="{ height: itemHeight * count + 'px' }"
    >
        <!-- 占位 dom 元素，高度为所有数据总高度 -->
        <div class="placeholderDom" :style="{ height: allListData.length * itemHeight + 'px' }"></div>
        <!-- 内容区，展示部分数据，top 值变化 -->
        <div class="contentList" :style="{ top: topVal }">
            <!-- 遍历展示数据项 -->
            <div
                v-for="(item, index) in showListData"
                :key="index"
                class="itemClass"
                :style="{ height: itemHeight + 'px' }"
            >
                {{ item.name }}
            </div>
        </div>
        <!-- 加载中部分 -->
        <div class="loadingBox" v-show="loading">
            <i class="el-icon-loading"></i>&nbsp;&nbsp;<span>loading...</span>
        </div>
    </div>
</template>
```

## 二、JavaScript 部分
```javascript
import axios from "axios";

export default {
    data() {
        return {
            allListData: [], // 存放所有数据，如十万条数据
            itemHeight: 40, // 每条数据项高度
            count: 10, // 一屏展示的数据条数
            start: 0, // 开始位置索引
            end: 10, // 结束位置索引
            topVal: 0, // 用于联动定位
            loading: false,
        };
    },
    computed: {
        // 计算要展示的数据
        showListData() {
            return this.allListData.slice(this.start, this.end);
        },
    },
    async created() {
        this.loading = true;
        const res = await axios.get("http://ashuai.work:10000/bigData");
        this.allListData = res.data.data;
        this.loading = false;
    },
    methods: {
        // 处理滚动事件
        handleScroll() {
            const scrollTop = this.$refs.virtualListWrap.scrollTop;
            this.start = Math.floor(scrollTop / this.itemHeight);
            this.end = this.start + this.count;
            this.topVal = this.$refs.virtualListWrap.scrollTop + "px";
        },
    },
};
```

## 三、样式部分
```less
// 虚拟列表容器盒子样式
.virtualListWrap {
    box-sizing: border-box;
    width: 240px;
    border: solid 1px #000000;
    // 开启滚动条
    overflow-y: auto;
    // 开启相对定位
    position: relative;

   .contentList {
        width: 100%;
        height: auto;
        // 搭配使用绝对定位
        position: absolute;
        top: 0;
        left: 0;

       .itemClass {
            box-sizing: border-box;
            width: 100%;
            height: 40px;
            line-height: 40px;
            text-align: center;
        }

        // 奇偶行不同颜色
       .itemClass:nth-child(even) {
            background: #c7edcc;
        }
       .itemClass:nth-child(odd) {
            background: pink;
        }
    }

   .loadingBox {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(255, 255, 255, 0.64);
        color: green;
        display: flex;
        justify-content: center;
        align-items: center;
    }
}
```
1. **使用 vxetable 插件实现虚拟列表**：
如果不是列表，是 table 表格的话，笔者这里推荐一个好用的 UI 组件，vxetable，看名字就知道做的是表格相关的业务。其中就包括虚拟列表。
vue2 和 vue3 版本都支持，性能比较好，官方说：虚拟滚动（最大可以支撑 5w 列、30w 行）。强大！
官方网站地址：vxetable.cn/v3/#/table/…。
**安装使用代码**：
注意安装版本，笔者使用的版本如下：
`cnpm i xe-utils vxe-table@3.6.11 --save`。
`main.js`：
```javascript
// 使用 VXETable
import VXETable from 'vxe-table';
import 'vxe-table/lib/style.css';
Vue.use(VXETable);
```
代码方面也很简单，如下：
```html
<template>
    <div class="box">
        <vxe-table
            border
            show-overflow
            ref="xTable1"
            height="300"
            :row-config="{ isHover: true }"
            :loading="loading"
        >
            <vxe-column type="seq"></vxe-column>
            <vxe-column field="id" title="ID"></vxe-column>
            <vxe-column field="name" title="名字"></vxe-column>
            <vxe-column field="value" title="对应值"></vxe-column>
        </vxe-table>
    </div>
</template>
<script>
import axios from "axios";
export default {
    data() {
        return {
            loading: false,
        };
    },
    async created() {
        this.loading = true;
        const res = await axios.get("http://ashuai.work:10000/bigData");
        this.loading = false;
        this.render(res.data.data);
    },
    methods: {
        render(data) {
            this.$nextTick(() => {
                const $table = this.$refs.xTable1;
                $table.loadData(data);
            });
        },
    },
};
</script>
```

## 十一、方案七：开启多线程 Web Worker 进行操作
本案例中，使用 Web Worker 另外开启一个线程去操作代码逻辑，收益并不是特别大（假如使用虚拟滚动列表插件的情况下）。不过也算是一个拓展的思路吧，面试的时候，倒是可以说一说，提一提。
对 Web Worker 不熟悉的道友们，可以看看笔者之前的这篇文章：《性能优化之使用 vue-worker 插件（基于 Web Worker）开启多线程运算提高效率》。

## 十二、方案八：未雨绸缪，防患于未然
1. 在上述解决方案都说完以后，并没有结束。实际上本题目在考查候选人知识的广度和深度以外，更是考查了候选人的处理问题的思考方式，这一点尤其重要！
2. 如果笔者是候选人，笔者在说了上述 7 种方案以后，会再补充第八种方案：未雨绸缪，防患于未然。
    - **场景模拟**：
面试官随意打量着其手中我的简历，抚须怪叫一声：“小子，后端要一次性返回 10 万条数据给你，你如何处理？”
我眉毛一挑，歪嘴一笑：“在上述 7 种方案陈述完以后，我想类似的问题，我们可以从根本上去解决。即第八种方案，要未雨绸缪，防患于未然。”
“哦？”面试官心中疑惑，缓缓放下我的简历：“愿闻其详。”
我不紧不慢地答道：“在具体开发工作中，我们在接到一个需求时，在技术评审期间，我们就要和后端去商量比较合适的技术解决方案。这个问题是后端要一次性返回我 10 万条数据，重点并不在 10 万条这么多数据，而在于后端为什么要这样做？”
面试官抬头，瞳孔中倒映出我的身影，认真听了起来。
我一字一顿地说道：“除去**业务真正需要这种方案**的话（若是客户要求的，那就没啥好说的，干就完了），后端这样做的原因大致有两种，第一种他不太懂 sql 的 limit 语句，但这基本不可能，第二种就是他有事情，随便敷衍写了一下。所以，就是要和他沟通，从大数据量接口请求时长过长，以及过多的 dom 元素渲染导致性能变差，以及项目的可维护性等角度去沟通，我相信只要正确的沟通，就能从根源上去避免这种不太合理的情况发生。”
面试官又突然狡黠地发问：“要是沟通以后，后端死活不给你分页呢？你咋办？嗨嗨！你的沟通无效果！你如何处理！人家不听你的！”似乎是觉得这个问题很刁钻，他双臂抱在胸前，靠在椅背上，发出桀桀桀的诡异笑声，他等待着看到我脸上即将绽放的回答不上来的，尴尬笑容。
我内心冷哼一声：雕虫小技...
我盯着面试官的眼睛，认真说道：“如果工作中沟通无效果，要么是我自己沟通语言表达的问题，这一点我会注意，不断提升自己的沟通技巧和说话方式，要么就是...”
我声音扬起了三分：“我沟通的这个人有问题！他工作摸鱼偷懒耍滑！固执己见！为难他人！高高在上！自以为是！这种情况下，我会找到我的直属领导去介入，因为这已经不是项目的需求问题了，而是员工的基本素养问题！”
停顿了一秒，我声音又柔和了几分：“但是，但是我相信咱们公司员工中是绝对没有这样的人存在的，各个都是能力强悍，态度端正的优秀员工。毕竟咱们公司在行业中久负盛名，我也是因此慕名而来的。您说对吧？”
面试官眼中闪过震惊之色，他没有想到我居然把皮球又踢给他了，不过他为了维持形象，旋即恢复了镇定，只是面部肌肉在止不住的微微颤抖。
“那是当然，公司人才济济。”面试官随口接话道。
我又补充道：“实际上在工作中，前端作为比较贴近用户的角色而言，需要和各个岗位的同事进行沟通，比如后端、产品、UI、测试等。我们需要通过合理的沟通方式，去提升工作效率，完成项目，实现自己的价值，为公司创造收益，我想这是每一个员工需要做的，也是必须要做到的。”
面试官又抚须怪叫一声：“小子表现还行，你被录用了！一个月工资 2200，自带电脑，无社无金，007 工作制，不能偷吃公司零食，以及...”
我：阿哒...

## 十三、总结
有效的沟通，源自于解决问题的思维模式，在多数情况下，重要性，大于当下所掌握的技术知识点。
网站效果演示地址：ashuai.work:8888/#/bigData。
GitHub 仓库地址：github.com/shuirongshu…。
如果觉得文章帮到了您，欢迎不吝 star 哦 ^_^。
本文正在参加「金石计划」，快来看看吧...