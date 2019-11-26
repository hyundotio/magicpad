//Function to look up key
const lookupKey = function(query,server) {
  //console.log(query)
	async function main() {
		let $searchResults = $('.search-results');
		let $searchStatus = $('.search-status');
		$searchStatus.text('Searching...');
		let server = $('.search-key-server-list').val();
		if (location.protocol == "https:") {
			server = location.protocol + server
		} else {
			server = 'http:'+server
		}
		try {
			const hkp = new openpgp.HKP(server);
			const hkpLookup = await hkp.lookup({ query: query });
			if(hkpLookup != undefined){
				if(hkpLookup.length > 0){
					const searchedKey = await openpgp.key.readArmored(hkpLookup.trim());
					const $searchResultList = $('.search-result-list');
					if(searchedKey.err != undefined){
						$searchStatus.text('Error');
						throw errorFinder('searchresultkey');
					}
					if(searchedKey.keys.length > 1){
						$searchResultList.removeClass('hidden');
						$searchStatus.text('Multiple keys found');
					} else {
						$searchResultList.addClass('hidden');
						$searchStatus.text('Key found');
					}
					$searchResultList.empty();
					for(let i = 0; i < searchedKey.keys.length; i++){
						const fingerprintBuffer = new Uint8Array(searchedKey.keys[i].primaryKey.fingerprint).buffer;
						const fingerprintHex = buf2hex(fingerprintBuffer);
						const downloadLink = server + '/pks/lookup?op=get&options=mr&search=0x' + fingerprintHex;
						const keyId = searchedKey.keys[i].primaryKey.keyid.toHex();
						const $tempOption = $('<option>');
						let optionStr = keyId;
						if(i == 0){
							optionStr = 'Latest - '+optionStr;
							$('.searched-key-download').attr('href', downloadLink).attr('target','_blank');
							$('.downloaded-fingerprint').text(fingerprintHex.match(/.{1,4}/g).join(' ').toUpperCase());
						}
						$tempOption.text(optionStr);
						$tempOption.val(keyId).attr('data-fingerprint',fingerprintHex);
						$searchResultList.append($tempOption);
					}
					updateKeyLinks();
					$searchResults.addClass('search-complete');
				}
			} else {
				$searchResults.removeClass('search-complete');
				$searchStatus.text('Nothing found');
			}
		} catch(e) {
			$searchResults.removeClass('search-complete');
			$searchStatus.text('Error');
			lipAlert(e);
		}
	}
	main();
}

const returnServer = function(){
	let server = $('.search-key-server-list').val();
	if (location.protocol == "https:") {
		server = location.protocol + server
	} else {
		server = 'http:'+server
	}
	return server
}

const updateKeyLinks = function(){
	const $searchedKeyActions = $('.searched-key-action');
	$searchedKeyActions.addClass('disabled');
	const server = returnServer();
	const downloadLink = server + '/pks/lookup?op=get&options=mr&search=0x' + $('.search-result-list').val();
	$.ajax({
    url:downloadLink,
    success: function (data){
			session.searchedKey = data;
			const fingerprintHex = $(".search-result-list option:selected").attr('data-fingerprint');
			const fileName = $('.search-result-list').val().toLowerCase().replace(/\s/g, '') + '.png';
			createStegKey(pubDataUri,'search',session.searchedKey);
			$('.searched-key-download').attr('href', downloadLink).attr('target','_blank');
			$('.downloaded-fingerprint').text(fingerprintHex.match(/.{1,4}/g).join(' ').toUpperCase());
			$('.searched-key-download-steg').attr('download', fileName);
			$searchedKeyActions.removeClass('disabled');
    }
  });
}

const importSearchedKey = function(){
	const server = returnServer();
	const keyId = $(".search-result-list option:selected").val();
	const downloadLink = server + '/pks/lookup?op=get&options=mr&search=0x' + $('.search-result-list').val();
	$.ajax({
    url:downloadLink,
    success: function (data){
		 	const $tempInput = $('<input>');
			importPubKey('search',data,$tempInput);
			$tempInput.val(keyId).addClass('key-pub-import');
    }
  });
}
