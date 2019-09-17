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
			$('.fingerprint-priv').addClass('active');
			$('.fingerprint-priv-str').text(session.privKeyFingerprint.match(/.{1,4}/g).join(' ').toUpperCase());
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
			$('.fingerprint-pub').addClass('active');
			$('.fingerprint-pub-str').text(session.pubKeyFingerprint.match(/.{1,4}/g).join(' ').toUpperCase());
			$pubkeyInputOpenText.text('Paste key');
			$keyPubImportLabel.text('Reimport key');
			if($pubkeyInputWindow.hasClass('active')){
				writeKeyStatus(undefined,true);
				$('.popup-filter').removeClass('active');
				$pubkeyInputWindow.removeClass('active');
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
