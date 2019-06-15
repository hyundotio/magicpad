//open key servers popup
$('.open-keybrowser').bind('click',function(){
	$('.popup-filter').addClass('active');
	let $keyServerBrowserWindow = $('.key-server-browser-window');
	let $popupTabContent = $keyServerBrowserWindow.find('.popup-tab-content');
	let $popupTab = $keyServerBrowserWindow.find('.popup-tabs');
	$popupTab.find('.active').removeClass('active');
	$popupTab.find('.popup-tab').eq(0).addClass('active');
	let tabOpen = $popupTab.find('.active').attr('data-tab');
	$popupTabContent.find('.popup-tab-page.active').removeClass('active');
	$popupTabContent.find('.'+tabOpen).addClass('active');
	$keyServerBrowserWindow.addClass('active');
})
