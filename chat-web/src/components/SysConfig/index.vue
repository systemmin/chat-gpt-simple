<template>
	<!-- 系统配置组件 -->
	<div id="sys-config">
		<a-form-model layout="vertical" ref="form" :rules="validatorRules" :model="form">
			<a-form-model-item label="模式" prop="mode">
				<a-select :default-value="form.mode" v-model="form.mode" @change="handleModeChange" placeholder="请选择模式">
					<a-select-option value="web">
						聊天-TOKEN
					</a-select-option>
					<a-select-option value="chat">
						聊天-API
					</a-select-option>
					<a-select-option value="complate">
						补全
					</a-select-option>
				</a-select>
			</a-form-model-item>
			<a-form-model-item label="模型" prop="model">
				<a-select :default-value="form.model" v-model="form.model" @change="handleModelChange"
					placeholder="请选择模型">
					<a-select-option :value="item.id" v-for="(item,i) in models" :key="i">
						{{item.id}}
					</a-select-option>
				</a-select>
			</a-form-model-item>
			<a-form-model-item prop="temperature" v-if="form.mode!=='web'">
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
			<a-form-model-item prop="max_tokens" v-if="form.mode!=='web'">
				<span slot="label">
					max_tokens&nbsp;
					<a-tooltip title="补全时生成的最大标记(tokens)数。">
						<a-icon type="question-circle-o" />
					</a-tooltip>
				</span>
				<div style="display: flex;">
					<a-slider style="flex: 1;" v-model="form.max_tokens" :min="1" :step="1" :max="max_tokens" />
					<a-input-number style="flex: 0 0 60px;" v-model="form.max_tokens" :min="1" :step="1"
						:max="max_tokens" @change="numberChange()" />
				</div>
			</a-form-model-item>

			<a-form-model-item v-if="form.mode!=='web'">
				<span slot="label">
					API_KEY&nbsp;
					<a-tooltip title="从ChatGPT链接https://platform.openai.com/account/api-keys获取">
						<a-icon type="question-circle-o" />
					</a-tooltip>
				</span>
				<a-input placeholder="与ACCESS_TOKEN选其一" v-model="form.key"  />
			</a-form-model-item>

			<a-form-model-item v-if="form.mode=='web'">
				<span slot="label">
					ACCESS_TOKEN&nbsp;
					<a-tooltip title="从ChatGPT链接https://chat.openai.com/api/auth/session获取、配置token仅支持使用Chat-GPT最新版本接口">
						<a-icon type="question-circle-o" />
					</a-tooltip>
				</span>
				<a-input placeholder="与API_KEY可选其一" v-model="form.token" />
			</a-form-model-item>
			<a-form-model-item>
				<a-button type="primary"  ghost block @click="submit()">保存配置</a-button>
			</a-form-model-item>
		</a-form-model>
	</div>
</template>

<script>
	import {
		SendOne
	} from '@icon-park/vue';
	import {
		modelsUrl
	} from '@/api/config'
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
					mode: 'web',
					model: 'gpt-3.5-turbo',
					max_tokens: 256,
					temperature: 1,
					key:'',
					token:'',
				},
				max_tokens: 2049, // 补全模型最大限制
				models: [], // 模型列表
				chat_models: [{
						id: 'gpt-3.5-turbo',
						max_tokens: 4096,
					},
					{
						id: 'gpt-3.5-turbo-16k',
						max_tokens: 16384,
					},
					{
						id: 'gpt-3.5-turbo-0613',
						max_tokens: 4096,
					},
					{
						id: 'gpt-3.5-turbo-16k-0613',
						max_tokens: 16384,
					}
				], // 聊天模型
				complate_models: [], // 补全模型
				validatorRules: {
					mode: [{
						required: true,
						message: '请选择模式!'
					}],
					model: [{
						required: true,
						message: '请选择模型!'
					}]
				},
			}
		},
		created() {
			this.init()
		},
		methods: {
			async init() {
				try {
					const response = await fetch(modelsUrl);
					const res = await response.json()
					if (res.code === 200) {
						const list = res.data.data;
						// 过滤系统模型，和用户微调模型
						const usable = list.filter(item => item.owned_by === 'openai' || item.owned_by.includes(
							'user-'));
						// 聊天模型
						const chat_models = usable.filter(item => item.root.includes('gpt'))
						// 补全模型 ,排除编辑（edit）和嵌入（babbage）模型 
						const complate_models = usable.filter(item => !item.root.includes('gpt') && !item.root
							.includes(
								'edit') && !item.root.includes('babbage'))
						// 默认 聊天模型
						this.models = this.chat_models;
						this.complate_models = complate_models;
					} else {
						this.$message.error(res.message)
					}
				} catch (e) {
					console.log(e)
					this.$message.error(e.toString())
				}
			},
			/**
			 * 选择模式更换模式
			 * @param {Object} code
			 */
			handleModeChange(code) {
				this.form.model = '';
				this.models = code === 'web' ? this.chat_models : this[code + '_models'];
				this.$emit('onModel',code);
			},
			/**
			 * @param {Object} code 模型
			 */
			handleModelChange(code) {
				if (code.includes('gpt')) {
					this.max_tokens = this.chat_models.filter(item => item.id === code)[0].max_tokens
				}
				localStorage.setItem('sysConfig', JSON.stringify(this.form))
			},
			submit() {
				this.$refs.form.validate(valid => {
					if (valid) {
						this.$message.success('保存成功');
						localStorage.setItem('sysConfig', JSON.stringify(this.form));
					}
				})
			}
		},
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
		display: block;
	}

	>>>.ant-form-item-label>label {
		font-size: 1rem;
		font-weight: 600;
	}
</style>