//Convert steganograph to message
const convertStegMsg = function($type){
	async function main() {
		try {
			// Closure to capture the file information.
			const imgSrc = await resolveLoadFileURL($type);
			const img = await resolveImg(imgSrc.result);
			const retrievedMsg = readSteg(img);
			$(img).remove();
			//Also fill in key textArea
			//Open convereted-key-window;
			if(retrievedMsg.length > 0){
				$('.import-stg-msg-label').text('Reimport steganograph');
				$('.text-read').val(retrievedMsg).text(retrievedMsg).scrollTop(0,0);
				readFormCheck();
			} else {
				throw (errorFinder('stegnomsg'));
			}
		} catch(e) {
			$type.val('');
			lipAlert(e);
		}
	}
	main();
}

const convertKey = function($el){
	async function main() {
		try {
			const selectedFile = await resolveLoadFileURL($el); //reuse function to get url
			if($.inArray(selectedFile.file['type'], ['image/png']) > -1){
				convertStegKey($el);
			} else {
				convertStegKeyReverse($el);
			}
		} catch(e) {
			lipAlert(errorFinder('keyimportfail'));
		}
	}
	main();
}

//convert key string to steg
const convertStegKeyReverse = function($type){
	async function main() {
		try {
				const retrievedKey = await resolveLoadFileText($type);
				const keyInput = await openpgp.key.readArmored(retrievedKey);
				if(keyInput.err != undefined || (!testPubKey(retrievedKey) && !testPrivKey(retrievedKey))){
					throw errorFinder('pubkey');
				}
				createStegKey(pubDataUri,'convert',retrievedKey);
				$('.convert-filename').text(' - ' + getFilename($('.key-convert').val()));
				$('.key-convert-label').find('span').text('Reimport key');
				const outputStr = "Please download the .png image key below.\n\nKey contents:\n"+retrievedKey;
				$('.converted-key-output').text(outputStr).val(outputStr).scrollTop(0,0);
				$('.save-converted').removeClass('disabled').attr('download','convertedKey.png');
				$('.copy-converted').attr('disabled', 'disabled');
				$('.converted-aside').text('Key converted.');
		} catch(e) {
			lipAlert(errorFinder('pubkey'));
		}
	}
	main();
}

//covnert steganograph key to string
const convertStegKey = function($type){
	async function main() {
		try {
			const imgSrc = await resolveLoadFileURL($type);
			const img = await resolveImg(imgSrc.result);
			const retrievedKey = readSteg(img);
			$(img).remove();
			const keyOutput = await openpgp.key.readArmored(retrievedKey);
			if(keyOutput.err != undefined || (!testPubKey(retrievedKey) && !testPrivKey(retrievedKey))){
				throw errorFinder('stegkeyread');
			}
			$('.convert-filename').text(' - ' + getFilename($('.key-convert').val()));
			$('.key-convert-label').find('span').text('Reimport key');
			$('.converted-key-output').text(retrievedKey).val(retrievedKey).scrollTop(0,0);
			$('.save-converted').removeClass('disabled').attr('href', dataURItoBlobURL('data:application/octet-stream;base64;filename=encrypted_message.txt,' + btoa(retrievedKey))).attr('download', 'convertedKey.asc');
			$('.copy-converted').removeAttr('disabled');
			$('.converted-aside').text('Key converted.');
		} catch(e) {
			$type.val('');
			lipAlert(e);
		}
	}
	main();
}
