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
				let keyType;
				if(keyInput.keys[0].isPrivate()){
					keyType = 'private';
					createStegKey(pvDataUri,'convert',retrievedKey);
				} else {
					keyType = 'public';
					createStegKey(pubDataUri,'convert',retrievedKey);
				}

				$('.convert-filename').text(' - ' + getFilename($('.key-convert').val()));
				$('.key-convert-label').find('span').text('Reimport key');
				const outputStr = "Please download the .png image key below.\n\nKey contents:\n"+retrievedKey;
				$('.converted-key-output').text(outputStr).val(outputStr).scrollTop(0,0);
				let fileName;
				if(keyInput.keys[0].users[0].userId.name){
					fileName = (keyInput.keys[0].users[0].userId.name).split(' ')[0].toLowerCase().replace(/\s/g, '') + '_' + keyType + '_steg.png';
				} else {
					fileName = 'converted_'+keyType+'_steg.png';
				}
				$('.save-converted').removeClass('disabled').attr('download',fileName);
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
			let keyType = 'public';
			if(keyOutput.keys[0].isPrivate()){
				keyType = 'private';
			}
			$('.convert-filename').text(' - ' + getFilename($('.key-convert').val()));
			$('.key-convert-label').find('span').text('Reimport key');
			$('.converted-key-output').text(retrievedKey).val(retrievedKey).scrollTop(0,0);
			if(keyOutput.keys[0].users[0].userId.name){
			}
			let fileName;
			if(keyOutput.keys[0].users[0].userId.name){
				fileName = (keyOutput.keys[0].users[0].userId.name).split(' ')[0].toLowerCase().replace(/\s/g, '') + '_' + keyType + '.asc';
			} else {
				fileName = 'converted_'+keyType+'.asc';
			}
			let $saveConverted = $('.save-converted');
			revokeBlob($saveConverted.attr('href'));
			$saveConverted.removeClass('disabled').attr('href', dataURItoBlobURL('data:application/octet-stream;base64;filename='+fileName+',' + btoa(retrievedKey))).attr('download', fileName);
			$('.copy-converted').removeAttr('disabled');
			$('.converted-aside').text('Key converted.');
		} catch(e) {
			$type.val('');
			lipAlert(e);
		}
	}
	main();
}
