//Sign message
const signMessage = function() {
	if (!session.running) {
		session.running = true;
		let $body = $('body');
		async function main() {
			try {
				const privKeyObj = (await resolvePrivKey(session.privKey)).keys[0];
				const decryptPrivKey = await resolveDecKey(privKeyObj,$('.text-write-passphrase').val());
				const options = {
					message: openpgp.cleartext.fromText($('.text-write').val()),
					privateKeys: [privKeyObj]
				};
				const signMsg = await resolveSignMsg(options);
				const cleartext = signMsg.data.trim();
				session.running = false;
				encryptMessage(cleartext,true);
			} catch(e) {
				session.running = false;
				$body.removeClass('loading');
				lipAlert(e);
			}
		}
		main();
	}
}
