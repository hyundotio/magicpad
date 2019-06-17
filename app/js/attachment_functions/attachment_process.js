//encrypt attachment
function encryptAttachment(){
	if (!session.running) {
		session.running = true;
		let $body = $('body');
		$body.addClass('loading');
		let $attachmentImport = $('.attachment-import');
		let file = $attachmentImport[0].files[0];
		let fileReader = new FileReader();
		let encrypt = new Promise((resolve,reject) => {
			fileReader.onload = async () => {
				openpgp.key.readArmored(session.pubKey).then(data => {
					let options = {
							message: openpgp.message.fromBinary(new Uint8Array(fileReader.result)),
              publicKeys: data.keys
					};
					openpgp.encrypt(options).then(ciphertext => {
						let blob = new Blob([ciphertext.data], {
						  type: 'application/octet-stream'
						});
						let url = URL.createObjectURL(blob);
						$('.attachment-download').attr('href',url).attr('download',('encrypted_'+getFilename($('.attachment-import').val())));
						session.running = false;
						$body.removeClass('loading');
						$('.popup-filter').addClass('active');
						$('.attachment-window').addClass('active').find('.window-title').find('span').text('Encrypted attachment');
						$('.attachment-download').find('span').html('Download<br>encrypted file');
						$('.attachment-view').removeAttr('disabled');
					}).catch(function(e){
						session.running = false;
						$body.removeClass('loading');
						lipAlert('Cannot encrypt attachment. Try testing a different file and/or using different keys.');
					})
				}).catch(function(e){
					session.running = false;
					$body.removeClass('loading');
					lipAlert('The public key cannot be read. It may be corrupted.');
				})
			}
			fileReader.readAsArrayBuffer(file);
		})
	}
}

//decrypt attachment
function decryptAttachment(){
	if (!session.running) {
		session.running = true;
		let $body = $('body');
		$body.addClass('loading');
		let $attachmentImport = $('.attachment-import');
		let file = $attachmentImport[0].files[0];
		let fileReader = new FileReader();
		let encrypt = new Promise((resolve,reject) => {
			fileReader.onload = async () => {
				openpgp.key.readArmored(session.privKey).then(pvKeys => {
					privKeyObj = pvKeys.keys[0];
					privKeyObj.decrypt($('.attachment-passphrase').val()).then(output => {
						//console.log(fileReader.result);
						openpgp.key.readArmored(session.pubKey).then(pbKeys => {
							pbKeyObj = pbKeys.keys;
							openpgp.message.readArmored(fileReader.result).then(msg => {
								let options = {
									message: msg,
									publicKeys: pbKeyObj,
									privateKeys: [privKeyObj],
									format: 'binary'
								}
								openpgp.decrypt(options).then(plaintext => {
									let blob = new Blob([plaintext.data], {
									  type: 'application/octet-stream'
									});
									let url = URL.createObjectURL(blob);
									$('.attachment-download').attr('href',url).attr('download',('decrypted_'+getFilename($('.attachment-import').val())));
									session.running = false;
									$body.removeClass('loading');
									$('.attachment-window').addClass('active').find('.window-title').find('span').text('Decrypted attachment');
									$('.popup-filter').addClass('active');
									$('.attachment-download').find('span').html('Download<br>decrypted file');
									$('.attachment-view').removeAttr('disabled');
								}).catch(function(e){
									session.running = false;
									lipAlert('Cannot decrypt message. Try a different private key.');
									$body.removeClass('loading');
								})
							}).catch(function(e){
								session.running = false;
								lipAlert('The encrypted attachment cannot be read. It may be corrupted.');
								$body.removeClass('loading');
							})
						}).catch(function(e){
							session.running = false;
							lipAlert('The public key cannot be read. It may be corrupted.');
							$body.removeClass('loading');
						})
					}).catch(function(e){
						session.running = false;
						lipAlert('The private key passphrase is incorrect.');
						$body.removeClass('loading');
					})
				}).catch(function(e){
					session.running = false;
					lipAlert('The private key cannot be read. It may be corrupted.');
					$body.removeClass('loading');
				})
			}
			fileReader.readAsText(file);
		})
	}
}
