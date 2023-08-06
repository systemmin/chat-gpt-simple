const fs = require('fs');
const path = require('path');
const express = require('express');
const fetch = require('node-fetch');
const Result = require("./result.js");
const sourceParser = require('eventsource-parser');
const c = require('ansi-colors');

const {
	Console
} = require('node:console');
const output = fs.createWriteStream('./stdout.log');
const errorOutput = fs.createWriteStream('./stderr.log');

const logger = new Console({
	stdout: output,
	stderr: errorOutput
});
/**
 * 
 * 解析获取 json 数据
 */
const app = express();
app.use(express.json());
require('dotenv').config()
/**
 * 常量
 */
const PORT = process.env.PORT || 8080;
const API_WEB_URL = process.env.API_WEB_URL;
const API_CHAT_URL = process.env.API_CHAT_URL;
const API_MODEL_URL = process.env.API_MODEL_URL;
const API_COM_URL = process.env.API_COM_URL;
const API_KEY = process.env.API_KEY;
const DEBUG = process.env.DEBUG === 'true'
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

if (!API_KEY && !ACCESS_TOKEN) {
	// throw new Error("API 密钥与 ACCESS_TOKEN 同时为空");
	console.log(c.red('===> API_KEY 密钥与 ACCESS_TOKEN 同时为空'));
	process.exit(0)
}
if (ACCESS_TOKEN && !API_WEB_URL) {
	console.log(c.red('===> API_WEB_URL 为空'));
	process.exit(0)
}
// 将静态资源目录设置为 publicPath
app.use(express.static('public'));

//处理跨域请求
app.all('*', function(req, res, next) {
	//允许的来源
	res.header("Access-Control-Allow-Origin", "*");
	//允许的头部信息，如果自定义请求头，需要添加以下信息，允许列表可以根据需求添加
	res.header("Access-Control-Allow-Headers",
		"Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild");
	//允许的请求类型
	res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
	next();
})

/**
 * 全局异常
 */
process.on('uncaughtException', (err) => {
	console.error('未捕获的异常:', err);
});



/**
 * @description 客户端请求，请求转发
 * @author Mr.FANG
 * @time 2023年7月29日
 */
app.post('/events/', (req, res) => {
	const body = req.body
	if (DEBUG) {
		logger.info('web=>请求参数:', body)
	}

	res.setHeader('Context-type', 'text/event-stream');
	res.setHeader('Cache-Control', 'no-cache');
	res.setHeader('Connection', 'keep-alive');
	res.flushHeaders();
	// 处理消息内容
	const messages = body.messages || [];
	// 参数封装
	const postData = {
		model: body.config?.model ? body.config.model : "gpt-3.5-turbo",
		messages: [{
				"role": "system",
				"content": "你是一个乐于助人的助手."
			},
			...messages
		],
		max_tokens: body.config?.max_tokens ? body.config.max_tokens : 256,
		temperature: body.config?.temperature ? body.config.temperature : 1,
		stream: true, // 返回流
	};
	if (body.prompt) {
		postData.prompt = body.prompt; // 新增
		delete postData['messages']; // 删除 message 对象
	}
	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${API_KEY}`,
		},
		body: JSON.stringify(postData)
	};
	if (DEBUG) {
		logger.info('node=>请求参数:', options)
	}
	let error_content = '';
	const parser = sourceParser.createParser((event) => {
		const data = event.data;
		if (!data.includes('[DONE]')) {
			const result = JSON.parse(data);
			const msg = {
				id: result.id,
				content: body.prompt ? result.choices[0].text : result.choices[0].delta.content,
				role: 'assistant',
				created: result.created
			}
			res.write('data:' + JSON.stringify(msg) + "\n\n");
		}
	})
	// 补全和聊天接口处理
	const url = body.prompt ? API_COM_URL : API_CHAT_URL;
	fetch(url, options)
		.then(response => {
			if (DEBUG) {
				logger.info('node<=请求URL:', url)
				logger.info('node<=响应状态:', response.status)
				logger.info('node<=响应标识:%s', response.ok)
				logger.info('node<=响应状态:', response.status)
				logger.info('node<=响应文本:', response.statusText)
				const contentType = response.headers.get('content-type');
				logger.info('node<=响应类型:', contentType)
				logger.info('node<=header:', response.headers.raw())
			}
			const body = response.body
			body.on('readable', () => {
				let chunk;
				while (null !== (chunk = body.read())) {
					if (response.status !== 200) {
						error_content += chunk.toString();
					}
					parser.feed(chunk.toString());
				}
			});
			body.on('end', () => {
				if (response.status !== 200) {
					let msg = error_content.replaceAll(/\s|\n/g, '') + '\n\n';
					console.error(msg)
					res.write('data:' + msg + '\n\n')
					if (DEBUG) {
						logger.error('node=>响应异常:', msg)
					}
				}
				res.write('data:[DONE]\n\n');
				res.end();
			})
		});
})

/**
 * @description 获取所有模型
 */
app.get('/models', async (req, res) => {
	const options = {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${API_KEY}`,
		},
	};
	const models_path = './data/models.json';
	const exits = fs.existsSync(models_path)
	if (!exits) {
		const data = await request(API_MODEL_URL, options);
		const json = data.stringify();
		res.json(json);
		fs.writeFile(models_path, JSON.stringify(json), (err) => {
			if (err) {
				console.error('保存失败：', err);
			} else {
				console.log('保存成功！');
			}
		});
	} else {
		//  加载本地缓存数据
		const data = await fs.readFileSync(models_path);
		res.json(JSON.parse(data))
	}

})

/**
 * @description uuid
 */
const uuid = () => {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0,
			v = c === 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}

/**
 * @description 通过 token 访问 chat GPT
 */
app.post('/chat/token', async (req, res) => {
	res.setHeader('Context-type', 'text/event-stream');
	res.setHeader('Cache-Control', 'no-cache');
	res.setHeader('Connection', 'keep-alive');
	res.flushHeaders();
	// 获取客户端请求参数
	const body = req.body;
	if (DEBUG) {
		logger.info('web=>请求参数:', body)
	}
	const postData = {
		action: "next",
		messages: [{
			id: uuid(),
			role: "user",
			content: {
				content_type: "text",
				parts: [body.content]
			}
		}],
		model: "gpt-3.5-turbo",
		parent_message_id: body.parent_message_id ? body.parent_message_id : uuid(),
	};
	if (body.conversation_id) {
		postData.conversation_id = body.conversation_id;
	}
	// 创建  stream 流解析器，每一次返回数据可能不完整；
	const parser = sourceParser.createParser((event) => {
		if (event.type === "event") {
			let data = event.data;
			if (!data.includes('[DONE]')) {
				const result = JSON.parse(data);
				if (result.message) {
					const msg = {
						id: result.message.id,
						role: "assistant",
						content: result.message.content.parts[0],
						parent_id: result.message.metadata.parent_id,
						conversation_id: result.conversation_id
					}
					res.write('data:' + JSON.stringify(msg) + "\n\n");
				}
			}
		}
	});
	const options = {
		method: 'POST',
		headers: {
			'Accept': 'text/event-stream',
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${ACCESS_TOKEN}`,
		},
		body: JSON.stringify(postData)
	};
	if (DEBUG) {
		logger.info('node=>请求参数:', options)
	}
	let error_content = '';
	fetch(API_WEB_URL, options)
		.then(response => {
			if (DEBUG) {
				logger.info('node<=请求URL:', API_WEB_URL)
				logger.info('node<=响应状态:', response.status)
				logger.info('node<=响应标识:%s', response.ok)
				logger.info('node<=响应状态:', response.status)
				logger.info('node<=响应文本:', response.statusText)
				const contentType = response.headers.get('content-type');
				logger.info('node<=响应类型:', contentType)
				logger.info('node<=header:', response.headers.raw())
			}
			let body = response.body;
			body.on('readable', () => {
				let chunk;
				while (null !== (chunk = body.read())) {
					if (response.status !== 200) {
						error_content += chunk.toString();
					}
					parser.feed(chunk.toString());
				}
			});
			body.on('end', () => {
				if (response.status !== 200) {
					res.write('data:' + error_content + "\n\n");
					if (DEBUG) {
						logger.info('node<=响应异常:', error_content)
					}
				}
				res.write('data:[DONE]\n\n');
				res.end();
			})
		})
		.then(body => {

		});
})



/**
 * @param {String} url 访问地址
 * @param {Object} options 请求参数
 */
const request = async (url, options, parser) => {
	console.log('进入')
	try {
		logger.log('请求URL:%s', url)
		logger.log('请求参数:', options)
		const response = await fetch(url, options);
		logger.log('响应标识:%s', response.ok)
		logger.log('响应状态:', response.status)
		logger.log('响应文本:', response.statusText)
		const contentType = response.headers.get('content-type');
		logger.log('响应类型:', contentType)
		logger.log('header:', response.headers.raw())
		const decoder = new TextDecoder('utf-8');
		let data; // 返回结果
		switch (contentType) {
			case 'text/html':
				data = await response.text();
				break;
			case 'text/event-stream':
				data = 'stream';
				handleStream(response.body);
				break;
			case 'application/json':
				data = await response.json();
				break;
			default:
				data = await response.blob();
		}
		logger.log('响应结果:', data)
		if (response.ok) {
			return Result.ok(data);
		} else {
			return Result.fail({
				code: response.status,
				statusText: response.statusText,
				data: data,
			})
		}
	} catch (err) {
		logger.error(err)
		return Result.fail(err.toString())
	}
	return Result.fail();
}

app.listen(PORT, () => {
	console.log(c.green(`Server is running at http://localhost:${PORT}`));
});