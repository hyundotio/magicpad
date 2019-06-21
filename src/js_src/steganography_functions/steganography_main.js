//convert steganograph to text
const readSteg = function(img){
	return steg.decode(img);
}

//create  steganograph key
const createStegKey = function(input,type,str){
	async function main() {
		try {
			const loadedImg = await resolveImg(input);
			const imgCanvas = document.createElement("canvas");
			let imgContext = imgCanvas.getContext("2d");
			imgContext.canvas.width = loadedImg.width;
			imgContext.canvas.height = loadedImg.height;
			imgContext.drawImage(loadedImg, 0, 0, loadedImg.width, loadedImg.height);
			imgContext.font = '11px IBM Plex Mono';
			imgContext.fillStyle = '#0062ff';
			const imgStr = $('.form-email').val().trunc(35);
			if(type == 'search'){
				imgStr = $('.searchbox-pubkey').val().trunc(35);
			}
			imgContext.fillText(imgStr, 14, 55);

			let newImg = await resolveImg(imgCanvas.toDataURL("image/png"));
			if(type == 'public'){
				createSteg(newImg,$('.key-public-img-download'),str);
			} else if (type == 'private'){
				createSteg(newImg,$('.key-private-img-download'),str);
			} else if (type =='search'){
				createSteg(newImg,$('.searched-key-download-steg'),str);
			} else {
				//createSteg(newImg,$('.key-revoke-steg-download-link'),str);
			}
			$(imgCanvas).remove();
			$(loadedImg).remove();
			$(newImg).remove();
		} catch(e) {
			lipAlert('Failed to create image keys.');
		}
	}
	main();
}

//createSteg($('steghost')[0],$('processed-img-download-link'),encryptedMessageStr);
const createSteg = function(img,$dest,str){
	$dest.attr('href',steg.encode(str, img));
}

//Convert steganograph to message
const convertStegMsg = function($type){
	async function main() {
		try {
			// Closure to capture the file information.
			const imgSrc = await resolveLoadFileURL($type).result;
			const img = await resolveImg(imgSrc);
			const retrievedMsg = readSteg(img);
			$(img).remove();

			//Also fill in key textArea
			//Open convereted-key-window;
			if(retrievedMsg.length > 0){
				$('.import-stg-msg-label').text('Reimport steganograph');
				$('.text-read').val(retrievedMsg).text(retrievedMsg).scrollTop(0,0);
				readFormCheck();
			} else {
				$type.val('');
				lipAlert('The imported steganograph does not contain a message.');
			}
		} catch(e) {
			$type.val('');
			lipAlert('Failed to process imported steganograph.');
		}
	}
	main();
}

//covnert steganograph key to string
const convertStegKey = function($type){
	async function main() {
		try {
			const imgSrc = await resolveLoadFileURL($type).result;
			const img = await resolveImg(imgSrc);
			let retrievedKey = readSteg(img);
			$(img).remove();
			//Also fill in key textArea
			//Open convereted-key-window;
			if(testPubKey(retrievedKey) || testPrivKey(retrievedKey)){
				$('.convert-filename').text(' - ' + getFilename($('.key-convert').val()));
				$('.key-convert-label').find('span').text('Reimport image');
				$('.converted-key-output').text(retrievedKey).val(retrievedKey).scrollTop(0,0);
				$('.save-converted').removeClass('disabled').attr('href', 'data:application/octet-stream;base64;filename=encrypted_message.txt,' + btoa(retrievedKey)).attr('download', 'convertedKey.asc');
				$('.copy-converted').removeAttr('disabled');
				$('.converted-aside').text('Key converted.');
			} else {
				$type.val('');
				lipAlert('The imported image does not contain a valid key.');
			}
		} catch(e) {
			$type.val('');
			lipAlert('The imported file is not a valid image key.');
		}
	}
	main();
}
