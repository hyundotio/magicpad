let session = {
  privKey:'',
  pubKey:'',
  pubKeyFingerprint:'',
  running:false,
  lastDec:'',
  lastEnc:'',
  lastEncPaste:''
}
// Update the online status icon based on connectivity
window.addEventListener('online',  function(){
  $('.online-flag').addClass('active');
});
window.addEventListener('offline', function(){
  $('.online-flag').removeClass('active');
});
$('.lip-exit').bind('click',function(){
  $('.lip').removeClass('active');
})
function init(){
  purge();
  if(window.navigator.onLine){
    $('.online-flag').addClass('active');
  } else {
    $('.online-flag').removeClass('active');
  }
}
init();
function buf2hex(buffer) { // buffer is an ArrayBuffer
  return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
}

function isEmail(email) {
  let regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  return regex.test(email);
}

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
function viewEncMsg(){
  $('.popup-filter').addClass('active');
  $('.processed-output-window').addClass('active mono');
  $('.processed-output-window').find('.processed-output').text(session.lastEnc).val(session.lastEnc);
  $('.save-processed').attr('href','data:text/plain;charset=utf-8,' + encodeURIComponent(session.lastEnc)).attr('download','encrypted_message.txt');
}
function viewDecMsg(){
  $('.popup-filter').addClass('active');
  $('.processed-output-window').addClass('active');
  $('.processed-output-window').find('.processed-output').text(session.lastDec.data).val(session.lastDec.data);
  $('.save-processed').attr('href','data:text/plain;charset=utf-8,' + encodeURIComponent(session.lastDec.data)).attr('download','decrypted_message.txt');
}

function encryptMessage(msg){
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
        session.running = false;
        $('.processed-aside').text('Message encrypted and signed');
        $('.main-loader').removeClass('active');
    })
  });
}
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

function signMessage(){
  openpgp.key.readArmored(session.privKey).then(data => {
    let options, cleartext, validity;
    let privKeyObj = data.keys[0];
    privKeyObj.decrypt($('.text-write-passphrase').val()).then(output => {
      options = {
          message: openpgp.cleartext.fromText($('.text-write').val()), // CleartextMessage or Message object
          privateKeys: [privKeyObj]                             // for signing
      };
      openpgp.sign(options).then(function(signed) {
          cleartext = signed.data.trim(); // '-----BEGIN PGP SIGNED MESSAGE ... END PGP SIGNATURE-----'
          encryptMessage(cleartext);
      });
    });
  });
}
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
$('.copy-processed').bind('click',function(){
  copyProcessed();
})
$('.view-message-decrypted').bind('click',function(){
  viewDecMsg();
})
$('.view-message-encrypted').bind('click',function(){
  viewEncMsg();
})
$('.encrypt-message').bind('click',function(){
  session.running = true;
  $('.main-loader').addClass('active');
  signMessage();
})
$('.decrypt-message').bind('click',function(){
  session.running = true;
  $('.main-loader').addClass('active');
  decryptMessage();
})
function verifySignature(){
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
        validity = verified.signatures[0].valid; // true
        if (validity) {
          $('.processed-aside').text('Message signature validated with imported public key');
        } else {
          $('.processed-aside').text('Unable to validate message signature with imported public key');
        }
        $('.view-message-decrypted').removeAttr('disabled');
        session.running = false;
        $('.main-loader').removeClass('active');
        viewDecMsg();
      });
    })
  })
}
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
            verifySignature();
          })
        })
      })
    })
  });
}

function writeFormCheck(){
  if($('.text-write').val().length > 0 && $('.text-write-passphrase').val().length > 0 && session.privKey.length > 0 && session.pubKey.length > 0){
    $('.encrypt-message').removeAttr('disabled');
  } else {
    $('.encrypt-message').attr('disabled','disabled');
  }
}
function readFormCheck(){
  if($('.text-read').val().length > 0 && $('.text-read-passphrase').val().length > 0 && session.privKey.length > 0){
    $('.decrypt-message').removeAttr('disabled');
  } else {
    $('.decrypt-message').attr('disabled','disabled');
  }
}

$('.read').keyup(function(){
  readFormCheck()
})
$('.write').keyup(function(){
  writeFormCheck()
})

$('.key-import').change(function(){
  let $type = $(this);
  let file = $type[0].files[0];
  let reader = new FileReader();
  reader.onload = function(e) {
    if($type.hasClass('key-priv-import')){
      session.privKey = reader.result;
      importPrivKey();
    } else {
      session.pubKey = reader.result;
      importPubKey();
    }
  }
  reader.readAsText(file);
})

function importPrivKey(){
  //$('.read').find('.fingerprint').text(openpgp.key.primaryKey.fingerprint);
  $('.key-priv-import-label').text('Reimport');
  writeFormCheck();
  readFormCheck();
}

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

function keyReady(){
  importPrivKey();
  $('.key-public-download').attr('href','data:text/plain;charset=utf-8,' + encodeURIComponent(session.pubKey));
  $('.key-public-download').attr('download','public.asc');
  $('.key-private-download').attr('href','data:text/plain;charset=utf-8,' + encodeURIComponent(session.privKey));
  $('.key-private-download').attr('download','private.asc');
  $('.pages').find('li').eq(0).css('margin-left','-50%');
  session.running = false;
}
function popupExit(){
  $('.popup').removeClass('active');
  $('.popup').removeClass('mono');
  $('.popup-filter').removeClass('active');
}
$('.popup-exit').bind('click',function(e){
  if(!session.running){
    popupExit();
  }
})

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
$('.purge').bind('click',function(){
  purge()
})

$('.key-generate-start').bind('click',function(e){
  $('.popup-filter').addClass('active');
  $('.create-key-window').addClass('active');
  $('.create-key-window').keyup(function(e) {
    if (e.keyCode === 13 && $('.key-generate').is(':visible')) {
      $('.key-generate').click();
    }
    if (e.keyCode === 27)  $('.popup-exit').click();   // esc
  });
})

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

$('.pw-toggle').change(function() {
    if (this.checked) {
      $('.passphrase-box').attr('type','text');
    } else {
      $('.passphrase-box').attr('type','password');
    }
});

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

$('.key-generate-reset').bind('click',function(){
  newKeyReset();
})

function newKeyReset(){
  $('.create-key-progress').removeClass('active');
  $('.key-new-form').removeAttr('style').find('input').val('');
  $('.key-generate').attr('disabled','disabled');
}

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
