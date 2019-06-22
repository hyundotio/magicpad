//enables / disabled buttons based upon given list of inputs / textarea
const keyUpChecker = function($input,$target){
	if($input.val().length > 0){
		$target.removeAttr('disabled');
	} else {
		$target.attr('disabled','disabled');
	}
}

//checks for form fields for key generation
const newKeyFormCheck = function(){
	let $keyGenerate = $('.key-generate');
	let empty = false;
	$('.key-new-form').find('input').each(function() {
		let $this = $(this);
		if ($this.val() == '' && !$this.hasClass('pw-toggle')) {
			empty = true;
			$this.hasClass('empty')
		}
		if ($this.hasClass('form-email') && !isEmail($this.val()) && $this.val() != '') {
			empty = true;
			$this.addClass('error');
		} else {
			$this.removeClass('error');
		}
	})
	if (!empty) {
		$keyGenerate.removeAttr('disabled');
	} else {
		$keyGenerate.attr('disabled', 'disabled');
	}
}

//Checks for form in the Write tab
const writeFormCheck = function() {
	let $encryptMessage = $('.encrypt-message');
	let $textWrite = $('.text-write');
	if ($encryptMessage.hasClass('sign-enabled')) {
		if ($textWrite.val().length > 0 && $('.text-write-passphrase').val().length > 0 && session.privKey.length > 0 && session.pubKey.length > 0) {
			$encryptMessage.removeAttr('disabled');
		} else {
			$encryptMessage.attr('disabled', 'disabled');
		}
	} else {
		if ($textWrite.val().length > 0 && session.pubKey.length > 0) {
			$encryptMessage.removeAttr('disabled');
		} else {
			$encryptMessage.attr('disabled', 'disabled');
		}
	}
}

//Checks for form in the Read tab
const readFormCheck = function() {
	let $decryptMessage = $('.decrypt-message');
	if ($('.text-read').val().length > 0 && $('.text-read-passphrase').val().length > 0 && session.privKey.length > 0) {
		$decryptMessage.removeAttr('disabled');
	} else {
		$decryptMessage.attr('disabled', 'disabled');
	}
}

//check  form for attachments
const attachmentFormcheck = function(){
	const attachmentRadio = $('.attachment-radio:checked').val();
	const attachmentImport = $('.attachment-import').val();
	const attachmentPassphrase = $('.attachment-passphrase').val();
	let $attachmentSize = $('.attachment-size');
	let $attachmentFilename = $('.attachment-filename');
	let $attachmentProcess = $('.attachment-process');
	let $attachmentView = $('.attachment-view');
	if(attachmentRadio == 'decrypt'){
		if(attachmentPassphrase.length > 0 && attachmentImport.length > 0 && session.privKey.length > 0){
			$attachmentProcess.removeAttr('disabled');
		} else {
			if(attachmentImport == ''){
				$attachmentSize.text('No file selected');
				$attachmentFilename.text('');
			}
			$attachmentView.attr('disabled','disabled');
			$attachmentProcess.attr('disabled','disabled');
		}
	} else if (attachmentRadio == 'encrypt'){
		if(attachmentImport.length > 0 && session.pubKey.length > 0){
			$attachmentProcess.removeAttr('disabled');
		} else {
			if(attachmentImport == ''){
				$attachmentSize.text('No file selected');
				$attachmentFilename.text('');
			}
			$attachmentView.attr('disabled','disabled');
			$attachmentProcess.attr('disabled','disabled');
		}
	} else {
		if(attachmentPassphrase.length > 0 && attachmentImport.length > 0 && session.privKey.length > 0 && session.pubKey.length > 0){
			$attachmentProcess.removeAttr('disabled');
		} else {
			if(attachmentImport == ''){
				$attachmentSize.text('No file selected');
				$attachmentFilename.text('');
			}
			$attachmentView.attr('disabled','disabled');
			$attachmentProcess.attr('disabled','disabled');
		}
	}
}

const formChecker = [
	{
		type: 'read',
		runCheck: function(){readFormCheck()}
	},
	{
		type: 'write',
		runCheck: function(){writeFormCheck()}
	},
	{
		type: 'attachments',
		runCheck: function(){attachmentFormcheck()}
	}
]
