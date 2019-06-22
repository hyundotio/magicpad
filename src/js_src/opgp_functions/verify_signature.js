//Verify signature of message
const verifySignature = function() {
	if (!session.running) {
		session.running = true;
		let $body = $('body');
		let $processedAside = $('.processed-aside');
		async function main() {
			try {
				const pbKeyObj = (await resolvePubKey(session.pubKey)).keys;
				if (opgpErrorHandler(pbKeyObj.err, 'pubkey')) return;
				const msg = await resolveVerifyMsgPrep(session.lastDec.data);
				if (opgpErrorHandler(msg.err), 'parsesignmsg') return;
				const options = {
					message: msg,
					publicKeys: pbKeyObj
				}
				const verified = await resolveVerifyMsg(options);
				if (opgpErrorHandler(verified.err), 'invalidsign') return;
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
				opgpErrorHandler(true,'parsesignmsg');
				session.running = false;
				$body.removeClass('loading');
			}
		}
		main();
	}
}
