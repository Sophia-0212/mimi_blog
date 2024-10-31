四、前端安全性相关-攻击方式-预防-cookie设置属性
## 1.Cookie相关与HttpOnly


1. **什么是`HttpOnly`？为什么我们需要它？**

`HttpOnly` 是一个用于设置 HTTP Cookie 的属性，它的作用是限制客户端（通常是浏览器）对 Cookie 的访问，只允许通过 HTTP 或 HTTPS 协议进行访问，而禁止通过脚本（如 JavaScript）进行访问。

使用 `HttpOnly` 属性可以提高 Web 应用程序的安全性：防止跨站脚本攻击（XSS）：浏览器将禁止 JavaScript 访问带有该属性的 Cookie


2. **除了`HttpOnly`，哪些其他标志或属性可以提高Cookie的安全性？**


- `Secure` 属性：只允许通过 HTTPS 连接传输 Cookie。

- `SameSite` 属性：`SameSite` 属性用于定义 Cookie 发送的规则，以防止跨站点请求伪造（CSRF）攻击。可以将 `SameSite` 属性设置为以下值之一：`Strict`、`Lax` 或 `None`。`Strict` 模式完全禁止跨站点发送 Cookie，`Lax` 模式在导航到目标站点之前仅允许在安全上下文(指顶导)中发送 Cookie，而 `None` 模式允许在任何情况下发送 Cookie（需要同时设置 `Secure` 属性）。使用适当的 `SameSite` 设置可以限制 Cookie 的发送范围，减少 CSRF 攻击的风险。

- `Domain` 属性：通过设置 `Domain` 属性，可以限制 Cookie 的作用域。将 `Domain` 属性设置为与当前网站的主域名匹配，可以防止恶意网站访问到另一个网站的 Cookie。这可以提高 Cookie 的隔离性和安全性。

- `Path` 属性：设置Cookie的可发送路径。这样可以防止其他路径下的恶意脚本访问和窃取 Cookie。

- 定期更新和轮换 Cookie：定期更改敏感 Cookie 的值，增加攻击者窃取 Cookie 的难度。同时，使用有限的有效期限制 Cookie 的生命周期。

- CSP（内容安全策略）：通过 CSP，可以定义网页可以加载的资源源，限制恶意脚本的执行和 Cookie 的访问。


```javascript
res.cookie('cookieName', 'cookieValue', { 
  httpOnly: true,
  secure: true,
  sameSite: 'Strict',
  domain: 'example.com',
  path: '/'
});
```


**`SameSite`场景：**
那我如果设置SameSite中的Strict，那是不是完全禁止跨站点发送 Cookie。也就是在evil.com里面点<img src="https://img-home.csdnimg.cn/images/20230724024159.png?origin_url=https%3A%2F%2Fbank.com%2Ftransfer%3Fto%3Dattacker%26amount%3D1000&pos_id=img-kXng9Qhn-1694418053406)" width="0" height="0">。也不会携带cookie了？

SameSite` 属性是一个相对较新的 Cookie 属性，用于增强浏览器中的跨站点请求的安全性。该属性有三个可能的值：`Strict`、`Lax` 和 `None`。

- 当设置为 `SameSite=Strict` 时，该 Cookie 仅在请求来自同一站点时发送。这意味着，即使用户已经在 `bank.com` 上登录，如果他们访问了 `evil.com` 并从那里尝试通过 `<img>` 标签或任何其他方式触发一个跨站点请求，浏览器将不会附带与 `bank.com` 相关的任何 `SameSite=Strict` 的 Cookie。

- `SameSite=Lax` 是一个稍微宽松一点的版本，它允许一些安全的跨站点请求（例如GET请求）携带 Cookie，但不允许跨站点的 POST 请求携带 Cookie。这可以避免许多 CSRF 攻击，同时仍然允许某些跨站点的使用场景。

- `SameSite=None` 意味着 Cookie 可以在任何跨站点请求中发送，但这需要与 `Secure` 标志一起使用，这意味着 Cookie 只能通过 HTTPS 发送。

为了增强安全性，许多现代浏览器已经开始更改其对 `SameSite` 的默认行为，将其默认设置为 `Lax`。这就是为什么在某些场景中，如果没有明确设置 `SameSite` 属性，您可能会看到一些关于 Cookie 行为的变化。

综上所述，设置 `SameSite=Strict` 确实可以大大减少 CSRF 攻击的风险，因为它会完全阻止跨站点发送 Cookie。



**如何理解Samesite = Lax?：**

1. 假设用户已登录`bank.com`并获取了一个带有`SameSite=Lax`属性的cookie。
2. 用户访问一个第三方的恶意网站`evil.com`。
3. 在`evil.com`上有一个尝试利用CSRF漏洞发起的XHR请求，目标是`bank.com/transferMoney`。由于cookie设置为`Lax`，这个跨站XHR请求不会携带`bank.com`的cookie，从而防止了潜在的CSRF攻击。
4. 但是，如果用户在`evil.com`上点击一个指向`bank.com`的链接，由于这是一个**顶层导航请求**，`bank.com`的cookie将会被发送，尽管是从`evil.com`触发的。

**总结：转账请求不携带cookie，顶层导航请求携带cookie，从而确保不破坏用户的正常浏览体验.**




**SameSite与Secure的不同：**
- `SameSite` 属性用来控制 Cookie 是否能够在**跨站请求中被发送**。
- `Secure` 属性确保 Cookie **只能通过 HTTPS 协议发送**。

**如何理解Domain属性？：**

`Domain`属性在Cookie中定义了**哪些域名可以访问该Cookie**。它有助于定义Cookie的范围。

默认情况下，Cookie只能**被创建它的页面所访问**。但是，如果你设置了`Domain`属性，这个Cookie就可以被此域下的其他**子域**所访问。

**那cookie的domain属性，能解决cookie的跨域问题吗？**
回到你的问题，domain 属性解决的其实**不是通常意义上的“跨域问题”，而是主域下的子域名共享问题**。跨完全不同的域（例如 example.com 和 another.com）之间是无法共享 cookie 的，无论如何设置 domain 属性。如果你需要在完全不同的域名之间共享信息，你可能需要使用其他方法，如 **JSONP、CORS 或服务器间的通信**。

**如何在JavaScript中设置和读取Cookies？**

在JavaScript中，可以使用`document.cookie`属性来读取和设置cookies。


