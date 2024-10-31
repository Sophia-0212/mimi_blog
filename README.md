网站访问：https://sophia-0212.github.io/mimi_blog/

VitePress 是一个基于 Vite 的静态网站生成器，专注于构建文档网站。以下是如何使用 VitePress 的详细步骤：

## 1. 安装 VitePress

首先，你需要在你的项目中安装 VitePress。可以通过 npm 或 yarn 来完成：

```LESS
# 使用 npm
npm install vitepress --save-dev

# 使用 yarn
yarn add vitepress --dev
```


## 2. 创建项目结构

在你的项目根目录下，创建一个名为 `docs` 的文件夹。VitePress 会在这个文件夹中查找你的文档。

```LESS
mkdir docs
```


### 目录结构示例

```LESS
my-project
├── docs
│   ├── .vitepress
│   │   └── config.js
│   ├── index.md
│   └── guide.md
└── package.json
```


## 3. 配置 VitePress

在 `docs` 文件夹中，创建一个 `.vitepress` 文件夹，并在其中创建 `config.js` 文件。这是 VitePress 的配置文件。

### 示例配置

```LESS
// docs/.vitepress/config.js
module.exports = {
  title: '我的文档',
  description: '这是我的文档网站',
  themeConfig: {
    nav: [
      { text: '主页', link: '/' },
      { text: '指南', link: '/guide' },
    ],
    sidebar: [
      { text: '指南', link: '/guide' },
    ],
  },
}
```


## 4. 创建文档

在 `docs` 文件夹中，创建 Markdown 文件。例如，创建 `index.md` 和 `guide.md` 文件。

### `index.md` 示例

```LESS
# 欢迎来到我的文档

这是一个使用 VitePress 创建的文档网站。
```


### `guide.md` 示例

```LESS
# 使用指南

这里是如何使用 VitePress 的指南。
```


## 5. 启动开发服务器

在项目根目录下，打开终端并运行以下命令启动开发服务器：

```LESS
npx vitepress dev docs
```


访问 `http://localhost:3000`，你就可以看到你的文档网站了。

## 6. 构建静态网站

完成文档后，可以运行以下命令来构建静态网站：

```LESS
npx vitepress build docs
```


构建完成后，生成的静态文件会放在 `docs/.vitepress/dist` 目录下。

## 7. 部署

你可以将构建生成的文件部署到任何静态网站托管服务，例如 GitHub Pages、Netlify 等。

### GitHub Pages 部署示例

1. 在你的项目根目录下，运行以下命令来初始化 Git 仓库（如果尚未初始化）：

  ```LESS
git init
```


2. 添加并提交你的文件：

  ```LESS
git add .
git commit -m "Initial commit"
```


3. 创建一个 `gh-pages` 分支并推送：

  ```LESS
git checkout -b gh-pages
git add docs/.vitepress/dist
git commit -m "Deploy to GitHub Pages"
git push -u origin gh-pages
```



