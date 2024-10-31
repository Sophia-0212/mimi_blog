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
                        { text: '浏览器的组成', link: '/fe/browser1' },
                        { text: '浏览器工作流程-渲染', link: '/fe/browser2' },
                        { text: '浏览器的存储-缓存机制', link: '/fe/browser3' },
                        // { text: '前端安全性相关-攻击方式-预防-cookie设置属性', link: '/fe/article4' },
                    ],
                },
                {
                    text: '安全',
                    link: '/fe/',
                    collapsed: false,
                    items: [
                        { text: '安全-Cookie相关与HttpOnly', link: '/fe/safety1' },
                        { text: '安全-三种攻击方式', link: '/fe/safety2' },
                        { text: '安全-内容安全策略CSP', link: '/fe/safety3' },

                        
                    ],
                },
            ],
        },
        footer: {
            copyright: 'Copyright © 2022-present Sophia-0212',
        },
    },
};