//Converts buffer to hex
const buf2hex = function(buffer) {
	return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
}
//Checks if string is email
const isEmail = function(email) {
	let regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
	return regex.test(email);
}
//get filename of input
const getFilename = function(str){
	return str.split(/(\\|\/)/g).pop()
}
//Truncate string to X int characters
String.prototype.trunc = String.prototype.trunc ||
function(n){
		return (this.length > n) ? this.substr(0, n-1) + '...' : this;
};

//Shows human readable file sizes
const bytesToSize = function(bytes) {
   const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
   if (bytes == 0) return '0 Byte';
   const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
   return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};
