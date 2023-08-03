import Vue from 'vue'
import App from './App.vue'
import 'ant-design-vue/dist/antd.css'; // or 'ant-design-vue/dist/antd.less'
import {
	DatePicker,
	message,
	Button,
	Input,
	Affix,
	FormModel,
	Radio,
	Select,
	InputNumber,
	Row,
	Col,
	Slider,
	Tooltip,
	Icon,
	Divider,
} from 'ant-design-vue';
Vue.use(DatePicker);
Vue.use(Button);
Vue.use(Input);
Vue.use(Affix);
Vue.use(FormModel);
Vue.use(Radio);
Vue.use(Select);
Vue.use(InputNumber);
Vue.use(Row);
Vue.use(Col);
Vue.use(Slider);
Vue.use(Tooltip);
Vue.use(Icon);
Vue.use(Divider);

import {
	CheckOne
} from '@icon-park/vue';
import '@icon-park/vue/styles/index.css';
Vue.use(CheckOne);

Vue.config.productionTip = false
Vue.prototype.$message = message;

import highlight from 'highlight.js';
Vue.use(highlight);
//封装成一个指令
Vue.directive('highlight', (el) => {
	let blocks = el.querySelectorAll('pre code')
	blocks.forEach((block) => {
		highlight.highlightBlock(block)
	})
})
import CopyButtonPlugin from '@/assets/js/copy.min.js'
// hljs 拷贝插件
highlight.addPlugin(new CopyButtonPlugin());

new Vue({
	render: h => h(App),
}).$mount('#app')
