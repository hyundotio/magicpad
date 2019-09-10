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
					if(searchedKey.err != undefined){
						$searchStatus.text('Error');
						throw errorFinder('searchresultkey');
					}
					session.searchedKey = hkpLookup.trim();
					const buffer = new Uint8Array(searchedKey.keys[0].primaryKey.fingerprint).buffer;
					$('.searched-key-download').attr('href', dataURItoBlobURL('data:application/octet-stream;base64;name=searchedKey_public.asc,' + btoa(session.searchedKey))).attr('download', 'searchedKey_public.asc').attr('target','_blank');
					$('.downloaded-fingerprint').text(buf2hex(buffer).match(/.{1,4}/g).join(' ').toUpperCase());
					createStegKey(pubDataUri,'search',session.searchedKey);
					$('.searched-key-download-steg').attr('download', 'searchedKey_public_steg.png')
					$searchResults.addClass('search-complete');
					$searchStatus.text('Key found');
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
