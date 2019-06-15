//Converts buffer to hex
function buf2hex(buffer) {
	return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
}
//Checks if string is email
function isEmail(email) {
	let regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
	return regex.test(email);
}
//get filename of input
function getFilename(str){
	return str.split(/(\\|\/)/g).pop()
}
//Truncate string to X int characters
String.prototype.trunc = String.prototype.trunc ||
function(n){
		return (this.length > n) ? this.substr(0, n-1) + '...' : this;
};
