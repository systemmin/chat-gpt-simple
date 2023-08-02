<template>
	<!-- 发送消息组件 -->
	<div id="bottom-send">
		<div class="input-textarea">
			<a-textarea id="ttttt" v-model="text" ref="refContent" @pressEnter="pressEnter"
				:autoSize="{ minRows: 1, maxRows: 6 }" placeholder="请输入您的问题？Enter 发送消息、Shift+Enter 换行"></a-textarea>
			<div class="send-btn" @click="send()" v-if="text.length>0">
				<send-one theme="outline" size="24" fill="#fff" :strokeWidth="4" />
			</div>
		</div>

	</div>
</template>

<script>
	import {
		SendOne
	} from '@icon-park/vue';
	export default {
		name: 'Message',
		components: {
			SendOne
		},
		props: {

		},
		data() {
			return {
				text: ''
			}
		},
		mounted() {
			// 清除默认 class ，
			document.getElementById('ttttt').className = 'ccc';
		},
		methods: {
			pressEnter(event) {
				// enter 发送消息 enter+shift 换行
				if (event.keyCode == 13 && !event.shiftKey) {
					event.preventDefault(); // 禁止换行
					this.send();
				}
			},
			send() {
				if (!this.text) {
					return;
				}
				this.$emit('send', this.text);
				this.text = '';
			}
		}
	}
</script>

<style scoped>
	#bottom-send {
		background-image: linear-gradient(180deg, hsla(0, 0%, 100%, 0) 13.94%, #fff 54.73%);
		position: fixed;
		bottom: 0px;
		width: calc(100% - 15.625rem);
		padding: 1.25rem 0rem;
	}

	.input-textarea {
		max-width: 48rem;
		margin: 0px auto;
		display: flex;
		box-shadow: 0 0 15px rgba(0, 0, 0, .1);
		border: 1px solid rgba(0, 0, 0, .1);
		padding: 0.625rem;
		border-radius: 0.625rem;
		background-color: #fff;
		align-items: flex-end;

	}

	textarea {
		border: none;
		outline: none;
		resize: none !important;
		flex: 1;
		font-size: 16px !important;
		max-height: 200px;
		height: 24px;
		padding-left: 5px;
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



	.send-btn {
		flex: 0 0 30px;
		background-color: #19c37d;
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 5px;
		cursor: pointer;
	}
</style>
