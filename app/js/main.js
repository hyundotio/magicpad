let session = {
	privKey: '',
	pubKey: '',
	generatedPubKey:'',
	generatedPrivKey:'',
	generatedRevKey:'',
	pubKeyFingerprint: '',
	running: false,
	lastDec: '',
	lastEnc: '',
	lastDecStatus: '',
	lastEncStatus: '',
	lastEncPaste: '',
	lastEncFile:'',
	lastDecFile:'',
	lastDecFilename:'',
	lastEncFileType:'',
	lastEncFilename:'',
	keyToUploadFile:'',
	searchedKey:''
}

//Input key filename when selected
const attachmentFilename = function($type) {
	async function main() {
		try {
			const attachment = await resolveLoadFileURL($type);
			let $filenameEl = $('.attachment-filename');
			const filename = getFilename($type.val());
			$filenameEl.text(' - ' + filename);
			$('.attachment-size').text('File size: '+bytesToSize(attachment.file.size));
			$('.attachment-import-label').find('span').text('Reselect file');
		} catch(e) {
			$type.val('');
			lipAlert('Failed to load selected file.');
		}
	}
	main();
}

//check  form for attachments
const attachmentFormcheck = function(){
	const attachmentRadio = $('.attachment-radio:checked').val();
	const attachmentImport = $('.attachment-import').val();
	const attachmentPassphrase = $('.attachment-passphrase').val();
	let $attachmentProcess = $('.attachment-process');
	if(attachmentRadio == 'decrypt'){
		if(attachmentPassphrase.length > 0 && attachmentImport.length > 0 && session.privKey.length > 0){
			$attachmentProcess.removeAttr('disabled');
		} else {
			$attachmentProcess.attr('disabled','disabled');
		}
	} else if (attachmentRadio == 'encrypt'){
		if(attachmentImport.length > 0 && session.pubKey.length > 0){
			$attachmentProcess.removeAttr('disabled');
		} else {
			$attachmentProcess.attr('disabled','disabled');
		}
	} else {
		if(attachmentPassphrase.length > 0 && attachmentImport.length > 0 && session.privKey.length > 0 && session.pubKey.length > 0){
			$attachmentProcess.removeAttr('disabled');
		} else {
			$attachmentProcess.attr('disabled','disabled');
		}
	}
}

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
				const options = {
						message: openpgp.message.fromBinary(new Uint8Array(fileReader.result)),
						publicKeys: data.keys
				};
				const ciphertext = await resolveEncMsg(options);
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
/*
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
						session.lastEncFile = url;
						session.lastEncFilename = 'encrypted_' + getFilename($('.attachment-import').val());
						session.lastEncFileSigned = false;
						$('.attachment-download').attr('href',url).attr('download',session.lastEncFilename).find('span').html('Download<br>encrypted file');
						session.running = false;
						$body.removeClass('loading');
						$('.popup-filter').addClass('active');
						$('.attachment-window').addClass('active').find('.window-title').find('span').text('Encrypted attachment');
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
		*/
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
				const decryptPrivKey = await resolveDecKey(privKeyObj,$('.attachment-passphrase').val());
				const pbKeyObj = await resolvePubKey(session.pubKey).keys;
				const msg = await resolveDecMsgPrep(readAttachment);
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

		/*
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
									session.lastDecFile = url;
									session.lastDecFilename = 'decrypted_' + getFilename($('.attachment-import').val());
									$('.attachment-download').attr('href',url).attr('download',session.lastDecFilename).find('span').html('Download<br>decrypted file');
									session.running = false;
									$body.removeClass('loading');
									$('.attachment-window').addClass('active').find('.window-title').find('span').text('Decrypted attachment');
									$('.popup-filter').addClass('active');
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
		*/
	}
}

//enables / disabled buttons based upon given list of inputs / textarea
const keyUpChecker = function($input,$target){
	if($input.val().length > 0){
		$target.removeAttr('disabled');
	} else {
		$target.attr('disabled','disabled');
	}
}

//checks for form fields for key generation
const newKeyFormCheck = function(){
	let $keyGenerate = $('.key-generate');
	let empty = false;
	$('.key-new-form').find('input').each(function() {
		let $this = $(this);
		if ($this.val() == '' && !$this.hasClass('pw-toggle')) {
			empty = true;
			$this.hasClass('empty')
		}
		if ($this.hasClass('form-email') && !isEmail($this.val()) && $this.val() != '') {
			empty = true;
			$this.addClass('error');
		} else {
			$this.removeClass('error');
		}
	})
	if (!empty) {
		$keyGenerate.removeAttr('disabled');
	} else {
		$keyGenerate.attr('disabled', 'disabled');
	}
}

//Checks for form in the Write tab
const writeFormCheck = function() {
	let $encryptMessage = $('.encrypt-message');
	let $textWrite = $('.text-write');
	if ($encryptMessage.hasClass('sign-enabled')) {
		if ($textWrite.val().length > 0 && $('.text-write-passphrase').val().length > 0 && session.privKey.length > 0 && session.pubKey.length > 0) {
			$encryptMessage.removeAttr('disabled');
		} else {
			$encryptMessage.attr('disabled', 'disabled');
		}
	} else {
		if ($textWrite.val().length > 0 && session.pubKey.length > 0) {
			$encryptMessage.removeAttr('disabled');
		} else {
			$encryptMessage.attr('disabled', 'disabled');
		}
	}
}

//Checks for form in the Read tab
const readFormCheck = function() {
	let $decryptMessage = $('.decrypt-message');
	if ($('.text-read').val().length > 0 && $('.text-read-passphrase').val().length > 0 && session.privKey.length > 0) {
		$decryptMessage.removeAttr('disabled');
	} else {
		$decryptMessage.attr('disabled', 'disabled');
	}
}

//Function to look up key
const lookupKey = function(query,server) {
  //console.log(query)
	async function main() {
		let $searchResults = $('.search-results');
		let $searchStatus = $('.search-status');
		$searchStatus.text('Searching...');
		let server = $('.search-key-server-list').val();
		if (location.protocol == "https:") {
			server = location.protocol + server
		} else {
			server = 'http:'+server
		}
		try {
			const hkpLookup = await resolveSearchKey(query,server);
			if(hkpLookup != undefined){
				if(hkpLookup.length > 0){
					session.searchedKey = hkpLookup.trim();
					const searchedKey = await resolvePubKey(session.searchedKey);
					const buffer = new Uint8Array(searchedKey.keys[0].primaryKey.fingerprint).buffer;
					$('.searched-key-download').attr('href', 'data:application/octet-stream;base64;name=searchedKey_public.asc,' + btoa(session.searchedKey)).attr('download', 'searchedKey_public.asc').attr('target','_blank');
					$('.downloaded-fingerprint').text(buf2hex(buffer).match(/.{1,4}/g).join(' ').toUpperCase());
					createStegKey('./ui/publickeyreference.jpg','search',session.searchedKey);
					$('.searched-key-download-steg').attr('download', 'searchedKey_public_steg.png')
					$searchResults.addClass('search-complete');
					$searchStatus.text('Key found');
				}
			} else {
				$('.search-complete').removeClass('search-complete');
				$searchStatus.text('Nothing found');
			}
		} catch(e) {
			$searchStatus.text('Error');
			lipAlert(e);
			//lipAlert("Key retrieved but was unabled to read fingerprint. Please use another key.");
		}
	}
	main();
/*
		ndew Promise((resolve, reject) => {
			hkp.lookup({ query: query }).then(function(keys) {
				if(keys != undefined){
					if (keys.length > 0){
						//copy keys
						async function main() {
						  try {
								session.searchedKey = keys.trim();
								const searchedKey = resolvePubKey(session.searchedKey);
								const buffer = new Uint8Array(searchedKey.keys[0].primaryKey.fingerprint).buffer;
								$('.searched-key-download').attr('href', 'data:application/octet-stream;base64;name=searchedKey_public.asc,' + btoa(session.searchedKey)).attr('download', 'searchedKey_public.asc').attr('target','_blank');
								$('.downloaded-fingerprint').text(buf2hex(buffer).match(/.{1,4}/g).join(' ').toUpperCase());
								createStegKey('./ui/publickeyreference.jpg','search',session.searchedKey);
								$('.searched-key-download-steg').attr('download', 'searchedKey_public_steg.png')
								$searchResults.addClass('search-complete');
								$searchStatus.text('Key found');
							} catch(e) {
								$searchStatus.text('Error');
								lipAlert("Key retrieved but was unabled to read fingerprint. Please use another key.");
							}
						}
						main();
					}
				} else {
					//clear keys
					$('.search-complete').removeClass('search-complete');
					$searchStatus.text('Nothing found');
				}
			}).catch(function(e){
				$searchStatus.text('Search error');
				lipAlert('Could not retrieve key. Please try again.');
			})
		}).catch(function(e){
			$searchStatus.text('Search error');
			$('.create-key-progress').find('span').text('Failed generating keys').removeClass('active');
			lipAlert('Could not connect to key server. Please try again.');
		})*/
}

//Function to upload key
const uploadKey = function(type){
	if(!session.running){
		session.running = true;
		if(type !== 'import'){
				session.keyToUploadFile = $('.pubkey-upload-input').val();
		}
		let $uploadProgress = $('.upload-progress');
		$uploadProgress.addClass('active').find('span').text('Uploading key...');
		let server = $('.upload-key-server-list').val();
		if (location.protocol == "https:") {
			server = location.protocol + server
		} else {
			server = 'http:'+server
		}
		if(testPubKey(session.keyToUploadFile, server)){
			async function main() {
				try {
					const hkpUpload = await resolveUploadKey(session.keyToUploadFile);
					const pbKeyObj = await resolvePubKey(session.keyToUploadFile);
					const buffer = new Uint8Array(pbKeyObj.keys[0].primaryKey.fingerprint).buffer;
					let downloadLink = $('.upload-key-server-list').val() + '/pks/lookup?op=get&options=mr&search=0x' + buf2hex(buffer);
					if(type !== 'import'){
						//paste
						$('.paste-upload-link').addClass('active').attr('href',downloadLink);
					} else {
						$('.import-upload-link').addClass('active').attr('href',downloadLink);
						//import
					}
					$uploadProgress.removeClass('active').find('span').text('Upload complete');
					session.running = false;
				} catch(e) {
					$uploadProgress.removeClass('active').find('span').text('Upload failed');
					lipAlert(e);
					session.running = false;
				}
			}
			main();

			/*
			hkp.upload(session.keyToUploadFile).then(function() {
				//downloadlink
				openpgp.key.readArmored(session.keyToUploadFile).then(data => {
					const buffer = new Uint8Array(data.keys[0].primaryKey.fingerprint).buffer;
					let downloadLink = $('.upload-key-server-list').val() + '/pks/lookup?op=get&options=mr&search=0x' + buf2hex(buffer);
					if(type !== 'import'){
						//paste
						$('.paste-upload-link').addClass('active').attr('href',downloadLink);
					} else {
						$('.import-upload-link').addClass('active').attr('href',downloadLink);
						//import
					}
					$('.upload-progress').removeClass('active').find('span').text('Upload complete');
					session.running = false;
				}).catch(function(e){
					$('.upload-progress').removeClass('active').find('span').text('Upload failed');
					lipAlert("The fingerprint could not be generated from the uploaded key. Please try again.");
					session.running = false;
				})
			}).catch(function(e){
				$('.upload-progress').removeClass('active').find('span').text('Upload failed');
				lipAlert('The public key could not be uploaded. Please try again.');
				session.running = false;
			});
			*/
		} else {
			$('.upload-progress').removeClass('active').find('span').text('Upload failed');
			lipAlert("Oops! This doesn't seem like a valid public key. Please choose a different file.");
			session.running = false;
		}
	}
}

//Decrypt messages
const decryptMessage = function() {
	if (!session.running) {
		session.running = true;
		const $body = $('body');
		async function main() {
		  try {
				session.lastEncPaste = $('.text-read').val();
				const privKeyObj = (await resolvePrivKey(session.privKey)).keys[0];
				const decryptPrivKey = await resolveDecKey(privKeyObj,$('.text-read-passphrase').val());
				const pbKeyObj = (await resolvePubKey(session.pubKey)).keys;
				const msg = await resolveDecMsgPrep(session.lastEncPaste);
				const options = {
					message: msg,
					publicKeys: pbKeyObj,
					privateKeys: [privKeyObj]
				}
				const plaintext = (await resolveDecMsg(options));
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
/*
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
				*/

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
				const opgpMsg = await resolveTextMsg(msg);
				const options = {
					message: opgpMsg, // input as Message object
					publicKeys: pbKeyObj.keys
				}
				const ciphertext = await resolveEncMsg(options);
				encrypted = ciphertext.data.trim();
				session.lastEnc = encrypted;
				if ($stgHost.val().length > 0){
					const stegSrc = await resolveLoadFileURL($stgHost)
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

//Generate keys
const generateKeys = function() {
	if (!session.running) {
		session.running = true;
		let $body = $('body');
    $('.create-key-progress').addClass('active').find('span').text('Generating keys...');
		$body.addClass('cursor-loading');
		const options = {
			userIds: [{
				name: ($('.form-name').val()),
				email: ($('.form-email').val())
			}],
			numBits: 4096,
			passphrase: ($('.form-passphrase').val())
		}
		async function main() {
			try {
				const generateKey = await resolveGenKey(options);
				session.generatedPrivKey = generateKey.privateKeyArmored.trim();
				session.generatedPubKey = generateKey.publicKeyArmored.trim();
				session.generatedRevKey = generateKey.revocationCertificate.trim();
				createStegKey('./ui/privatekeyreference.jpg','private',session.generatedPrivKey);
				createStegKey('./ui/publickeyreference.jpg','public',session.generatedPubKey);
				keyReady();
			} catch(e) {
				session.running = false;
				$body.removeClass('cursor-loading');
				lipAlert('Keys could not be generated. Please try again.');
				newKeyReset();
			}
		}
		main();
	}
}

//output key status + download links when keys are generated
const keyReady = function() {
	let formName = $('.form-name').val().split(' ')[0].toLowerCase().replace(/\s/g, '');
	$('.key-public-img-download').attr('download',formName+'_pub_steg.png');
	$('.key-private-img-download').attr('download',formName+'_priv_steg.png');
	$('.key-public-download').attr('href', 'data:application/octet-stream;base64;name='+formName+'_public.asc,' + btoa(session.generatedPubKey)).attr('download', formName+'_public.asc');
	$('.key-private-download').attr('href', 'data:application/octet-stream;base64;name='+formName+'_private.asc,' + btoa(session.generatedPrivKey)).attr('download', formName+'_private.asc');
	$('.key-rev-download').attr('href', 'data:application/octet-stream;base64;name='+formName+'_revoke.asc,' + btoa(session.generatedRevKey)).attr('download', formName+'_revoke.asc');
	$('.key-new-done').addClass('active');
	$('.key-new-form').addClass('next-page');
	$('.create-key-progress').removeClass('active').find('span').text('Keys generated');
	$('.key-generate-start').text('Download generated keys');
	$('.create-key-window').find('.window-title').find('span').text('Generated keys');
	$('body').removeClass('cursor-loading');
	session.running = false;
}

//Reset key generation form
const newKeyReset = function() {
	let $createKeyWindow = $('.create-key-window');
	$('.key-generate-start').text('Create new private and public key set +');
	$createKeyWindow.find('.window-title').find('span').text('New key set');
	$createKeyWindow.find('a').each(function() {
		$(this).attr('href', '#').removeAttr('download');
	})
	$('.create-key-progress').removeClass('active');
	$('.key-new-form').removeClass('next-page').find('input').val('');
	$('.key-new-done').removeClass('active');
	$('.key-generate').attr('disabled', 'disabled');
}

//Process imported keys
const keyImportProcess = function($type,result){
	if ($type.hasClass('key-priv-import')) {
		if (testPrivKey(result)) {
			session.privKey = result;
			importPrivKey();
		} else {
			$type.val('');
			lipAlert("Oops! This doesn't seem like a valid private key. Please choose a different file.");
		}
	} else if ($type.hasClass('server-key-pub-import')){
		if (testPubKey(result)) {
			session.keyToUploadFile = result;
			validatePubKeyUpload();
		} else {
			$type.val('');
			lipAlert("Oops! This doesn't seem like a valid public key. Please choose a different file.");
		}
	} else {
		if (testPubKey(result)) {
			session.pubKey = result;
			importPubKey('file');
		} else {
			$type.val('');
			lipAlert("Oops! This doesn't seem like a valid public key. Please choose a different file.");
		}
	}
}

//Input key filename when selected
const writeKeyStatus = function(pasted) {
	let filename;
	let pubImport = $('.key-pub-import').val();
 	const privImport = $('.key-priv-import').val();
	if(pasted){
		pubImport = 'pasted key'
	}
	if (pubImport != '') {
		filename = getFilename(pubImport);
		$('.public-key-filename').text(' - ' + filename);
	}
	if (privImport != '') {
		filename = getFilename($('.key-priv-import').val());
		$('.private-key-filename').text(' - ' + filename);
	}
}

//read key file when file is selected (pasted public key, selected public key, selected private key) steganography or plain text
const keyImport = function($type){
	async function main() {
		try {
			const selectedFile = await resolveLoadFileURL($type); //reuse function to get url
			if($.inArray(selectedFile.file['type'], ['image/png']) > -1){
				//reader.readAsDataURL(file);
				const img = await resolveImg(selectedFile.result);
				const result = readSteg(img);
				$(img).remove();
				keyImportProcess($type,result);
			} else {
				//reader.readAsText(file);
				const loadedFile = await resolveLoadFileText($type);
				keyImportProcess($type,loadedFile);
			}
		} catch(e) {
			$type.val('');
			lipAlert(e);
		}
	}
	main();
}

//read public key from pasted button
const importPubkeyStr = function(){
	const $pubkeyInput = $('.pubkey-input');
	const pubKeyPaste = $pubkeyInput.val().trim();
	if (testPubKey(pubKeyPaste)) {
		session.pubKey = pubKeyPaste;
		return true
	} else {
		lipAlert("Oops! This doesn't seem like a valid public key. Please choose a different file.");
		return false
	}
}

//Import private key button function
const importPrivKey = function() {
	//$('.read').find('.fingerprint').text(openpgp.key.primaryKey.fingerprint);
	$('.key-priv-import-label').find('span').text('Reimport key');
	writeFormCheck();
	readFormCheck();
	attachmentFormcheck();
	writeKeyStatus();
}

//process public key from import
const importPubKey = function(type) {
	//$('.fingerprint').text(getFingerprint(pubKey));
	async function main() {
	  try {
	    const pubKeyOutput = await resolvePubKey(session.pubKey);
			const buffer = new Uint8Array(pubKeyOutput.keys[0].primaryKey.fingerprint).buffer;
			let $pubkeyInputOpenText = $('.pubkey-input-open').find('span');
			let $keyPubImportLabel = $('.key-pub-import-label').find('span');
			let $pubkeyInputWindow = $('.pubkey-input-window');
			session.pubKeyFingerprint = buf2hex(buffer);
			$('.fingerprint').addClass('active');
			$('.fingerprint-str').text(session.pubKeyFingerprint.match(/.{1,4}/g).join(' ').toUpperCase());
			if(type == 'paste'){
				$pubkeyInputOpenText.text('Repaste key');
				$keyPubImportLabel.text('Select key');
			} else {
				$pubkeyInputOpenText.text('Paste key');
				$keyPubImportLabel.text('Reimport key');
			}
			//$('.view-pub-key').addClass('active');
			attachmentFormcheck();
			writeFormCheck();
			readFormCheck();
			if($pubkeyInputWindow.hasClass('active')){
				writeKeyStatus(true);
				$('.popup-filter').removeClass('active');
				$pubkeyInputWindow.removeClass('active');
			} else {
				writeKeyStatus();
			}
	  } catch (e) {
	    lipAlert(e);
	  }
	}
	main();
}

//Sign message
const signMessage = function() {
	if (!session.running) {
		session.running = true;
		let $body = $('body');
		async function main() {
			try {
				const privKeyObj = (await resolvePrivKey(session.privKey)).keys[0];
				const decryptPrivKey = await resolveDecKey(privKeyObj,$('.text-write-passphrase').val());
				const options = {
					message: openpgp.cleartext.fromText($('.text-write').val()),
					privateKeys: [privKeyObj]
				};
				const signMsg = await resolveSignMsg(options);
				const cleartext = signMsg.data.trim();
				session.running = false;
				encryptMessage(cleartext);
			} catch(e) {
				session.running = false;
				$body.removeClass('loading');
				lipAlert(e);
			}
		}
		main();
		/*
		openpgp.key.readArmored(session.privKey).then(data => {
			let options, cleartext, validity;
			let privKeyObj = data.keys[0];
			privKeyObj.decrypt($('.text-write-passphrase').val()).then(output => {
				options = {
					message: openpgp.cleartext.fromText($('.text-write').val()),
					privateKeys: [privKeyObj]
				};
				openpgp.sign(options).then(function(signed) {
					cleartext = signed.data.trim();
					session.running = false;
					encryptMessage(cleartext, true);
				}).catch(function(e) {
					session.running = false;
					$body.removeClass('loading');
					lipAlert('Cannot sign message. Please try again with a different message and/or keys.');
				});
			}).catch(function(e) {
				session.running = false;
				$body.removeClass('loading');
				lipAlert('The private key passphrase is incorrect.');
			});
		}).catch(function(e) {
			session.running = false;
			$body.removeClass('loading');
			lipAlert('The private key cannot be read. It may be corrupted.');
		});*/
	}
}

//test public key (preliminary)
const testPubKey = function(pubKey){
	if(pubKey.search('-----END PGP PUBLIC KEY BLOCK-----') != -1 && pubKey.search('-----BEGIN PGP PUBLIC KEY BLOCK-----') != -1){
		return true
	} else {
		return false
	}
}

//test private key (preliminary)
const testPrivKey = function(privKey){
	if(privKey.search('-----END PGP PRIVATE KEY BLOCK-----') != -1 && privKey.search('-----BEGIN PGP PRIVATE KEY BLOCK-----') != -1){
		return true
	} else {
		return false
	}
}

//Import public key button function
const validatePubKeyUpload = function(){
	async function main() {
		try {
			const readPubKey = await resolvePubKey(session.pubKey);
			let $serverKeyPubImport = $('.server-key-pub-import');
			let $h3Text = $serverKeyPubImport.parent().find('h3').find('span');
			$h3Text.text('  -  '+getFilename($serverKeyPubImport.val()));
			$serverKeyPubImport.prev('.label-container').find('span').text('Reselect key');
			$('.server-key-pub-import-upload').removeAttr('disabled');
		} catch (e) {
			lipAlert('The public key cannot be read. It may be corrupted.');
		}
	}
	main();
}

//Verify signature of message
const verifySignature = function() {
	if (!session.running) {
		session.running = true;
		let $body = $('body');
		let $processedAside = $('.processed-aside');
		async function main() {
			try {
				const pbKeyObj = (await resolvePubKey(session.pubKey)).keys;
				const msg = await resolveVerifyMsgPrep(session.lastDec.data);
				const options = {
					message: msg,
					publicKeys: pbKeyObj
				}
				const verified = await resolveVerifyMsg(options);
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

//Copy content to Clipboard
window.Clipboard = (function(window, document, navigator) {
    let textArea,
        copy;
    function isOS() {
        return navigator.userAgent.match(/ipad|iphone/i);
    }
    function createTextArea(text) {
        textArea = document.createElement('textArea');
        textArea.value = text;
        document.body.appendChild(textArea);
    }
    function selectText() {
        let range,
            selection;
        if (isOS()) {
            range = document.createRange();
            range.selectNodeContents(textArea);
            selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            textArea.setSelectionRange(0, 999999);
        } else {
            textArea.select();
        }
    }
    function copyToClipboard() {
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }
    copy = function(text) {
        createTextArea(text);
        selectText();
        copyToClipboard();
    };
    return {
        copy: copy
    };
})(window, document, navigator);

//Converts buffer to hex
const buf2hex = function(buffer) {
	return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
}
//Checks if string is email
const isEmail = function(email) {
	let regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
	return regex.test(email);
}
//get filename of input
const getFilename = function(str){
	return str.split(/(\\|\/)/g).pop()
}
//Truncate string to X int characters
String.prototype.trunc = String.prototype.trunc ||
function(n){
		return (this.length > n) ? this.substr(0, n-1) + '...' : this;
};

//Shows human readable file sizes
const bytesToSize = function(bytes) {
   const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
   if (bytes == 0) return '0 Byte';
   const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
   return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};

//promise wrapper for encrypting message
const resolveEncMsg = function(options){
	return new Promise(resolve => {
		const encMsgResolve = openpgp.encrypt(options);
		resolve(encMsgResolve);
	})
}

//promise wrapper for parsing enc msg for decryption
const resolveDecMsgPrep = function(encMsg){
	return new Promise(resolve => {
		const decMsgPrepResolve = openpgp.message.readArmored(encMsg);
		resolve(decMsgPrepResolve);
	})
}

//promise wrapper for decrypting message
const resolveDecMsg = function(options){
	return new Promise(resolve => {
		const decMsgResolve = openpgp.decrypt(options);
		resolve(decMsgResolve);
	})
}

//promise wrapper for decrypting private key
const resolveDecKey = function(privKeyObj,passphrase){
	return new Promise(resolve => {
		const decKeyResolve = privKeyObj.decrypt(passphrase);
		resolve(decKeyResolve);
	})
}

//output as opgp msg
const resolveTextMsg = function(msg){
	return new Promise(resolve => {
		const textMsgResolve = openpgp.message.fromText(msg);
		resolve(textMsgResolve);
	})
}

//promise wrapper for steganography canvas
const resolveImg = function(src){
	return new Promise(resolve => {
		const img = document.createElement('img');
		img.onload = function(){
			resolve(img);
			$(img).remove();
		}
		img.src = src;
	})
}

//promise wrapper for decrypting attachment
const resolveLoadFileText = function($type){
	const file = $type[0].files[0];
	return new Promise(resolve => {
		let reader = new FileReader();
		reader.onload = function(){
			resolve(reader.result);
		}
		reader.readAsText(file);
	})
}

//promise wrapper for encrypting attachment
const resolveLoadFileBuffer = function(file){
	return new Promise(resolve => {
		let reader = new FileReader();
		reader.onload = function(){
			resolve(reader.result);
		}
		reader.readAsArrayBuffer(file);
	})
}

//promise wrapper for importing steg key file
const resolveLoadFileURL = function($type){
	return new Promise(resolve => {
		 const file = $type[0].files[0];
		 let reader = new FileReader();
		 reader.onload = function(e){
			 const result = e.target.result;
			 const returnObj = {
				 file : file,
				 reader : reader,
				 result : result
			 }
			 resolve(returnObj);
		 }
		 reader.readAsDataURL(file);
	})
}


//generate key
const resolveGenKey = function(options){
		return new Promise(resolve => {
			const genKeyResolve = openpgp.generateKey(options);
			resolve(genKeyResolve);
		})
}

//promise wrapper for parsing public key
//session.pubKey
const resolvePubKey = function(pubKey){
	return new Promise(resolve => {
		const pubKeyResolve = openpgp.key.readArmored(pubKey);
		resolve(pubKeyResolve);
	})
}

//promise wrapper for parsing private key
//session.privKey
const resolvePrivKey = function(privKey){
	return new Promise(resolve => {
		const privKeyResolve = openpgp.key.readArmored(privKey);
		resolve(privKeyResolve);
	})
}

//promise wrapper for decrypting private key
const resolveDecPrivKey = function(passphrase){
	return new Promise(resolve => {
		const privKeyDecResolve = openpgp.decrypt(passphrase);
		resolve(privKeyDecResolve);
	})
}

//promise wrapper for uploading key
const resolveUploadKey = function(key,server){
	return new Promise(resolve => {
		const hkp = new openpgp.HKP(server);
		const uploadKeyResolve = hkp.upload(key);
		resolve(uploadKeyResolve);
	})
}

//promise wrapper for searching key
const resolveSearchKey = function(query,server){
	return new Promise(resolve => {
		const hkp = new openpgp.HKP(server);
		const searchKeyResolve = hkp.lookup({ query: query });
		resolve(searchKeyResolve);
	})
}

//read decrypted data for signature verification
//session.lastDec.data
const resolveVerifyMsgPrep = function(decData){
	return new Promise(resolve => {
		const verifyMsgPrepResolve = openpgp.cleartext.readArmored(decData);
		resolve(verifyMsgPrepResolve);
	})
}

//verify signature in message
const resolveVerifyMsg = function(options){
	return new Promise(resolve => {
		const verifyMsgResolve = openpgp.verify(options);
		resolve(verifyMsgResolve);
	})
}

//promise wrapper for signing message
const resolveSignMsg = function(options){
	return new Promise(resolve => {
		const signMsgResolve = openpgp.sign(options);
		resolve(signMsgResolve);
	})
}

//convert steganograph to text
const readSteg = function(img){
	return steg.decode(img);
}

//create  steganograph key
const createStegKey = function(input,type,str){
	async function main() {
		try {
			const loadedImg = await resolveImg(input);
			const imgCanvas = document.createElement("canvas");
			let imgContext = imgCanvas.getContext("2d");
			imgContext.canvas.width = loadedImg.width;
			imgContext.canvas.height = loadedImg.height;
			imgContext.drawImage(loadedImg, 0, 0, loadedImg.width, loadedImg.height);
			imgContext.font = '11px IBM Plex Mono';
			imgContext.fillStyle = '#0062ff';
			let imgStr = $('.form-email').val().trunc(35);
			if(type == 'search'){
				imgStr = $('.searchbox-pubkey').val().trunc(35);
			}
			imgContext.fillText(imgStr, 14, 55);

			let newImg = await resolveImg(imgCanvas.toDataURL("image/png"));
			if(type == 'public'){
				createSteg(newImg,$('.key-public-img-download'),str);
			} else if (type == 'private'){
				createSteg(newImg,$('.key-private-img-download'),str);
			} else if (type =='search'){
				createSteg(newImg,$('.searched-key-download-steg'),str);
			} else {
				//createSteg(newImg,$('.key-revoke-steg-download-link'),str);
			}
			$(imgCanvas).remove();
			$(loadedImg).remove();
			$(newImg).remove();
		} catch(e) {
			lipAlert('Failed to create image keys.');
		}
	}
	main();
}

//createSteg($('steghost')[0],$('processed-img-download-link'),encryptedMessageStr);
const createSteg = function(img,$dest,str){
	$dest.attr('href',steg.encode(str, img));
}

//Convert steganograph to message
const convertStegMsg = function($type){
	async function main() {
		try {
			// Closure to capture the file information.
			const imgSrc = await resolveLoadFileURL($type);
			const img = await resolveImg(imgSrc.result);
			const retrievedMsg = readSteg(img);
			$(img).remove();

			//Also fill in key textArea
			//Open convereted-key-window;
			if(retrievedMsg.length > 0){
				$('.import-stg-msg-label').text('Reimport steganograph');
				$('.text-read').val(retrievedMsg).text(retrievedMsg).scrollTop(0,0);
				readFormCheck();
			} else {
				$type.val('');
				lipAlert('The imported steganograph does not contain a message.');
			}
		} catch(e) {
			$type.val('');
			lipAlert('Failed to process imported steganograph.');
		}
	}
	main();
}

//covnert steganograph key to string
const convertStegKey = function($type){
	async function main() {
		try {
			const imgSrc = await resolveLoadFileURL($type);
			const img = await resolveImg(imgSrc.result);
			const retrievedKey = readSteg(img);
			$(img).remove();
			//Also fill in key textArea
			//Open convereted-key-window;
			if(testPubKey(retrievedKey) || testPrivKey(retrievedKey)){
				$('.convert-filename').text(' - ' + getFilename($('.key-convert').val()));
				$('.key-convert-label').find('span').text('Reimport image');
				$('.converted-key-output').text(retrievedKey).val(retrievedKey).scrollTop(0,0);
				$('.save-converted').removeClass('disabled').attr('href', 'data:application/octet-stream;base64;filename=encrypted_message.txt,' + btoa(retrievedKey)).attr('download', 'convertedKey.asc');
				$('.copy-converted').removeAttr('disabled');
				$('.converted-aside').text('Key converted.');
			} else {
				$type.val('');
				lipAlert('The imported image does not contain a valid key.');
			}
		} catch(e) {
			$type.val('');
			lipAlert('The imported file is not a valid image key.');
		}
	}
	main();
}

//Alert notification
const lipAlert = function(str) {
	$('.message-flag').addClass('active').find('span').text(str);
}

//initialize application
const init = function() {
	 $onlineFlag = $('.online-flag');
	if (window.navigator.onLine) {
		$onlineFlag.addClass('active');
	} else {
		$onlineFlag.removeClass('active');
	}
	$('input').each(function(){
		if($(this).attr('type') == 'radio'){
			if($(this).index() == 0){
					$(this).prop('checked',true);
			} else {
					$(this).prop('checked',false);
			}
		} else {
			$(this).val('').prop('checked',false);
		}
	})
	$('textarea').val('');
	keyUpChecker($('.pubkey-upload-input'),$('.upload-public-key-paste'));
	keyUpChecker($('.searchbox-pubkey'),$('.search-pubkey'));
	keyUpChecker($('.pubkey-input'),$('.import-pubkey-str'));
	readFormCheck();
	writeFormCheck();
	newKeyFormCheck();
	attachmentFormcheck();
	$('.init-disabled').attr('disabled','disabled').removeClass('init-disabled');
	setTimeout(function () {
      const viewheight = $(window).height();
      const viewwidth = $(window).width();
      const viewport = document.querySelector("meta[name=viewport]");
      viewport.setAttribute("content", "height=" + viewheight + "px, width=" + viewwidth + "px, initial-scale=1.0, user-scalable=0, maximum-scale=1");
  }, 300);
}

//get rid of loading screen when all assets are loaded
window.onload = function(){
	init();
	let loadingStart = document.getElementById('loading-start');
	loadingStart.style.opacity = 0;
	setTimeout(function(){
		$(loadingStart).remove();
	},250);
}

//Handles online notification lip (alerts user if they are online)
window.addEventListener('online', function() {
	$('.online-flag').addClass('active');
});
window.addEventListener('offline', function() {
	$('.online-flag').removeClass('active');
});

//Exits popup
const popupExit = function(){
	$('.popup').removeClass('active');
	$('.main-nav').removeClass('mobile-active');
	$('.mobile-menu').removeClass('active');
	$('.popup-filter').removeClass('active');
}

//Activate Copied alert when user clicks on Copy to clipboard button
const showCopied = function($copied){
	$copied.addClass('active');
	setTimeout(function() {
		$copied.removeClass('active');
	}, 2000);
}

//Show passphrase box if Decrypting
$('.attachment-radio').bind('click',function(){
  let $this = $(this);
  let $attachmentCredentials = $('.attachment-credentials');
  let $attachmentProcess = $('.attachment-process');
  let $attachmentView = $('.attachment-view');
  if($this.is(':checked')){
      if($this.val() == 'decrypt'){
        $attachmentCredentials.removeClass('disabled').find('input').removeAttr('disabled');
        $attachmentProcess.removeClass('attachment-encrypt').addClass('attachment-decrypt').find('span').text('Decrypt');
        $attachmentProcess.find('img').attr('src','./ui/decrypt.svg');
        if(session.lastDecFile.length > 0){
          $attachmentView.removeAttr('disabled');
          $('.attachment-window').find('.window-title').find('span').text('Decrypted attachment');
          $('.attachment-download').attr('href',session.lastDecFile).attr('download',session.lastDecFilename).find('span').html('Download<br>decrypted file');
          $('.attachment-view').removeAttr('disabled');
        } else {
          $attachmentView.attr('disabled','disabled');
        }
      } else {
        if($this.val() == 'encrypt-sign'){
          $attachmentCredentials.removeClass('disabled').find('input').removeAttr('disabled');
          $attachmentProcess.addClass('attachment-encrypt-sign');
          if(session.lastEncFile.length > 0 && session.lastEncFileSigned){

          }
        } else {
          $attachmentCredentials.addClass('disabled').find('input').attr('disabled','disabled');
          $attachmentProcess.addClass('attachment-encrypt');
          if(session.lastEncFile.length > 0){
            $attachmentView.removeAttr('disabled');
            $('.attachment-window').find('.window-title').find('span').text('Encrypted attachment');
            $('.attachment-download').attr('href',session.lastEncFile).attr('download',session.lastEncFilename).find('span').html('Download<br>encrypted file');
            $('.attachment-view').removeAttr('disabled');
          } else {
            $attachmentView.attr('disabled','disabled')
          }
        }
        $attachmentProcess.removeClass('attachment-decrypt').find('span').text('Encrypt');
        $attachmentProcess.find('img').attr('src','./ui/encrypt.svg');
      }
      attachmentFormcheck();
  }
})

//Get filename when user selects file.
$('.attachment-import').change(function(){
  attachmentFilename($(this));
  attachmentFormcheck();
})

//Check passphrase keyup for attachment (when decrypting)
$('.attachment-passphrase').keyup(function(){
  attachmentFormcheck();
}).change(function(){
  attachmentFormcheck();
})

//Start processing attachment
$('.attachment-process').bind('click',function(){
  let $this = $(this);
  $('body').addClass('loading');
  if($this.hasClass('attachment-decrypt')){
    decryptAttachment();
  } else if ($this.hasClass('attachment-encrypt-sign')){
    encryptAttachment(true);
  } else {
    encryptAttachment(false);
  }
})

//open processed attachment popup
$('.attachment-view').bind('click',function(){
  if(!$(this).is(':disabled')){
    $('.popup-filter').addClass('active');
    $('.attachment-window').addClass('active');
  }
})

//
$('.attachment-download').bind('click',function(e){
  let link = $(this).attr('href');
  let iOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
  if(iOS){
    e.preventDefault();
    setTimeout(function(){
        window.open(link);
    }, 500);
  }
})

//Logic to navigate list for Guide
$('.tutorial-selectors').find('a').each(function(){
    $(this).bind('click',function(e){
        e.preventDefault();
        let $this = $(this);
        let $tutorialPages = $('.tutorial-pages');
        let $tutorialPage = $tutorialPages.find('.'+$this.attr('data-tutorial'));
        let $tutorialPageVideo = $tutorialPage.find('video');
        if($tutorialPageVideo.length > 0){
            $tutorialPageVideo[0].currentTime = 0;
        }
        $('.tutorial-selectors').find('.active').removeClass('active')
        $this.addClass('active');
        $tutorialPages.find('.active').removeClass('active');
        $tutorialPage.addClass('active')
    })
})

//Checks for file imported by user in Private and Key import buttons
$('.key-import').change(function() {
	keyImport($(this))
})

//import pasted pubkey
$('.import-pubkey-str').bind('click',function(){
	if(importPubkeyStr()){
		importPubKey('paste');
	}
})

//check if pubkey paste textarea is filled
$('.pubkey-input').keyup(function(){
	keyUpChecker($(this),$('.import-pubkey-str'));
}).change(function(){
	keyUpChecker($(this),$('.import-pubkey-str'));
})

//opn pubkey paste
$('.pubkey-input-open').bind('click',function(){
	$('.popup-filter').addClass('active');
	$('.pubkey-input-window').addClass('active');
})

//Open steganography key converter popup
$('.open-keyconverter').bind('click',function(){
	$('.steg-key-converter-window').addClass('active');
	$('.popup-filter').addClass('active');
});

//Detect steganography imported file
$('.key-convert').change(function(){
	convertStegKey($(this));
});

//copy to clipboard - converted
$('.copy-converted').bind('click',function(){
	Clipboard.copy($('.converted-key-output').text());
	showCopied($('.steg-key-converter-window').find('.copied'));
})

//opens new key generation popup
$('.key-generate-start').bind('click', function(e) {
	$('.create-key-window').addClass('active')
	$('.popup-filter').addClass('active');
})

//new key generation form input checks
$('.key-new-form').find('input').each(function() {
	$(this).keyup(function() {
		newKeyFormCheck();
	}).change(function(){
		newKeyFormCheck();
	})
})

//Reset key generation form
$('.key-generate-reset').bind('click', function(e) {
	e.preventDefault();
	newKeyReset();
})

//start key generation + key form check
$('.key-generate').bind('click', function(e) {
	let $this = $(this);
	let formFlag = false;
	$('.key-new-form').find('input').each(function() {
		let $this = $(this);
		if (!$this.hasClass('pw-toggle') && $this.val() == '') {
			formFlag = true;
		}
	})
	if (!formFlag) {
		$this.attr('disabled','disabled');
		generateKeys();
	}
})

//copy generated public keys
$('.copy-generated-public-key').bind('click',function(e){
	e.preventDefault();
	Clipboard.copy(session.generatedPubKey);
	showCopied($(this).find('.copied'));
})

//open key servers popup
$('.open-keybrowser').bind('click',function(){
	$('.popup-filter').addClass('active');
	let $keyServerBrowserWindow = $('.key-server-browser-window');
	let $popupTabContent = $keyServerBrowserWindow.find('.popup-tab-content');
	let $popupTab = $keyServerBrowserWindow.find('.popup-tabs');
	$popupTab.find('.active').removeClass('active');
	$popupTab.find('.popup-tab').eq(0).addClass('active');
	let tabOpen = $popupTab.find('.active').attr('data-tab');
	$popupTabContent.find('.popup-tab-page.active').removeClass('active');
	$popupTabContent.find('.'+tabOpen).addClass('active');
	$keyServerBrowserWindow.addClass('active');
})

//Binding for search-box to enable search button
$('.searchbox-pubkey').keyup(function(){
	let $this = $(this);
	keyUpChecker($this,$('.search-pubkey'));
}).change(function(){
	let $this = $(this);
	keyUpChecker($this,$('.search-pubkey'));
})

//Binding for Copy searched key
$('.searched-key-copy').bind('click',function(){
	Clipboard.copy(session.searchedKey);
	showCopied($('.search-results').find('.copied'));
})

//Search for key button
$('.search-pubkey').bind('click',function(){
	let $this = $(this);
	if(!$this.is(':disabled')){
		lookupKey($('.searchbox-pubkey').val(),$('.search-key-server-list').val());
	}
})

//Form checker for public key upload paste.
$('.pubkey-upload-input').keyup(function(){
	keyUpChecker($(this),$('.upload-public-key-paste'));
}).change(function(){
	keyUpChecker($(this),$('.upload-public-key-paste'));
})

//Upload pasted key binding
$('.upload-public-key-paste').bind('click',function(){
	if(!$(this).is(':disabled')){
		uploadKey('paste');
	}
})

//Upload selected key file binding
$('.server-key-pub-import-upload').bind('click',function(){
	if(!$(this).is(':disabled')){
		keyImport($('.server-key-pub-import'));
		uploadKey('import');
	}
})

//Process selected key file
$('.server-key-pub-import').change(function(){
	keyImport($(this));
})

//Copy to clipboard button
$('.copy-processed').bind('click', function() {
	//copyProcessed($('.processed-output').text());
	Clipboard.copy($('.processed-output').text());
	showCopied($('.processed-output-window').find('.copied'));
})

//Convert imported steganography to text message on read page
$('.import-stg-msg').change(function(){
	convertStegMsg($(this));
})
//Decrypt message on read page
$('.decrypt-message').bind('click', function() {
	if (!$(this).is(':disabled')) {
		$('body').addClass('loading');
		decryptMessage();
	}
})

//Re-open Processed Output containing decrypted message on Read page
$('.view-message-decrypted').bind('click', function() {
	if (!$(this).is(':disabled')) {
		viewDecMsg();
	}
})

//Form check for read page textarea
$('.read').keyup(function(e) {
	readFormCheck()
}).change(function(){
	readFormCheck()
})

//Binding for exiting bottom lip alert
$('.lip-exit').bind('click', function() {
	$('.lip').removeClass('active');
})

//bindings for navigating between main nav tabs
$('.tab').bind('click', function(e) {
	e.preventDefault();
	let $main = $('main');
	let $tabWindow = $main.find('.tab-window');
	let nextTab = $(this).attr('data-tab');
	$('.main-nav').find('.active').removeClass('active');
	$(this).addClass('active');
	$tabWindow.removeClass('active').each(function() {
		if ($(this).hasClass(nextTab)) {
			popupExit();
			$(this).addClass('active');
		}
	})
})

//do not run <a> buttons with disabled class
$('a').bind('click',function(e){
	if ($(this).hasClass('disabled')){
		e.preventDefault();
	}
})

//Password show toggler
$('.pw-toggle').change(function() {
	let $passphraseBox = $('.passphrase-box');
	if (this.checked) {
		$passphraseBox.attr('type', 'text');
	} else {
		$passphraseBox.attr('type', 'password');
	}
});

//label container bind (input file is triggered by label for custom styling)
$('.label-container').bind('click', function(e) {
	e.preventDefault();
	e.stopPropagation();
	$(this).next('input').click();
})

//autofocus out of select + select for better UX
$('select').change(function(){
	$(this).blur();
})

//mobile app Menu actuator
$('.mobile-menu').bind('click',function(){
	let $mainNav = $('.main-nav');
	let $popupFilter = $('.popup-filter');
	let $this = $(this);
	popupExit();
	if($mainNav.hasClass('mobile-active')){
		$this.removeClass('active');
		$mainNav.removeClass('mobile-active');
		$popupFilter.removeClass('active');
	} else {
		$this.addClass('active');
		$mainNav.addClass('mobile-active');
		$popupFilter.addClass('active');
	}
})

//Exit popup button binding
$('.popup-exit').bind('click', function(e) {
	if (!session.running) {
		popupExit();
	}
})

//Expand popup button binding
$('.popup-expand').bind('click', function() {
	let $this = $(this);
	let $thisParPar = $this.parent().parent();
	if ($this.hasClass('active')){
		$this.removeClass('active').find('img').attr('src', './ui/expand.svg');
		$thisParPar.removeClass('expanded');
	} else {
		$this.addClass('active').find('img').attr('src', './ui/minimize.svg');
		$thisParPar.addClass('expanded');
	}
})


//Bindings for tabs within popups (used for Key Server Browser)
$('.popup-tabs').find('.popup-tab').each(function(){
	$(this).bind('click',function(){
		let $this = $(this);
		let $thisParPar = $this.parent().parent();
		let $popupTabContent = $thisParPar.parent().find('.popup-tab-content');
		$thisParPar.find('.active').removeClass('active');
		$this.addClass('active');
		$popupTabContent.find('.active').removeClass('active');
		$popupTabContent.find('.'+$this.attr('data-tab')).addClass('active');
	})
})

//Clear selected file for steganography host
$('.clear-steg-host').bind('click',function(){
	$('.stg-host-label').text('Select steganograph host');
	$('.stg-host').val('');
	$(this).removeClass('active');
})

//Form check for write page textarea
$('.write').keyup(function() {
	writeFormCheck()
}).change(function(){
	writeFormCheck()
})

//Detect sleected file for steganography host on write page
$('.stg-host').change(function(){
	let $this = $(this);
	let file = $this[0].files[0];
	let reader = new FileReader();
	let $stgClear = $('.clear-steg-host');
	if($.inArray(file['type'], ["image/gif", "image/jpeg", "image/png"]) > -1){
		$('.stg-host-label').text('Reselect steganograph host');
		$stgClear.addClass('active');
	} else {
		$(this).val('');
		$stgClear.removeClass('active');
		lipAlert('The imported file is not a valid image to be used as a steganograph host');
	}
})

//Checkbox binding for Signing Message in write page
$('.encrypt-sign-checkbox').change(function() {
	let $encryptMessage = $('.encrypt-message');
	let $signCredentials = $('.sign-credentials');
	if (this.checked) {
		$encryptMessage.addClass('sign-enabled');
		$signCredentials.removeClass('disabled').find('input').removeAttr('disabled');
	} else {
		$encryptMessage.removeClass('sign-enabled');
		$signCredentials.addClass('disabled').find('input').attr('disabled', 'disabled');
	}
	writeFormCheck()
})

//Binding for encrypting messages
$('.encrypt-message').bind('click', function() {
	let $this = $(this);
	if (!$this.is(':disabled')) {
		$('body').addClass('loading');
		if ($this.hasClass('sign-enabled')) {
			signMessage();
		} else {
			encryptMessage($('.text-write').val(), false);
		}
	}
})

//Binding to view encrypted message processed-output popup
$('.view-message-encrypted').bind('click', function() {
	if (!$(this).is(':disabled')) {
		if($('.steg-msg-download').attr('href').length > 1){
			viewEncMsg(true);
		} else {
			viewEncMsg(false);
		}
	}
})

//get rid of loading screen when all assets are loaded
window.onload = function(){
	init();
	let loadingStart = document.getElementById('loading-start');
	loadingStart.style.opacity = 0;
	setTimeout(function(){
		$(loadingStart).remove();
	},250);
}

//Handles online notification lip (alerts user if they are online)
window.addEventListener('online', function() {
	$('.online-flag').addClass('active');
});
window.addEventListener('offline', function() {
	$('.online-flag').removeClass('active');
});
