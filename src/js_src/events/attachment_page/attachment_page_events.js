//Show passphrase box if Decrypting
$('.attachment-radio').bind('click',function(){
  let $this = $(this);
  let $attachmentCredentials = $('.attachment-credentials');
  let $attachmentProcess = $('.attachment-process');
  let $attachmentView = $('.attachment-view');
  if($this.is(':checked')){
      if($this.val() == 'decrypt'){
        $attachmentCredentials.removeClass('disabled').find('input').removeAttr('disabled');
        $attachmentProcess.removeClass('attachment-encrypt').addClass('attachment-decrypt').find('span').text('Decrypt');
        $attachmentProcess.find('img').attr('src','./ui/decrypt.svg');
        if(session.lastDecFile.length > 0){
          $attachmentView.removeAttr('disabled');
          $('.attachment-window').find('.window-title').find('span').text('Decrypted attachment');
          $('.attachment-download').attr('href',session.lastDecFile).attr('download',session.lastDecFilename).find('span').html('Download<br>decrypted file');
          $('.attachment-view').removeAttr('disabled');
        } else {
          $attachmentView.attr('disabled','disabled');
        }
      } else {
        if($this.val() == 'encrypt-sign'){
          $attachmentCredentials.removeClass('disabled').find('input').removeAttr('disabled');
          $attachmentProcess.addClass('attachment-encrypt-sign');
          if(session.lastEncFile.length > 0 && session.lastEncFileSigned){

          }
        } else {
          $attachmentCredentials.addClass('disabled').find('input').attr('disabled','disabled');
          $attachmentProcess.addClass('attachment-encrypt');
          if(session.lastEncFile.length > 0){
            $attachmentView.removeAttr('disabled');
            $('.attachment-window').find('.window-title').find('span').text('Encrypted attachment');
            $('.attachment-download').attr('href',session.lastEncFile).attr('download',session.lastEncFilename).find('span').html('Download<br>encrypted file');
            $('.attachment-view').removeAttr('disabled');
          } else {
            $attachmentView.attr('disabled','disabled')
          }
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
  $('body').addClass('loading');
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
