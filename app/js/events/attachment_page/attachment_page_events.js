//Show passphrase box if Decrypting
$('.attachment-radio').bind('click',function(){
  let $this = $(this);
  let $attachmentCredentials = $('.attachment-credentials');
  let $attachmentProcess = $('.attachment-process');
  if($this.is(':checked')){
      if($this.val() == 'decrypt'){
        $attachmentCredentials.removeClass('disabled').find('input').removeAttr('disabled');
        $attachmentProcess.removeClass('attachment-encrypt').addClass('attachment-decrypt').find('span').text('Decrypt');
        $attachmentProcess.find('img').attr('src','./ui/decrypt.svg');
      } else {
        if($this.val() == 'encrypt-sign'){
          $attachmentCredentials.removeClass('disabled').find('input').removeAttr('disabled');
          $attachmentProcess.addClass('attachment-encrypt-sign');
        } else {
          $attachmentCredentials.addClass('disabled').find('input').attr('disabled','disabled');
          $attachmentProcess.addClass('attachment-encrypt');
        }
        $attachmentProcess.removeClass('attachment-decrypt').find('span').text('Encrypt');
        $attachmentProcess.find('img').attr('src','./ui/encrypt.svg');
      }
      attachmentFormcheck();
  }
})

//Get filename when user selects file.
$('.attachment-import').change(function(){
  attachmentFilename($(this));
  attachmentFormcheck();
})

//Check passphrase keyup for attachment (when decrypting)
$('.attachment-passphrase').keyup(function(){
  attachmentFormcheck();
}).change(function(){
  attachmentFormcheck();
})

//Start processing attachment
$('.attachment-process').bind('click',function(){
  let $this = $(this);
  if($this.hasClass('attachment-decrypt')){
    decryptAttachment();
  } else if ($this.hasClass('attachment-encrypt-sign')){
    encryptAttachment(true);
  } else {
    encryptAttachment(false);
  }
})

//open processed attachment popup
$('.attachment-view').bind('click',function(){
  if(!$(this).is(':disabled')){
    $('.popup-filter').addClass('active');
    $('.attachment-window').addClass('active');
  }
})
