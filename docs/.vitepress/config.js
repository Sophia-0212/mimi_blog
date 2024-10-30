module.exports = {
    title: "mimi's blog",
    description: '这是我的文档网站',
    themeConfig: {
        nav: [
            { text: '主页', link: '/' },
            { text: '指南', link: '/guide' },
            { text: '博客', link: '/blog' },
        ],
        sidebar: {
            '/guide/': [
                { text: '指南', link: '/guide/' },
                { text: '指南1', link: '/guide/guide1' },
                { text: '指南2', link: '/guide/guide2' },
                { text: '指南3', link: '/guide/guide3' },
            ],
            '/blog/': [
                { text: '博客', link: '/blog/' },
                { text: '文章1', link: '/blog/article1' },
                { text: '文章2', link: '/blog/article2' },
            ],
        },
        footer: {
            copyright: 'Copyright © 2022-present Sophia-0212',
        },
    },
}