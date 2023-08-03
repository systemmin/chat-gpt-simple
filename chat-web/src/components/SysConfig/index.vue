<template>
	<!-- 系统配置组件 -->
	<div id="sys-config">
		<a-form-model layout="vertical" :model="form">
			<a-form-model-item label="模式">
				<a-select default-value="Chat" @change="handleChange" placeholder="请选择模式">
					<a-select-option value="Chat">
						Chat
					</a-select-option>
					<a-select-option value="Complate">
						Complate
					</a-select-option>
				</a-select>
			</a-form-model-item>
			<a-form-model-item label="模型">
				<a-select default-value="v1" @change="handleChange" placeholder="请选择模型">
					<a-select-option value="v1">
						v1
					</a-select-option>
					<a-select-option value="v2">
						v2
					</a-select-option>
				</a-select>
			</a-form-model-item>
			<a-form-model-item>
				<span slot="label">
					temperature&nbsp;
					<a-tooltip title="使用什么temperature，介于 0 和 2 之间。较高的值（如 0.8）将使输出更加随机，而较低的值（如 0.2）将使输出更加集中和确定">
						<a-icon type="question-circle-o" />
					</a-tooltip>
				</span>
				<div style="display: flex;">
					<a-slider style="flex: 1;" v-model="form.temperature" :min="0.1" :step="0.1" :max="2" />
					<a-input-number style="flex: 0 0 50px;" v-model="form.temperature" :min="0.1" :step="0.1"
						:max="2" />
				</div>
			</a-form-model-item>
			<a-form-model-item>
				<span slot="label">
					max_tokens&nbsp;
					<a-tooltip title="补全时生成的最大标记(tokens)数。">
						<a-icon type="question-circle-o" />
					</a-tooltip>
				</span>
				<div style="display: flex;">
					<a-slider style="flex: 1;" v-model="form.max_tokens" :min="1" :step="1" :max="2049" />
					<a-input-number style="flex: 0 0 60px;" v-model="form.max_tokens" :min="1" :step="1" :max="2049"
						@change="numberChange()" />
				</div>
			</a-form-model-item>
			
			<a-form-model-item>
				<span slot="label">
					API_KEY&nbsp;
					<a-tooltip title="从ChatGPT链接https://platform.openai.com/account/api-keys获取">
						<a-icon type="question-circle-o" />
					</a-tooltip>
				</span>
				 <a-input placeholder="与ACCESS_TOKEN选其一" />
			</a-form-model-item>
			
			<a-form-model-item>
				<span slot="label">
					ACCESS_TOKEN&nbsp;
					<a-tooltip title="从ChatGPT链接https://chat.openai.com/api/auth/session获取、配置token仅支持使用Chat-GPT最新版本接口">
						<a-icon type="question-circle-o" />
					</a-tooltip>
				</span>
				 <a-input placeholder="与API_KEY可选其一" />
			</a-form-model-item>
			<a-form-model-item>
				<a-button type="primary" ghost block @click="submit()">保存配置</a-button>
			</a-form-model-item>
		</a-form-model>
	</div>
</template>

<script>
	import {
		SendOne
	} from '@icon-park/vue';
	export default {
		name: 'SysConfig',
		components: {
			SendOne
		},
		props: {

		},
		data() {
			return {
				form: {
					mode: '',
					model: '',
					max_tokens: 256,
					temperature: 1,
				},
			}
		},
		methods: {
			numberChange() {

			},
			handleChange() {

			},
			submit() {
				this.$message.success('保存成功')
				console.log(this.form);
			}
		}
	}
</script>

<style scoped>
	#sys-config {
		position: fixed;
		right: 0px;
		background-color: white;
		width: 250px;
		height: 100vh;
		border-left: 1px solid #dededf;
		padding: 10px;
		display: none;
	}

	>>>.ant-form-item-label>label {
		font-size: 1rem;
		font-weight: 600;
	}
</style>
