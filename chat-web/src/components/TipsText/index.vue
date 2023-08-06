<template>
	<!-- 系统配置组件 -->
	<div id="tips-text">
		<!-- 搜索框 -->
		<div>
			<a-input v-model="text" placeholder="请输入搜索内容" allowClear @input="onSearch" />
		</div>

		<div style="height: 45px;"></div>

		<div class="tips-item" v-for="(item,i) in text?searchList:list" @click="onTips(item)" :key="i">
			<div><span>{{item.act}}</span></div>
			<hr style="margin:5px 0px;">
			<div class="text-container">{{item.prompt}}</div>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'TipsText',
		components: {},
		props: {

		},
		data() {
			return {
				text: '',
				searchList: [],
				list: []
			}
		},
		created() {
			this.init()
		},
		methods: {
			async init() {
				const response = await fetch('tips.json')
				const data =await response.json();
				this.list=data;
			},
			onTips(item) {
				this.$emit('tips', item);
			},
			onSearch() {
				const text = this.text;
				if (text) {
					this.searchList = this.list.filter(item => item.act.includes(text) || item.prompt.includes(text));
				}
			}
		}
	}
</script>

<style scoped>
	#tips-text {
		position: fixed;
		left: 250px;
		background-color: #202123;
		width: 250px;
		height: 100vh;
		border-left: 1px solid #525355;
		color: #ececf1;
		overflow: auto;
		display: none;
		scrollbar-color: #bbbbbb #202123;
		scrollbar-width: thin;
	}

	#tips-text>div:first-child {
		padding: 10px;
		position: fixed;
		top: 0px;
		background-color: #202123;
	}

	.tips-item {
		margin: 2px 0px;
		padding: 0.625rem;
		cursor: pointer;
	}

	.tips-item:hover {
		background-color: #2a2b32;
	}

	.tips-item:active {
		background-color: #343541;
	}

	.text-container {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		overflow: hidden;
		text-overflow: ellipsis;
		-webkit-line-clamp: 3;
		/* 设置显示的行数 */
		color: chartreuse;
		font-size: 13px;
	}

	>>>.ant-input {
		background-color: #050509;
		color: #fff;
	}

	>>>.ant-input-clear-icon {
		color: #f5f5f5;
	}

	>>>.ant-input-clear-icon:hover {
		color: white;
	}
</style>