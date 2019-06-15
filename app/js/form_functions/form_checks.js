//enables / disabled buttons based upon given list of inputs / textarea
function keyUpChecker($input,$target){
	if($input.val().length > 0){
		$target.removeAttr('disabled');
	} else {
		$target.attr('disabled','disabled');
	}
}

//checks for form fields for key generation
function newKeyFormCheck(){
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
function writeFormCheck() {
	let $encryptMessage = $('.encrypt-message');
	if ($encryptMessage.hasClass('sign-enabled')) {
		if ($('.text-write').val().length > 0 && $('.text-write-passphrase').val().length > 0 && session.privKey.length > 0 && session.pubKey.length > 0) {
			$encryptMessage.removeAttr('disabled');
		} else {
			$encryptMessage.attr('disabled', 'disabled');
		}
	} else {
		if ($('.text-write').val().length > 0 && session.pubKey.length > 0) {
			$encryptMessage.removeAttr('disabled');
		} else {
			$encryptMessage.attr('disabled', 'disabled');
		}
	}
}

//Checks for form in the Read tab
function readFormCheck() {
	let $decryptMessage = $('.decrypt-message');
	if ($('.text-read').val().length > 0 && $('.text-read-passphrase').val().length > 0 && session.privKey.length > 0) {
		$decryptMessage.removeAttr('disabled');
	} else {
		$decryptMessage.attr('disabled', 'disabled');
	}
}
