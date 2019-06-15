//Form checker for public key upload paste.
$('.pubkey-upload-input').keyup(function(){
	keyUpChecker($(this),$('.upload-public-key-paste'));
}).change(function(){
	keyUpChecker($(this),$('.upload-public-key-paste'));
})

//Upload pasted key binding
$('.upload-public-key-paste').bind('click',function(){
	if(!$(this).is(':disabled')){
		uploadKey('paste');
	}
})

//Upload selected key file binding
$('.server-key-pub-import-upload').bind('click',function(){
	if(!$(this).is(':disabled')){
		keyImport($('.server-key-pub-import'));
		uploadKey('import');
	}
})

//Process selected key file
$('.server-key-pub-import').change(function(){
	keyImport($(this));
})
