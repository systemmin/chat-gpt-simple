const BASE_URL = 'http://localhost:8080';

const completionsUrl =`${BASE_URL}/completions`;
const chatUrl =`${BASE_URL}/chat`;
const eventsUrl =`${BASE_URL}/events`;
const modelsUrl =`${BASE_URL}/models`;

module.exports = {
	completionsUrl,
	chatUrl,
	eventsUrl,
	modelsUrl,
}
