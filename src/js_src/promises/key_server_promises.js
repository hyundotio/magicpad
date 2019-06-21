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
