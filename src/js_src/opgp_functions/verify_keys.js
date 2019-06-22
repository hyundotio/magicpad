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
			$('.public-key-upload-filename').text('  -  '+getFilename($('.server-key-pub-import').val()));
			$('.server-pub-key-import-label').find('span').text('Reselect key');
			$('.server-key-pub-import-upload').removeAttr('disabled');
		} catch (e) {
			lipAlert(e);
		}
	}
	main();
}
