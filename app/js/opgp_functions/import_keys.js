//Process imported keys
function keyImportProcess($type,result){
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
function writeKeyStatus(pasted) {
	let filename;
	let pubImport = $('.key-pub-import').val();
	let privImport = $('.key-priv-import').val();
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
function keyImport($type){
		let file = $type[0].files[0];
		let reader = new FileReader();
		reader.onload = function(e) {
			let result;
			if($.inArray(file['type'], ['image/png']) > -1){
				let img = document.createElement('img');
				img.onload = function(){
					result = readSteg(img);
					$(img).remove();
					keyImportProcess($type,result);
				}
				img.src = e.target.result;
			} else {
				keyImportProcess($type,reader.result);
			}
		}
		if ($.inArray(file['type'], ['image/png']) > -1) {
			reader.readAsDataURL(file);
		} else {
			reader.readAsText(file);
		}
}

//read public key from pasted button
function importPubkeyStr(){
	let $pubkeyInput = $('.pubkey-input');
	let pubKeyPaste = $pubkeyInput.val().trim();
	if (testPubKey(pubKeyPaste)) {
		session.pubKey = pubKeyPaste;
		return true
	} else {
		lipAlert("Oops! This doesn't seem like a valid public key. Please choose a different file.");
		return false
	}
}

//Import private key button function
function importPrivKey() {
	//$('.read').find('.fingerprint').text(openpgp.key.primaryKey.fingerprint);
	$('.key-priv-import-label').find('span').text('Reimport key');
	writeFormCheck();
	readFormCheck();
	attachmentFormcheck();
	writeKeyStatus();
}

//process public key from import
function importPubKey(type) {
	//$('.fingerprint').text(getFingerprint(pubKey));
	openpgp.key.readArmored(session.pubKey).then(data => {
		const buffer = new Uint8Array(data.keys[0].primaryKey.fingerprint).buffer;
		let $pubkeyInputWindow = $('.pubkey-input-window');
		session.pubKeyFingerprint = buf2hex(buffer);
		$('.fingerprint').addClass('active');
		$('.fingerprint-str').text(session.pubKeyFingerprint.match(/.{1,4}/g).join(' ').toUpperCase());
		if(type == 'paste'){
			$('.pubkey-input-open').find('span').text('Repaste key');
			$('.key-pub-import-label').find('span').text('Select key');
		} else {
			$('.pubkey-input-open').find('span').text('Paste key');
			$('.key-pub-import-label').find('span').text('Reimport key');
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
	}).catch(function(e){
		lipAlert('The public key cannot be read. It may be corrupted.');
	})
}
