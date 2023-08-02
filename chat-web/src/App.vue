<template>
	<div id="app">
		<div id="main">
			<div id="left">
				<sidebar @collapse="(e)=>show=!e"></sidebar>
			</div>
			<div id="right">
				<message></message>
				<message role="assistant"></message>
				<div style="height: 6.25rem;border-top: 1px solid #dededf;"></div>
				<send-text></send-text>
			</div>

		</div>
		<!-- 折叠按钮 -->
		<div v-if="show" style="position: fixed;top: 20px;left: 20px;cursor: pointer;" @click="handleCollapse()">
			<expand-left theme="outline" size="24" fill="#000" :strokeWidth="4" />
		</div>
	</div>
</template>

<script>
	import Message from '@/components/Message/index';
	import SendText from '@/components/SendText/index';
	import Sidebar from '@/components/Sidebar/index';
	import {
		SendOne,
		ExpandLeft
	} from '@icon-park/vue';
	export default {
		name: 'App',
		components: {
			Message,
			SendText,
			SendOne,
			Sidebar,
			ExpandLeft
		},
		data() {
			return {
				bottom: 20,
				top: 20,
				show: false,
			}
		},

		methods: {
			handleCollapse(e) {
				document.getElementById('left').style.display = 'block';
				document.getElementById('bottom-send').style.width='calc(100% - 15.625rem)';
				this.show = false;
			}
		}
	}
</script>

<style>
	* {
		padding: 0px;
		margin: 0px;
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
	}

	#right {
		flex: 1;
		height: 100vh;
		background-color: #ffffff;
		overflow: auto;
	}
</style>