<template>
	<!-- 消息体 -->
	<div :style="{'backgroundColor':role==='user'?ubgColor:abgColor}">
		<div class="message">
			<div class="message-icon">
				<span class="icon"
					:style="{'background-color':role==='user'?uIconColor:aIconColor}">{{role==='user'?'U':'S'}}</span>
			</div>
			<div class="message-body" v-highlight v-html="htmls" v-if="isOrginal"></div>
			<!-- 显示原文 -->
			<div class="message-body" v-else><pre>{{o_html}}</pre></div>
			
			<!-- 按钮 -->
			<div class="message-tool">
				<div @click="copy($event)">
					<a-tooltip title="复制">
					<copy-one theme="filled" size="18" fill="#acacbe" />
					</a-tooltip>
				</div>
				<div @click="capture($event)">
					<a-tooltip title="显示原文">
					<file-code-one theme="filled" size="18" fill="#acacbe" />
					</a-tooltip>
				</div>
			</div>

		</div>
	</div>
</template>

<script>
	import 'highlight.js/styles/github.css';
	// import 'highlight.js/styles/shades-of-purple.css';
	import '@/assets/css/monokai-sublime.css';
	import '@/assets/css/copy.min.css';
	import html2canvas from 'html2canvas';
	import {
		marked
	} from 'marked';

	import {
		CopyOne,
		FileCodeOne,
	} from '@icon-park/vue';
	// 控制台警告处理
	marked.options({
		headerIds: false,
		mangle: false
	})


	export default {
		name: 'Message',
		components: {
			CopyOne,
			FileCodeOne
		},
		props: {
			// assistant user
			role: {
				type: String,
				default: 'user',

			},
			// 内容
			html: {
				type: String,
			}
		},
		data() {
			return {
				ubgColor: '#fff',
				abgColor: '#f7f7f8',
				uIconColor: '#4f2ba6',
				aIconColor: '#19c37d',
				showButton: false,
				htmls: '',
				isOrginal:true,
				o_html:'```javascript /**\n * @param {Object} el_id 清空指定节点下内容\n */\nfunction deleteChild(el_id) {\n	const del_el = document.getElementById(el_id);\n	var first = del_el.firstElementChild;\n	while (first) {\n		first.remove();\n		first = del_el.firstElementChild;\n	}\n}```',
			}
		},
		created() {
			console.log(marked)
			this.$nextTick(() => {
				this.htmls = marked.parse(
					this.o_html
				)
			})
		},
		methods: {
			copy(event) {
				console.log(event)
			},
			capture(event) {
				// 截图
				// html2canvas(document.getElementById('right')).then(canvas => {
				// 	const base64Image = canvas.toDataURL('image/png');
				// 	this.downPng(base64Image)
				// })
				this.isOrginal = !this.isOrginal;
			},
			downPng(base64Image) {
				var downloadLink = document.createElement("a");
				downloadLink.href = base64Image;
				downloadLink.download = '3333' + ".png";
				downloadLink.click();
				downloadLink.remove();
			}
		}
	}
</script>

<style scoped>
	.message {
		display: flex;
		gap: 1.25rem;
		max-width: 48rem;
		margin: 0px auto;
		position: relative;
		padding-top: 1.4375rem;
		padding-bottom: 1.25em;
	}

	.message-icon {
		flex-shrink: 0;
		align-items: flex-end;
	}

	.message-body {
		width: calc(100% - 100px);
	}

	span.icon {
		color: #fff;
		width: 2.125rem;
		display: block;
		height: 2.125rem;
		text-align: center;
		line-height: 2.125rem;
		font-size: 1.4375rem;
		font-weight: 400;
	}

	.message-tool {
		position: absolute;
		right: -1.25rem;
		display: flex;
		gap: 0.3125rem;
	}

	.message-tool>div {
		border-radius: 50%;
		width: 26px;
		height: 26px;
		display: flex;
		align-content: center;
		justify-content: center;
		align-items: center;
		cursor: pointer;
	}

	.message-tool>div:hover {
		background-color: #ececf1;
	}
</style>
