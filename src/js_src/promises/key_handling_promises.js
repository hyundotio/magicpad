//promise wrapper for parsing public key
//session.pubKey
const resolvePubKey = function(pubKey){
	let pubKeyResolve;
	const prom = new Promise(resolve => {
		pubKeyResolve = openpgp.key.readArmored(pubKey);
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
