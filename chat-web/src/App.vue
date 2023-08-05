<template>
	<div id="app">
		<div id="main">
			<div id="left">
				<sidebar @collapse="(e)=>show=!e"></sidebar>
			</div>
			<div id="right">
				<message :data="item" v-for="(item,i) in history" :key="i"></message>
				<div style="height: 6.25rem;border-top: 1px solid #dededf;"></div>
				<send-text :prompt="prompt" @send="onSend"></send-text>
			</div>
			<!-- 系统配置组件 -->
			<sys-config></sys-config>
			<!-- 提示语句 -->
			<tips-text @tips="tips"></tips-text>
			<!-- 折叠按钮 -->
			<div v-if="show" style="position: fixed;top: 20px;left: 20px;cursor: pointer;" @click="handleCollapse()">
				<expand-left theme="outline" size="24" fill="#000" :strokeWidth="4" />
			</div>
		</div>


		<!-- 示例语句组件 -->
	</div>
</template>

<script>
	const API_TYPE_WEB = 'web'; // 非官方接口，web接口访问 chatGPT
	const API_TYPE_CHAT = 'chat'; // 官方聊天接口，api 接口访问 chatGPT
	const API_TYPE_COM = 'complate'; // 官方补全、训练微调模型接口，

	import Message from '@/components/Message/index';
	import SendText from '@/components/SendText/index';
	import Sidebar from '@/components/Sidebar/index';
	import SysConfig from '@/components/SysConfig/index';
	import TipsText from '@/components/TipsText/index';
	import {
		marked
	} from 'marked';
	import {
		SendOne,
		ExpandLeft
	} from '@icon-park/vue';
	const sourceParser = require('eventsource-parser');
	console.log(sourceParser)

	// 控制台警告处理
	marked.options({
		headerIds: false,
		mangle: false
	})
	console.log(marked)
	export default {
		name: 'App',
		components: {
			Message,
			SendText,
			SysConfig,
			TipsText,
			SendOne,
			Sidebar,
			ExpandLeft
		},
		data() {
			return {
				show: false, // 侧边栏状态
				apiType: API_TYPE_WEB,
				prompt: '', // 提词
				tokenMsg: {
					id: '',
					parent_message_id: '67dc467d-64df-4037-b106-2941b5d7c3f3', // 父级消息id
					conversation_id: '25923008-82a9-49cd-a423-98f234c7173c', // 会话 id
					content: "", // 消息内容
					role: 'user',
					orginal: true,
				},
				pid: '08a177c3-d507-4d55-a93d-e0b46d8a857a', // 当前会话id
				content: '',
				receive: {}, // 临时接收对象
				history: [], // 聊天记录列表
				firstchunk: false, // 标识接收消息
			}
		},
		created() {
			this.init();
		},
		methods: {
			init() {
				const history = localStorage.getItem('history');
				const historys = history ? JSON.parse(history) : [];

				const list = historys[0].list;
				this.handleMessage(list);
			},
			// 渲染聊天记录
			renderHistory() {
				for (const d of list) {
					if (!d.html) {
						d.html = marked.parse(d.content);
					}
					d.orginal = true;
				}
				this.history = list;
				// 更新会话 id 父级聊天记录
				if (API_TYPE_WEB === this.apiType) {
					const {
						parent_id,
						conversation_id
					} = list.at(-1); // 返回最后一条记录
					this.tokenMsg = Object.assign({
						parent_message_id: parent_id,
						conversation_id
					}, this.tokenMsg);
				}
			},
			handleCollapse(e) {
				document.getElementById('left').style.display = 'block';
				document.getElementById('bottom-send').style.width = 'calc(100% - 15.625rem)';
				this.show = false;
			},
			tips(text) {
				this.prompt = text.prompt;
				console.log(text)
			},
			generateUUID() {
				return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
					var r = Math.random() * 16 | 0,
						v = c === 'x' ? r : (r & 0x3 | 0x8);
					return v.toString(16);
				});
			},
			onSend(text) {
				const tokenMsg = this.tokenMsg;
				tokenMsg.content = text;
				let _that = this;
				// 1、请求参数
				const options = {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(tokenMsg)
				};
				// 2、保存用户发送信息
				this.saveRecod(tokenMsg);
				tokenMsg.html = marked.parse(text);
				this.history.push(tokenMsg);
				// 3、创建 stream 解析
				const parser = sourceParser.createParser((event) => {
					if (event.type === "event") {
						this.handleMessage(event.data)
					}
				})
				// 4、、发起请求
				// fetch('http://localhost:8080/events/v2', options)
				fetch('http://localhost:8080/chat/token', options)
					.then(response => {
						console.log(response)
						const reader = response.body.getReader();
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
										parser.feed(chunk);
										return readStream();
									}
								});
						}
						return readStream();
					})
					.catch(error => {
						console.error('Error occurred while fetching event stream:', error);
					});
			},
			/**
			 * @description 处理消息事件
			 * @param {Object} chunk 事件消息
			 */
			handleMessage(chunk) {
				console.log(chunk)
				try {
					// 1、结束标识
					if (chunk.includes('DONE')) {
						console.log('结束')
						const receive = this.receive;
						if (receive && API_TYPE_WEB === this.apiType) {
							const {
								parent_id,
								conversation_id
							} = receive
							this.tokenMsg = Object.assign({
								parent_message_id: parent_id,
								conversation_id
							}, this.tokenMsg);
							this.saveRecod(this.receive);
						}
					} else {
						//2、正常接收数据
						const data = JSON.parse(chunk);
						data.role = "assistant";
						data.html = marked.parse(data.content);
						data.orginal = true;
						// 处理消息，将最新一条数据 push 到数组结尾
						if (!this.firstchunk) {
							this.history.push(data);
							this.firstchunk = true;
						} else { // 更新最新消息
							this.$set(this.history, this.history.length - 1, data);
						}
						// token
						this.content = data.content;
						// 补全
						// this.content = data.message.content.parts[0];

						this.receive = data;
						// 接口
						// _that.content += data.choices[0].delta.content;
					}
				} catch (err) {
					this.$message.error(err.toString())
					console.log(err);
				}
			},

			/**
			 * @description 对话记录保存到本地缓存
			 * @param {Object} message
			 */
			saveRecod(message) {
				let pid = this.pid ? this.pid : this.generateUUID();
				this.pid = pid;
				const history = localStorage.getItem('history');
				const list = history ? JSON.parse(history) : [];
				if (list.length === 0) {
					const data = {
						title: message.content,
						pid: pid,
						list: [message]
					}
					localStorage.setItem('history', JSON.stringify([data]))
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
						currentData.list.push(message)
						localStorage.setItem('history', JSON.stringify(list))
					} else {
						const data = {
							title: message.content,
							pid: pid,
							list: [message]
						}
						list.push(data);
						localStorage.setItem('history', JSON.stringify(list))
					}
				}
			}
		}
	}
</script>

<style>
	* {
		padding: 0px;
		margin: 0px;
	}

	/* 火狐 */
	scrollbar {
		color: #bbbbbb #202123;
		width: thin;

	}

	scrollbar-thumb {
		border-radius: 5px;
	}

	::-webkit-scrollbar {
		width: 7px;
	}

	::-webkit-scrollbar-track {
		background-color: #ffffff;
		/* 轨道颜色 */
	}

	::-webkit-scrollbar-thumb {
		background-color: #bbbbbb;
		/* 滑块颜色 */
		border-radius: 5px;
		/* 滑块圆角 */
	}

	code {
		border-radius: 0.3125rem;
	}

	#app {
		font-family: Avenir, Helvetica, Arial, sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		color: #2c3e50;
		/* 定义滚动条的样式 */
		scrollbar-width: thin;
		/* 滚动条宽度 */
		scrollbar-color: #bbbbbb #ffffff;
		/* 滚动条颜色(轨道颜色 滑块颜色) */

		/* Firefox浏览��� */
		scrollbar-width: thin;
		/* 滚动条宽度 */
		scrollbar-color: #bbbbbb #ffffff;
		/* 滚动条颜色(轨道颜色 滑块颜色) */
	}

	#main {
		display: flex;
	}

	#left {
		flex: 0 0 15.625rem;
		height: 100vh;
		background-color: #202123;
		color: #ececf1;
		-moz-user-select: none;
		-webkit-user-select: none;
		user-select: none;
	}

	#right {
		flex: 1;
		height: 100vh;
		background-color: #ffffff;
		overflow: auto;
	}
</style>