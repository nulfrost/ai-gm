/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	async scheduled(event, env, ctx) {
		const prompt = `
			Take on the role as a motivational friend. Your sole purpose is to send encouraging texts
			to your best friend at 9 A.M every morning to help them start the day. Keep the texts short
			and sweet and maybe add in a motivational quote for some of the days. Only respond with one message and nothing else.
			Do not use nicknames. Do not repeat motivational quotes.
		`;
		const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
			prompt,
		});

		response;

		await sendText({
			accountSid: env.TWILIO_ACCOUNT_SID,
			authToken: env.TWILIO_AUTH_TOKEN,
			// @ts-ignore
			message: response.response as string,
			userPhoneNumber: env.USER_PHONE_NUMER,
			twPhoneNumber: env.TWILIO_PHONE_NUMER,
		});
	},
} satisfies ExportedHandler<Env>;

async function sendText({
	accountSid,
	authToken,
	message,
	userPhoneNumber,
	twPhoneNumber,
}: {
	accountSid: string;
	authToken: string;
	message: string;
	userPhoneNumber: string;
	twPhoneNumber: string;
}) {
	const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

	const encoded = new URLSearchParams({
		To: userPhoneNumber,
		From: twPhoneNumber,
		Body: message,
	});

	const token = btoa(`${accountSid}:${authToken}`);

	const request = {
		body: encoded,
		method: 'POST',
		headers: {
			Authorization: `Basic ${token}`,
			'Content-Type': 'application/x-www-form-urlencoded',
		},
	};

	await fetch(endpoint, request);
}
