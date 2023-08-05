<template>
	<!-- 消息体 -->
	<div :style="{'backgroundColor':data.role==='user'?ubgColor:abgColor}" v-if="data">
		<div class="message">
			<div class="message-icon">
				<span class="icon"
					:style="{'background-color':data.role==='user'?uIconColor:aIconColor}">{{data.role==='user'?'U':'S'}}</span>
			</div>
			<div class="message-body" v-highlight v-html="data.html" v-if="data.orginal"></div>
			<!-- 显示原文 -->
			<div class="message-body" v-else>
				<pre
					style="white-space: break-spaces;padding: 10px;border: 1px solid #ececf1;border-radius: 5px;">{{data.content}}
				</pre>
			</div>

			<!-- 按钮 -->
			<div class="message-tool">
				<div @click="copy($event)">
					<a-tooltip title="复制">
						<copy-one theme="filled" size="18" fill="#acacbe" />
					</a-tooltip>
				</div>
				<div @click="capture($event)" v-if="data.role!=='user'">
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
	import '@/assets/css/monokai-sublime.css';
	import '@/assets/css/copy.min.css';
	import html2canvas from 'html2canvas';
	import {
		CopyOne,
		FileCodeOne,
	} from '@icon-park/vue';


	export default {
		name: 'Message',
		components: {
			CopyOne,
			FileCodeOne
		},
		props: {
			role: {
				type: String,
				default: 'user',

			},
			// 内容
			data: {
				type: Object,
			}
		},
		data() {
			return {
				ubgColor: '#fff',
				abgColor: '#f7f7f8',
				uIconColor: '#4f2ba6',
				aIconColor: '#19c37d',
				isOrginal: true,
			}
		},
		methods: {
			copy(event) {
				this.copyToClipboard(this.data.content);
				this.$message.success('已复制剪切板')
			},
			copyToClipboard(text) {
				var input = document.createElement("textarea");
				input.value = text;
				document.body.appendChild(input);
				input.select();
				document.execCommand("copy");
				document.body.removeChild(input);
			},
			capture(event) {
				this.data.orginal = !this.data.orginal;
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