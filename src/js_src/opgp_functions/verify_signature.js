//Verify signature of message
const verifySignature = function() {
	if (!session.running) {
		session.running = true;
		let $body = $('body');
		let $processedAside = $('.processed-aside');
		async function main() {
			try {
				const pbKeyObj = (await resolvePubKey(session.pubKey)).keys;
				const msg = await resolveVerifyMsgPrep(session.lastDec.data);
				const options = {
					message: msg,
					publicKeys: pbKeyObj
				}
				const verified = await resolveVerifyMsg(options);
				validity = verified.signatures[0].valid;
				if (validity) {
					session.lastDecStatus = 'Message decrypted. Signature valid.';
				} else {
					session.lastDecStatus = 'Message decrypted. Signature not valid.';
				}
				$processedAside.text(session.lastDecStatus);
				$('.view-message-decrypted').removeAttr('disabled');
				$body.removeClass('loading');
				session.running = false;
				viewDecMsg();
			} catch(e) {
				lipAlert(e);
				session.running = false;
				$body.removeClass('loading');
			}
		}
		main();
	}
}
