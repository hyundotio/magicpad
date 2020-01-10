const loadPage = function(hashLoc){
  let $main = $('main');
  let $tabWindow = $main.find('.tab-window');
  let $mainNav = $('.main-nav');
  /*
  let $this = $(this);
  let nextTab = $this.attr('data-tab');

  $this.addClass('active');
  */
  let $nextPage = $('.'+hashLoc[1]);
  if($nextPage.length > 0){
    popupExit();
    $mainNav.find('.active').removeClass('active');
    $mainNav.find('a').each(function(){
      let $this = $(this);
      if ($this.attr('data-tab').toLowerCase() == hashLoc[1]){
        $this.addClass('active');
      }
    })
    $tabWindow.removeClass('active');
    $nextPage.addClass('active');
    for (let i = 0; i < formChecker.length; i++){
      if(formChecker[i].type == hashLoc[1]){
        formChecker[i].runCheck();
      }
    }
  } else {
    window.location.hash = '#!'
  }
}

const hashHandler = function(hashArray){
    if (hashArray[0] === 'page'){
      if(hashArray[1] !== undefined){
          loadPage(hashArray);
      } else {
          window.location.hash = '#!'
      }
      //about
    } else if (hashArray.length === 0){
      //go home
        window.location.hash = '#!/page/keys'
    } else {
        window.location.hash = '#!'
    }
}

const hashCreator = function(firstTime){
  let locHash = location.hash.split('/');
  let cleanedHash = [];
  for (let i = 0; i < locHash.length; i++){
    if(locHash[i] !== '' && locHash[i] !== '#!'){
      cleanedHash.push(locHash[i].toLowerCase());
    }
  }
  hashHandler(cleanedHash);
}

window.addEventListener('hashchange',function(e){
    hashCreator();
},false);
hashCreator(true);
