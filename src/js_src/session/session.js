let iOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);

const sessionModel = {
	privKey: '',
	pubKey: '',
	privKeyName:'',
	pubKeyName:'',
	generatedPubKey:'',
	generatedPrivKey:'',
	generatedRevKey:'',
	pubKeyFingerprint: '',
	privKeyFingerprint:'',
	running: false,
	lastDec: '',
	lastEnc: '',
	lastDecSave: '',
	lastEncSave: '',
	lastDecStatus: '',
	lastEncStatus: '',
	lastEncPaste: '',
	lastEncFile:'',
	lastDecFile:'',
	lastDecFilename:'',
	lastEncFileType:'',
	lastEncFilename:'',
	lastConverted:'',
	keyToUploadFile:'',
	searchedKey:'',
	sessionStore:false
}

let session = JSON.parse(JSON.stringify(sessionModel));

const adjustSession = function(){
	if(session.sessionStore){
		session.running = false;
		window.localStorage.setItem('session',JSON.stringify(session));
	}
}

const eraseSession = function(){
	window.localStorage.setItem('session',null);
}

const recallSession = function(){
	if(window.localStorage.getItem('session') != null){
		if(window.localStorage.getItem('session') != 'null'){
			session = JSON.parse(window.localStorage.getItem('session'));
			Object.keys(sessionModel).forEach(function(key){
				if (!(key in session)){
					session[key] = '';
				}
			})
			//session = JSON.parse(window.localStorage.getItem('session'));
			const $sessionToggle = $('.session-toggle');
			if(session.sessionStore){
				$sessionToggle.prop('checked',true).change();
				if(session.pubKeyName != ''){
					let $tempInput = $('<input>');
					$tempInput.val(session.pubKeyName).addClass('key-pub-import');
					importPubKey('file',session.pubKey,$tempInput);
					$tempInput.remove();
				}
				if(session.privKeyName != ''){
					let $tempInput = $('<input>');
					$tempInput.val(session.privKeyName).addClass('key-priv-import');
					importPrivKey(session.privKey,$tempInput);
					$tempInput.remove();
				}
			}
		}
	}
}
