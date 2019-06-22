//encrypt attachment
const encryptAttachment = function(){
	if (!session.running) {
		session.running = true;
		let $body = $('body');
		let $attachmentImport = $('.attachment-import');
		async function main() {
			try {
				const fileReader = await resolveLoadFileBuffer($attachmentImport);
				const pbKeyObj = await openpgp.readArmored.key(session.pubKey);
				const options = {
						message: openpgp.message.fromBinary(new Uint8Array(fileReader)),
						publicKeys: pbKeyObj.keys
				};
				const ciphertext = await openpgp.encrypt(options);
				const blob = new Blob([ciphertext.data], {
					type: 'application/octet-stream'
				});
				const url = URL.createObjectURL(blob);
				session.lastEncFile = url;
				session.lastEncFilename = 'encrypted_' + getFilename($('.attachment-import').val());
				session.lastEncFileSigned = false;
				$('.attachment-download').attr('href',url).attr('download',session.lastEncFilename).find('span').html('Download<br>encrypted file');
				session.running = false;
				$body.removeClass('loading');
				$('.popup-filter').addClass('active');
				$('.attachment-window').addClass('active').find('.window-title').find('span').text('Encrypted attachment');
				$('.attachment-view').removeAttr('disabled');
			} catch(e) {
				session.running = false;
				$body.removeClass('loading');
				lipAlert(e);
			}
		}
		main();
	}
}

//decrypt attachment
const decryptAttachment = function(){
	if (!session.running) {
		session.running = true;
		let $body = $('body');
		const $attachmentImport = $('.attachment-import');
		async function main() {
			try {
				const readAttachment = await resolveLoadFileText($attachmentImport);
				const privKeyObj = (await openpgp.readArmored.key(session.privKey)).keys[0];
				const decryptPrivKey = await openpgp.decrypt(privKeyObj,$('.attachment-passphrase').val());
				const pbKeyObj = (await openpgp.readArmored.key(session.pubKey)).keys;
				const msg = await openpgp.message.readArmored(readAttachment);
				const options = {
					message: msg,
					publicKeys: pbKeyObj,
					privateKeys: [privKeyObj],
					format: 'binary'
				}
				const plaintext = await resolveDecMsg(options);
				const blob = new Blob([plaintext.data], {
					type: 'application/octet-stream'
				});
				const url = URL.createObjectURL(blob);
				session.lastDecFile = url;
				session.lastDecFilename = 'decrypted_' + getFilename($attachmentImport.val());
				$('.attachment-download').attr('href',url).attr('download',session.lastDecFilename).find('span').html('Download<br>decrypted file');
				session.running = false;
				$body.removeClass('loading');
				$('.attachment-window').addClass('active').find('.window-title').find('span').text('Decrypted attachment');
				$('.popup-filter').addClass('active');
				$('.attachment-view').removeAttr('disabled');
			} catch(e) {
				session.running = false;
				lipAlert(e);
				$body.removeClass('loading');
			}
		}
		main();
	}
}
