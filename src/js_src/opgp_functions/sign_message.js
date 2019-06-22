//Sign message
const signMessage = function() {
	if (!session.running) {
		session.running = true;
		let $body = $('body');
		async function main() {
			try {
				const privKeyObj = (await resolvePrivKey(session.privKey)).keys[0];
				if (opgpErrorHandler(privKeyObj.err,'privkey')) return;
				const decryptPrivKey = await resolveDecKey(privKeyObj,$('.text-write-passphrase').val());
				if (opgpErrorHandler(decryptPrivKey.err,'decpriv')) return;
				const options = {
					message: openpgp.cleartext.fromText($('.text-write').val()),
					privateKeys: [privKeyObj]
				};
				const signMsg = await resolveSignMsg(options);
				if (opgpErrorHandler(signMsg.err,'signfail')) return;
				const cleartext = signMsg.data.trim();
				session.running = false;
				encryptMessage(cleartext);
			} catch(e) {
				session.running = false;
				$body.removeClass('loading');
				opgpErrorHandler(true,'signfail');
			}
		}
		main();
	}
}
