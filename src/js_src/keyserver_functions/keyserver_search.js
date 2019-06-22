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
			const hkpLookup = await resolveSearchKey(query,server);
			if(hkpLookup != undefined){
				if(hkpLookup.length > 0){
					session.searchedKey = hkpLookup.trim();
					const searchedKey = await resolvePubKey(session.searchedKey);
					const buffer = new Uint8Array(searchedKey.keys[0].primaryKey.fingerprint).buffer;
					$('.searched-key-download').attr('href', 'data:application/octet-stream;base64;name=searchedKey_public.asc,' + btoa(session.searchedKey)).attr('download', 'searchedKey_public.asc').attr('target','_blank');
					$('.downloaded-fingerprint').text(buf2hex(buffer).match(/.{1,4}/g).join(' ').toUpperCase());
					createStegKey(pubDataUri,'search',session.searchedKey);
					$('.searched-key-download-steg').attr('download', 'searchedKey_public_steg.png')
					$searchResults.addClass('search-complete');
					$searchStatus.text('Key found');
				}
			} else {
				$('.search-complete').removeClass('search-complete');
				$searchStatus.text('Nothing found');
			}
		} catch(e) {
			$searchStatus.text('Error');
			lipAlert(e);
		}
	}
	main();
}
