//Session Data
//Session Data
//Session Data
let session = {
	privKey: '',
	pubKey: '',
	generatedPubKey:'',
	generatedPrivKey:'',
	pubKeyFingerprint: '',
	running: false,
	lastDec: '',
	lastEnc: '',
	lastEncPaste: ''
}
//Init Function
//Init Function
//Init Function
function init() {
	purge();
	let $onlineFlag = $('.online-flag');
	if (window.navigator.onLine) {
		$onlineFlag.addClass('active');
	} else {
		$onlineFlag.removeClass('active');
	}
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
	let $processedOutputWindow = $('.processed-output-window');
	$('.popup-filter').addClass('active');
	$processedOutputWindow.addClass('active mono').find('.window-title').find('span').text('Encrypted message');
	$processedOutputWindow.find('.processed-output').text(session.lastEnc).val(session.lastEnc);
	$('.save-processed').removeClass('hidden').attr('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(session.lastEnc)).attr('download', 'encrypted_message.txt');
}
//View decrypted message
function viewDecMsg() {
	let $processedOutputWindow = $('.processed-output-window');
	$('.popup-filter').addClass('active');
	$processedOutputWindow.addClass('active').removeClass('mono').find('.window-title').find('span').text('Decrypted message');
	$processedOutputWindow.find('.processed-output').text(session.lastDec.data).val(session.lastDec.data);
	$('.save-processed').removeClass('hidden').attr('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(session.lastDec.data)).attr('download', 'decrypted_message.txt');
}
//Exits popup
function popupExit() {
	$('.popup').removeClass('active');
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
//Resets all data in session
function purge() {
	//$('.view-pub-key').removeClass('active');
	$('.key-new-form').removeClass('next-page');
	$('.key-new-done').removeClass('active');
	$('.create-key-window').find('.window-title').find('span').text('New key set');
	$('.key-generate-start').text('Create new private and public key set +');
	$('.sign-credentials').removeClass('disabled').find('input').removeAttr('disabled');
	$('.create-key-progress').removeClass('active');
	$('.key-status').text('');
	$('input').val('').reset;
	$('textarea').text('').val('').reset;
	$('.revert-encryption').removeAttr('active encrypted decrypted');
	$('.save-processed').attr('href', '#').removeAttr('download');
	$('.processed-output').html('');
	$('.encrypt-message').attr('disabled', 'disabled');
	$('.decrypt-message').attr('disabled', 'disabled');
	$('.view-processed').attr('disabled', 'disabled');
	$('.view-message-encrypted').attr('disabled', 'disabled');
	$('.key-private-download').attr('href', '#').removeAttr('download');
	$('.key-public-download').attr('href', '#').removeAttr('download');
	$('.keys').find('.key-private-download').remove();
	$('.keys').find('.key-public-download').remove();
	$('.key-pub-import-label').find('span').text('Import key');
	$('.key-priv-import-label').find('span').text('Import key');
	$('.fingerprint').text('No public key imported');
	$('.encrypt-sign-checkbox').prop('checked', true);
	session = {
		privKey: '',
		pubKey: '',
		generatedPubKey:'',
		generatedPrivKey:'',
		pubKeyFingerprint: '',
		running: false,
		lastDec: '',
		lastEnc: '',
		lastEncPaste: ''
	}
}
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
	$('.key-priv-import-label').find('span').text('Reimport');
	writeFormCheck();
	readFormCheck();
	writeKeyStatus();
}
//Import public key button function
function importPubKey() {
	//$('.fingerprint').text(getFingerprint(pubKey));
	openpgp.key.readArmored(session.pubKey).then(data => {
		const buffer = new Uint8Array(data.keys[0].primaryKey.fingerprint).buffer;
		let $pubkeyInputWindow = $('.pubkey-input-window');
		session.pubKeyFingerprint = buf2hex(buffer);
		$('.fingerprint').text(session.pubKeyFingerprint.match(/.{1,4}/g).join(' ').toUpperCase());
		$('.key-pub-import-label').find('span').text('Reimport');
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
//Function when key gneration is finished
function keyReady() {
	let formName = $('.form-name').val().toLowerCase().replace(/\s/g, '');
	$('.key-public-download').attr('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(session.generatedPubKey)).attr('download', formName+'_public.asc');
	$('.key-private-download').attr('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(session.generatedPrivKey)).attr('download', formName+'_private.asc');
	$('.key-new-done').addClass('active');
	$('.key-new-form').addClass('next-page');
	$('.create-key-progress').removeClass('active');
	$('.key-generate-start').text('Download generated keys');
	$('.create-key-window').find('.window-title').find('span').text('Generated keys');
	session.running = false;
}
//OpenPGP Functions
//OpenPGP Functions
//OpenPGP Functions
//Lookup Public Key
function lookupKey (query,server) {
  //console.log(query)
	let hkp = new openpgp.HKP(server);
  return new Promise((resolve, reject) => {
    hkp.lookup({ query: query }).then(function(keys) {
      console.log(keys);
    })
  })
}
//Generate keys
function generateKeys() {
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
		keyReady();
	}).catch(function(e) {
		lipAlert('Failed generating keys. Please try again.');
		newKeyReset();
	});
}
function lookup (query,server) {
  let hkp = new openpgp.HKP(server);
  return new Promise((resolve, reject) => {
    hkp.lookup({ query: query }).then(function(keys) {
      console.log(keys);
    }).catch(function(e){ alert('error'+e); })
  })
}
//lookup('magicpadhyun@gmail.com','https://pgp.mit.edu');
//Decrypt messages
function decryptMessage() {
	if (!session.running) {
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
							session.lastDec = plaintext;
							if ((session.lastDec.data).search('-----BEGIN PGP SIGNATURE-----') != -1) {
								verifySignature();
							} else {
								$body.removeClass('loading');
								$('.processed-aside').text('Message decrypted.');
								session.running = false;
								viewDecMsg();
							}
						}).catch(function(e) {
							lipAlert('Cannot decrypt message. Try testing a different message and/or keys.');
							$body.removeClass('loading');
						});
					}).catch(function(e) {
						lipAlert('The encrypted message cannot be parsed and/or is formatted incorrectly.');
						$body.removeClass('loading');
					});
				}).catch(function(e) {
					lipAlert('The public key cannot be read. It may be corrupted.');
					$body.removeClass('loading');
				});
			}).catch(function(e) {
				lipAlert('The private key passphrase is incorrect.');
				$body.removeClass('loading');
			});
		}).catch(function(e) {
			lipAlert('The private key cannot be read. It may be corrupted.');
			$body.removeClass('loading');
		});
	}
}
//Encrypt Message
function encryptMessage(msg, signedToggle) {
	if (!session.running) {
		let $processedAside = $('.processed-aside');
		let $body = $('body');
		session.running = true;
		openpgp.key.readArmored(session.pubKey).then(data => {
			let options, cleartext, validity;
			options = {
				message: openpgp.message.fromText(msg), // input as Message object
				publicKeys: data.keys
			}
			openpgp.encrypt(options).then(ciphertext => {
				encrypted = ciphertext.data.trim() // '-----BEGIN PGP MESSAGE ... END PGP MESSAGE-----'
				session.lastEnc = encrypted;
				$('.view-message-encrypted').removeAttr('disabled');
				if (signedToggle) {
					$processedAside.text('Message encrypted and signed.');
				} else {
					$processedAside.text('Message encrypted.');
				}
				$body.removeClass('loading');
				session.running = false;
				viewEncMsg();
			}).catch(function(e) {
				$body.removeClass('loading');
				lipAlert('Cannot encrypt message. Try testing a different message and/or keys.');
			});
		}).catch(function(e) {
			$body.removeClass('loading');
			lipAlert('The public key cannot be read. It may be corrupted.');
		});
	}
}
//Sign message
function signMessage() {
	if (!session.running) {
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
					encryptMessage(cleartext, true);
				}).catch(function(e) {
					$body.removeClass('loading');
					lipAlert('Cannot sign message. Please try again with a different message and/or keys.');
				});
			}).catch(function(e) {
				$body.removeClass('loading');
				lipAlert('The private key passphrase is incorrect.');
			});
		}).catch(function(e) {
			$body.removeClass('loading');
			lipAlert('The private key cannot be read. It may be corrupted.');
		});
	}
}
//Verify signature of message
function verifySignature() {
	if (!session.running) {
		let $processedAside = $('.processed-aside');
		let $body = $('body');
		session.running = true;
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
					validity = verified.signatures[0].valid;
					if (validity) {
						$processedAside.text('Message decrypted. Signature valid.');
					} else {
						$processedAside.text('Message decrypted. Signature not valid.');
					}
					$('.view-message-decrypted').removeAttr('disabled');
					$body.removeClass('loading');
					session.running = false;
					viewDecMsg();
				}).catch(function(e) {
					$body.removeClass('loading');
					lipAlert('The signature cannot be verified. It may be corrupted.');
				});
			}).catch(function(e) {
				$body.removeClass('loading');
				lipAlert('The signature cannot be read. It maybe corrupted.');
			});
		}).catch(function(e) {
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
	if (pubKeyPaste.search('-----BEGIN PGP PUBLIC KEY BLOCK-----') != -1 && pubKeyPaste.search('-----END PGP PUBLIC KEY BLOCK-----') != -1) {
		session.pubKey = pubKeyPaste;
		return true
	} else {
		lipAlert("Oops! This doesn't seem like a valid public key. Please choose a different file.");
	}
}
//key file importe
function keyImport($type){
		let file = $type[0].files[0];
		let reader = new FileReader();
		reader.onload = function(e) {
			if ($type.hasClass('key-priv-import')) {
				if (reader.result.search('-----BEGIN PGP PRIVATE KEY BLOCK-----') != -1 && reader.result.search('-----END PGP PRIVATE KEY BLOCK-----') != -1) {
					session.privKey = reader.result;
					importPrivKey();
				} else {
					lipAlert("Oops! This doesn't seem like a valid private key. Please choose a different file.");
				}
			} else {
				if (reader.result.search('-----END PGP PUBLIC KEY BLOCK-----') != -1 && reader.result.search('-----BEGIN PGP PUBLIC KEY BLOCK-----') != -1) {
					session.pubKey = reader.result;
					importPubKey();
				} else {
					lipAlert("Oops! This doesn't seem like a valid public key. Please choose a different file.");
				}
			}
		}
		if (file != undefined) {
			reader.readAsText(file);
		}
}
//UI Bindings
//UI Bindings
//UI Bindings
//autofocus out of select;
$('select').change(function(){
	$(this).blur();
})
//paste pub key button
$('.import-pubkey-str').bind('click',function(){
	if(importPubkeyStr()){
		importPubKey();
	}
})

//open pub key paste windows
$('.pubkey-input-open').bind('click',function(){
	$('.popup-filter').addClass('active');
	$('.pubkey-input-window').addClass('active');
})

//copy generated public keys
$('.copy-generated-public-key').bind('click',function(e){
	e.preventDefault();
	copyProcessed(session.generatedPubKey);
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
	purge();
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
	copyProcessed($('.processed-output').text());
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
})
//Checks for input in Write form
$('.write').keyup(function() {
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
	let $keyGenerate = $('.key-generate');
	$('.popup-filter').addClass('active');
	$('.create-key-window').addClass('active').keyup(function(e) {
		if (e.keyCode === 13 && $keyGenerate.is(':visible')) {
			$keyGenerate.click();
		}
	});
})
//start key generation + key form check
$('.key-generate').bind('click', function(e) {
	if (!session.running) {
		let $this = $(this);
		let formFlag = false;
		$('.key-new-form').find('input').each(function() {
			let $this = $(this);
			if (!$this.hasClass('pw-toggle') && $this.val() == '') {
				formFlag = true;
			}
		})
		if (!formFlag) {
			session.running = true;
			$('.create-key-progress').addClass('active');
			generateKeys();
		}
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
//Reset key generation form
$('.key-generate-reset').bind('click', function(e) {
	e.preventDefault();
	newKeyReset();
})
//new key generation form input checks
$('.key-new-form').find('input').each(function() {
	$(this).keyup(function() {
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
	})
})
