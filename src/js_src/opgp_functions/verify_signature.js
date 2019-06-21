//Verify signature of message
const verifySignature = function() {
	if (!session.running) {
		session.running = true;
		async function main() {
			try {
				let $body = $('body');
				const pbKeyObj = await resolvePubKey(session.pubKey).keys;
				const msg = await resolveVerifyMsgPrep(session.lastDec.data);
				const options = {
					message: msg,
					publicKeys: pbKeyObj
				}
				const verified = await resolveVerifyMsg(options);
				let $processedAside = $('.processed-aside');
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


/*
		openpgp.key.readArmored(session.pubKey).then(pbKeys => {
			pbKeyObj = pbKeys.keys;
			openpgp.cleartext.readArmored(session.lastDec.data).then(msg => {
				let options = {
					message: msg,
					publicKeys: pbKeyObj
				}
				openpgp.verify(options).then(function(verified) {
					let $processedAside = $('.processed-aside');
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
				}).catch(function(e) {
					session.running = false;
					$body.removeClass('loading');
					lipAlert('The signature cannot be verified. It may be corrupted.');
				});
			}).catch(function(e) {
				session.running = false;
				$body.removeClass('loading');
				lipAlert('The signature cannot be read. It maybe corrupted.');
			});
		}).catch(function(e) {
			session.running = false;
			$body.removeClass('loading');
			lipAlert('The public key cannot be read. It may be corrupted.');
			//console.log('readpubkey'+e);
		});
	*/
	}
}
