# chat-web

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

### 接口定义

| 接口     | 请求方式 | 描述         |
| -------- | -------- | ------------ |
| /model   | get      | 获取模型列表 |
| /event   | post     | 发送消息事件 |
| /tips    | get      | 获取提示列表 |
| /history | get      | 获取对话记录 |

```json
// 对话记录
{
    "id": "2525555555555/回话id",
    "title": "标题/可修改，默认获取第一条发送内容",
    "time": "1215454545时间戳",
    "list": [
        {
            "id": "id",
            "role": "user",
            "content": "内容",
            "time": "时间戳"
        },
        {
            "id": "id",
            "role": "assistan",
            "content": "内容",
            "time": "时间戳"
        }
    ]
}
// API_KEY Chat-GPT模型 发送消息
{
    config:{
    "model": "",
    "max_tokens": 256,
    "temperature": 1,
    "api_key": "",
    "asset_token":"",
    key_messages:[
    {
        "id": "id",
        "role": "user",
        "content": "内容",
        "time": "时间戳"
    },
    {
        "id": "id",
        "role": "assistan",
        "content": "内容",
        "time": "时间戳"
    }
	],
    token_message:
       { 
        "id": "id",
        "parent_message_id":'',
        "conversation_id":'',
        "role": "assistan",
        "content": "内容",
        "time": "时间戳"
	},
    prompt_message:'',l
    
}
```

js

```js
	const postData = {
		action: "next",
		messages: [{
			id: generateUUID(),
			role: "user",
			content: {
				content_type: "text",
				parts: [
					"目前比较成熟的人工智能系统有哪些？"
				]
			}
		}],
		model: "gpt-3.5-turbo",
		parent_message_id: generateUUID(),
		// conversation_id: generateUUID()
	};
```

