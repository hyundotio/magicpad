//opens new key generation popup
$('.key-generate-start').bind('click', function(e) {
	$('.create-key-window').addClass('active')
	$('.popup-filter').addClass('active');
})

//new key generation form input checks
$('.key-new-form').find('input').each(function() {
	$(this).keyup(function() {
		newKeyFormCheck();
	}).change(function(){
		newKeyFormCheck();
	})
})

//Reset key generation form
$('.key-generate-reset').bind('click', function(e) {
	newKeyReset();
})

//start key generation + key form check
$('.key-generate').bind('click', function(e) {
	let $this = $(this);
	let formFlag = false;
	$('.key-new-form').find('input').each(function() {
		let $this = $(this);
		if (!$this.hasClass('pw-toggle') && $this.val() == '') {
			formFlag = true;
		}
	})
	if (!formFlag) {
		$this.attr('disabled','disabled');
		generateKeys();
	}
})

//copy generated public keys
$('.copy-generated-public-key').bind('click',function(e){
	Clipboard.copy(session.generatedPubKey);
	showCopied($(this).find('.copied'));
})
