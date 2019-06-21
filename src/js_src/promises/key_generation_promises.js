
//generate key
const resolveGenKey = function(options){
		return new Promise(resolve => {
			const genKeyResolve = openpgp.generateKey(options);
			resolve(genKeyResolve);
		})
}
