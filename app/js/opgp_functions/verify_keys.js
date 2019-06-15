//test public key (preliminary)
function testPubKey(pubKey){
	if(pubKey.search('-----END PGP PUBLIC KEY BLOCK-----') != -1 && pubKey.search('-----BEGIN PGP PUBLIC KEY BLOCK-----') != -1){
		return true
	} else {
		return false
	}
}

//test private key (preliminary)
function testPrivKey(privKey){
	if(privKey.search('-----END PGP PRIVATE KEY BLOCK-----') != -1 && privKey.search('-----BEGIN PGP PRIVATE KEY BLOCK-----') != -1){
		return true
	} else {
		return false
	}
}

//Import public key button function
function validatePubKeyUpload(){
	openpgp.key.readArmored(session.pubKey).then(data => {
		let $serverKeyPubImport = $('.server-key-pub-import');
		let $h3Text = $serverKeyPubImport.parent().find('h3').find('span');
		$h3Text.text('  -  '+getFilename($('.server-key-pub-import').val()));
		$serverKeyPubImport.prev('.label-container').find('span').text('Reselect key');
		$('.server-key-pub-import-upload').removeAttr('disabled');
	}).catch(function(e){
		lipAlert('The public key cannot be read. It may be corrupted.');
	})
}
