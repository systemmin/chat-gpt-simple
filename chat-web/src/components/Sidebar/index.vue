<template>
	<div>
		<!-- 顶部 -->
		<a-affix :offset-top="top">
			<div class="session">
				<div class="create-session cursor-p" @click="onNewChat()">
					<plus theme="outline" size="24" fill="#fff" :strokeWidth="2" />
					<div>新会话</div>
				</div>
				<div class="icon-session cursor-p" @click="onCollapse()">
					<expand-right theme="outline" size="24" fill="#fff" :strokeWidth="4" />
				</div>
			</div>
			<div class="session" style="background-color:#050509;" @click="onExample()">
				<div class="create-session cursor-p">
					<text-message theme="outline" size="24" fill="#fff" :strokeWidth="4" />
					<div>示例语句</div>
				</div>
			</div>
			<div class="session" style="background-color:#050509;" @click="onSetting()">
				<div class="create-session cursor-p">
					<setting theme="outline" size="24" fill="#fff" :strokeWidth="4" />
					<div>系统配置</div>
				</div>
			</div>
		</a-affix>
		<div class="center">
			<div class="record" v-for="(item,i) in historys" :style="{backgroundColor:index===i?'#343541':''}"
				@click="onRecord(i)">
				<div style="display: flex;">
					<comment theme="outline" size="18" fill="#a7a7ae" :strokeWidth="4" />
				</div>
				<div>{{item.title}}</div>
				<!-- <div><a-input style="background-color: #050509;color: white;"></a-input></div> -->
				<div class="tool" v-if="index===i">
					<pencil theme="outline" size="18" fill="#a7a7ae" :strokeWidth="4" />
					<delete-four @click="onDelete(item.pid)" theme="outline" size="18" fill="#d8171a" :strokeWidth="4" />
				</div>
			</div>
		</div>
	</div>

</template>

<script>
	import {
		Plus,
		IndentLeft,
		ExpandRight,
		TextMessage,
		Comment,
		DeleteFour,
		Pencil,
		Setting,
		ExpandLeft
	} from '@icon-park/vue';
	export default {
		name: 'Sidebar',
		components: {
			Plus,
			IndentLeft,
			ExpandRight,
			TextMessage,
			Setting,
			Comment,
			DeleteFour,
			Pencil,
			ExpandLeft
		},
		props: {
			historys: {
				type: Array
			},
			index: {
				type: Number,
				default: 0
			}
		},
		data() {
			return {
				text: '',
				top: 0,
				active: false,
			}
		},
		methods: {

			onCollapse() {
				document.getElementById('left').style.display = 'none';
				document.getElementById('bottom-send').style.width = '100vw';
				document.getElementById('sys-config').style.display = 'none';
				document.getElementById('tips-text').style.display = 'none';
				this.$emit('collapse', false)
			},
			onSetting() {
				const sysConfigEl = document.getElementById('sys-config');
				if (!sysConfigEl.style.display || sysConfigEl.style.display === 'block') {
					sysConfigEl.style.display = 'none';
				} else {
					sysConfigEl.style.display = 'block';
				}
				this.$emit('setting', true);
			},
			onExample() {
				const sysConfigEl = document.getElementById('tips-text');
				if (!sysConfigEl.style.display || sysConfigEl.style.display === 'block') {
					sysConfigEl.style.display = 'none';
				} else {
					sysConfigEl.style.display = 'block';
				}
				this.$emit('onExample', true);
			},
			onNewChat() {
				this.$emit('onChat', true);
			},
			onRecord(index) {
				this.$emit('onDetail', index);
			},
			onDelete(pid){
				this.$emit('onDelete', pid);
			}
			
		}

	}
</script>

<style scoped>
	.session {
		border: 0. solid #d9d9e3;
		display: flex;
		align-items: center;
		margin: 0.4375rem;
		gap: 0.625rem;

	}

	.icon-session {
		flex: 0 0 1.5rem;
		padding: 0.1875rem 0.4375rem;
	}

	.create-session {
		flex: 1;
		padding: 0.4375rem;
		display: flex;
		align-items: center;
		gap: 0.625rem;
	}

	.create-session:hover,
	.icon-session:hover {
		background-color: #2b2c2f;
	}

	.cursor-p {
		cursor: pointer;
		border-radius: 0.3125rem;
		border: 0.0625rem solid #555659;
		padding-top: 0.375rem;
	}

	.center {
		overflow: auto;
		height: calc(100vh - 150px);
		scrollbar-color: #bbbbbb #202123;
		scrollbar-width: thin;
	}

	.center::-webkit-scrollbar-track {
		background-color: #202123;
		/* 轨道颜色 */
	}

	.record {
		display: flex;
		margin: 0.625rem;
		padding: 0.625rem;
		cursor: pointer;
		border-radius: 0.3125rem;
		gap: 0.3125rem;
		align-items: center;
		position: relative;
	}

	.record:hover {
		background-color: #2a2b32;
	}

	.record:active {
		background-color: #343541;
	}

	.record div:first-child {
		flex: 0 0 1.25rem
	}

	.tool {
		display: flex;
		justify-content: space-evenly;
		position: absolute;
		right: 0px;
		background-color: #343541;
		width: 3.0625rem
	}

	.record div:nth-child(2) {
		flex: 1;
		justify-self: start;
		overflow: hidden;
		white-space: nowrap;
		max-width: 11.25rem
	}
</style>