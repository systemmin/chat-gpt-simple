const fs = require('fs');
const path = require('path');
const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config()
const app = express();
const Result = require("./result.js");
const {
	Console
} = require('node:console');
const output = fs.createWriteStream('./stdout.log');
const errorOutput = fs.createWriteStream('./stderr.log');
const sourceParser = require('eventsource-parser');
/**
 * 
 * 解析获取 json 数据
 */
const bodyParser = require('body-parser');
const res = require('express/lib/response');
const {
	message
} = require('./result.js');
const json = express.json({
	type: '*/json'
});

app.use(json);
app.use(bodyParser.urlencoded({
	extended: false
}));


let sendFlag = false;
/**
 * 常量
 */
const port = process.env.PORT || 8080;
const url = process.env.API_URL || 'https://api.openai.com';
const data_path = process.env.DIR_PATH;
const key = process.env.API_KEY;
const debug = process.env.DEBUG === 'true'
const debug_data = process.env.DEBUG_ROW_DATA === 'true';
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

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
 * @description 客户端请求，请求转发
 * @author Mr.FANG
 * @time 2023年7月29日
 */
app.post('/events/', (req, ress) => {
	console.log('body', req.body)
	console.log('req', req.ip)
	console.log(req.params);

	ress.setHeader('Context-type', 'text/event-stream');
	ress.setHeader('Cache-Control', 'no-cache');
	ress.setHeader('Connection', 'keep-alive');
	ress.flushHeaders();
	for (const d of req.body.messages) {
		delete d['id'];
	}
	const postData = {
		model: "gpt-3.5-turbo",
		messages: req.body.messages,
		// "messages": [
		// 	{
		// 		"role": "system",
		// 		"content": "You are a helpful assistant."
		// 	},
		// 	{
		// 		"role": "user",
		// 		"content": "java 降序排序"
		// 	}
		// ],
		stream: true
	};
	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${key}`,
		},
		body: JSON.stringify(postData)
	};
	if (options) {
		console.info('请求参数：', options)
	}
	/**
	 * {
  "error": {
    "message": "Additional properties are not allowed ('id' was unexpected) - 'messages.1'",
    "type": "invalid_request_error",
    "param": null,
    "code": null
  }
}
	 */
	fetch(url, options)
		.then(response => response.body)
		.then(res => {
			// 读取数据
			var temp = '';
			let context = '';
			res.on('readable', () => {
				let chunk;
				const decoder = new TextDecoder('utf-8');
				while (null !== (chunk = res.read())) {
					const chunks = decoder.decode(chunk);
					if (chunks.includes('error')) {
						console.error('Error :', chunks);
					}
					if (debug_data) {
						console.info('original====>', chunks)
					}
					const d = parseData(chunks, temp, context, ress);
					temp = d.temp;
					context = d.context;
					if (debug_data) {
						console.info('parse====>', d.result, )
					}

				}
			});

			res.on('end', () => {
				if (debug)
					console.log('读取结束')
				if (debug)
					console.log(context)
				ress.end();
			})
		});
})

/**
 * @description 本地加载文件测试接口
 * @author Mr.FANG
 * @time 2023年7月29日
 */
app.post('/events/v2/', (req, res) => {
	console.log('body', req.body.messages)
	res.setHeader('Content-type', 'text/event-stream')
	res.setHeader('Cache-Control', 'no-cache');
	res.setHeader('Connection', 'keep-alive');
	res.flushHeaders();
	console.log(debug)
	if (debug) {
		console.log(data_path)
	}

	let p = path.join(__dirname, data_path);
	if (debug) {
		console.log(p)
	}

	fs.readFile(p, 'UTF-8', (err, data) => {
		if (err) {
			console.error('Error reading file:', err);
			return;
		}
		const lines = data.split(/\r?\n/);
		var temp = '';
		let context = '';
		let i = 0;
		const interval = setInterval(() => {
			res.write(lines[i])
			// const d = parseData(lines[i], temp, context, res);
			// temp = d.temp;
			// context = d.context;
			// if (debug) {
			// 	console.log(d.result, d.result.length)
			// }
			i++;
			if (i === lines.length) {
				if (debug) {
					console.log(context)
				}
				clearInterval(interval)
			}
		})

	});
})

/**
 * @description 提前停止请求
 * @author Mr.FANG
 * @time 2023年7月29日
 */
app.get('/abort', (reqs, res) => {

})

/**
 * @description 获取所有模型
 */
app.get('/models', async (req, res) => {
	res.setHeader('Access-Control-Allow-Origin', "*")
	const options = {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${key}`,
		},
	};
	// const data = await request('https://ai.waai.vip/v1/models', options);
	//  加载本地缓存数据
	const data = await fs.readFileSync('./data/models.json');
	res.json(JSON.parse(data))
})

function generateUUID() {
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
	console.log('请求参数', body)
	// if (!Object.keys(message).length) {
	// 	res.json(Result.fail(null, '请求参数为空').stringify());
	// 	res.end();
	// }
	const postData = {
		action: "next",
		messages: [{
			id: generateUUID(),
			role: "user",
			content: {
				content_type: "text",
				parts: [body.content]
			}
		}],
		model: "gpt-3.5-turbo",
		parent_message_id: body.parent_message_id ? body.parent_message_id : generateUUID(),
	};
	if (body.conversation_id) {
		postData.conversation_id = body.conversation_id;
	}
	// 创建  stream 流解析器，每一次返回数据可能不完整；
	const parser = sourceParser.createParser((event) => {
		if (event.type === "event") {
			let data = event.data;
			if (data.includes('[DONE]')) {
				res.write('data:[DONE]\n\n');
				res.end();
				console.log('结束')
			} else {
				// {"detail":"Something went wrong, please try reloading the conversation."}
				const result = JSON.parse(data);
				// console.log('result:', result)
				if (result.message) {
					const msg = {
						id: result.message.id,
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
	console.log('options:', options)
	fetch('https://ai.fakeopen.com/api/conversation', options)
		.then(response => response.body)
		.then(body => {
			body.on('readable', () => {
				let chunk;
				while (null !== (chunk = body.read())) {
					// {"detail":"Something went wrong, please try reloading the conversation."} 不会执行parser
					console.log('原文：', chunk.toString())
					parser.feed(chunk.toString());
				}
			});
			body.on('end', () => {
				// console.log('读取结束')
				res.end();
			})
		});
})

function onMessage(data) {
	console.log(data)
}


const logger = new Console({
	stdout: output,
	stderr: errorOutput
});

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

const handleStream = (body, parser) => {
	let error;
	body.on('error', err => {
		error = err;
		console.log(err)
	});
	body.on('readable', () => {
		let chunk;
		const decoder = new TextDecoder('utf-8');
		while (null !== (chunk = res.read())) {
			parser.feed(chunk.toString());
		}
	});
	return new Promise((resolve, reject) => {
		body.on('close', () => {
			error ? reject(error) : resolve();
		});
	});
};


/**
 * @description 解析 text/events-strem 
 * @author Mr.FANG
 * @time 2023年7月29日
 * 
 * @param {Object} data chatGPT 接收到原始内容
 * @param {Object} temp 临时追加内容
 * @param {Object} context 内容
 * @param {Object} res response 响应对象
 * 
 */
function parseData(data, temp, context, res) {
	let result = [];
	const strings = data.split('data:');
	for (const d of strings) {
		if (d.includes('DONE')) {
			res.end('data:DONE\n\n');
			if (debug) {
				console.log('结束：', d);
			}
			result.push('DONE')
			return {
				result,
				temp: '',
				context
			};
		}
		let text = temp + d;
		text = text.trim();
		const s = text.indexOf('{');
		const e = text.lastIndexOf('}');

		if (e !== -1 && s !== -1) {
			// 匹配成功输出
			let rest = text.substring(s, e + 1);
			rest = rest.replace(/\n/g, '');

			res.write('data:' + rest + "\n\n");
			let ct = JSON.parse(rest);
			context += ct.choices[0].delta.content;
			// console.log('解析：' + result);
			result.push(rest);
			// 清空
			temp = '';
		} else {
			// 匹配失败累加
			temp += d;
		}
	}
	return {
		result,
		temp,
		context
	};
}


app.listen(port, () => {
	console.log(`Server is running at http://localhost:${port}`);
});