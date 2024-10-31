module.exports = {
    title: "mimi's blog",
    description: '这是我的文档网站',
    base: "/mimi_blog/",
    themeConfig: {
        nav: [
            { text: '主页', link: '/' },
            { text: '指南', link: '/guide' },
            { text: '前端面经', link: '/fe' },
        ],
        sidebar: {
            '/guide/': [
                {
                    text: '指南',
                    link: '/guide/',
                    collapsed: true, // 设置为 true 表示默认折叠
                    items: [
                        { text: '指南 1', link: '/guide/guide1' },
                        { text: '指南 2', link: '/guide/guide2' },
                        { text: '指南 3', link: '/guide/guide3' },
                    ],
                },
            ],
            '/fe/': [
                {
                    text: '浏览器',
                    link: '/fe/',
                    collapsed: false,
                    items: [
                        { text: '浏览器的组成', link: '/fe/article1' },
                        { text: '浏览器工作流程-渲染', link: '/fe/article2' },
                        { text: '浏览器的存储-缓存机制', link: '/fe/article3' },
                        // { text: '前端安全性相关-攻击方式-预防-cookie设置属性', link: '/fe/article4' },
                    ],
                },
                {
                    text: '安全',
                    link: '/fe/',
                    collapsed: false,
                    items: [
                        // { text: '浏览器的组成', link: '/fe/article4' },
                        // { text: '浏览器工作流程-渲染', link: '/fe/article2' },
                        // { text: '浏览器的存储-缓存机制', link: '/fe/article3' },
                        { text: '前端安全性相关-攻击方式-预防-cookie设置属性', link: '/fe/article4' },
                    ],
                },
            ],
        },
        footer: {
            copyright: 'Copyright © 2022-present Sophia-0212',
        },
    },
};