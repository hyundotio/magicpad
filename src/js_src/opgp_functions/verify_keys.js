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
		try {
			let $publicKeyUploadFilename = $('.public-key-upload-filename');
			let $serverPubKeyImportLabel = $('.server-pub-key-import-label');
			let $serverKeyPubImportUpload = $('.server-key-pub-import-upload');
			const readPubKey = await openpgp.key.readArmored(key);
			if(readPubKey.err != undefined || !testPubKey(key)){
				$('.server-key-pub-import').val('');
				$publicKeyUploadFilename.text('');
				$serverPubKeyImportLabel.find('span').text('Select key');
				$serverKeyPubImportUpload.attr('disabled','disabled');
				throw errorFinder('pubkey');
			}
			session.keyToUploadFile = key;
			$publicKeyUploadFilename.text('  -  '+getFilename($('.server-key-pub-import').val()));
			$serverPubKeyImportLabel.find('span').text('Reselect key');
			$serverKeyPubImportUpload.removeAttr('disabled');
		} catch (e) {
			lipAlert(e);
		}
	}
	main();
}
