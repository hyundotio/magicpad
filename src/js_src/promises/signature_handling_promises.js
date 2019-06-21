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
