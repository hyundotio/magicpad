//Session Data
//Session Data
//Session Data

let session = {
  privKey:'',
  pubKey:'',
  pubKeyFingerprint:'',
  running:false,
  lastDec:'',
  lastEnc:'',
  lastEncPaste:''
}

//Init Function
//Init Function
//Init Function

function init(){
  purge();
  if(window.navigator.onLine){
    $('.online-flag').addClass('active');
  } else {
    $('.online-flag').removeClass('active');
  }
}
init();

// UI data handling functions
// UI data handling functions
// UI data handling functions

//Alert notification
function lipAlert(str){
  $('.message-flag').addClass('active').find('span').text(str);
}

//Handles online notification lip
window.addEventListener('online',  function(){
  $('.online-flag').addClass('active');
});
window.addEventListener('offline', function(){
  $('.online-flag').removeClass('active');
});

//View Encrypted Message
function viewEncMsg(){
  $('.popup-filter').addClass('active');
  $('.processed-output-window').addClass('active mono');
  $('.processed-output-window').find('.processed-output').text(session.lastEnc).val(session.lastEnc);
  $('.save-processed').attr('href','data:text/plain;charset=utf-8,' + encodeURIComponent(session.lastEnc)).attr('download','encrypted_message.txt');
}

//View decrypted message
function viewDecMsg(){
  $('.popup-filter').addClass('active');
  $('.processed-output-window').addClass('active');
  $('.processed-output-window').find('.processed-output').text(session.lastDec.data).val(session.lastDec.data);
  $('.save-processed').attr('href','data:text/plain;charset=utf-8,' + encodeURIComponent(session.lastDec.data)).attr('download','decrypted_message.txt');
}

//Exits popup
function popupExit(){
  $('.popup').removeClass('active');
  $('.popup').removeClass('mono');
  $('.popup-filter').removeClass('active');
}

//Checks for form in the Write tab
function writeFormCheck(){
  if($('.encrypt-message').hasClass('sign-enabled')){
    if($('.text-write').val().length > 0 && $('.text-write-passphrase').val().length > 0 && session.privKey.length > 0 && session.pubKey.length > 0){
      $('.encrypt-message').removeAttr('disabled');
    } else {
      $('.encrypt-message').attr('disabled','disabled');
    }
  } else {
    if($('.text-write').val().length > 0 && session.pubKey.length > 0){
      $('.encrypt-message').removeAttr('disabled');
    } else {
      $('.encrypt-message').attr('disabled','disabled');
    }
  }
}

//Checks for form in the Read tab
function readFormCheck(){
  if($('.text-read').val().length > 0 && $('.text-read-passphrase').val().length > 0 && session.privKey.length > 0){
    $('.decrypt-message').removeAttr('disabled');
  } else {
    $('.decrypt-message').attr('disabled','disabled');
  }
}

// Data processing functions
// Data processing functions
// Data processing functions

//Resets all data in session
function purge(){
  $('input').val('').reset;
  $('textarea').text('').val('').reset;
  $('.revert-encryption').removeAttr('active encrypted decrypted');
  $('.save-processed').attr('href','#').removeAttr('download');
  $('.processed-output').html('');
  $('.encrypt-message').attr('disabled','disabled');
  $('.decrypt-message').attr('disabled','disabled');
  $('.view-processed').attr('disabled','disabled');
  $('.view-message-encrypted').attr('disabled','disabled');
  $('.key-private-download').attr('href','#').removeAttr('download');
  $('.key-public-download').attr('href','#').removeAttr('download');
  $('.keys').find('.key-private-download').remove();
  $('.keys').find('.key-public-download').remove();
  $('.key-pub-import-label').text('Import');
  $('.key-priv-import-label').text('Import');
  $('.fingerprint').text('No public key imported');
  session.pubKey = '';
  session.privKey = '';
  session.pubKeyFingerprint = '';
  session.running = false;
  session.lastEnc = '';
  session.lastDec = '';
  session.lastEncPaste = '';
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
function copyProcessed() {
  let $temp = $("<textarea>");
  $temp.css({'opacity':0.1,'width':'1px','height':'1px','position':'fixed','top':0,'left':0})
  let content = $('.processed-output').text();

  $("body").append($temp);
  $temp.val(content).select();
  document.execCommand("copy");
  $temp.remove();
  $('.copied').addClass('active');
  setTimeout(function(){
    $('.copied').removeClass('active');
  },2000);
}

//Reset key generation form
function newKeyReset(){
  $('.create-key-progress').removeClass('active');
  $('.key-new-form').removeAttr('style').find('input').val('');
  $('.key-generate').attr('disabled','disabled');
}

//Import private key button function
function importPrivKey(){
  //$('.read').find('.fingerprint').text(openpgp.key.primaryKey.fingerprint);
  $('.key-priv-import-label').text('Reimport');
  writeFormCheck();
  readFormCheck();
}

//Import public key button function
function importPubKey(){
  //$('.fingerprint').text(getFingerprint(pubKey));
  openpgp.key.readArmored(session.pubKey).then(data => {
    const buffer = new Uint8Array(data.keys[0].primaryKey.fingerprint).buffer;
    session.pubKeyFingerprint = buf2hex(buffer);
    $('.fingerprint').text(session.pubKeyFingerprint.match(/.{1,4}/g).join(' ').toUpperCase());
    $('.key-pub-import-label').text('Reimport');
  })
  writeFormCheck();
  readFormCheck();
}

//Function when key gneration is finished
function keyReady(){
  importPrivKey();
  $('.key-public-download').attr('href','data:text/plain;charset=utf-8,' + encodeURIComponent(session.pubKey));
  $('.key-public-download').attr('download','public.asc');
  $('.key-private-download').attr('href','data:text/plain;charset=utf-8,' + encodeURIComponent(session.privKey));
  $('.key-private-download').attr('download','private.asc');
  $('.pages').find('li').eq(0).css('margin-left','-50%');
  session.running = false;
}

//OpenPGP Functions
//OpenPGP Functions
//OpenPGP Functions

//Generate keys
function generateKeys(){
  let options = {
    userIds: [{ name: ($('.form-name').val()),
                email: ($('.form-email').val()) }],
    numBits: 4096,
    passphrase: ($('.form-passphrase').val())
  }
  openpgp.generateKey(options).then(key => {
    session.privKey = key.privateKeyArmored.trim();
    session.pubKey = key.publicKeyArmored.trim();
    keyReady();
  })
}

//Decrypt messages
function decryptMessage(){
  let privKeyObj;
  let pbKeyObj;
  let parsedMsg;
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
            if((session.lastDec.data).search('-----BEGIN PGP SIGNATURE-----') != -1){
              verifySignature();
            } else {
              $('.processed-aside').text('Message decrypted');
              viewDecMsg();
            }

          }).catch(function(e){
            lipAlert('Cannot decrypt message. Try testing a different message and/or keys.');
            $('.main-loader').removeClass('active');
            console.log('decrypt msg'+e);
          });
        }).catch(function(e){
          lipAlert('The encrypted message cannot be parsed and/or is formatted incorrectly.');
          $('.main-loader').removeClass('active');
          //console.log('parse msg'+e);
        });
      }).catch(function(e){
        lipAlert('The public key cannot be read. It may be corrupted.');
        $('.main-loader').removeClass('active');
        //console.log('read pubkey'+e);
      });
    }).catch(function(e){
      lipAlert('The private key passphrase is incorrect.');
      $('.main-loader').removeClass('active');
      //console.log('decrypt passphrase'+e);
    });
  }).catch(function(e){
    lipAlert('The private key cannot be read. It may be corrupted.');
    $('.main-loader').removeClass('active');
    //console.log('read privkey'+e);
  });
}

//Encrypt Message
function encryptMessage(msg,signedToggle){
  if(!session.running){
    session.running = true;
    openpgp.key.readArmored(session.pubKey).then(data => {
      let options, cleartext, validity;
      options = {
          message: openpgp.message.fromText(msg),       // input as Message object
          publicKeys: data.keys
      }
      openpgp.encrypt(options).then(ciphertext => {
          encrypted = ciphertext.data.trim() // '-----BEGIN PGP MESSAGE ... END PGP MESSAGE-----'
          session.lastEnc = encrypted;
          viewEncMsg();
          $('.view-message-encrypted').removeAttr('disabled');
          if(signedToggle){
            $('.processed-aside').text('Message encrypted and signed');
          } else {
            $('.processed-aside').text('Message encrypted');
          }
          $('.main-loader').removeClass('active');
          session.running = false;
      }).catch(function(e){
        //console.log('encryptmsg'+e);
        $('.main-loader').removeClass('active');
        lipAlert('Cannot encrypt message. Try testing a different message and/or keys.');
      });
    }).catch(function(e){
      //console.log('read pubkey'+e);
      $('.main-loader').removeClass('active');
      lipAlert('The public key cannot be read. It may be corrupted.');
    });
  }
}

//Sign message
function signMessage(){
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
          encryptMessage(cleartext,true);
      }).catch(function(e){
        //console.log('sign msg'+e);
        $('.main-loader').removeClass('active');
        lipAlert('Cannot sign message. Please try again with a different message and/or keys.');
      });
    }).catch(function(e){
      //console.log('unlock privkey'+e);
      $('.main-loader').removeClass('active');
      lipAlert('The private key passphrase is incorrect.');
    });
  }).catch(function(e){
    //console.log('readprivkey'+e);
    $('.main-loader').removeClass('active');
    lipAlert('The private key cannot be read. It may be corrupted.');
  });;
}

//Verify signature of message
function verifySignature(){
  if(!session.running){
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
            $('.processed-aside').text('Message signature validated with imported public key');
          } else {
            $('.processed-aside').text('Unable to validate message signature with imported public key');
          }
          $('.view-message-decrypted').removeAttr('disabled');
          $('.main-loader').removeClass('active');
          session.running = false;
          viewDecMsg();
        }).catch(function(e){
          $('.main-loader').removeClass('active');
          lipAlert('The signature cannot be verified. It may be corrupted.');
        });
      }).catch(function(e){
        $('.main-loader').removeClass('active');
        lipAlert('The signature cannot be read. It maybe corrupted.');
      });
    }).catch(function(e){
      $('.main-loader').removeClass('active');
      lipAlert('The public key cannot be read. It may be corrupted.');
      //console.log('readpubkey'+e);
    });
  }
}

//UI Bindings
//UI Bindings
//UI Bindings

//Purge / reset functions
$('.purge').bind('click',function(){
  purge();
})

//Exits notification lip
$('.lip-exit').bind('click',function(){
  $('.lip').removeClass('active');
})

//Exits popup lip
$('.popup-exit').bind('click',function(e){
  if(!session.running){
    popupExit();
  }
})

//Expands popup
$('.popup-expand').bind('click',function(){
  if($(this).hasClass('active')){
    $(this).removeClass('active');
    $(this).parent().parent().removeClass('expanded');
    $(this).find('img').attr('src','./ui/expand.svg');
  } else {
    $(this).addClass('active');
    $(this).parent().parent().addClass('expanded');
    $(this).find('img').attr('src','./ui/minimize.svg');
  }
})

//Copy to clipboard button
$('.copy-processed').bind('click',function(){
  copyProcessed();
})

//Re-open Decrypted Message popup
$('.view-message-decrypted').bind('click',function(){
  if(!$(this).is(':disabled')){
    viewDecMsg();
  }
})

//Re-open Encrypted Message popup
$('.view-message-encrypted').bind('click',function(){
  if(!$(this).is(':disabled')){
    viewEncMsg();
  }
})

//Encrypt Message Button
$('.encrypt-message').bind('click',function(){
  if(!$(this).is(':disabled')){
    $('.main-loader').addClass('active');
    if($(this).hasClass('sign-enabled')){
      signMessage();
    } else {
      encryptMessage($('.text-write').val(),false);
    }
  }
})

//Decrypt Message button
$('.decrypt-message').bind('click',function(){
  if(!$(this).is(':disabled')){
    $('.main-loader').addClass('active');
    decryptMessage();
  }
})

//Checks for input in Read form
$('.read').keyup(function(e){
  readFormCheck()
})

//Checks for input in Write form
$('.write').keyup(function(){
  writeFormCheck()
})

//Checks for file imported by user in Private and Key import buttons
$('.key-import').change(function(){
  let $type = $(this);
  let file = $type[0].files[0];
  let reader = new FileReader();
  reader.onload = function(e) {
    if($type.hasClass('key-priv-import')){
      if(reader.result.search('PRIVATE KEY BLOCK') != -1){
        session.privKey = reader.result;
        importPrivKey();
      } else {
        alert("Oops! This doesn't seem like a proper private key. Please choose a different file.");
      }
    } else {
      if(reader.result.search('PUBLIC KEY BLOCK') != -1){
        session.pubKey = reader.result;
        importPubKey();
      } else {
        alert("Oops! This doesn't seem like a proper public key. Please choose a different file.");
      }
    }
  }
  reader.readAsText(file);
})

$('body').keyup(function(e){
  if (e.keyCode === 27)  $('.popup-filter').click();
})
//opens new key generation popup
$('.key-generate-start').bind('click',function(e){
  $('.popup-filter').addClass('active');
  $('.create-key-window').addClass('active');
  $('.create-key-window').keyup(function(e) {
    if (e.keyCode === 13 && $('.key-generate').is(':visible')) {
      $('.key-generate').click();
    }

  });
})

//start key generation
$('.key-generate').bind('click',function(e){
  if(!session.running){
    let formFlag = false;
    $('.key-new-form').find('input').each(function(){
      if(!$(this).hasClass('pw-toggle') && $(this).val() == ''){
        formFlag = true;
      }
    })
    if(!formFlag){
      session.running = true;
      $('.create-key-progress').addClass('active');
      generateKeys();
    }
  }
})

//Sign toggler
$('.encrypt-sign-checkbox').change(function(){
  if(this.checked){
    $('.encrypt-message').addClass('sign-enabled');
    $('.sign-credentials').removeClass('disabled').find('input').removeAttr('disabled');
  } else {
    $('.encrypt-message').removeClass('sign-enabled');
    $('.sign-credentials').addClass('disabled').find('input').attr('disabled','disabled');
  }
  writeFormCheck()
})

//Password show toggler
$('.pw-toggle').change(function() {
    if (this.checked) {
      $('.passphrase-box').attr('type','text');
    } else {
      $('.passphrase-box').attr('type','password');
    }
});

//Tab changer
$('.tab').bind('click',function(e){
  let $main = $('main');
  e.preventDefault();
  let nextTab = $(this).attr('data-tab');
  $('.main-nav').find('.active').removeClass('active');
  $(this).addClass('active');
  $main.find('.tab-window').removeClass('active');
  $main.find('.tab-window').each(function(){
    if($(this).hasClass(nextTab)){
      $(this).addClass('active');
    }
  })
})

//Reset key generation form
$('.key-generate-reset').bind('click',function(){
  newKeyReset();
})

//new key generation form input checks
$('.key-new-form').find('input').each(function(){
  $(this).keyup(function(){
    let empty = false;
    $('.key-new-form').find('input').each(function(){
      if($(this).val() == '' && !$(this).hasClass('pw-toggle')){
        empty = true;
        $(this).hasClass('empty')
      }
      if($(this).hasClass('form-email') && !isEmail($(this).val()) && $(this).val() != ''){
        empty = true;
        $(this).addClass('error');
      } else {
        $(this).removeClass('error');
      }
    })
    if(!empty){
      $('.key-generate').removeAttr('disabled');
    } else {
      $('.key-generate').attr('disabled','disabled');
    }
  })
})
