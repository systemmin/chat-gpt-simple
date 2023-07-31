<template>
	<div id="app">
		<div id="main">
			<div id="left">1</div>
			<div id="right">
				<message></message>
				<message role="assistant"></message>

				<a-affix :offset-bottom="bottom" style="background-image: linear-gradient(180deg,hsla(0,0%,100%,0) 13.94%,#fff 54.73%);">
					<div id="bottom-send">
						<a-textarea placeholder="Basic usage" :rows="4" />
					</div>
				</a-affix>
			</div>

		</div>
	</div>
</template>

<script>
	import message from '@/components/Message/index'
	export default {
		name: 'App',
		components: {
			message
		},
		data() {
			return {
				bottom: 20,
			}
		}
	}
</script>

<style>
	* {
		padding: 0px;
		margin: 0px;
	}

	#app {
		font-family: Avenir, Helvetica, Arial, sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		color: #2c3e50;
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
		background-color: aliceblue;
		overflow: auto;
	}
	#bottom-send{
		background-image: linear-gradient(180deg,hsla(0,0%,100%,0) 13.94%,#fff 54.73%);
	}
</style>