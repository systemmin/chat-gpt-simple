const fs = require('fs');
const path = require('path');
const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 8080;
const url = process.env.API_URL || 'https://api.openai.com';
const data_path = process.env.DIR_PATH;
const key = process.env.API_KEY;


// 将静态资源目录设置为 publicPath
app.use(express.static('public'));

/**
 * @description 客户端请求，请求转发
 * @author Mr.FANG
 * @time 2023年7月29日
 */
app.get('/events/', (reqs, ress) => {
	ress.setHeader('Context-type', 'text/event-stream');
	ress.setHeader('Cache-Control', 'no-cache');
	ress.setHeader('Connection', 'keep-alive');
	ress.flushHeaders();

	const postData = {
		"model": "gpt-3.5-turbo",
		"messages": [{
				"role": "system",
				"content": "You are a helpful assistant."
			},
			{
				"role": "user",
				"content": "java 降序排序"
			}
		],
		'stream': true
	};
	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${key}`,
		},
		body: JSON.stringify(postData)
	};
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
					console.log('原始数据====>', chunks)
					const d = parseData(chunks, temp, context, ress);
					temp = d.temp;
					context = d.context;
					// console.log(d.result, d.result.length)
				}
			});

			res.on('end', () => {
				console.log('读取结束')
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
app.get('/events/v2/', (reqs, res) => {
	res.setHeader('Content-type', 'text/event-stream')
	res.setHeader('Cache-Control', 'no-cache');
	res.setHeader('Connection', 'keep-alive');
	res.flushHeaders();
	console.log(data_path)
	let p = path.join(__dirname, data_path);
	console.log(p)
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
			console.log(d.result, d.result.length)
			i++;
			if (i === lines.length) {
				console.log(context)
				clearInterval(interval)
			}
		})

	});
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
			console.log('结束：', d);
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