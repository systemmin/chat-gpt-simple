<template>
	<!-- 消息体 -->
	<div :style="{'backgroundColor':role==='user'?ubgColor:abgColor}">
		<div class="message">
			<div class="message-icon">
				<span class="icon" :style="{'background-color':role==='user'?uIconColor:aIconColor}">M</span>
			</div>
			<div class="message-body">
				<p>消息体消息体消息体消息体消息体消息体消息体消息体消息体消息体消息体消息体222消息体消息体消息体消息体消息体消息体消息体消息体3</p>
				<p>消息体</p>
				<p>消息体</p>
				<p>消息体</p>
				<p>消息体</p>
				<p>消息体</p>
				<p>消息体</p>
				<p>消息体</p>
				<p>消息体</p>
				<p>消息体</p>
				<p>消息体</p>
				<p>消息体</p>
				<p>消息体</p>
				<p>消息体</p>
				<p>消息体</p>
				<p>消息体</p>
				<p>消息体</p>
				<p>消息体</p>
				<p>消息体</p>
				<p>消息体</p>
				<!-- <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path
						d="M18 6H8C6.89543 6 6 6.89543 6 8V18C6 19.1046 6.89543 20 8 20H18C19.1046 20 20 19.1046 20 18V8C20 6.89543 19.1046 6 18 6Z"
						fill="none" stroke="#333" stroke-width="4" stroke-linejoin="round" />
					<path
						d="M18 28H8C6.89543 28 6 28.8954 6 30V40C6 41.1046 6.89543 42 8 42H18C19.1046 42 20 41.1046 20 40V30C20 28.8954 19.1046 28 18 28Z"
						fill="none" stroke="#333" stroke-width="4" stroke-linejoin="round" />
					<path
						d="M40 6H30C28.8954 6 28 6.89543 28 8V18C28 19.1046 28.8954 20 30 20H40C41.1046 20 42 19.1046 42 18V8C42 6.89543 41.1046 6 40 6Z"
						fill="none" stroke="#333" stroke-width="4" stroke-linejoin="round" />
					<path
						d="M40 28H30C28.8954 28 28 28.8954 28 30V40C28 41.1046 28.8954 42 30 42H40C41.1046 42 42 41.1046 42 40V30C42 28.8954 41.1046 28 40 28Z"
						fill="none" stroke="#333" stroke-width="4" stroke-linejoin="round" />
				</svg> -->
				<!-- 消息体内容 -->


			</div>
			<div class="message-tool">
				<button @click="copy($event)">
					<svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path
							d="M13 12.4316V7.8125C13 6.2592 14.2592 5 15.8125 5H40.1875C41.7408 5 43 6.2592 43 7.8125V32.1875C43 33.7408 41.7408 35 40.1875 35H35.5163"
							stroke="#000" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" />
						<path
							d="M32.1875 13H7.8125C6.2592 13 5 14.2592 5 15.8125V40.1875C5 41.7408 6.2592 43 7.8125 43H32.1875C33.7408 43 35 41.7408 35 40.1875V15.8125C35 14.2592 33.7408 13 32.1875 13Z"
							fill="none" stroke="#000" stroke-width="1" stroke-linejoin="round" />
					</svg>
				</button>
				<button @click="capture($event)">
					<svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M6 10H38V42" stroke="#000" stroke-width="1" stroke-linecap="round"
							stroke-linejoin="round" />
						<path d="M10.5483 37.4519L42.385 5.61519" stroke="#000" stroke-width="1" stroke-linecap="round"
							stroke-linejoin="round" />
						<path d="M42 38H10V6" stroke="#000" stroke-width="1" stroke-linecap="round"
							stroke-linejoin="round" />
					</svg>
				</button>
			</div>

		</div>
	</div>
</template>

<script>
	export default {
		name: 'Message',
		props: {
			// assistant user
			role: {
				type: String,
				default: 'user'
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
			}
		},
		methods: {
			copy(event) {
				console.log(event)
			},
			capture(event) {
				console.log(event)
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
		width: calc(100% - 115px);
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
		right: -3.75rem;
		display: flex;
		gap: 0.3125rem;
	}

	.message-tool>button:hover {
		background-color: #ececf1;
	}

	.message-tool>button {
		border: none;
		cursor: pointer;
		border-radius: 50%;
		padding: 0.3125rem;
		background-color: #f7f7f8;
	}

	.message-tool>button>svg {
		width: 1.125rem;
		height: 1.125rem;
		vertical-align: middle;
	}
</style>