# 简易版Chat-GPT 

简易版chat-gpt

## 依赖

- `eventsource-parser`：`event/text-stream` 流解析完整数据包
- `express`：提供服务
- `node-fetch`：向 openai 发起请求

## 流程





## 实现功能

- [x] 聊天

  - API 密钥访问，消耗 tokens ，有限制。
  - web 令牌访问，无限制

- [x] 补全

  - 通过微调之后的自定义模型

- [x] 提示

  - 提词列表

- [x] 聊天记录

- [x] 动态模型

- [x] 动态参数

  - 开发调试

- [x] 支持理解上下文

- [x] 代码格式化

- [x] 数据导出

- [x] 保存消息到本地图片

## 系统配置

### 访问令牌

您可以通过登录 ChatGPT Web 应用程序然后打开 来手动获取https://chat.openai.com/api/auth/session，这将返回包含您的accessToken字符串的 JSON 对象。

#### 反向代理

由社区成员运行的已知反向代理包括：

| 反向代理 URL                                     | 作者                                         | 速率限制                  | 最后检查           |
| ------------------------------------------------ | -------------------------------------------- | ------------------------- | ------------------ |
| `https://ai.fakeopen.com/api/conversation`       | [@pengzhile](https://github.com/pengzhile)   | 5 个请求/10 秒（按 IP）   | 2023 年 4 月 18 日 |
| `https://api.pawan.krd/backend-api/conversation` | [@PawanOsman](https://github.com/PawanOsman) | 50 个请求/15 秒（~3 r/s） | 2023 年 3 月 23 日 |

已代理的接口详情：访问 https://status.fakeopen.com/

**注意**：使用反向代理会将您的访问令牌暴露给第三方。这应该不会产生任何不利影响，但在使用此方法之前请考虑风险。

### 接口密钥

从以下地址获取接口密钥 https://platform.openai.com/account/api-keys

### 配置文件env


```
# 端口
PORT=8080
# 是否开启控制台日志
DEBUG=true

# 聊天接口地址 官方：https://api.openai.com/v1/chat/completions；社区代理：https://ai.fakeopen.com/v1/chat/completions
API_CHAT_URL=https://ai.fakeopen.com/v1/chat/completions

# 补全接口（微调模型）地址 官方：https://api.openai.com/v1/completions；社区代理：https://ai.fakeopen.com/v1/completions
API_COM_URL=https://ai.fakeopen.com/api/completions

# 模型地址 官方：https://api.openai.com/v1/models；社区代理：https://ai.fakeopen.com/api/models
API_MODEL_URL=https://ai.fakeopen.com/api/models

# 浏览器 TOKEN 访问地址，免费无限制。详情浏览 https://status.fakeopen.com/
API_WEB_URL=https://ai.fakeopen.com/api/conversation

# 接口访问密钥 KEY 
#API_KEY=

# 浏览器 TOKEN 访问凭证 
ACCESS_TOKEN=
```

## 演示


![](https://raw.githubusercontent.com/systemmin/chat-gpt-simple/main/docs/1.png)

![](https://raw.githubusercontent.com/systemmin/chat-gpt-simple/main/docs/2.png)

![](https://raw.githubusercontent.com/systemmin/chat-gpt-simple/main/docs/3.png)

![](https://raw.githubusercontent.com/systemmin/chat-gpt-simple/main/docs/4.png)

![](https://raw.githubusercontent.com/systemmin/chat-gpt-simple/main/docs/5.png)


## 安装

命令行界面

```sh
npm install 
```

## 启动

命令行界面

```sh
npm run dev
```

### 兼容性
node >= 18

## 参考

- 在此鸣谢 [@transitive-bullshit ](https://github.com/transitive-bullshit/)，[@pengzhile](https://github.com/pengzhile) ，[Chanzhaoyu](https://github.com/Chanzhaoyu) ，[PlexPt](https://github.com/PlexPt) 
- 参考仓库
  - https://github.com/transitive-bullshit/chatgpt-api（接口）
  - https://github.com/Chanzhaoyu/chatgpt-web（前端页面）
  - https://github.com/PlexPt/awesome-chatgpt-prompts-zh（提示词）

## License

MIT © [systemmin](https://dtking.cn/)
