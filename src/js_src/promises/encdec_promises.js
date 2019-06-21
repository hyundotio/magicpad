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
