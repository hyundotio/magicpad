//encrypt attachment
const encryptAttachment = function(){
	if (!session.running) {
		session.running = true;
		let $body = $('body');
		let $attachmentImport = $('.attachment-import');
		async function main() {
			try {
				const fileReader = await resolveLoadFileBuffer($attachmentImport[0].files[0]);
				const pbKeyObj = await resolvePubKey(session.pubKey);
				if (opgpErrorHandler(pbKeyObj.err,'pubkey')) return;
				const options = {
						message: openpgp.message.fromBinary(new Uint8Array(fileReader.result)),
						publicKeys: data.keys
				};
				const ciphertext = await resolveEncMsg(options);
				if (opgpErrorHandler(ciphertext.err,'encattach')) return;
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
				opgpErrorHandler(true,'encattach');
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
				const readAttachment = await resolveLoadFileText($attachmentImport[0].files[0]);
				const privKeyObj = await resolvePrivKey(session.privKey).keys[0];
				if (opgpErrorHandler(privKeyObj.err,'privkey')) return;
				const decryptPrivKey = await resolveDecKey(privKeyObj,$('.attachment-passphrase').val());
				if (opgpErrorHandler(decryptPrivKey.err,'decpriv')) return;
				const pbKeyObj = await resolvePubKey(session.pubKey).keys;
				if (opgpErrorHandler(pbKeyObj.err,'pubkey')) return;
				const msg = await resolveDecMsgPrep(readAttachment);
				if (opgpErrorHandler(msg.err,'parseattach')) return;
				const options = {
					message: msg,
					publicKeys: pbKeyObj,
					privateKeys: [privKeyObj],
					format: 'binary'
				}
				const plaintext = await resolveDecMsg(options);
				if (opgpErrorHandler(plaintext.err,'decattach')) return;
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
				opgpErrorHandler(true,'decattach');
				$body.removeClass('loading');
			}
		}
		main();
	}
}
