//convert steganograph to text
function readSteg(img){
	return steg.decode(img);
}

//create  steganograph key
function createStegKey(input,type,str){
	let loadedImg = document.createElement('img');
	let newImg = document.createElement('img');
	loadedImg.onload = function(){
		let imgCanvas = document.createElement("canvas");
		let imgContext = imgCanvas.getContext("2d");
		imgContext.canvas.width = loadedImg.width;
		imgContext.canvas.height = loadedImg.height;
		imgContext.drawImage(loadedImg, 0, 0, loadedImg.width, loadedImg.height);
		imgContext.font = '11px IBM Plex Mono';
		imgContext.fillStyle = '#0062ff';
		let imgStr = $('.form-email').val().trunc(35);
		if(type == 'search'){
			imgStr = $('.searchbox-pubkey').val().trunc(35);
		}
		imgContext.fillText(imgStr, 14, 55);
		let imgInfom = imgCanvas.toDataURL("image/png");
		newImg.onload = function(){
			if(type == 'public'){
				createSteg(newImg,$('.key-public-img-download'),str);
			} else if (type == 'private'){
				createSteg(newImg,$('.key-private-img-download'),str);
			} else if (type =='search'){
				createSteg(newImg,$('.searched-key-download-steg'),str);
			}else {
				//createSteg(newImg,$('.key-revoke-steg-download-link'),str);
			}
			$(imgCanvas).remove();
			$(loadedImg).remove();
			$(newImg).remove();
		}
		newImg.src = imgInfom;
	}
	loadedImg.src = input;
}

//createSteg($('steghost')[0],$('processed-img-download-link'),encryptedMessageStr);
function createSteg(img,$dest,str){
	$dest.attr('href',steg.encode(str, img));
}

//Convert steganograph to message
function convertStegMsg($type){
	// Closure to capture the file information.
	let file = $type[0].files[0];
	let reader = new FileReader();
	if($.inArray(file['type'], ['image/png']) > -1){
		reader.onload = function(e) {
			let img = document.createElement('img');
			img.onload = function(){
				let retrievedMsg = readSteg(img);
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
			}
			img.src = e.target.result;
		}
		if (file != undefined) {
			reader.readAsDataURL(file);
		}
	} else {
		$type.val('');
		lipAlert('The imported file is not a valid steganograph.');
	}
}

//covnert steganograph key to string
function convertStegKey($type){
	// Closure to capture the file information.
	let file = $type[0].files[0];
	let reader = new FileReader();
	if($.inArray(file['type'], ['image/png']) > -1){
		reader.onload = function(e) {
			let img = document.createElement('img');
			img.onload = function(){
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
			}
			img.src = e.target.result;
		}
		if (file != undefined) {
			reader.readAsDataURL(file);
		}
	} else {
		$type.val('');
		lipAlert('The imported file is not a valid image key.');
	}
}
