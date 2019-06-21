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

//promise wrapper for importing steg file
/*
const resolveLoadFileDataURL = function($type){
	return new Promise(resolve => {
		 const file = $type[0].files[0];
		 let reader = new FileReader();
		 reader.onload = function(e){
			 const returnObj = {
				 reader : reader,
				 file : file
			 }
			 resolve(returnObj);
		 }
		 reader.readAsDataURL(file);
	})
}
*/

//promise wrapper for decrypting attachment
const resolveLoadFileText = function($type){
	const file = $type[0].files[0];
	return new Promise(resolve => {
		let reader = new FileReader();
		reader.onload = function(){
			resolve(reader.result);
		}
		reader.readAsText(file);
	})
}

//promise wrapper for encrypting attachment
const resolveLoadFileBuffer = function(file){
	return new Promise(resolve => {
		let reader = new FileReader();
		reader.onload = function(){
			resolve(reader.result);
		}
		reader.readAsArrayBuffer(file);
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
		 reader.readAsDataURL(file);
	})
}

//promise wrapper for uploading key
const resolveUploadKey = function(key,server){
	return new Promise(resolve => {
		const hkp = new openpgp.HKP(server);
		const uploadKeyResolve = hkp.upload(key);
		resolve(uploadKeyResolve);
	})
}

//promise wrapper for searching key
const resolveSearchKey = function(query,server){
	return new Promise(resolve => {
		const hkp = new openpgp.HKP(server);
		const searchKeyResolve = hkp.lookup({ query: query });
		resolve(searchKeyResolve);
	})
}

//promise wrapper for parsing public key
//session.pubKey
const resolvePubKey = function(pubKey){
	return new Promise(resolve => {
		const pubKeyResolve = openpgp.key.readArmored(pubKey);
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

//promise wrapper for signing message
const resolveSignMsg = function(options){
	return new Promise(resolve => {
		const signMsgResolve = openpgp.sign(options);
		resolve(signMsgResolve);
	})
}

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

//output as opgp msg
const resolveTextMsg = function(msg){
	return new Promise(resolve => {
		const textMsgResolve = openpgp.message.fromText(msg);
		resolve(textMsgResolve);
	})
}

//generate key
const resolveGenKey = function(options){
		return new Promise(resolve => {
			const genKeyResolve = openpgp.generateKey(options);
			resolve(genKeyResolve);
		})
}
