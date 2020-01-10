//View Encrypted Message
const viewEncMsg = function(steg) {
	let $processedAside = $('.processed-aside');
	let $processedOutputWindow = $('.processed-output-window');
	let $saveProcessed = $('.save-processed');
	$processedAside.text(session.lastEncStatus);
	if(steg){
		$('.steg-msg-download').attr('download', 'encrypted_steg_message.png')
		$processedOutputWindow.addClass('steg');
	} else {
		$processedOutputWindow.removeClass('steg');
	}
	$processedOutputWindow.find('.processed-output').text(session.lastEnc).val(session.lastEnc);
	$saveProcessed.removeClass('hidden').attr('href', session.lastEncSave).attr('download', 'encrypted_message.txt');
	$processedOutputWindow.find('textarea').scrollTop(0,0);
	$processedOutputWindow.addClass('mono').find('.window-title').find('span').text('Encrypted message');
	openPopup('.processed-output-window');
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
				const pbKeyObj = (await openpgp.key.readArmored(session.pubKey)).keys;
				const opgpMsg = await openpgp.message.fromText(msg);
				const options = {
					message: opgpMsg, // input as Message object
					publicKeys: pbKeyObj
				}
				const ciphertext = await openpgp.encrypt(options);
				const encrypted = ciphertext.data.trim();
				revokeBlob(session.lastEncSave);
				session.lastEnc = encrypted;
				session.lastEncSave = dataURItoBlobURL('data:application/octet-stream;base64;filename=encrypted_message.txt,' + btoa(session.lastEnc));
				const mpUrl = 'https://www.magicpost.io/post.php?'+'to='+encodeURIComponent(session.pubKeyFingerprint)+'&from='+encodeURIComponent(session.privKeyFingerprint)+'&msg='+encodeURIComponent(session.lastEnc);
				$('.mp-link').attr('href',mpUrl);
				const $stegMsgDownload = $('.steg-msg-download');
				if ($stgHost.val().length > 0){
					const stegSrc = await resolveLoadFileURL($stgHost);
					const newImg = await resolveImg(stegSrc.result);
					const imgCanvas = document.createElement("canvas");
					const imgContext = imgCanvas.getContext("2d");
					const maxSize = 1024;
					const imgSalt = Math.floor(Math.random() * (16 - 0 + 1)) + 0;
					const pixelSpace = Math.ceil(Math.sqrt(((session.lastEnc.length * 16) / 3))) + imgSalt;
					const imgRatio = Math.ceil(newImg.width) / Math.ceil(newImg.height);
					const imgRatioInv = Math.ceil(newImg.height) / Math.ceil(newImg.width);
					let imgWidth = newImg.width;
					let imgHeight = newImg.height;

					//determine final image size
					if(maxSize < imgWidth || maxSize < imgHeight){
						//Reduce image size if too big
						let maxWidth = maxSize;
						let maxHeight = maxSize;
						if(imgRatio > 1){
							//width is bigger;
							maxHeight = maxHeight * imgRatioInv;
						} else if (imgRatio < 1) {
							//height is bigger
							maxWidth = maxWidth * imgRatio;
						}
						imgWidth = maxWidth;
						imgHeight = maxHeight;
					}
					if((pixelSpace**2) > (imgHeight * imgWidth)){
						//Calculate minimum image size for text required and stretch;
						//This will also determine if the max size is not big enough for the user given text.
						let minWidth = pixelSpace;
						let minHeight = pixelSpace;
						if(imgRatio > 1){
							//width is bigger;
							minWidth = minWidth * imgRatio;
						} else if (imgRatio < 1) {
							//height is bigger
							minHeight = minHeight * imgRatioInv;
						}
						imgWidth = minWidth;
						imgHeight = minHeight;
					}


					imgContext.canvas.width = imgWidth;
					imgContext.canvas.height = imgHeight;
					imgContext.fillStyle = '#FFFFFF';
					imgContext.fillRect(0,0,imgWidth,imgHeight);
					imgContext.drawImage(newImg, 0, 0, imgWidth, imgHeight);
					const imgInfom = imgCanvas.toDataURL("image/jpeg", 1.0);
					const imgConvert = await resolveImg(imgInfom);
					createSteg(imgConvert,$stegMsgDownload,session.lastEnc);
					$(imgCanvas).remove();
					$(newImg).remove();
					$(imgConvert).remove();
					encryptStatus(signedToggle);
					session.running = false;
					$body.removeClass('loading');
					viewEncMsg(true);
				} else {
					revokeBlob($stegMsgDownload.attr('href'));
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
	}
}
