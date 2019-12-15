let iOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);

const sessionModel = {
	privKey: '',
	pubKey: '',
	privKeyName:'',
	pubKeyName:'',
	generatedPubKey:'',
	generatedPrivKey:'',
	generatedRevKey:'',
	pubKeyFingerprint: '',
	privKeyFingerprint:'',
	running: false,
	lastDec: '',
	lastEnc: '',
	lastDecSave: '',
	lastEncSave: '',
	lastDecStatus: '',
	lastEncStatus: '',
	lastEncPaste: '',
	lastEncFile:'',
	lastDecFile:'',
	lastDecFilename:'',
	lastEncFileType:'',
	lastEncFilename:'',
	lastConverted:'',
	keyToUploadFile:'',
	searchedKey:'',
	sessionStore:false
}

let session = JSON.parse(JSON.stringify(sessionModel));

const adjustSession = function(){
	if(session.sessionStore){
		session.running = false;
		window.localStorage.setItem('session',JSON.stringify(session));
	}
}

const eraseSession = function(){
	window.localStorage.setItem('session',null);
}

window.onbeforeunload = function(){
	if(session.sessionStore){
		session.generatedPubKey = '';
		session.generatedPrivKey = '';
		session.generatedRevKey = '';
		session.lastDec = '';
		session.lastEnc = '';
		session.lastDecSave = '';
		session.lastEncSave = '';
		session.lastDecStatus = '';
		session.lastEncStatus = '';
		session.lastEncPaste = '';
		session.lastEncFile = '';
		session.lastDecFile = '';
		session.lastDecFilename = '';
		session.lastEncFileType = '';
		session.lastEncFilename = '';
		session.lastConverted = '';
		session.keyToUploadFile = '';
		session.searchedKey = '';
		adjustSession();
	}
};

const recallSession = function(){
	if(window.localStorage.getItem('session') != null){
		if(window.localStorage.getItem('session') != 'null'){
			session = JSON.parse(window.localStorage.getItem('session'));
			Object.keys(sessionModel).forEach(function(key){
				if (!(key in session)){
					session[key] = '';
				}
			})
			//session = JSON.parse(window.localStorage.getItem('session'));
			const $sessionToggle = $('.session-toggle');
			if(session.sessionStore){
				$sessionToggle.prop('checked',true).change();
				if(session.pubKeyName != ''){
					let $tempInput = $('<input>');
					$tempInput.val(session.pubKeyName).addClass('key-pub-import');
					importPubKey('file',session.pubKey,$tempInput);
					$tempInput.remove();
				}
				if(session.privKeyName != ''){
					let $tempInput = $('<input>');
					$tempInput.val(session.privKeyName).addClass('key-priv-import');
					importPrivKey(session.privKey,$tempInput);
					$tempInput.remove();
				}
			}
		}
	}
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
			lipAlert(e);
		}
	}
	main();
}

//encrypt attachment
const encryptAttachment = function(){
	if (!session.running) {
		session.running = true;
		let $body = $('body');
		let $attachmentImport = $('.attachment-import');
		async function main() {
			try {
				const fileReader = await resolveLoadFileBuffer($attachmentImport);
				const pbKeyObj = (await openpgp.key.readArmored(session.pubKey)).keys;
				const options = {
						message: openpgp.message.fromBinary(new Uint8Array(fileReader)),
						publicKeys: pbKeyObj
				};
				const $attachmentDownload = $('.attachment-download');
				revokeBlob(session.lastEncFilename);
				const ciphertext = await openpgp.encrypt(options);
				const blob = new Blob([ciphertext.data], {
					type: 'application/octet-stream'
				});
				const url = URL.createObjectURL(blob);

				session.lastEncFile = url;
				session.lastEncFilename = 'encrypted_' + getFilename($('.attachment-import').val());
				session.lastEncFileSigned = false;
				$attachmentDownload.attr('href',url).attr('download',session.lastEncFilename).find('span').html('Download<br>encrypted file');
				session.running = false;
				$body.removeClass('loading');
				$('.attachment-window').find('.window-title').find('span').text('Encrypted attachment');
				$('.attachment-view').removeAttr('disabled');
				openPopup('.attachment-window');
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
				const privKeyObj = (await openpgp.key.readArmored(session.privKey)).keys[0];
				const decryptPrivKey = await privKeyObj.decrypt($('.attachment-passphrase').val());
				const pbKeyObj = (await openpgp.key.readArmored(session.pubKey)).keys;
				const msg = await openpgp.message.readArmored(readAttachment);
				const options = {
					message: msg,
					publicKeys: pbKeyObj,
					privateKeys: [privKeyObj],
					format: 'binary'
				}
				const $attachmentDownload = $('.attachment-download');
				revokeBlob(session.lastDecFilename);
				const plaintext = await openpgp.decrypt(options);
				const blob = new Blob([plaintext.data], {
					type: 'application/octet-stream'
				});
				const url = window.URL.createObjectURL(blob);
				session.lastDecFile = url;
				session.lastDecFilename = 'decrypted_' + getFilename($attachmentImport.val());
				$attachmentDownload.attr('href',url).attr('download',session.lastDecFilename).find('span').html('Download<br>decrypted file');
				session.running = false;
				$body.removeClass('loading');
				$('.attachment-window').find('.window-title').find('span').text('Decrypted attachment');
				$('.attachment-view').removeAttr('disabled');
				openPopup('.attachment-window');
			} catch(e) {
				session.running = false;
				$body.removeClass('loading');
				lipAlert(e);
			}
		}
		main();
	}
}

const errorDict = [
  {
    input: 'privkey',
    output: 'The private key cannot be read. It may be corrupted.'
  },
  {
    input: 'pubkey',
    output: 'The public key cannot be read. It may be corrupted.'
  },
  {
    input: 'decpriv',
    output: 'The private key passphrase is incorrect.'
  },
  {
    input: 'signfail',
    output: 'Cannot sign message. Try again with a different message and/or keys.'
  },
  {
    input: 'parsemsg',
    output: 'The encrypted message cannot be read. It may be corrupted.'
  },
  {
    input: 'parseattach',
    output: 'The encrypted attachment cannot be read. It may be corrupted.'
  },
  {
    input: 'genkey',
    output: 'Keys could not be generated. Try again.'
  },
  {
    input: 'encmsg',
    output: 'Cannot encrypt message. Try a different private key.'
  },
  {
    input: 'stegkeyread',
    output: 'The imported image does not contain a valid key.'
  },
  {
    input: 'stegkey',
    output: 'The imported file is not a valid image key.'
  },
  {
    input: 'importExt',
    output: 'The selected file is not a .png or .asc file.'
  },
  {
    input: 'stegkeygen',
    output: 'Failed to create image keys.'
  },
  {
    input: 'stegnomsg',
    output: 'The imported steganograph does not contain a message.'
  },
  {
    input: 'stegmsggeneral',
    outout: 'Failed to process imported steganograph.'
  },
  {
    input: 'steglen',
    output:'Selected steganograph host cannot store the encrypted message. Try a larger image.'
  },
  {
    input: 'parsesignmsg',
    output: 'The signature cannot be read. It maybe corrupted.'
  },
  {
    input: 'invalidsign',
    output: 'The signature is corrupted. Proceed with caution.'
  },
  {
    input: 'decmsg',
    output: 'Cannot decrypt message. Try a different private key.'
  },
  {
    input: 'upload',
    output: 'The public key could not be uploaded. Try again.'
  },
  {
    input: 'uploadcomplete',
    output: 'The fingerprint could not be generated from the uploaded key. Proceed with caution.'
  },
  {
    input: 'searchconnection',
    output:'Could not connect to key server. Try again.'
  },
  {
    input: 'searchresultkey',
    output: 'A key was retrieved but is corrected. Search / use another key.'
  },
  {
    input: 'searchgeneral',
    output: 'Failed to search. Try again with a different server and/or key.'
  },
  {
    input: 'encattach',
    output: 'Cannot encrypt attachment. Try testing a different file and/or using different keys.'
  },
  {
    input: 'decattach',
    output: 'Cannot decrypt attachment. Try a different private key.'
  },
  {
    input: 'file',
    output: 'Failed to load selected file.'
  },
  {
    input: 'keyimportfail',
    output: 'Failed to import key. Try another file.'
  }
]

const opgpErrorHandler = function(opgp,type){
  if(opgp){
    throw (errorFinder(type))
	} else {
		return false
	}
}

const errorFinder = function(error){
  for(i = 0; i < errorDict.length; i++){
    if((errorDict[i].input).search(error) > -1){
      return errorDict[i].output
    }
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

//check  form for attachments
const attachmentFormcheck = function(){
	const attachmentRadio = $('.attachment-radio:checked').val();
	const attachmentImport = $('.attachment-import').val();
	const attachmentPassphrase = $('.attachment-passphrase').val();
	let $attachmentSize = $('.attachment-size');
	let $attachmentFilename = $('.attachment-filename');
	let $attachmentProcess = $('.attachment-process');
	let $attachmentView = $('.attachment-view');
	if(attachmentRadio == 'decrypt'){
		if(attachmentPassphrase.length > 0 && attachmentImport.length > 0 && session.privKey.length > 0){
			$attachmentProcess.removeAttr('disabled');
		} else {
			if(attachmentImport == ''){
				$attachmentSize.text('No file selected');
				$attachmentFilename.text('');
			}
			$attachmentView.attr('disabled','disabled');
			$attachmentProcess.attr('disabled','disabled');
		}
	} else if (attachmentRadio == 'encrypt'){
		if(attachmentImport.length > 0 && session.pubKey.length > 0){
			$attachmentProcess.removeAttr('disabled');
		} else {
			if(attachmentImport == ''){
				$attachmentSize.text('No file selected');
				$attachmentFilename.text('');
			}
			$attachmentView.attr('disabled','disabled');
			$attachmentProcess.attr('disabled','disabled');
		}
	} else {
		if(attachmentPassphrase.length > 0 && attachmentImport.length > 0 && session.privKey.length > 0 && session.pubKey.length > 0){
			$attachmentProcess.removeAttr('disabled');
		} else {
			if(attachmentImport == ''){
				$attachmentSize.text('No file selected');
				$attachmentFilename.text('');
			}
			$attachmentView.attr('disabled','disabled');
			$attachmentProcess.attr('disabled','disabled');
		}
	}
}

const formChecker = [
	{
		type: 'read',
		runCheck: function(){readFormCheck()}
	},
	{
		type: 'write',
		runCheck: function(){writeFormCheck()}
	},
	{
		type: 'attachments',
		runCheck: function(){attachmentFormcheck()}
	}
]

const pubDataUri = 'data:image/jpeg;base64,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';

const pvDataUri = 'data:image/jpeg;base64,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';

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
			const hkp = new openpgp.HKP(server);
			const hkpLookup = await hkp.lookup({ query: query });
			if(hkpLookup != undefined){
				if(hkpLookup.length > 0){
					const searchedKey = await openpgp.key.readArmored(hkpLookup.trim());
					const $searchResultList = $('.search-result-list');
					if(searchedKey.err != undefined){
						$searchStatus.text('Error');
						throw errorFinder('searchresultkey');
					}
					if(searchedKey.keys.length > 1){
						$searchResultList.removeClass('hidden');
						$searchStatus.text('Multiple keys found');
					} else {
						$searchResultList.addClass('hidden');
						$searchStatus.text('Key found');
					}
					$searchResultList.empty();
					for(let i = 0; i < searchedKey.keys.length; i++){
						const fingerprintBuffer = new Uint8Array(searchedKey.keys[i].primaryKey.fingerprint).buffer;
						const fingerprintHex = buf2hex(fingerprintBuffer);
						const downloadLink = server + '/pks/lookup?op=get&options=mr&search=0x' + fingerprintHex;
						const keyId = searchedKey.keys[i].primaryKey.keyid.toHex();
						const $tempOption = $('<option>');
						let optionStr = keyId;
						if(i == 0){
							optionStr = 'Latest - '+optionStr;
							$('.searched-key-download').attr('href', downloadLink).attr('target','_blank');
							$('.downloaded-fingerprint').text(fingerprintHex.match(/.{1,4}/g).join(' ').toUpperCase());
						}
						$tempOption.text(optionStr);
						$tempOption.val(keyId).attr('data-fingerprint',fingerprintHex);
						$searchResultList.append($tempOption);
					}
					updateKeyLinks();
					$searchResults.addClass('search-complete');
				}
			} else {
				$searchResults.removeClass('search-complete');
				$searchStatus.text('Nothing found');
			}
		} catch(e) {
			$searchResults.removeClass('search-complete');
			$searchStatus.text('Error');
			lipAlert(e);
		}
	}
	main();
}

const returnServer = function(){
	let server = $('.search-key-server-list').val();
	if (location.protocol == "https:") {
		server = location.protocol + server
	} else {
		server = 'http:'+server
	}
	return server
}

const updateKeyLinks = function(){
	const $searchedKeyActions = $('.searched-key-action');
	$searchedKeyActions.addClass('disabled');
	const server = returnServer();
	const downloadLink = server + '/pks/lookup?op=get&options=mr&search=0x' + $('.search-result-list').val();
	$.ajax({
    url:downloadLink,
    success: function (data){
			session.searchedKey = data;
			const fingerprintHex = $(".search-result-list option:selected").attr('data-fingerprint');
			const fileName = $('.search-result-list').val().toLowerCase().replace(/\s/g, '') + '.png';
			createStegKey(pubDataUri,'search',session.searchedKey);
			$('.searched-key-download').attr('href', downloadLink).attr('target','_blank');
			$('.downloaded-fingerprint').text(fingerprintHex.match(/.{1,4}/g).join(' ').toUpperCase());
			$('.searched-key-download-steg').attr('download', fileName);
			$searchedKeyActions.removeClass('disabled');
    }
  });
}

const importSearchedKey = function(){
	const server = returnServer();
	const keyId = $(".search-result-list option:selected").val();
	const downloadLink = server + '/pks/lookup?op=get&options=mr&search=0x' + $('.search-result-list').val();
	$.ajax({
    url:downloadLink,
    success: function (data){
		 	const $tempInput = $('<input>');
			$tempInput.val(keyId).addClass('key-pub-import');
			importPubKey('search',data,$tempInput);
			$tempInput.remove();
    }
  });
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

		let $pasteUploadLink = $('.paste-upload-link');
		let $importUploadLink = $('.import-upload-link');
		async function main() {
			try {
				const pbKeyObj = await openpgp.key.readArmored(session.keyToUploadFile);
				if(pbKeyObj.err != undefined || !testPubKey(session.keyToUploadFile)){
					throw errorFinder('pubkey');
				}
				const hkp = new openpgp.HKP(server);
				const hkpUpload = await hkp.upload(session.keyToUploadFile);
				const buffer = new Uint8Array(pbKeyObj.keys[0].primaryKey.fingerprint).buffer;
				let downloadLink = server + '/pks/lookup?op=get&options=mr&search=0x' + buf2hex(buffer);
				if(type !== 'import'){
					$pasteUploadLink.addClass('active').attr('href',downloadLink);
				} else {
					$importUploadLink.addClass('active').attr('href',downloadLink);
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
				revokeBlob(session.lastDecSave);
				session.lastDec = plaintext;
				session.lastDecSave = dataURItoBlobURL('data:application/octet-stream;base64;filename=decrypted_message.txt,' + btoa(session.lastDec.data));
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
	let $saveProcessed = $('.save-processed');
	$processedAside.text(session.lastDecStatus);
	$processedOutputWindow.find('.processed-output').text(session.lastDec.data).val(session.lastDec.data);
	$saveProcessed.removeClass('hidden').attr('href', session.lastDecSave).attr('download', 'decrypted_message.txt');
	$processedOutputWindow.find('textarea').scrollTop(0,0);
	$processedOutputWindow.removeClass('mono steg').find('.window-title').find('span').text('Decrypted message');
	openPopup('.processed-output-window');
}

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
				const mpUrl = 'https://www.magicpost.io/post.php?'+'to='+encodeURI(session.pubKeyFingerprint)+'&from='+encodeURI(session.privKeyFingerprint)+'&msg='+encodeURI(session.lastEnc);
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

//Generate keys
const generateKeys = function() {
	const $formName = $('.form-name');
	const $formEmail = $('.form-email');
	const $formPassphrase = $('.form-passphrase');
	if (!session.running) {
		session.running = true;
		let $body = $('body');
    $('.create-key-progress').addClass('active').find('span').text('Generating keys...');
		$body.addClass('cursor-loading popup-uninterrupt');
		const options = {
			userIds: [{
				name: ($formName.val()),
				email: ($formEmail.val())
			}],
			numBits: 4096,
			passphrase: ($formPassphrase.val())
		}
		async function main() {
			try {
				const generateKey = await openpgp.generateKey(options);
				if(generateKey.err != undefined){
					throw errorFinder('genkey');
				}
				$formEmail.val('');
				$formPassphrase.val('');
				session.generatedPrivKey = generateKey.privateKeyArmored.trim();
				session.generatedPubKey = generateKey.publicKeyArmored.trim();
				session.generatedRevKey = generateKey.revocationCertificate.trim();
				createStegKey(pvDataUri,'private',session.generatedPrivKey);
				createStegKey(pubDataUri,'public',session.generatedPubKey);
				keyReady();
			} catch(e) {
				session.running = false;
				$body.removeClass('cursor-loading popup-uninterrupt');
				newKeyReset();
				lipAlert(e);
			}
		}
		main();
	}
}

//output key status + download links when keys are generated
const keyReady = function() {
	const $formName = $('.form-name');
	let formName = $formName.val().split(' ')[0].toLowerCase().replace(/\s/g, '');
	let $keyPublicDownload = $('.key-public-download');
	let $keyPrivateDownload = $('.key-private-download');
	$formName.val('');
	revokeBlob($keyPrivateDownload.attr('href'));
	revokeBlob($keyPublicDownload.attr('href'));
	$('.key-public-img-download').attr('download',formName+'_pub_steg.png');
	$('.key-private-img-download').attr('download',formName+'_priv_steg.png');
	$keyPublicDownload.attr('href', dataURItoBlobURL('data:application/octet-stream;base64;name='+formName+'_public.asc,' + btoa(session.generatedPubKey))).attr('download', formName+'_public.asc');
	$keyPrivateDownload.attr('href', dataURItoBlobURL('data:application/octet-stream;base64;name='+formName+'_private.asc,' + btoa(session.generatedPrivKey))).attr('download', formName+'_private.asc');
	//$('.key-rev-download').attr('href', dataURItoBlobURL('data:application/octet-stream;base64;name='+formName+'_revoke.asc,' + btoa(session.generatedRevKey))).attr('download', formName+'_revoke.asc');
	$('.key-new-done').addClass('active');
	$('.key-new-form').addClass('next-page');
	$('.create-key-progress').removeClass('active').find('span').text('Keys generated');
	$('.key-generate-start').text('Download generated keys');
	$('.create-key-window').addClass('active').find('.window-title').find('span').text('Generated keys');
	$('.pubkey-paste-button').addClass('active');
	$('body').removeClass('cursor-loading popup-uninterrupt');
	session.running = false;
}

//import generated privKey
const importGeneratedPrivKey = function(filename){
	let $tempInput = $('<input>');
	$tempInput.val(filename).addClass('key-priv-import');
	importPrivKey(session.generatedPrivKey,$tempInput);
	$tempInput.remove();
}

//Reset key generation form
const newKeyReset = function() {
	let $createKeyWindow = $('.create-key-window');
	let $keyNewForm = $('.key-new-form');
	let $keyNewDone = $('.key-new-done');
	session.generatedPrivKey = '';
	session.generatedPubKey = '';
	session.generatedRevKey = '';
	$keyNewDone.find('.blob-download').each(function(){
		revokeBlob($(this).attr('href'));
	})
	$('.pubkey-paste-button').removeClass('active');
	$('.key-generate-start').text('Create new private and public key set +');
	$createKeyWindow.find('.window-title').find('span').text('New key set');
	$createKeyWindow.find('a').each(function() {
		$(this).attr('href', '#').removeAttr('download');
	})
	$('.create-key-progress').removeClass('active');
	$keyNewForm.removeClass('next-page').find('input').val('');
	$keyNewForm.find('.pw-toggle').prop('checked',false).change();
	$keyNewDone.removeClass('active');
	$('.key-generate').attr('disabled', 'disabled');
}

//Process imported keys
const keyImportProcess = function($type,result){
	if ($type.hasClass('key-priv-import')) {
		importPrivKey(result,$type);
	} else if ($type.hasClass('server-key-pub-import')){
		validatePubKeyUpload(result);
	} else {
		importPubKey('file',result,$type);
	}
}

//Input key filename when selected
const writeKeyStatus = function($input,pasted) {
	if(pasted){
		session.pubKeyName = 'pasted key';
		$('.public-key-filename').text(' - pasted key');
	}
	if($input != undefined){
			let inputVal = $input.val();
			let filename = getFilename(inputVal);
			if ($input.hasClass('key-pub-import') && inputVal != '') {
				session.pubKeyName = inputVal;
				$('.public-key-filename').text(' - ' + filename);
			}
			if ($input.hasClass('key-priv-import') && inputVal != '') {
				session.privKeyName = inputVal;
				$('.private-key-filename').text(' - ' + filename);
			}
	}

}

//read key file when file is selected (pasted public key, selected public key, selected private key) steganography or plain text
const keyImport = function($type){
	async function main() {
		try {
			const selectedFile = await resolveLoadFileURL($type); //reuse function to get url
			if($.inArray(selectedFile.file['type'], ['image/png']) > -1){
				const img = await resolveImg(selectedFile.result);
				const result = readSteg(img);
				$(img).remove();
				keyImportProcess($type,result);
			} else {
				const loadedFile = await resolveLoadFileText($type);
				keyImportProcess($type,loadedFile);
			}
		} catch(e) {
			lipAlert(errorFinder('keyimportfail'));
		}
	}
	main();
}

//read public key from pasted button
const importPubkeyStr = function(){
	async function main(){
		try {
			const $pubkeyInput = $('.pubkey-input');
			const pubKeyPaste = $pubkeyInput.val().trim();
			const pubKeyOutput = await openpgp.key.readArmored(pubKeyPaste);
			if(pubKeyOutput.err != undefined || !testPubKey(pubKeyPaste)){
				throw errorFinder('pubkey');
			}
			session.pubKey = pubKeyPaste;
			adjustSession();
			return true
		} catch {
			lipAlert(e);
			return false
		}
	}
	main();
}

//Import private key button function
const importPrivKey = function(key,$input) {
	//$('.read').find('.fingerprint').text(openpgp.key.primaryKey.fingerprint);
	async function main(){
		try {
			const pvKeyOutput = await openpgp.key.readArmored(key);
			if(pvKeyOutput.err != undefined || !testPrivKey(key)) {
				throw errorFinder('privkey');
			}
			session.privKey = key;
			const buffer = new Uint8Array(pvKeyOutput.keys[0].primaryKey.fingerprint).buffer;
			session.privKeyFingerprint = buf2hex(buffer);
			const matchedFingerprint = session.privKeyFingerprint.match(/.{1,4}/g);
			$('.fingerprint-priv').addClass('active');
			$('.mp-link-search').attr('href','https://magicpost.io/search.php?search='+(matchedFingerprint.join('+').toUpperCase()));
			$('.fingerprint-priv-str').text(matchedFingerprint.join(' ').toUpperCase());
			$('.key-priv-import-label').find('span').text('Reimport key');
			writeKeyStatus($input,false);
			adjustSession();
		} catch(e) {
			$input.val('');
			lipAlert(e);
		}
	}
	main();
}

//process public key from import
const importPubKey = function(type,key,$input) {
	//$('.fingerprint').text(getFingerprint(pubKey));
	async function main() {
	  try {
			let pubKey = key;
			let $pubkeyInputOpenText = $('.pubkey-input-open').find('span');
			let $keyPubImportLabel = $('.key-pub-import-label').find('span');
			let $pubkeyInputWindow = $('.pubkey-input-window');
			if(type == 'paste'){
				pubKey = $('.pubkey-input').val().trim();
			}
	    const pubKeyOutput = await openpgp.key.readArmored(pubKey);
			if(pubKeyOutput.err != undefined || !testPubKey(pubKey)){
				throw errorFinder('pubkey');
			}
			session.pubKey = pubKey;
			const buffer = new Uint8Array(pubKeyOutput.keys[0].primaryKey.fingerprint).buffer;
			session.pubKeyFingerprint = buf2hex(buffer);
			const matchedFingerprint = session.pubKeyFingerprint.match(/.{1,4}/g);
			$('.fingerprint-pub').addClass('active');
			$('.fingerprint-pub-str').text(matchedFingerprint.join(' ').toUpperCase());
			$pubkeyInputOpenText.text('Paste key');
			$keyPubImportLabel.text('Reimport key');
			if($pubkeyInputWindow.hasClass('active')){
				writeKeyStatus(undefined,true);
				popupExit();
			} else {
				writeKeyStatus($input,false);
			}
			adjustSession();
	  } catch (e) {
			if($input) $input.val('');
	   	lipAlert(e);
	  }
	}
	main();
}

//Sign message
const signMessage = function() {
	if (!session.running) {
		session.running = true;
		async function main() {
			try {
				const privKeyObj = (await openpgp.key.readArmored(session.privKey)).keys[0];
				const decryptPrivKey = await privKeyObj.decrypt($('.text-write-passphrase').val());
				const options = {
					message: openpgp.cleartext.fromText($('.text-write').val()),
					privateKeys: [privKeyObj]
				};
				const signMsg = await openpgp.sign(options);
				const cleartext = signMsg.data.trim();
				session.running = false;
				encryptMessage(cleartext,true);
			} catch(e) {
				session.running = false;
				$('body').removeClass('loading');
				lipAlert(e);
			}
		}
		main();
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
const validatePubKeyUpload = function(key){
	async function main() {
		let $publicKeyUploadFilename = $('.public-key-upload-filename');
		let $serverPubKeyImportLabel = $('.server-pub-key-import-label');
		let $serverKeyPubImportUpload = $('.server-key-pub-import-upload');
		try {
			const readPubKey = await openpgp.key.readArmored(key);
			if(readPubKey.err != undefined || !testPubKey(key)){
				throw errorFinder('pubkey');
			}
			session.keyToUploadFile = key;
			$publicKeyUploadFilename.text('  -  '+getFilename($('.server-key-pub-import').val()));
			$serverPubKeyImportLabel.find('span').text('Reselect key');
			$serverKeyPubImportUpload.removeAttr('disabled');
		} catch (e) {
			session.keyToUploadFile = '';
			$('.server-key-pub-import').val('');
			$publicKeyUploadFilename.text('');
			$serverPubKeyImportLabel.find('span').text('Select key');
			$serverKeyPubImportUpload.attr('disabled','disabled');
			lipAlert(e);
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
				const pbKeyObj = (await openpgp.key.readArmored(session.pubKey)).keys;
				const msg = await openpgp.cleartext.readArmored(session.lastDec.data);
				const options = {
					message: msg,
					publicKeys: pbKeyObj
				}
				const verified = await openpgp.verify(options);
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

//add anon CORS
const resolveImgCORS = function(src){
	return new Promise(resolve => {
		const img = document.createElement('img');
		img.setAttribute('crossOrigin', 'anonymous');
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
		if(file != undefined){
			reader.readAsText(file);
		}
	})
}

//promise wrapper for encrypting attachment
const resolveLoadFileBuffer = function($type){
	const file = $type[0].files[0];
	return new Promise(resolve => {
		let reader = new FileReader();
		reader.onload = function(){
			resolve(reader.result);
		}
		if(file != undefined){
			reader.readAsArrayBuffer(file);
		}
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
		 if(file != undefined){
			 reader.readAsDataURL(file);
		 }
	})
}

if ("serviceWorker" in navigator && location.protocol == 'https:') {
  if (navigator.serviceWorker.controller) {
    //console.log("[PWA Builder] active service worker found, no need to register");
  } else {
    // Register the service worker
    navigator.serviceWorker
      .register("./pwa.js", {
        scope: "./"
      })
      .then(function (reg) {
        //console.log("[PWA Builder] Service worker has been registered for scope: " + reg.scope);
      });
  }
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
				throw (errorFinder('stegnomsg'));
			}
		} catch(e) {
			$type.val('');
			lipAlert(e);
		}
	}
	main();
}

const convertKey = function($el){
	async function main() {
		try {
			const selectedFile = await resolveLoadFileURL($el); //reuse function to get url
			if($.inArray(selectedFile.file['type'], ['image/png']) > -1){
				convertStegKey($el);
			} else {
				convertStegKeyReverse($el);
			}
		} catch(e) {
			lipAlert(errorFinder('keyimportfail'));
		}
	}
	main();
}

//convert key string to steg
const convertStegKeyReverse = function($type){
	async function main() {
		try {
				const retrievedKey = await resolveLoadFileText($type);
				const keyInput = await openpgp.key.readArmored(retrievedKey);
				if(keyInput.err != undefined || (!testPubKey(retrievedKey) && !testPrivKey(retrievedKey))){
					throw errorFinder('pubkey');
				}
				let keyType = 'public';
				if(keyInput.keys[0].isPrivate()){
					keyType = 'private';
				}
				createStegKey(pubDataUri,'convert',retrievedKey);
				$('.convert-filename').text(' - ' + getFilename($('.key-convert').val()));
				$('.key-convert-label').find('span').text('Reimport key');
				const outputStr = "Please download the .png image key below.\n\nKey contents:\n"+retrievedKey;
				$('.converted-key-output').text(outputStr).val(outputStr).scrollTop(0,0);
				let fileName;
				if(keyInput.keys[0].users[0].userId.name){
					fileName = (keyInput.keys[0].users[0].userId.name).split(' ')[0].toLowerCase().replace(/\s/g, '') + '_' + keyType + '_steg.png';
				} else {
					fileName = 'converted_'+keyType+'_steg.png';
				}
				$('.save-converted').removeClass('disabled').attr('download',fileName);
				$('.copy-converted').attr('disabled', 'disabled');
				$('.converted-aside').text('Key converted.');
		} catch(e) {
			lipAlert(errorFinder('pubkey'));
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
			const keyOutput = await openpgp.key.readArmored(retrievedKey);
			if(keyOutput.err != undefined || (!testPubKey(retrievedKey) && !testPrivKey(retrievedKey))){
				throw errorFinder('stegkeyread');
			}
			let keyType = 'public';
			if(keyOutput.keys[0].isPrivate()){
				keyType = 'private';
			}
			$('.convert-filename').text(' - ' + getFilename($('.key-convert').val()));
			$('.key-convert-label').find('span').text('Reimport key');
			$('.converted-key-output').text(retrievedKey).val(retrievedKey).scrollTop(0,0);
			if(keyOutput.keys[0].users[0].userId.name){
			}
			let fileName;
			if(keyOutput.keys[0].users[0].userId.name){
				fileName = (keyOutput.keys[0].users[0].userId.name).split(' ')[0].toLowerCase().replace(/\s/g, '') + '_' + keyType + '.asc';
			} else {
				fileName = 'converted_'+keyType+'.asc';
			}
			let $saveConverted = $('.save-converted');
			revokeBlob($saveConverted.attr('href'));
			$saveConverted.removeClass('disabled').attr('href', dataURItoBlobURL('data:application/octet-stream;base64;filename='+fileName+',' + btoa(retrievedKey))).attr('download', fileName);
			$('.copy-converted').removeAttr('disabled');
			$('.converted-aside').text('Key converted.');
		} catch(e) {
			$type.val('');
			lipAlert(e);
		}
	}
	main();
}

//convert steganograph to text
const readSteg = function(img){
	return steg.decode(img);
}

//create  steganograph key
const createStegKey = function(input,type,str){
	async function main() {
		try {
			const keyInit = await openpgp.key.readArmored(str);
			const loadedImg = await resolveImgCORS(input);
			const imgCanvas = document.createElement("canvas");
			let imgContext = imgCanvas.getContext("2d");
			imgContext.canvas.width = loadedImg.width;
			imgContext.canvas.height = loadedImg.height;
			imgContext.drawImage(loadedImg, 0, 0, loadedImg.width, loadedImg.height);
			imgContext.font = '11px IBM Plex Mono';
			imgContext.fillStyle = '#0062ff';
			let imgStr;
			if(keyInit.keys[0].users[0].userId.email){
				imgStr = (keyInit.keys[0].users[0].userId.email).trunc(35);
			} else {
				imgStr = 'Converted key'
			}
			imgContext.fillText(imgStr, 14, 55);
			let newImg = await resolveImg(imgCanvas.toDataURL("image/png"));
			$('body').append($(newImg));
			if(type == 'public'){
				createSteg(newImg,$('.key-public-img-download'),str);
			} else if (type == 'private'){
				createSteg(newImg,$('.key-private-img-download'),str);
			} else if (type =='search'){
				createSteg(newImg,$('.searched-key-download-steg'),str);
			} else if (type =='convert'){
				createSteg(newImg,$('.save-converted'),str);
			}else {
				//createSteg(newImg,$('.key-revoke-steg-download-link'),str);
			}
			$(imgCanvas).remove();
			$(loadedImg).remove();
			$(newImg).remove();
		} catch(e) {
			lipAlert(e);
		}
	}
	main();
}

//createSteg($('steghost')[0],$('processed-img-download-link'),encryptedMessageStr);
const createSteg = function(img,$dest,str){
	revokeBlob($dest.attr('href'));
	$dest.attr('href',dataURItoBlobURL(steg.encode(str, img)));
}

//Alert notification
const lipAlert = function(str) {
	$('.message-flag').addClass('active').find('span').text(str);
}

const dataURItoBlobURL = function(dataURI) {
    // convert base64 to raw binary data held in a string
    let byteString = atob(dataURI.split(',')[1]);

    // separate out the mime component
    let mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to an ArrayBuffer
    let arrayBuffer = new ArrayBuffer(byteString.length);
    let _ia = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
        _ia[i] = byteString.charCodeAt(i);
    }

    let dataView = new DataView(arrayBuffer);
    let blob = new Blob([dataView], { type: mimeString });
    let url = window.URL.createObjectURL(blob);
    return url;
}

const revokeBlob = function(blobURL){
  if(blobURL != undefined){
    if(blobURL.search('blob') > -1){
      window.URL.revokeObjectURL(blobURL);
    }
  }
}

//initialize application
const init = function() {
	window.URL = window.URL || window.webkitURL;
	let $onlineFlag = $('.online-flag');
	if (window.navigator.onLine) {
		$onlineFlag.addClass('active');
	} else {
		$onlineFlag.removeClass('active');
	}
	$('input').each(function(){
		let $this = $(this);
		if(!$this.hasClass('reset-ignore')){
			$this.val('').prop('checked',false);
		}
	})
	$('.attachment-radio').eq(0).prop('checked',true).change();
	$('textarea').val('');
	$('.init-disabled').attr('disabled','disabled').removeClass('init-disabled');
	recallSession();
	keyUpChecker($('.pubkey-upload-input'),$('.upload-public-key-paste'));
	keyUpChecker($('.searchbox-pubkey'),$('.search-pubkey'));
	keyUpChecker($('.pubkey-input'),$('.import-pubkey-str'));
	readFormCheck();
	writeFormCheck();
	newKeyFormCheck();
	attachmentFormcheck();
	setTimeout(function () {
      resizeViewport();
  }, 300);
}

//get rid of loading screen when all assets are loaded
$(window).on('load',function(){
	init();
	let loadingStart = document.getElementById('loading-start');
	loadingStart.style.opacity = 0;
	setTimeout(function(){
		$(loadingStart).remove();
	},250);
})

//Handles online notification lip (alerts user if they are online)
window.addEventListener('online', function() {
	$('.online-flag').addClass('active');
});
window.addEventListener('offline', function() {
	$('.online-flag').removeClass('active');
});

//Exits popup
const popupExit = function(){
	let $body = $('body');
	if(!$body.hasClass('popup-uninterrupt')){
		$body.removeClass('popup-active');
		$('.popup').removeClass('active');
		$('.main-nav').removeClass('mobile-active');
		$('.mobile-menu').removeClass('active');
		$('.popup-filter').removeClass('active');
	}
}

const openPopup = function(className){
	$('body').addClass('popup-active');
	$('.popup-filter').addClass('active');
	$(className).addClass('active');
}

//Activate Copied alert when user clicks on Copy to clipboard button
const showCopied = function($copied){
	$copied.addClass('active');
	setTimeout(function() {
		$copied.removeClass('active');
	}, 2000);
}

const loadPage = function(hashLoc){
  let $main = $('main');
  let $tabWindow = $main.find('.tab-window');
  let $mainNav = $('.main-nav');
  /*
  let $this = $(this);
  let nextTab = $this.attr('data-tab');

  $this.addClass('active');
  */
  let $nextPage = $('.'+hashLoc[1]);
  if($nextPage.length > 0){
    popupExit();
    $mainNav.find('.active').removeClass('active');
    $mainNav.find('a').each(function(){
      let $this = $(this);
      if ($this.attr('data-tab').toLowerCase() == hashLoc[1]){
        $this.addClass('active');
      }
    })
    $tabWindow.removeClass('active');
    $nextPage.addClass('active');

    for (let i = 0; i < formChecker.length; i++){
      if(formChecker[i].type == hashLoc[1]){
        formChecker[i].runCheck();
      }
    }
  } else {
    window.location.hash = '#!'
  }
}

const hashHandler = function(hashArray){
    if (hashArray[0] === 'page'){
      if(hashArray[1] !== undefined){
          loadPage(hashArray);
      } else {
          window.location.hash = '#!'
      }
      //about
    } else if (hashArray.length === 0){
      //go home
        window.location.hash = '#!/page/keys'
    } else {
        window.location.hash = '#!'
    }
}

const hashCreator = function(firstTime){
  let locHash = location.hash.split('/');
  let cleanedHash = [];
  for (let i = 0; i < locHash.length; i++){
    if(locHash[i] !== '' && locHash[i] !== '#!'){
      cleanedHash.push(locHash[i].toLowerCase());
    }
  }
  hashHandler(cleanedHash);
}

window.addEventListener('hashchange',function(e){
    hashCreator();
},false);
hashCreator(true);

const resizeViewport = function() {
	const viewheight = $(window).height();
	const viewwidth = $(window).width();
	const viewport = document.querySelector("meta[name=viewport]");
	viewport.setAttribute("content", "height=" + viewheight + "px, width=" + viewwidth + "px, initial-scale=1.0");
}

window.addEventListener("orientationchange", function() {
		resizeViewport();
});

window.addEventListener('resize', function(event){
	  resizeViewport();
});

//Show passphrase box if Decrypting
$('.attachment-radio').bind('click',function(){
  let $this = $(this);
  let $attachmentCredentials = $('.attachment-credentials');
  let $attachmentProcess = $('.attachment-process');
  let $attachmentView = $('.attachment-view');
  if($this.is(':checked')){
      let $attachmentDownload = $('.attachment-download');
      let $attachmentWindowTitleSpan = $('.attachment-window').find('.window-title').find('span');
      if($this.val() == 'decrypt'){
        $attachmentCredentials.removeClass('disabled').find('input').removeAttr('disabled');
        $attachmentProcess.removeClass('attachment-encrypt').addClass('attachment-decrypt').find('span').text('Decrypt');
        $attachmentProcess.find('img').attr('src','./ui/decrypt.svg');
        if(session.lastDecFile.length > 0){
          $attachmentView.removeAttr('disabled');
          $attachmentWindowTitleSpan.text('Decrypted attachment');
          $attachmentDownload.attr('href',session.lastDecFile).attr('download',session.lastDecFilename).find('span').html('Download<br>decrypted file');
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
            $attachmentWindowTitleSpan.text('Encrypted attachment');
            $attachmentDownload.attr('href',session.lastEncFile).attr('download',session.lastEncFilename).find('span').html('Download<br>encrypted file');
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
    openPopup('.attachment-window');
  }
})

//Logic to navigate list for Guide
$('.tutorial-selectors').find('a').each(function(){
    $(this).bind('click',function(e){
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
		importPubKey('paste');
})

//check if pubkey paste textarea is filled
$('.pubkey-input').keyup(function(){
	keyUpChecker($(this),$('.import-pubkey-str'));
}).change(function(){
	keyUpChecker($(this),$('.import-pubkey-str'));
})

//opn pubkey paste
$('.pubkey-input-open').bind('click',function(){
	openPopup('.pubkey-input-window');
})

//Open steganography key converter popup
$('.open-keyconverter').bind('click',function(){
	openPopup('.steg-key-converter-window');
});

//Detect steganography imported file
$('.key-convert').change(function(){
	convertKey($(this));
});

//copy to clipboard - converted
$('.copy-converted').bind('click',function(){
	Clipboard.copy($('.converted-key-output').text());
	showCopied($('.steg-key-converter-window').find('.copied'));
})

//opens new key generation popup
$('.key-generate-start').bind('click', function(e) {
	openPopup('.create-key-window');
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
	newKeyReset();
})

//Import key along with download
$('.key-private-download').bind('click',function(){
	let thisFilename = $(this).attr('download');
	if($('.key-new-done-import-toggle').is(':checked')){
		importGeneratedPrivKey(thisFilename);
	}
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
	Clipboard.copy(session.generatedPubKey);
	showCopied($(this).find('.copied'));
})

//open key servers popup
$('.open-keybrowser').bind('click',function(){
	let $keyServerBrowserWindow = $('.key-server-browser-window');
	let $popupTabContent = $keyServerBrowserWindow.find('.popup-tab-content');
	let $popupTab = $keyServerBrowserWindow.find('.popup-tabs');
	let $activePopupTab = $popupTabContent.children('.active');
	if($activePopupTab.length == 0){
		$popupTab.find('.active').removeClass('active');
		$popupTab.find('.popup-tab').eq(0).addClass('active');
		let tabOpen = $popupTab.find('.active').attr('data-tab');
		$popupTabContent.find('.popup-tab-page.active').removeClass('active');
		$popupTabContent.find('.'+tabOpen).addClass('active');
	}
	openPopup('.key-server-browser-window');
})

//Binding for search-box to enable search button
$('.searchbox-pubkey').keyup(function(){
	keyUpChecker($(this),$('.search-pubkey'));
}).change(function(){
	keyUpChecker($(this),$('.search-pubkey'));
})

//Binding for Copy searched key
$('.searched-key-copy').bind('click',function(){
	Clipboard.copy(session.searchedKey);
	showCopied($('.pubkeyserver-search').find('.copied'));
})

//Binding for importing searched key
$('.searched-key-import').bind('click',function(){
	importSearchedKey();
})

//Search for key button
$('.search-pubkey').bind('click',function(){
	let $this = $(this);
	if(!$this.is(':disabled')){
		lookupKey($('.searchbox-pubkey').val(),$('.search-key-server-list').val());
	}
})

$('.search-result-list').change(function(){
	updateKeyLinks();
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
	const $this = $(this);
	if($this.val() != ''){
		keyImport($this);
	} else {
		$('.public-key-upload-filename').text('');
		$('.server-pub-key-import-label').find('span').text('Select key');
		$('.server-key-pub-import-upload').attr('disabled','disabled');
	}
})

//Paste new key to clipboard
$('.pubkey-paste-button').bind('click',function(){
	$('.pubkey-upload-input').val(session.generatedPubKey).trigger('change');
})

//Copy to clipboard button
$('.copy-processed').bind('click', function() {
	//copyProcessed($('.processed-output').text());
	Clipboard.copy($('.processed-output').text());
	showCopied($('.processed-output-window').find('.copied'));
})

//Convert imported steganography to text message on read page
$('.import-stg-msg').change(function(){
	let $this = $(this);
	convertStegMsg($this);
	$this.val('');
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

//Session toggler
$('.session-toggle').change(function() {
	let $this = $(this);
  if(this.checked){
    session.sessionStore = true;
    adjustSession();
  } else {
    session.sessionStore = false;
    eraseSession();
  }
});

//Blob button fix for iOS
$('.blob-download').bind('click',function(e){
  if(iOS){
    e.preventDefault();
		let link = $(this).attr('href');
    setTimeout(function(){
        window.open(link, "_blank");
    }, 500);
  }
})

//do not run <a> buttons with disabled class
$('a').bind('click',function(e){
	if ($(this).hasClass('disabled')){
		e.preventDefault();
	}
})

$('.no-link').bind('click',function(e){
		e.preventDefault();
})

//Password show toggler
$('.pw-toggle').change(function() {
	let $thisPar = $(this).parent();
	let $passphraseBox = $thisPar.prev('input');
	if($passphraseBox.length == 0){
		$passphraseBox = $thisPar.prev('section').find('.passphrase-box');
	}
	if (this.checked) {
		$passphraseBox.attr('type', 'text');
	} else {
		$passphraseBox.attr('type', 'password');
	}
});

//label container bind (input file is triggered by label for custom styling)
$('.label-container').bind('click', function(e) {
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
	if($mainNav.hasClass('mobile-active')){
    popupExit();
		$this.removeClass('active');
		$mainNav.removeClass('mobile-active');
		$popupFilter.removeClass('active');
	} else {
    popupExit();
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
		$thisParPar.find('.popup-tab').removeClass('active');
		$this.addClass('active');
		$popupTabContent.find('.popup-tab-page').removeClass('active');
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
	let $stgHostLabel = $('.stg-host-label');
	if(file != undefined){
		if($.inArray(file['type'], ["image/gif", "image/jpeg", "image/png"]) > -1){
			$stgHostLabel.text('Reselect steganograph host');
			$stgClear.addClass('active');
		} else {
			$stgHostLabel.text('Select steganograph host');
			$this.val('');
			$stgClear.removeClass('active');
			lipAlert('The imported file is not a valid image to be used as a steganograph host');
		}
	} else {
		$stgHostLabel.text('Select steganograph host');
		$stgClear.removeClass('active');
		$this.val('');
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
