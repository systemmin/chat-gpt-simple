const fs = require('fs');
const path = require('path');
const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config()
const app = express();

/**
 * 
 * 解析获取 json 数据
 */
const bodyParser = require('body-parser');
const json = express.json({
	type: '*/json'
});

app.use(json);
app.use(bodyParser.urlencoded({
	extended: false
}));

/**
 * AbortController 接口表示一个控制器对象，允许你根据需要中止一个或多个 Web 请求
 * AbortController.signal 只读返回一个 AbortSignal 对象实例，它可以用来 with/abort 一个 Web（网络）请求。
 * AbortController.abort() 中止一个尚未完成的 Web（网络）请求。这能够中止 fetch 请求及任何响应体的消费和流。
 */
const AbortController = globalThis.AbortController
let controller = new AbortController();
let sendFlag = false;
/**
 * 常量
 */
const port = process.env.PORT || 8080;
const url = process.env.API_URL || 'https://api.openai.com';
const data_path = process.env.DIR_PATH;
const key = process.env.API_KEY;
const debug = new Boolean(process.env.DEBUG) || false;
const debug_data =new Boolean(process.env.DEBUG_ROW_DATA) || false;

// 将静态资源目录设置为 publicPath
app.use(express.static('public'));

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
		messages:req.body.messages,
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
					if(chunks.includes('error')){
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
			const d = parseData(lines[i], temp, context, res);
			temp = d.temp;
			context = d.context;
			if (debug) {
				console.log(d.result, d.result.length)
			}
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
	if (sendFlag) {
		console.log(controller.signal)
		controller.adort(); // 停止
		controller = new AbortController();
		console.log(controller.signal) // 信号
	}
})


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