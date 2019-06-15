//Decrypt messages
function decryptMessage() {
	if (!session.running) {
		session.running = true;
		let privKeyObj;
		let pbKeyObj;
		let parsedMsg;
		let $body = $('body');
		session.lastEncPaste = $('.text-read').val();
		openpgp.key.readArmored(session.privKey).then(pvKeys => {
			privKeyObj = pvKeys.keys[0];
			privKeyObj.decrypt($('.text-read-passphrase').val()).then(output => {
				openpgp.key.readArmored(session.pubKey).then(pbKeys => {
					pbKeyObj = pbKeys.keys;
					openpgp.message.readArmored(session.lastEncPaste).then(msg => {
						let options = {
							message: msg,
							publicKeys: pbKeyObj,
							privateKeys: [privKeyObj]
						}
						openpgp.decrypt(options).then(plaintext => {
							let $processedAside = $('.processed-aside');
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
						}).catch(function(e) {
							session.running = false;
							lipAlert('Cannot decrypt message. Try a different private key.');
							$body.removeClass('loading');
						});
					}).catch(function(e) {
						session.running = false;
						lipAlert('The encrypted message cannot be parsed and/or is formatted incorrectly.');
						$body.removeClass('loading');
					});
				}).catch(function(e) {
					session.running = false;
					lipAlert('The public key cannot be read. It may be corrupted.');
					$body.removeClass('loading');
				});
			}).catch(function(e) {
				session.running = false;
				lipAlert('The private key passphrase is incorrect.');
				$body.removeClass('loading');
			});
		}).catch(function(e) {
			session.running = false;
			lipAlert('The private key cannot be read. It may be corrupted.');
			$body.removeClass('loading');
		});
	}
}

//View decrypted message
function viewDecMsg() {
	let $processedAside = $('.processed-aside');
	let $processedOutputWindow = $('.processed-output-window');
	$processedAside.text(session.lastDecStatus);
	$('.popup-filter').addClass('active');
	$processedOutputWindow.find('.processed-output').text(session.lastDec.data).val(session.lastDec.data);
	$('.save-processed').removeClass('hidden').attr('href', 'data:application/octet-stream;filename=decrypted_message.txt,' + encodeURIComponent(session.lastDec.data)).attr('download', 'decrypted_message.txt');
	$processedOutputWindow.find('textarea').scrollTop(0,0);
	$processedOutputWindow.addClass('active').removeClass('mono steg').find('.window-title').find('span').text('Decrypted message');
}
