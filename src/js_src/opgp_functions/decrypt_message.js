//Decrypt messages
const decryptMessage = function() {
	if (!session.running) {
		session.running = true;
		const $body = $('body');
		async function main() {
		  try {
				session.lastEncPaste = $('.text-read').val();
				const privKeyObj = (await resolvePrivKey(session.privKey)).keys[0];
				if (opgpErrorHandler(privKeyObj.err,'privkey')) return;
				const decryptPrivKey = await resolveDecKey(privKeyObj,$('.text-read-passphrase').val());
				if (opgpErrorHandler(decryptPrivKey.err,'decpriv')) return;
				const pbKeyObj = (await resolvePubKey(session.pubKey)).keys;
				if (opgpErrorHandler(pbKeyObj.err,'pubkey')) return;
				const msg = await resolveDecMsgPrep(session.lastEncPaste);
				if (opgpErrorHandler(msg.err,'parsemsg')) return;
				const options = {
					message: msg,
					publicKeys: pbKeyObj,
					privateKeys: [privKeyObj]
				}
				const plaintext = (await resolveDecMsg(options));
				if (opgpErrorHandler(plaintext.err,'decmsg')) return;
				const $processedAside = $('.processed-aside');
				session.lastDec = plaintext;
				session.running = false;
				if ((session.lastDec.data).search('-----BEGIN PGP SIGNATURE-----') != -1) {
					verifySignature();
				} else {
					$body.removeClass('loading');
					session.lastDecStatus = 'Message decrypted.';
					$processedAside.text(session.lastDecStatus);
					$('.view-message-decrypted').removeAttr('disabled');
					session.running = false;
					viewDecMsg();
				}
			} catch (e) {
				session.running = false;
				opgpErrorHandler(true,'decmsg');
				$body.removeClass('loading');
			}
		}
		main();
	}
}

//View decrypted message
const viewDecMsg = function() {
	let $processedAside = $('.processed-aside');
	let $processedOutputWindow = $('.processed-output-window');
	$processedAside.text(session.lastDecStatus);
	$('.popup-filter').addClass('active');
	$processedOutputWindow.find('.processed-output').text(session.lastDec.data).val(session.lastDec.data);
	$('.save-processed').removeClass('hidden').attr('href', 'data:application/octet-stream;filename=decrypted_message.txt,' + encodeURIComponent(session.lastDec.data)).attr('download', 'decrypted_message.txt');
	$processedOutputWindow.find('textarea').scrollTop(0,0);
	$processedOutputWindow.addClass('active').removeClass('mono steg').find('.window-title').find('span').text('Decrypted message');
}
