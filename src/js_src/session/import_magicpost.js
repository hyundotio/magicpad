const checkReadImport = function(){
  if($('.read').hasClass('active')){
    let msgIdx;
    const hashLoc = window.location.hash.split('/');
    for (let i = 0; i < hashLoc.length; i++) {
      if (hashLoc[i] === 'read'){
        msgIdx = i + 1;
      }
    }
    if(hashLoc[msgIdx].substr(0,31) === '-----BEGIN%20PGP%20MESSAGE-----'){
      $('#read-textarea').val(decodeURIComponent(hashLoc[msgIdx]));
    }
  }
}
