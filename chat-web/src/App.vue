<template>
	<div id="app">
		<div id="main">
			<div id="left">
				<sidebar :historys="historys" :index="sideIndex" @onChat="handleChat" @onDelete="handleDelete"
					@onDetail="handleDetail" @collapse="(e)=>show=!e">
				</sidebar>
			</div>
			<div id="right">
				<message :data="item" v-for="(item,i) in speaks" :key="i"></message>
				<div style="height: 6.25rem;border-top: 1px solid #dededf;"></div>
				<send-text :prompt="prompt" @send="onSend"></send-text>
			</div>
			<!-- 系统配置组件 -->
			<sys-config @onModel="handleMolde"></sys-config>
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
	import {
		eventsUrl,
		chatUrl
	} from '@/api/config'
	// see 事件解析器
	const sourceParser = require('eventsource-parser');
	// md=>html 控制台警告处理
	marked.options({
		headerIds: false,
		mangle: false
	})
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
				apiType: API_TYPE_WEB, // 当前聊天类型
				prompt: '', // 提词
				tokenMsg: {
					id: '',
					parent_message_id: '', // 父级消息id
					conversation_id: '', // 会话 id
					content: "", // 消息内容
					role: 'user',
				},
				pid: '', // 当前会话id
				receive: {}, // 临时接收对象
				speaks: [], // 聊天记录列表
				firstchunk: false, // 标识接收消息
				historys: [], // 历史记录
				sideIndex: 0, // 侧边当前激活状态下标
				content: '', // 字符追加
			}
		},
		created() {
			this.init();
		},
		methods: {
			/**
			 * @description 初始化，加载本地缓存数据
			 * @author Mr.FANG
			 * 
			 */
			init() {
				// 加载本地记录
				const history = localStorage.getItem('history');
				const historys = history ? JSON.parse(history) : [];
				this.historys = historys.reverse();
				this.renderHistory();
			},
			/**
			 * @description 聊天模式
			 * @author Mr.FANG
			 * 
			 */
			handleMolde(code) {
				this.apiType = code;
			},
			/**
			 * 
			 * @description 渲染聊天记录
			 * @author Mr.FANG
			 * 
			 */
			renderHistory() {
				const history = this.historys[this.sideIndex];
				if (!history) {
					return;
				}
				const list = history.list;
				this.pid = history.pid;
				for (const d of list) {
					if (!d.html && d.content) {
						d.html = marked.parse(d.content);
					}
					d.orginal = true;
				}
				this.speaks = list;
				// 更新会话 id 父级聊天记录
				if (list.length) {
					const {
						parent_id,
						conversation_id
					} = list.at(-1); // 返回最后一条记录
					if (API_TYPE_WEB === this.apiType) {
						this.tokenMsg = Object.assign({
							parent_message_id: parent_id,
							conversation_id
						}, this.tokenMsg);
					}
				}
			},

			/**
			 * 
			 * @description 新会话
			 * @author Mr.FANG
			 * 
			 */
			handleChat() {
				const pid = this.generateUUID();
				this.pid = pid;
				const history = localStorage.getItem('history');
				const list = history ? JSON.parse(history) : [];
				const chat = {
					title: '新会话',
					pid: pid,
					type: this.apiType,
					list: []
				}
				list.push(chat);
				localStorage.setItem('history', JSON.stringify(list));
				//清空会话
				this.tokenMsg.parent_message_id = '';
				this.tokenMsg.conversation_id = '';
				this.init();
			},
			/**
			 * 
			 * @description 会话详情列表
			 * @author Mr.FANG
			 * 
			 */
			handleDetail(index) {
				this.sideIndex = index;
				this.renderHistory();
			},

			/**
			 * 
			 * @description 删除会话
			 * @author Mr.FANG
			 * 
			 * @param {String} pid 会话 id
			 */
			handleDelete(pid) {
				this.delStroe(pid);
				this.sideIndex = 0;
				this.init();
			},

			/**
			 * 
			 * @description 删除会话
			 * @author Mr.FANG
			 */
			handleCollapse(e) {
				document.getElementById('left').style.display = 'block';
				document.getElementById('bottom-send').style.width = 'calc(100% - 15.625rem)';
				this.show = false;
			},

			/**
			 * @description 提示词
			 * @author Mr.FANG
			 * 
			 * @param {String} text 提示词返回内容
			 */
			tips(text) {
				this.prompt = text.prompt;
			},

			/**
			 * @description UUID
			 * @author Mr.FANG
			 * 
			 */
			generateUUID() {
				return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
					var r = Math.random() * 16 | 0,
						v = c === 'x' ? r : (r & 0x3 | 0x8);
					return v.toString(16);
				});
			},
			/**
			 * @description 发送消息按钮
			 * 1、通过 token 凭证发送聊天消息
			 * 2、通过 key 密钥发送聊天消息
			 * 3、补全功能，微调模型后，通过接口测试模型
			 * @author Mr.FANG
			 * 
			 * @param {String} text 消息内容
			 */
			onSend(text) {
				const tokenMsg = this.tokenMsg;
				tokenMsg.content = text;
				tokenMsg.created = Date.now();
				// 1、请求参数
				const options = {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					}
				};
				// 2、保存用户发送信息
				this.saveRecod(tokenMsg);
				tokenMsg.html = marked.parse(text);
				this.speaks.push(tokenMsg);

				// 不同类型参数不同
				const sys = localStorage.getItem('sysConfig')
				switch (this.apiType) {
					case API_TYPE_WEB:
						const last = this.speaks?.filter(item=>{return item.conversation_id})[0];
						if (last) { // 理解上下文
							tokenMsg.parent_message_id = last.parent_id
							tokenMsg.conversation_id = last.conversation_id
						}
						options.body = JSON.stringify(tokenMsg);
						break;
					case API_TYPE_CHAT:
						if (!sys) {
							this.$message.warn('请先保存系统配置');
							return;
						}
						const messages = this.speaks.map(item => {
							return {
								role: item.role,
								content: item.content
							}
						})
						options.body = JSON.stringify({
							messages,
							config: JSON.parse(sys)
						});
						break;
					case API_TYPE_COM:
						if (!sys) {
							this.$message.warn('请先保存系统配置');
							return;
						}
						options.body = JSON.stringify({
							prompt: text,
							config: JSON.parse(sys)
						});
						break;
				}


				// 3、创建 stream 解析
				const parser = sourceParser.createParser((event) => {
					if (event.type === "event") {
						this.handleMessage(event.data)
					}
				})
				// 4、、发起请求
				const url = this.apiType === API_TYPE_WEB ? chatUrl : eventsUrl;
				fetch(url, options)
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
			 * @author Mr.FANG
			 * 
			 * @param {Object} chunk 事件消息
			 */
			handleMessage(chunk) {
				console.log(chunk)
				// 异常消息
				// if (chunk.includes('error') && chunk.includes('message')) {
				if (!chunk.includes('content:') && !chunk.includes('role') && !chunk.includes('DONE')) {
					this.$message.error(chunk);
					console.error('呀！~异常了', chunk)
					return;
				}
				try {
					// 1、结束标识
					if (chunk.includes('DONE')) {
						console.log('结束')
						const receive = this.receive;
						this.content = '';
						if (receive && API_TYPE_WEB === this.apiType) {
							const {
								parent_id,
								conversation_id
							} = receive
							this.tokenMsg = Object.assign({
								parent_message_id: parent_id,
								conversation_id
							}, this.tokenMsg);
						}
						this.saveRecod(this.receive);
					} else {
						//2、正常接收数据
						const data = JSON.parse(chunk);
						data.role = "assistant";
						data.orginal = true;
						// 处理消息，将最新一条数据 push 到数组结尾
						if (!this.firstchunk) {
							this.speaks.push(data);
							this.firstchunk = true;
						} else { // token 返回数据
							if (API_TYPE_WEB === this.apiType) {
								data.html = marked.parse(data.content);
								this.$set(this.speaks, this.speaks.length - 1, data);
							} else {
								// 通过 api key 请求返回的数据处理
								let content = this.content;
								content += data.content ? data.content : '';
								data.html = marked.parse(content);
								data.content = content;
								this.$set(this.speaks, this.speaks.length - 1, data);
								this.content = content;
							}
						}
						// 当前正在聊天中返回的内容
						this.receive = data;
					}
				} catch (err) {
					this.$message.error(err.toString())
					console.log(err);
				}
			},

			/**
			 * @description 对话记录保存到本地缓存
			 * @author Mr.FANG
			 * 
			 * @param {Object} message
			 */
			saveRecod(message) {
				let pid = this.pid ? this.pid : this.generateUUID();
				this.pid = pid;
				const list = this.getStroe()
				if (list.length === 0) {
					const data = {
						title: message.content,
						pid: pid,
						type: this.apiType,
						list: [message],
					}
					list.push(data);
					this.setStroe(list)
				} else {
					let chat = undefined;
					for (var i = 0; i < list.length; i++) {
						let item = list[i];
						if (item.pid === pid) {
							// 更新会话标题
							if (item.list.length == 0) {
								item.title = message.content;
							}
							chat = item;
							item.list.push(message);
							this.setStroe(list)
							continue;
						}
					}
					// 不存在添加新会话
					if (!chat) {
						const data = {
							title: message.content,
							pid: pid,
							type: this.apiType,
							list: [message]
						}
						list.push(data);
						this.setStroe(list)
					}
				}
			},
			getStroe() {
				const object = localStorage.getItem('history');
				return object ? JSON.parse(object) : [];
			},
			setStroe(value) {
				localStorage.setItem('history', JSON.stringify(value))
			},
			delStroe(pid) {
				const list = this.getStroe()
				if (list.length) {
					const values = list.filter(item => item.pid !== pid);
					this.setStroe(values)
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
	/* scrollbar {
		color: #bbbbbb #202123;
		width: thin;

	} */

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

	code {
		border-radius: 0.3125rem;
	}
    
	#app {
		font-size: 1em;
		font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
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