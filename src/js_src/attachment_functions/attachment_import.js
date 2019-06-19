//Input key filename when selected
const attachmentFilename = function($type) {
	let file = $type[0].files[0];
	let reader = new FileReader();
	reader.onload = function(e) {
		let result;
		let $filenameEl = $('.attachment-filename');
		filename = getFilename($type.val());
		$filenameEl.text(' - ' + filename);
		$('.attachment-size').text('File size: '+bytesToSize(file.size));
		$('.attachment-import-label').find('span').text('Reselect file');
	}
	reader.readAsDataURL(file);
}

//check  form for attachments
const attachmentFormcheck = function(){
	let attachmentRadio = $('.attachment-radio:checked').val();
	let $attachmentProcess = $('.attachment-process');
	let attachmentImport = $('.attachment-import').val();
	let attachmentPassphrase = $('.attachment-passphrase').val();
	if(attachmentRadio == 'decrypt'){
		if(attachmentPassphrase.length > 0 && attachmentImport.length > 0 && session.privKey.length > 0){
			$attachmentProcess.removeAttr('disabled');
		} else {
			$attachmentProcess.attr('disabled','disabled');
		}
	} else if (attachmentRadio == 'encrypt'){
		if(attachmentImport.length > 0 && session.pubKey.length > 0){
			$attachmentProcess.removeAttr('disabled');
		} else {
			$attachmentProcess.attr('disabled','disabled');
		}
	} else {
		if(attachmentPassphrase.length > 0 && attachmentImport.length > 0 && session.privKey.length > 0 && session.pubKey.length > 0){
			$attachmentProcess.removeAttr('disabled');
		} else {
			$attachmentProcess.attr('disabled','disabled');
		}
	}
}
