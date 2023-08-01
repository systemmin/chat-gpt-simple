<template>
	<!-- 发送消息组件 -->
	<div id="bottom-send">
		<div class="input-textarea">
			<a-textarea id="ttttt" v-model="text" ref="refContent" @keydown="handleKeyDown" @pressEnter="pressEnter"
				@input="input"></a-textarea>

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
				text: '',
				rowHeight: 24,
			}
		},
		mounted() {
			// 清除默认 class ，
			document.getElementById('ttttt').className = 'ccc';
		},
		methods: {
			pressEnter($event) {
				console.log(event)
			},
			handleKeyDown(event) {
				if (event.keyCode === 13 && event.shiftKey) {
					// 在这里执行你想要的操作
					let height = this.$refs.refContent.$el.style.height;
					if (height) {
						let h = height.split('px')[0];
						height = parseInt(h) + this.rowHeight + 'px';
					} else {
						height = 2 * this.rowHeight + 'px';
					}
					this.$refs.refContent.$el.style.height = height;
				}
			},
			input() {
				console.log(this.text)
			},
			send() {
				console.log(this.text)
				console.log('发送')
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
		height: 30px;
		line-height: 30px;
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 5px;
		cursor: pointer;

	}
</style>