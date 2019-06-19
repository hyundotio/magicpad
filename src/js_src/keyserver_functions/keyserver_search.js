//Function to look up key
const lookupKey = function(query,server) {
  //console.log(query)
		let $searchResults = $('.search-results');
		let $searchStatus = $('.search-status');
		$searchStatus.text('Searching...');
		if (location.protocol == "https:") {
		  server = location.protocol + server
		} else {
			server = 'http:'+server
		}
		let hkp = new openpgp.HKP(server);
		new Promise((resolve, reject) => {
			hkp.lookup({ query: query }).then(function(keys) {
				if(keys != undefined){
					if (keys.length > 0){
						//copy keys
						session.searchedKey = keys.trim();
						openpgp.key.readArmored(session.searchedKey).then(data => {
							const buffer = new Uint8Array(data.keys[0].primaryKey.fingerprint).buffer;
							$('.searched-key-download').attr('href', 'data:application/octet-stream;base64;name=searchedKey_public.asc,' + btoa(session.searchedKey)).attr('download', 'searchedKey_public.asc').attr('target','_blank');
							$('.downloaded-fingerprint').text(buf2hex(buffer).match(/.{1,4}/g).join(' ').toUpperCase());
							createStegKey('./ui/publickeyreference.jpg','search',session.searchedKey);
							$('.searched-key-download-steg').attr('download', 'searchedKey_public_steg.png')
							$searchResults.addClass('search-complete');
							$searchStatus.text('Key found');
						}).catch(function(e){
							$('.search-status').text('Error');
							lipAlert("Key retrieved but was unabled to read fingerprint. Please use another key.");
						})
					}
				} else {
					//clear keys
					$('.search-complete').removeClass('search-complete');
					$searchStatus.text('Nothing found');
				}
			}).catch(function(e){
				$('.search-status').text('Search error');
				lipAlert('Could not retrieve key. Please try again.');
			})
		}).catch(function(e){
			$('.search-status').text('Search error');
			$('.create-key-progress').find('span').text('Failed generating keys').removeClass('active');
			lipAlert('Could not connect to key server. Please try again.');
		})
}
