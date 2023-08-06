/**
 * @description 统一结果处理对象
 */
class Result {
	static code = 200;
	static message = '操作成功';
	static data = {};
	constructor() {

	}
	static ok(data) {
		this.code = 200;
		this.data = data;
		this.message = '操作成功';
		return this;
	}
	static ok(data, message = '操作成功') {
		this.code = 200;
		this.data = data;
		this.message = message;
		return this;
	}
	static fail() {
		this.code = 500;
		this.message = '请求失败';
		return this;
	}
	static fail(data) {
		this.data = data;
		this.code = 500;
		this.message = '操作失败';
		return this;
	}
	static fail(data, message = '操作失败') {
		this.data = data;
		this.code = 500;
		this.message = message;
		return this;
	}
	static stringify() {
		return {
			data: this.data,
			code: this.code,
			message: this.message
		};
	}
}
module.exports = Result;