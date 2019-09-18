//Decrypt messages
const decryptMessage = function() {
	if (!session.running) {
		session.running = true;
		const $body = $('body');
		async function main() {
		  try {
				session.lastEncPaste = $('.text-read').val();
				const privKeyObj = (await openpgp.key.readArmored(session.privKey)).keys[0];
				const decryptPrivKey = await privKeyObj.decrypt($('.text-read-passphrase').val());
				const pbKeyObj = (await openpgp.key.readArmored(session.pubKey)).keys;
				const msg = await openpgp.message.readArmored(session.lastEncPaste);
				const options = {
					message: msg,
					publicKeys: pbKeyObj,
					privateKeys: [privKeyObj]
				}
				const plaintext = (await openpgp.decrypt(options));
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
				lipAlert(e);
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
	$processedOutputWindow.find('.processed-output').text(session.lastDec.data).val(session.lastDec.data);
	$('.save-processed').removeClass('hidden').attr('href', dataURItoBlobURL('data:application/octet-stream;base64;filename=decrypted_message.txt,' + btoa(session.lastDec.data))).attr('download', 'decrypted_message.txt');
	$processedOutputWindow.find('textarea').scrollTop(0,0);
	$processedOutputWindow.removeClass('mono steg').find('.window-title').find('span').text('Decrypted message');
	openPopup('.processed-output-window');
}
