import Vue from 'vue'
import App from './App.vue'
import 'ant-design-vue/dist/antd.css'; // or 'ant-design-vue/dist/antd.less'
import { DatePicker,message,Button,Input,Affix} from 'ant-design-vue';
Vue.use(DatePicker);
Vue.use(Button);
Vue.use(Input);
Vue.use(Affix);

Vue.config.productionTip = false
Vue.prototype.$message = message;

new Vue({
  render: h => h(App),
}).$mount('#app')
