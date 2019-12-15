//open key servers popup
$('.open-keybrowser').bind('click',function(){
	let $keyServerBrowserWindow = $('.key-server-browser-window');
	let $popupTabContent = $keyServerBrowserWindow.find('.popup-tab-content');
	let $popupTab = $keyServerBrowserWindow.find('.popup-tabs');
	let $activePopupTab = $popupTabContent.children('.active');
	if($activePopupTab.length == 0){
		$popupTab.find('.active').removeClass('active');
		$popupTab.find('.popup-tab').eq(0).addClass('active');
		let tabOpen = $popupTab.find('.active').attr('data-tab');
		$popupTabContent.find('.popup-tab-page.active').removeClass('active');
		$popupTabContent.find('.'+tabOpen).addClass('active');
	}
	openPopup('.key-server-browser-window');
})
