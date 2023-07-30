let temp = '',
	pid = undefined,
	loading = false,
	el = undefined,
	el_id = undefined,
	content = '';
// marked setting 控制台警告信息
marked.options({
	headerIds: false,
	mangle: false
})
// hljs 拷贝插件
hljs.addPlugin(new CopyButtonPlugin());

// 系统
let systemMessage = {
	"role": "system",
	"content": "你是个乐于助人的助手。"
};

let userMessage = [];

/**
 * @param {Object} el_id 清空指定节点下内容
 */
function deleteChild(el_id) {
	const del_el = document.getElementById(el_id);
	var first = del_el.firstElementChild;
	while (first) {
		first.remove();
		first = del_el.firstElementChild;
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

// 处理消息
function handleEventStreamMessage(event) {
	const eventText = event.data;
	const d = parseData(eventText, temp, content);
	temp = d.temp;
	content = d.content;
	displayEvent(content);
}
// md 转 dom 解析 html 高亮
function displayEvent(content) {
	deleteChild(el_id)
	if (content) {
		el.innerHTML = marked.parse(content);
		let blocks = el.querySelectorAll("pre code");
		blocks.forEach(block => {
			hljs.highlightBlock(block);
		});
		scrollToTop()
	}

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
// 

/**
 * @description 发起请求
 * @author Mr.FANG
 * @time 2023年7月30日
 * 
 * @param {String} id 用户消息 id
 * @param {String} aid 助手消息 id
 * @param {String} value 发送内容
 */
function connectToEventStream(id, aid, value) {
	el_id = aid;
	el = document.getElementById(aid);
	temp = '';
	content = '';
	loading = true;
	userMessage.push({
		role: 'user',
		content: value,
		id,
	})

	const postData = {
		messages: [
			systemMessage,
			...userMessage,
		]
	};
	options.body = JSON.stringify(postData);

	// console.log(options)
	fetch('/events/v2/', options)
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
								content: content,
								id: aid
							});
							saveRecord();
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

/**
 * @description 创建 dom
 * @author Mr.FANG
 * @time 2023年7月30日
 * 
 * @param {String} id dom id
 * @param {String} role 角色：user,system
 */
const createHtml = (id, role) => {
	if (document.getElementById(id)) {
		return;
	}
	const roleDiv = document.createElement('div');
	roleDiv.className = role

	const contentDiv = document.createElement('div');
	contentDiv.className = 'content'

	const span = document.createElement('span');
	span.className = 'icon';
	span.style.backgroundColor = role === 'user' ? '#4f2ba6' : '#19c37d';
	span.innerText = role === 'user' ? 'M' : 'S'
	const idDiv = document.createElement('div');

	idDiv.id = id;
	contentDiv.append(span);
	contentDiv.append(idDiv);
	roleDiv.append(contentDiv)
	return roleDiv
}
const createSystemHtml = (id) => createHtml(id, 'system');
const createUserHtml = (id) => createHtml(id, 'user');


/**
 * @description 保存数据到本地
 * @author Mr.FANG
 * @time 2023年7月30日
 */
const saveRecord = () => {
	const obj = localStorage.getItem('list');
	const list = obj ? JSON.parse(obj) : [];
	if (!pid) {
		pid = generateUUID();
	}
	if (list.length === 0) {
		const data = {
			title: userMessage[0].content,
			pid,
			list: userMessage
		}
		localStorage.setItem('list', JSON.stringify([data]))
	} else {
		let currentData = undefined;
		for (var i = 0; i < list.length; i++) {
			let item = list[i];
			if (item.pid === pid) {
				currentData = item;
				continue;
			}
		}
		if (currentData) {
			// for (const msg of userMessage) {
			// 	currentData.list.push(msg)
			// }
			currentData.list = userMessage;
			localStorage.setItem('list', JSON.stringify(list))
		} else {
			const data = {
				title: userMessage[0].content,
				pid,
				list: userMessage
			}
			list.push(data);
			localStorage.setItem('list', JSON.stringify(list))
		}
	}
}

/**
 * 
 * @description 加载聊天记录侧边栏记录
 * @author Mr.FANG
 * @time 2023年7月30日
 * 
 */
const loadRecod = () => {
	let template = '';
	const obj = localStorage.getItem('list');
	const list = obj ? JSON.parse(obj) : [];
	if (list) {
		list.forEach(item => {
			template += `
			<div class="record" data-id="${item.pid}">
				<div><span >Ⓜ</span>️</div>
				<div class="detail"  data-id="${item.pid}">${item.title}</div>
				<div><span class="export" data-id="${item.pid}">💾</span><span class="delete" data-id="${item.pid}">⛔</span></div>
			</div>
			`;
		})
		// 追加
		document.getElementById('session-list').innerHTML = template;
	}
}

/**
 * 
 * @description 创建 dom 节点，渲染 html，高亮
 * @author Mr.FANG
 * @time 2023年7月30日
 * 
 * @param {String} list 消息详情列表数据
 */
const renderingHtml = (list) => {
	const els = document.getElementById('list-msg'); //
	list.forEach(item => {
		let s1
		if (item.role === 'user') {
			s1 = createUserHtml(item.id);
		} else {
			s1 = createSystemHtml(item.id);
		}
		els.append(s1)
		document.getElementById(item.id).innerHTML = marked.parse(item.content);;
	})
	let blocks = els.querySelectorAll("pre code");
	blocks.forEach(block => {
		hljs.highlightBlock(block);
	});
	scrollToTop()
}


/**
 * 
 * @description 从本地缓存加载数据
 * @author Mr.FANG
 * @time 2023年7月30日
 * 
 * @param {String} pid 消息列表 id 
 */
const loadDetail = (pid) => {
	const obj = localStorage.getItem('list');
	const list = obj ? JSON.parse(obj) : [];
	deleteChild('list-msg'); // 清空节点
	list.forEach(item => {
		if (item.pid === pid) {
			userMessage = item.list;
			renderingHtml(item.list)
		}
	})
}
/**
 * 
 * @description 从本地缓存删除
 * @author Mr.FANG
 * @time 2023年7月30日
 * 
 * @param {String} id 消息列表 id 
 */
const deleteRecord = (id) => {
	console.log('delete', id)
	const obj = localStorage.getItem('list');
	const list = obj ? JSON.parse(obj) : [];
	localStorage.setItem('list', JSON.stringify(list.filter(item => item.pid !== id)));
	loadRecod();
}

/**
 * 
 * @description 下载文件
 * @author Mr.FANG
 * @time 2023年7月30日
 * 
 * @param {String} id 消息列表 id 
 */
const exportRecord = (id) => {
	const obj = localStorage.getItem('list');
	const list = obj ? JSON.parse(obj) : [];
	var jsonData = list.filter(item => item.pid === id)[0];
	var jsonString = JSON.stringify(jsonData);
	var blob = new Blob([jsonString], {
		type: "application/json"
	});
	var downloadLink = document.createElement("a");
	downloadLink.href = URL.createObjectURL(blob);
	downloadLink.download = id + ".json";
	downloadLink.click();
}

/**
 * 
 * @description 侧边栏激活样式
 * @author Mr.FANG
 * @time 2023年7月30日
 * 
 * @param {String} id 消息列表 id 
 */
const activeSide = (id) => {
	const els = document.querySelectorAll('.record');
	for (const el of els) {
		if (el.getAttribute('data-id') === id) {
			el.style.backgroundColor = '#343541';
		} else {
			el.style.backgroundColor = '#202123';
		}
	}
}

let showButton = false;
const mainEl = document.getElementById('right');
const handleScroll = () => {
	// 显示或隐藏按钮根据容器的滚动位置
	const container = mainEl.scrollContainer;
	// if (container.scrollTop > 100) {
	// 	showButton = true;
	// } else {
	// 	showButton = false;
	// }
}

/**
 * 
 * @description 滚动到底部
 * @author Mr.FANG
 * @time 2023年7月30日
 */
const scrollToTop = () => {
	console.log('dddd')
	// 平滑滚动到容器顶部
	mainEl.scrollTo({
		top: mainEl.scrollHeight,
		behavior: "smooth",
	});
}
mainEl.addEventListener("scroll", handleScroll())
// removeEventListener("scroll", this.handleScroll);


/**
 * 
 * @description 动态监听 click 事件
 * @author Mr.FANG
 * @time 2023年7月30日
 */
document.addEventListener('click', (event) => {
	console.log(event)
	const className = event.target.className;
	console.log(className);
	const did = event.target.dataset.id
	if (className === 'export') {
		console.log('导出')
		exportRecord(did)
	} else if (className === 'delete') {
		console.log('删除')
		deleteRecord(did);
	} else if (className === 'detail' || className === 'record') {
		console.log('详情')
		pid = did
		console.log('pid', pid)
		console.log('did', did)
		loadDetail(did)
		activeSide(did)
	}
})