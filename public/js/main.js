let el = undefined;
// 清空dom
let el_id = '';
// 
let loading = false;

// 系统
const systemMessage = {
	"role": "system",
	"content": "你是个乐于助人的助手。"
};

const userMessage = [

];

function deleteChild() {
	el = document.getElementById(el_id);
	var first = el.firstElementChild;
	while (first) {
		first.remove();
		first = el.firstElementChild;
	}
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0,
        v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}


// 解析数据
function parseData(data, temp, content, res) {
	let result = [];
	const strings = data.split('data:');
	for (const d of strings) {
		if (d.includes('DONE')) {
			console.log('结束：', d);
			result.push('DONE')
			return {
				result,
				temp: '',
				content
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
			let ct = JSON.parse(rest);
			content += ct.choices[0].delta.content || '';
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
		content
	};
}
let temp = '',
	content = '';
// 处理消息
function handleEventStreamMessage(event) {
	const eventText = event.data;
	const d = parseData(eventText, temp, content);
	temp = d.temp;
	content = d.content;
	// console.log(d.result)
	displayEvent(content);
}
// md 转 dom 解析 html 高亮
function displayEvent(content) {
	deleteChild()
	el.innerHTML = marked.parse(content);
	let blocks = el.querySelectorAll("pre code");
	blocks.forEach(block => {
		hljs.highlightBlock(block);
	});
}
const postData = {
	messages: [
		systemMessage,
		...userMessage,
	]
};
const options = {
	method: 'POST',
	headers: {
		'Content-Type': 'application/json'
	},
	// signal: controller.signal
};
// 发起请求
function connectToEventStream(id,value) {
	el_id = id;
	temp = '';
	content = '';
	loading = true;
	const textarea = document.getElementById('prompt-textarea');
	userMessage.push({
		role: 'user',
		content: value
	})
	
	const postData = {
		messages: [
			systemMessage,
			...userMessage,
		]
	};
	options.body=JSON.stringify(postData);
	
	
	fetch('/events/', options)
		.then(response => {
			const reader = response.body.getReader();
			// const decoder = new TextDecoder();
			// 将响应解析为 text/event-stream 格式
			const decoder = new TextDecoder('utf-8');

			function readStream() {
				return reader.read()
					.then(({
						done,
						value
					}) => {
						if (!done) {
							const chunk = decoder.decode(value);
							handleEventStreamMessage({
								data: chunk
							});
							return readStream();
						} else {
							loading = false;
							// 助手返回信息
							userMessage.push({
								role: 'assistant',
								content: content
							})
							document.getElementById('prompt-textarea').disabled = false;
							document.getElementById('sendMsg').disabled = false;
							console.log(userMessage);
						}
					});
			}
			return readStream();
		})
		.catch(error => {
			console.error('Error occurred while fetching event stream:', error);
		});
}