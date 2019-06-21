//import pasted pubkey
$('.import-pubkey-str').bind('click',function(){
	if(importPubkeyStr()){
		importPubKey('paste');
	}
})

//check if pubkey paste textarea is filled
$('.pubkey-input').keyup(function(){
	keyUpChecker($(this),$('.import-pubkey-str'));
}).change(function(){
	keyUpChecker($(this),$('.import-pubkey-str'));
})

//opn pubkey paste
$('.pubkey-input-open').bind('click',function(){
	$('.popup-filter').addClass('active');
	$('.pubkey-input-window').addClass('active');
})
