//View Encrypted Message
const viewEncMsg = function(steg) {
	let $processedAside = $('.processed-aside');
	let $processedOutputWindow = $('.processed-output-window');
	$processedAside.text(session.lastEncStatus);
	if(steg){
		$('.steg-msg-download').attr('download', 'encrypted_steg_message.png')
		$processedOutputWindow.addClass('steg');
	} else {
		$processedOutputWindow.removeClass('steg');
	}
	$processedOutputWindow.find('.processed-output').text(session.lastEnc).val(session.lastEnc);
	$('.save-processed').removeClass('hidden').attr('href', 'data:application/octet-stream;base64;filename=encrypted_message.txt,' + btoa(session.lastEnc)).attr('download', 'encrypted_message.txt');
	$('.popup-filter').addClass('active');
	$processedOutputWindow.find('textarea').scrollTop(0,0);
	$processedOutputWindow.addClass('active mono').find('.window-title').find('span').text('Encrypted message');
}

//write status to processed-output when key is processed
const encryptStatus = function(signedToggle){
	let $processedAside = $('.processed-aside');
	$('.view-message-encrypted').removeAttr('disabled');
	if (signedToggle) {
		session.lastEncStatus = 'Message encrypted and signed.';
	} else {
		session.lastEncStatus = 'Message encrypted.';
	}
	$processedAside.text(session.lastEncStatus);
}

//Encrypt Message
const encryptMessage = function(msg, signedToggle) {
	if (!session.running) {
		session.running = true;
		let $body = $('body');
		async function main() {
		  try {
				const $stgHost = $('.stg-host');
				const pbKeyObj = await resolvePubKey(session.pubKey);
				if (opgpErrorHandler(pbKeyObj.err)) return;
				const opgpMsg = await resolveTextMsg(msg);
				if (opgpErrorHandler(opgpMsg.err)) return;
				const options = {
					message: opgpMsg, // input as Message object
					publicKeys: pbKeyObj.keys
				}
				const ciphertext = await resolveEncMsg(options);
				if (opgpErrorHandler(ciphertext.err)) return;
				encrypted = ciphertext.data.trim();
				session.lastEnc = encrypted;
				if ($stgHost.val().length > 0){
					const stegSrc = await resolveLoadFileURL($stgHost);
					const newImg = await resolveImg(stegSrc.result);
					const imgCanvas = document.createElement("canvas");
					let imgContext = imgCanvas.getContext("2d");
					imgContext.canvas.width = newImg.width;
					imgContext.canvas.height = newImg.height;
					imgContext.fillStyle = '#FFFFFF';
					imgContext.fillRect(0,0,newImg.width,newImg.height);
					imgContext.drawImage(newImg, 0, 0, newImg.width, newImg.height);
					const imgInfom = imgCanvas.toDataURL("image/jpeg", 1.0);
					const imgConvert = await resolveImg(imgInfom);
					if(parseInt(steg.getHidingCapacity(imgConvert)) >= session.lastEnc){
						$stgHost.val('');
						lipAlert('Selected steganograph host cannot store the encrypted message. Please try a larger image.');
					} else {
						createSteg(imgConvert,$('.steg-msg-download'),session.lastEnc);
						$(imgCanvas).remove();
						$(newImg).remove();
						$(imgConvert).remove();
						encryptStatus(signedToggle);
						session.running = false;
						$body.removeClass('loading');
						viewEncMsg(true);
					}
				} else {
					encryptStatus(signedToggle);
					session.running = false;
					$body.removeClass('loading');
					viewEncMsg(false);
				}
			} catch(e) {
				//
				session.running = false;
				$body.removeClass('loading');
				lipAlert(e);
			}
		}
		main();
		/*
		openpgp.key.readArmored(session.pubKey).then(data => {
			let options, cleartext, validity;
			options = {
				message: openpgp.message.fromText(msg), // input as Message object
				publicKeys: data.keys
			}
			openpgp.encrypt(options).then(ciphertext => {
				encrypted = ciphertext.data.trim() // '-----BEGIN PGP MESSAGE ... END PGP MESSAGE-----'
				session.lastEnc = encrypted;
				if ($('.stg-host').val().length > 0){
					let reader = new FileReader();
					reader.onload = function(e){
						let newImg = document.createElement('img');
						let imgConvert = document.createElement('img');
						newImg.onload = function(){
							let imgCanvas = document.createElement("canvas");
							let imgContext = imgCanvas.getContext("2d");
							imgContext.canvas.width = newImg.width;
							imgContext.canvas.height = newImg.height;
							imgContext.fillStyle = '#FFFFFF';
							imgContext.fillRect(0,0,newImg.width,newImg.height);
							imgContext.drawImage(newImg, 0, 0, newImg.width, newImg.height);
							let imgInfom = imgCanvas.toDataURL("image/jpeg", 1.0);
							imgConvert.onload = function(){
								if(parseInt(steg.getHidingCapacity(imgConvert)) >= session.lastEnc){
									lipAlert('Selected steganograph host cannot store the encrypted message. Please try a larger image.');
								} else {
									createSteg(imgConvert,$('.steg-msg-download'),session.lastEnc);
									$(imgCanvas).remove();
									$(newImg).remove();
									$(imgConvert).remove();
									encryptStatus(signedToggle);
									session.running = false;
									$body.removeClass('loading');
									viewEncMsg(true);
								}
							}
							imgConvert.src = imgInfom;
							if(parseInt(steg.getHidingCapacity(newImg)) >= session.lastEnc){
								lipAlert('Selected steganograph host cannot store the encrypted message. Please try a larger image.');
							} else {
								createSteg(newImg,$('.steg-msg-download'),session.lastEnc);
								$(newImg).remove();
								encryptStatus(signedToggle);
								session.running = false;
								$body.removeClass('loading');
								viewEncMsg(true);
							}
						}
						newImg.src = e.target.result;
					}
					reader.readAsDataURL($('.stg-host')[0].files[0]);
				} else {
					encryptStatus(signedToggle);
					session.running = false;
					$body.removeClass('loading');
					viewEncMsg(false);
				}
			}).catch(function(e) {
				session.running = false;
				$body.removeClass('loading');
				lipAlert('Cannot encrypt message. Try testing a different message and/or using different keys.');
			});
		}).catch(function(e) {
			session.running = false;
			$body.removeClass('loading');
			lipAlert('The public key cannot be read. It may be corrupted.');
		});*/
	}
}
