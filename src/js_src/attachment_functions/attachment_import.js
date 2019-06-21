//Input key filename when selected
const attachmentFilename = function($type) {
	async function main() {
		try {
			const attachment = await resolveLoadFileURL($type);
			let $filenameEl = $('.attachment-filename');
			const filename = getFilename($type.val());
			$filenameEl.text(' - ' + filename);
			$('.attachment-size').text('File size: '+bytesToSize(attachment.file.size));
			$('.attachment-import-label').find('span').text('Reselect file');
		} catch(e) {
			$type.val('');
			lipAlert('Failed to load selected file.');
		}
	}
	main();
}

//check  form for attachments
const attachmentFormcheck = function(){
	const attachmentRadio = $('.attachment-radio:checked').val();
	const attachmentImport = $('.attachment-import').val();
	const attachmentPassphrase = $('.attachment-passphrase').val();
	let $attachmentProcess = $('.attachment-process');
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
