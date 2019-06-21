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
				console.log(result);
				$(img).remove();
				keyImportProcess($type,result);
			} else {
				//reader.readAsText(file);
				const loadedFile = await resolveLoadFileText($type);
				console.log(loadedFile);
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
