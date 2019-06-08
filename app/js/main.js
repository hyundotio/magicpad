//Session Data
//Session Data
//Session Data
let session = {
	privKey: '',
	pubKey: '',
	generatedPubKey:'',
	generatedPrivKey:'',
	generatedRevKey:'',
	pubKeyFingerprint: '',
	running: false,
	lastDec: '',
	lastEnc: '',
	lastDecStatus: '',
	lastEncStatus: '',
	lastEncPaste: '',
	keyToUploadFile:'',
	searchedKey:''
}
//Init Function
//Init Function
//Init Function
function init() {
	let $onlineFlag = $('.online-flag');
	if (window.navigator.onLine) {
		$onlineFlag.addClass('active');
	} else {
		$onlineFlag.removeClass('active');
	}
	/*
	setTimeout(function () {
      let viewheight = $(window).height();
      let viewwidth = $(window).width();
      let viewport = document.querySelector("meta[name=viewport]");
      viewport.setAttribute("content", "height=" + viewheight + "px, width=" + viewwidth + "px, initial-scale=1.0, user-scalable=0, maximum-scale=1");
  }, 300);*/
}
init();
// UI data handling functions
// UI data handling functions
// UI data handling functions
//Alert notification
function lipAlert(str) {
	$('.message-flag').addClass('active').find('span').text(str);
}
//Handles online notification lip
window.addEventListener('online', function() {
	$('.online-flag').addClass('active');
});
window.addEventListener('offline', function() {
	$('.online-flag').removeClass('active');
});
//View Public Key
function viewPubKey() {
	let $processedOutputWindow = $('.processed-output-window');
	$('.popup-filter').addClass('active');
	$('.processed-aside').text('Viewing public key: '+getFilename($('.key-pub-import').val()));
	$processedOutputWindow.addClass('active mono').find('.window-title').find('span').text('Imported public key');
	$processedOutputWindow.find('.processed-output').text(session.pubKey).val(session.pubKey);
	$('.save-processed').addClass('hidden');
}
//View Encrypted Message
function viewEncMsg() {
	let $processedAside = $('.processed-aside');
	let $processedOutputWindow = $('.processed-output-window');
	$processedAside.text(session.lastEncStatus);
	$('.popup-filter').addClass('active');
	$processedOutputWindow.addClass('active mono').find('.window-title').find('span').text('Encrypted message');
	$processedOutputWindow.find('.processed-output').text(session.lastEnc).val(session.lastEnc);
	$('.save-processed').removeClass('hidden').attr('href', 'data:application/octet-stream;base64;filename=encrypted_message.txt,' + btoa(session.lastEnc)).attr('download', 'encrypted_message.txt');
}
//View decrypted message
function viewDecMsg() {
	let $processedAside = $('.processed-aside');
	let $processedOutputWindow = $('.processed-output-window');
	$processedAside.text(session.lastDecStatus);
	$('.popup-filter').addClass('active');
	$processedOutputWindow.addClass('active').removeClass('mono').find('.window-title').find('span').text('Decrypted message');
	$processedOutputWindow.find('.processed-output').text(session.lastDec.data).val(session.lastDec.data);
	$('.save-processed').removeClass('hidden').attr('href', 'data:application/octet-stream;base64;filename=decrypted_message.txt,' + btoa(session.lastDec.data)).attr('download', 'decrypted_message.txt');
}
//Exits popup
function popupExit() {
	$('.popup').removeClass('active');
	$('.main-nav').removeClass('mobile-active');
	$('.mobile-menu').removeClass('active');
	$('.popup-filter').removeClass('active');
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
// Data processing functions
// Data processing functions
// Data processing functions
//Converts buffer to hex
function buf2hex(buffer) {
	return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
}
//Checks if string is email
function isEmail(email) {
	let regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
	return regex.test(email);
}
//Copy to clipboard functions
function copyProcessed(content) {
	let $temp = $("<textarea>");
	$temp.css({
		'opacity': 0.1,
		'width': '1px',
		'height': '1px',
		'position': 'fixed',
		'top': 0,
		'left': 0
	})
	$("body").append($temp);
	$temp.val(content).select();
	document.execCommand("copy");
	$temp.remove();
}
//copy 2
window.Clipboard = (function(window, document, navigator) {
    var textArea,
        copy;

    function isOS() {
        return navigator.userAgent.match(/ipad|iphone/i);
    }

    function createTextArea(text) {
        textArea = document.createElement('textArea');
        textArea.value = text;
        document.body.appendChild(textArea);
    }

    function selectText() {
        var range,
            selection;

        if (isOS()) {
            range = document.createRange();
            range.selectNodeContents(textArea);
            selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            textArea.setSelectionRange(0, 999999);
        } else {
            textArea.select();
        }
    }

    function copyToClipboard() {
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }

    copy = function(text) {
        createTextArea(text);
        selectText();
        copyToClipboard();
    };

    return {
        copy: copy
    };
})(window, document, navigator);

//Activate Copied word
function showCopied($copied){
	$copied.addClass('active');
	setTimeout(function() {
		$copied.removeClass('active');
	}, 2000);
}
//Reset key generation form
function newKeyReset() {
	let $createKeyWindow = $('.create-key-window');
	$('.key-generate-start').text('Create new private and public key set +');
	$createKeyWindow.find('.window-title').find('span').text('New key set');
	$createKeyWindow.find('a').each(function() {
		$(this).attr('href', '#').removeAttr('download');
	})
	$('.create-key-progress').removeClass('active');
	$('.key-new-form').removeClass('next-page').find('input').val('');
	$('.key-new-done').removeClass('active');
	$('.key-generate').attr('disabled', 'disabled');
}
//get filename
function getFilename(str){
	return str.split(/(\\|\/)/g).pop()
}
//Input keystatus filenames
function writeKeyStatus(pasted) {
	let filename;
	let pubImport = $('.key-pub-import').val();
	let privImport = $('.key-priv-import').val();
	if(pasted){
		pubImport = 'pasted key'
	}
	if (pubImport != '') {
		filename = getFilename(pubImport);
		$('.public-key-filename').text(' - ' + filename);
	}
	if (privImport != '') {
		filename = getFilename($('.key-priv-import').val());
		$('.private-key-filename').text(' - ' + filename);
	}
}
//Import private key button function
function importPrivKey() {
	//$('.read').find('.fingerprint').text(openpgp.key.primaryKey.fingerprint);
	$('.key-priv-import-label').find('span').text('Reimport key');
	writeFormCheck();
	readFormCheck();
	writeKeyStatus();
}
//Import public key button function
function validatePubKeyUpload(){
	openpgp.key.readArmored(session.pubKey).then(data => {
		let $serverKeyPubImport = $('.server-key-pub-import');
		let $h3Text = $serverKeyPubImport.parent().find('h3').find('span');
		$h3Text.text('  -  '+getFilename($('.server-key-pub-import').val()));
		$serverKeyPubImport.prev('.label-container').find('span').text('Reselect key');
		$('.server-key-pub-import-upload').removeAttr('disabled');
	}).catch(function(e){
		lipAlert('The public key cannot be read. It may be corrupted.');
	})
}
function importPubKey(type) {
	//$('.fingerprint').text(getFingerprint(pubKey));
	openpgp.key.readArmored(session.pubKey).then(data => {
		const buffer = new Uint8Array(data.keys[0].primaryKey.fingerprint).buffer;
		let $pubkeyInputWindow = $('.pubkey-input-window');
		session.pubKeyFingerprint = buf2hex(buffer);
		$('.fingerprint').addClass('active');
		$('.fingerprint-str').text(session.pubKeyFingerprint.match(/.{1,4}/g).join(' ').toUpperCase());
		if(type == 'paste'){
			$('.pubkey-input-open').find('span').text('Repaste key');
			$('.key-pub-import-label').find('span').text('Select key');
		} else {
			$('.pubkey-input-open').find('span').text('Paste key');
			$('.key-pub-import-label').find('span').text('Reimport key');
		}
		//$('.view-pub-key').addClass('active');
		writeFormCheck();
		readFormCheck();
		if($pubkeyInputWindow.hasClass('active')){
			writeKeyStatus(true);
			$('.popup-filter').removeClass('active');
			$pubkeyInputWindow.removeClass('active');
		} else {
			writeKeyStatus();
		}
	}).catch(function(e){
		lipAlert('The public key cannot be read. It may be corrupted.');
	})
}
//Generate Download Functions  saveFile("Example.txt", "data:attachment/text", "Hello, world.");
//Function when key gneration is finished
function keyReady() {
	let formName = $('.form-name').val().toLowerCase().replace(/\s/g, '');
	$('.key-public-download').attr('href', 'data:application/octet-stream;base64;filename='+formName+'_public.asc,' + btoa(session.generatedPubKey)).attr('download', formName+'_public.asc').attr('target','_blank');
	$('.key-private-download').attr('href', 'data:application/octet-stream;base64;filename='+formName+'_private.asc,' + btoa(session.generatedPrivKey)).attr('download', formName+'_private.asc').attr('target','_blank');
	$('.key-rev-download').attr('href', 'data:application/octet-stream;base64;filename='+formName+'_revoke.asc,' + btoa(session.generatedRevKey)).attr('download', formName+'_revoke.asc').attr('target','_blank');
	$('.key-new-done').addClass('active');
	$('.key-new-form').addClass('next-page');
	$('.create-key-progress').removeClass('active').find('span').text('Keys generated');
	$('.key-generate-start').text('Download generated keys');
	$('.create-key-window').find('.window-title').find('span').text('Generated keys');
	$('body').removeClass('cursor-loading');
	session.running = false;
}
//OpenPGP Functions
//OpenPGP Functions
//OpenPGP Functions
//Lookup Public Key
function lookupKey (query,server) {
  //console.log(query)
	if(!session.running){
		session.running = true;
		let $searchResults = $('.search-results');
		let $searchStatus = $('.search-status');
		$searchStatus.text('Searching...');
		if (location.protocol == "https:") {
		  server = location.protocol + server
		} else {
			server = 'http:'+server
		}
		let hkp = new openpgp.HKP(server);
		new Promise((resolve, reject) => {
			hkp.lookup({ query: query }).then(function(keys) {
				if(keys != undefined){
					if (keys.length > 0){
						//copy keys
						session.searchedKey = keys.trim();
						openpgp.key.readArmored(session.searchedKey).then(data => {
							const buffer = new Uint8Array(data.keys[0].primaryKey.fingerprint).buffer;
							$('.searched-key-download').attr('href', 'data:application/octet-stream;base64;filename=searchedKey_public.asc,' + btoa(session.searchedKey)).attr('download', 'searchedKey_public.asc').attr('target','_blank');
							$('.downloaded-fingerprint').text(buf2hex(buffer).match(/.{1,4}/g).join(' ').toUpperCase());
							$searchResults.addClass('search-complete');
							$searchStatus.text('Key found');
							session.running = false;
						}).catch(function(e){
							$('.search-status').text('Error');
							lipAlert("Key retrieved but was unabled to read fingerprint. Please use another key.");
							session.running = false;
						})
					}
				} else {
					//clear keys
					session.running = false;
					$('.search-complete').removeClass('search-complete');
					$searchStatus.text('Nothing found');
				}
				session.running = false;
			}).catch(function(e){
				session.running = false;
				$('.search-status').text('Search error');
				lipAlert('Error in retrieving key. Please try again.');
			})
		}).catch(function(e){
			session.running = false;
			$('.search-status').text('Search error');
			$('.create-key-progress').find('span').text('Failed generating keys').removeClass('active');
			lipAlert('Error in searching. Please try again.');
		})
	}
}
//Generate keys
function generateKeys() {
	if (!session.running) {
		session.running = true;
		$('body').addClass('cursor-loading');
		let options = {
			userIds: [{
				name: ($('.form-name').val()),
				email: ($('.form-email').val())
			}],
			numBits: 4096,
			passphrase: ($('.form-passphrase').val())
		}
		openpgp.generateKey(options).then(key => {
			session.generatedPrivKey = key.privateKeyArmored.trim();
			session.generatedPubKey = key.publicKeyArmored.trim();
			session.generatedRevKey = key.revocationCertificate.trim();
			keyReady();
		}).catch(function(e) {
			session.running = false;
			$('body').removeClass('cursor-loading');
			lipAlert(e);
			newKeyReset();
		});
	}
}
//lookup('magicpadhyun@gmail.com','https://pgp.mit.edu');
//Decrypt messages
function decryptMessage() {
	if (!session.running) {
		session.running = true;
		let privKeyObj;
		let pbKeyObj;
		let parsedMsg;
		let $body = $('body');
		session.lastEncPaste = $('.text-read').val();
		openpgp.key.readArmored(session.privKey).then(pvKeys => {
			privKeyObj = pvKeys.keys[0];
			privKeyObj.decrypt($('.text-read-passphrase').val()).then(output => {
				openpgp.key.readArmored(session.pubKey).then(pbKeys => {
					pbKeyObj = pbKeys.keys;
					openpgp.message.readArmored(session.lastEncPaste).then(msg => {
						let options = {
							message: msg,
							publicKeys: pbKeyObj,
							privateKeys: [privKeyObj]
						}
						openpgp.decrypt(options).then(plaintext => {
							let $processedAside = $('.processed-aside');
							session.lastDec = plaintext;
							session.running = false;
							if ((session.lastDec.data).search('-----BEGIN PGP SIGNATURE-----') != -1) {
								verifySignature();
							} else {
								$body.removeClass('loading');
								session.lastDecStatus = 'Message decrypted.';
								$processedAside.text(session.lastDecStatus);
								$('.view-message-decrypted').removeAttr('disabled');
								session.running = false;
								viewDecMsg();
							}
						}).catch(function(e) {
							session.running = false;
							lipAlert('Cannot decrypt message. Try testing a different message and/or keys.');
							$body.removeClass('loading');
						});
					}).catch(function(e) {
						session.running = false;
						lipAlert('The encrypted message cannot be parsed and/or is formatted incorrectly.');
						$body.removeClass('loading');
					});
				}).catch(function(e) {
					session.running = false;
					lipAlert('The public key cannot be read. It may be corrupted.');
					$body.removeClass('loading');
				});
			}).catch(function(e) {
				session.running = false;
				lipAlert('The private key passphrase is incorrect.');
				$body.removeClass('loading');
			});
		}).catch(function(e) {
			session.running = false;
			lipAlert('The private key cannot be read. It may be corrupted.');
			$body.removeClass('loading');
		});
	}
}
//Encrypt Message
function encryptMessage(msg, signedToggle) {
	if (!session.running) {
		session.running = true;

		let $body = $('body');
		openpgp.key.readArmored(session.pubKey).then(data => {
			let options, cleartext, validity;
			options = {
				message: openpgp.message.fromText(msg), // input as Message object
				publicKeys: data.keys
			}
			openpgp.encrypt(options).then(ciphertext => {
				let $processedAside = $('.processed-aside');
				encrypted = ciphertext.data.trim() // '-----BEGIN PGP MESSAGE ... END PGP MESSAGE-----'
				session.lastEnc = encrypted;
				$('.view-message-encrypted').removeAttr('disabled');
				if (signedToggle) {
					session.lastEncStatus = 'Message encrypted and signed.';
				} else {
					session.lastEncStatus = 'Message encrypted.';
				}
				$processedAside.text(session.lastEncStatus);
				$body.removeClass('loading');
				session.running = false;
				viewEncMsg();
			}).catch(function(e) {
				session.running = false;
				$body.removeClass('loading');
				lipAlert('Cannot encrypt message. Try testing a different message and/or keys.');
			});
		}).catch(function(e) {
			session.running = false;
			$body.removeClass('loading');
			lipAlert('The public key cannot be read. It may be corrupted.');
		});
	}
}
//Sign message
function signMessage() {
	if (!session.running) {
		session.running = true;
		let $body = $('body');
		openpgp.key.readArmored(session.privKey).then(data => {
			let options, cleartext, validity;
			let privKeyObj = data.keys[0];
			privKeyObj.decrypt($('.text-write-passphrase').val()).then(output => {
				options = {
					message: openpgp.cleartext.fromText($('.text-write').val()),
					privateKeys: [privKeyObj]
				};
				openpgp.sign(options).then(function(signed) {
					cleartext = signed.data.trim();
					session.running = false;
					encryptMessage(cleartext, true);
				}).catch(function(e) {
					session.running = false;
					$body.removeClass('loading');
					lipAlert('Cannot sign message. Please try again with a different message and/or keys.');
				});
			}).catch(function(e) {
				session.running = false;
				$body.removeClass('loading');
				lipAlert('The private key passphrase is incorrect.');
			});
		}).catch(function(e) {
			session.running = false;
			$body.removeClass('loading');
			lipAlert('The private key cannot be read. It may be corrupted.');
		});
	}
}
//Verify signature of message
function verifySignature() {
	if (!session.running) {
		session.running = true;

		let $body = $('body');
		let privKeyObj;
		let pbKeyObj;
		let parsedMsg;
		openpgp.key.readArmored(session.pubKey).then(pbKeys => {
			pbKeyObj = pbKeys.keys;
			openpgp.cleartext.readArmored(session.lastDec.data).then(msg => {
				let options = {
					message: msg,
					publicKeys: pbKeyObj
				}
				openpgp.verify(options).then(function(verified) {
					let $processedAside = $('.processed-aside');
					validity = verified.signatures[0].valid;
					if (validity) {
						session.lastDecStatus = 'Message decrypted. Signature valid.';
					} else {
						session.lastDecStatus = 'Message decrypted. Signature not valid.';
					}
					$processedAside.text(session.lastDecStatus);
					$('.view-message-decrypted').removeAttr('disabled');
					$body.removeClass('loading');
					session.running = false;
					viewDecMsg();
				}).catch(function(e) {
					session.running = false;
					$body.removeClass('loading');
					lipAlert('The signature cannot be verified. It may be corrupted.');
				});
			}).catch(function(e) {
				session.running = false;
				$body.removeClass('loading');
				lipAlert('The signature cannot be read. It maybe corrupted.');
			});
		}).catch(function(e) {
			session.running = false;
			$body.removeClass('loading');
			lipAlert('The public key cannot be read. It may be corrupted.');
			//console.log('readpubkey'+e);
		});
	}
}
//paste pubkey from popup
function importPubkeyStr(){
	let $pubkeyInput = $('.pubkey-input');
	let pubKeyPaste = $pubkeyInput.val().trim();
	if (testPubKey(pubKeyPaste)) {
		session.pubKey = pubKeyPaste;
		return true
	} else {
		lipAlert("Oops! This doesn't seem like a valid public key. Please choose a different file.");
		return false
	}
}
//key file importe
function keyImport($type){
		let file = $type[0].files[0];
		let reader = new FileReader();
		reader.onload = function(e) {
			if ($type.hasClass('key-priv-import')) {
				if (testPrivKey(reader.result)) {
					session.privKey = reader.result;
					importPrivKey();
				} else {
					$type.val('');
					lipAlert("Oops! This doesn't seem like a valid private key. Please choose a different file.");
				}
			} else if ($type.hasClass('server-key-pub-import')){
				if (testPubKey(reader.result)) {
					session.keyToUploadFile = reader.result;
					validatePubKeyUpload();
				} else {
					$type.val('');
					lipAlert("Oops! This doesn't seem like a valid public key. Please choose a different file.");
				}
			} else {
				if (testPubKey(reader.result)) {
					session.pubKey = reader.result;
					importPubKey('file');
				} else {
					$type.val('');
					lipAlert("Oops! This doesn't seem like a valid public key. Please choose a different file.");
				}
			}
		}
		if (file != undefined) {
			reader.readAsText(file);
		}
}
function keyUpChecker($input,$target){
	if($input.val().length > 0){
		$target.removeAttr('disabled');
	} else {
		$target.attr('disabled','disabled');
	}
}
function testPubKey(pubKey){
	if(pubKey.search('-----END PGP PUBLIC KEY BLOCK-----') != -1 && pubKey.search('-----BEGIN PGP PUBLIC KEY BLOCK-----') != -1){
		return true
	} else {
		return false
	}
}
function testPrivKey(privKey){
	if(privKey.search('-----END PGP PRIVATE KEY BLOCK-----') != -1 && privKey.search('-----BEGIN PGP PRIVATE KEY BLOCK-----') != -1){
		return true
	} else {
		return false
	}
}
function uploadKey(type){
	if(!session.running){
		session.running = true;
		$('.upload-progress').addClass('active').find('span').text('Uploading key...');
		if(testPubKey(session.keyToUploadFile)){
			let hkp = new openpgp.HKP($('.upload-key-server-list').val());
			hkp.upload(session.keyToUploadFile).then(function() {
				//downloadlink
				openpgp.key.readArmored(session.keyToUploadFile).then(data => {
					const buffer = new Uint8Array(data.keys[0].primaryKey.fingerprint).buffer;
					let downloadLink = $('.upload-key-server-list').val() + '/pks/lookup?op=get&options=mr&search=0x' + buf2hex(buffer);
					if(type !== 'import'){
						//paste
						$('.paste-upload-link').addClass('active').attr('href',downloadLink);
					} else {
						$('.import-upload-link').addClass('active').attr('href',downloadLink);
						//import
					}
					$('.upload-progress').removeClass('active').find('span').text('Upload complete');
					session.running = false;
				}).catch(function(e){
					$('.upload-progress').removeClass('active').find('span').text('Upload failed');
					lipAlert("The fingerprint could not be generated from the uploaded key. Please try again.");
					session.running = false;
				})
			}).catch(function(e){
				$('.upload-progress').removeClass('active').find('span').text('Upload failed');
				lipAlert('The public key could not be uploaded. Please try again.');
				session.running = false;
			});
		} else {
			$('.upload-progress').removeClass('active').find('span').text('Upload failed');
			lipAlert("Oops! This doesn't seem like a valid public key. Please choose a different file.");
			session.running = false;
		}
	}
}
//UI Bindings
//UI Bindings
//UI Bindings
//mobile app Menu
$('.mobile-menu').bind('click',function(){
	let $mainNav = $('.main-nav');
	let $popupFilter = $('.popup-filter');
	let $this = $(this);
	popupExit();
	if($mainNav.hasClass('mobile-active')){
		$this.removeClass('active');
		$mainNav.removeClass('mobile-active');
		$popupFilter.removeClass('active');
	} else {
		$this.addClass('active');
		$mainNav.addClass('mobile-active');
		$popupFilter.addClass('active');
	}
})
//open key servers
$('.open-keybrowser').bind('click',function(){
	$('.popup-filter').addClass('active');
	let $keyServerBrowserWindow = $('.key-server-browser-window');
	let $popupTabContent = $keyServerBrowserWindow.find('.popup-tab-content');
	let $popupTab = $keyServerBrowserWindow.find('.popup-tabs');
	$popupTab.find('.active').removeClass('active');
	$popupTab.find('.popup-tab').eq(0).addClass('active');
	let tabOpen = $popupTab.find('.active').attr('data-tab');
	$popupTabContent.find('.popup-tab-page.active').removeClass('active');
	$popupTabContent.find('.'+tabOpen).addClass('active');
	$keyServerBrowserWindow.addClass('active');
})
//searched key copy
$('.searched-key-copy').bind('click',function(){
	Clipboard.copy(session.searchedKey);
	//copyProcessed();
	showCopied($('.search-results').find('.copied'));
})
//upload key file
$('.upload-public-key-paste').bind('click',function(){
	if(!$(this).is(':disabled')){
		let keyToUploadFile = $('.pubkey-upload-input').val();
		session.keyToUploadFile = keyToUploadFile;
		uploadKey('paste');
	}
})
$('.server-key-pub-import-upload').bind('click',function(){
	if(!$(this).is(':disabled')){
		keyImport($('.server-key-pub-import'));
		uploadKey('import');
	}
})
//key import for uploading
$('.server-key-pub-import').change(function(){
	keyImport($(this));
})
//textarea for pubkey upload checker
$('.pubkey-upload-input').keyup(function(){
	keyUpChecker($(this),$('.upload-public-key-paste'));
}).change(function(){
	keyUpChecker($(this),$('.upload-public-key-paste'));
})
//searchbox enabler
$('.searchbox-pubkey').keyup(function(){
	let $this = $(this);
	keyUpChecker($this,$('.search-pubkey'));
}).change(function(){
	let $this = $(this);
	keyUpChecker($this,$('.search-pubkey'));
})
$('.search-pubkey').bind('click',function(){
	let $this = $(this);
	if(!$this.is(':disabled')){
		lookupKey($('.searchbox-pubkey').val(),$('.search-key-server-list').val());
	}
})
//autofocus out of select + select processo
$('select').change(function(){
	$(this).blur();
})
//paste pub key button
$('.import-pubkey-str').bind('click',function(){
	if(importPubkeyStr()){
		importPubKey('paste');
	}
})

//open pub key paste windows
$('.pubkey-input').keyup(function(){
	keyUpChecker($(this),$('.import-pubkey-str'));
}).change(function(){
	keyUpChecker($(this),$('.import-pubkey-str'));
})
$('.pubkey-input-open').bind('click',function(){
	$('.popup-filter').addClass('active');
	$('.pubkey-input-window').addClass('active');
})

//copy generated public keys
$('.copy-generated-public-key').bind('click',function(e){
	e.preventDefault();
	Clipboard.copy(session.generatedPubKey);
	//copyProcessed(session.generatedPubKey);
	showCopied($(this).find('.copied'));
})
//View pub key bind
/*
$('.view-pub-key').bind('click',function(){
	viewPubKey();
})
*/
//label container bind
$('.label-container').bind('click', function(e) {
	e.preventDefault();
	e.stopPropagation();
	$(this).next('input').click();
})
//Purge / reset functions
$('.purge').bind('click', function() {
	window.location.reload(true);
})
//Exits notification lip
$('.lip-exit').bind('click', function() {
	$('.lip').removeClass('active');
})
//Exits popup lip
$('.popup-exit').bind('click', function(e) {
	if (!session.running) {
		popupExit();
	}
})
//Expands popup
$('.popup-expand').bind('click', function() {
	let $this = $(this);
	let $thisParPar = $this.parent().parent();
	if ($this.hasClass('active')){
		$this.removeClass('active').find('img').attr('src', './ui/expand.svg');
		$thisParPar.removeClass('expanded');
	} else {
		$this.addClass('active').find('img').attr('src', './ui/minimize.svg');
		$thisParPar.addClass('expanded');
	}
})
//Copy to clipboard button
$('.copy-processed').bind('click', function() {
	//copyProcessed($('.processed-output').text());
	Clipboard.copy($('.processed-output').text());
	showCopied($('.processed-output-window').find('.copied'));
})
//Re-open Decrypted Message popup
$('.view-message-decrypted').bind('click', function() {
	if (!$(this).is(':disabled')) {
		viewDecMsg();
	}
})
//Re-open Encrypted Message popup
$('.view-message-encrypted').bind('click', function() {
	if (!$(this).is(':disabled')) {
		viewEncMsg();
	}
})
//Encrypt Message Button
$('.encrypt-message').bind('click', function() {
	let $this = $(this);
	if (!$this.is(':disabled')) {
		$('body').addClass('loading');
		if ($this.hasClass('sign-enabled')) {
			signMessage();
		} else {
			encryptMessage($('.text-write').val(), false);
		}
	}
})
//Decrypt Message button
$('.decrypt-message').bind('click', function() {
	if (!$(this).is(':disabled')) {
		$('body').addClass('loading');
		decryptMessage();
	}
})
//Checks for input in Read form
$('.read').keyup(function(e) {
	readFormCheck()
}).change(function(){
	readFormCheck()
})
//Checks for input in Write form
$('.write').keyup(function() {
	writeFormCheck()
}).change(function(){
	writeFormCheck()
})
//Checks for file imported by user in Private and Key import buttons
$('.key-import').change(function() {
	keyImport($(this))
})
$('body').keyup(function(e) {
	if (e.keyCode === 27) $('.popup-filter').click();
})
//opens new key generation popup
$('.key-generate-start').bind('click', function(e) {
	$('.create-key-window').addClass('active')
	$('.popup-filter').addClass('active');
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
		$('.create-key-progress').addClass('active').find('span').text('Generating keys...');
		generateKeys();
	}
})
//Sign toggler
$('.encrypt-sign-checkbox').change(function() {
	let $encryptMessage = $('.encrypt-message');
	let $signCredentials = $('.sign-credentials');
	if (this.checked) {
		$encryptMessage.addClass('sign-enabled');
		$signCredentials.removeClass('disabled').find('input').removeAttr('disabled');
	} else {
		$encryptMessage.removeClass('sign-enabled');
		$signCredentials.addClass('disabled').find('input').attr('disabled', 'disabled');
	}
	writeFormCheck()
})
//Password show toggler
$('.pw-toggle').change(function() {
	let $passphraseBox = $('.passphrase-box');
	if (this.checked) {
		$passphraseBox.attr('type', 'text');
	} else {
		$passphraseBox.attr('type', 'password');
	}
});
//popup tab-changer
$('.popup-tabs').find('.popup-tab').each(function(){
	$(this).bind('click',function(){
		let $this = $(this);
		let $thisParPar = $this.parent().parent();
		let $popupTabContent = $thisParPar.parent().find('.popup-tab-content');
		$thisParPar.find('.active').removeClass('active');
		$this.addClass('active');
		$popupTabContent.find('.active').removeClass('active');
		$popupTabContent.find('.'+$this.attr('data-tab')).addClass('active');
	})
})
//Tab changer
$('.tab').bind('click', function(e) {
	e.preventDefault();
	let $main = $('main');
	let $tabWindow = $main.find('.tab-window');
	let nextTab = $(this).attr('data-tab');
	$('.main-nav').find('.active').removeClass('active');
	$(this).addClass('active');
	$tabWindow.removeClass('active').each(function() {
		if ($(this).hasClass(nextTab)) {
			popupExit();
			$(this).addClass('active');
		}
	})
})
//Tutorial selector
$('.tutorial-selectors').find('a').each(function(){
    $(this).bind('click',function(e){
        e.preventDefault();
        let $this = $(this);
        let $tutorialPages = $('.tutorial-pages');
        let $tutorialPage = $tutorialPages.find('.'+$this.attr('data-tutorial'));
        let $tutorialPageVideo = $tutorialPage.find('video');
        if($tutorialPageVideo.length > 0){
            $tutorialPageVideo[0].currentTime = 0;
        }
        $('.tutorial-selectors').find('.active').removeClass('active')
        $this.addClass('active');
        $tutorialPages.find('.active').removeClass('active');
        $tutorialPage.addClass('active')
    })
})

//Reset key generation form
$('.key-generate-reset').bind('click', function(e) {
	e.preventDefault();
	newKeyReset();
})
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
//new key generation form input checks
$('.key-new-form').find('input').each(function() {
	$(this).keyup(function() {
		newKeyFormCheck();
	}).change(function(){
		newKeyFormCheck();
	})
})
