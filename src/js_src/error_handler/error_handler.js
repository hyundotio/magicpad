const errorDict = [{
  input: 'whatever',
  output: 'yay!'
}]

const opgpErrorHandler = function(opgp){
  if(opgp){
		alert('error!');
    return true
	} else {
		return false
	}
}

const errorFinder = function(error){
  for(i = 0; i < errorDict.length; i++){
    if((errorDict[i].input).search(error) > -1){
      return errorDict[i].output
    }
  }
}
