<template>
	<div>
		<!-- 顶部 -->
		<a-affix :offset-top="top">
			<div class="session">
				<div class="create-session cursor-p">
					<plus theme="outline" size="24" fill="#fff" :strokeWidth="2" />
					<div>新会话</div>
				</div>
				<div class="icon-session cursor-p">
					<expand-right theme="outline" size="24" fill="#fff" :strokeWidth="2" />
					<!-- <expand-left theme="outline" size="24" fill="#d9d9e3" :strokeWidth="1"/> -->
				</div>
			</div>
			<div class="session" style="background-color:#050509;">
				<div class="create-session cursor-p">
					<text-message theme="outline" size="24" fill="#fff" :strokeWidth="2" />
					<div>示例语句</div>
				</div>
			</div>
			<div class="session" style="background-color:#050509;">
				<div class="create-session cursor-p">
					<setting theme="outline" size="24" fill="#fff" :strokeWidth="2" />
					<div>系统配置</div>
				</div>
			</div>
		</a-affix>
		<div class="center">
			<div class="record" v-for="(item,i) in 50" :style="{backgroundColor:index===i?'#343541':''}"
				@click="handleRecord(i)">
				<div style="display: flex;">
					<comment theme="outline" size="18" fill="#a7a7ae" :strokeWidth="2" />
				</div>
				<div>系统配置系统配置系统配置系统配置</div>
				<div class="tool" v-if="index===i">
					<pencil theme="outline" size="18" fill="#a7a7ae" :strokeWidth="2" />
					<delete-four theme="outline" size="18" fill="#a7a7ae" :strokeWidth="2" />
				</div>
			</div>

		</div>
		<div class="bottom"></div>
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
		Setting
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
			Pencil
		},
		props: {

		},
		data() {
			return {
				text: '',
				top: 0,
				active: false,
				index: 0,
			}
		},
		methods: {
			handleRecord(index) {
				this.index = index;
			},
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

	.create-session:hover {
		/* background-color: #2b2c2f; */
		background-color: #40414f;

	}

	.cursor-p {
		cursor: pointer;
		border-radius: 0.3125rem;
		border: 0.0625rem solid #555659;
		padding-top: 6px;
	}

	.center {
		overflow: auto;
		height: calc(100vh - 130px);
	}

	.record {
		display: flex;
		margin: 10px;
		padding: 10px;
		cursor: pointer;
		border-radius: 5px;
		gap: 5px;
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
		flex: 0 0 20px;
	}

	.tool {
		display: flex;
		justify-content: space-evenly;
		position: absolute;
		right: 0px;
		background-color: #343541;
		width: 49px;
	}

	/* .record div:last-child {
		flex: 0 0 40px
	} */

	.record div:nth-child(2) {
		flex: 1;
		justify-self: start;
		overflow: hidden;
		white-space: nowrap;
		max-width: 164px;
	}
</style>