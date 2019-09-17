//Session toggler
$('.session-toggle').change(function() {
	let $this = $(this);
  if(this.checked){
    session.sessionStore = true;
    adjustSession();
  } else {
    session.sessionStore = false;
    eraseSession();
  }
});
