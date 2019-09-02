//Logic to navigate list for Guide
$('.tutorial-selectors').find('a').each(function(){
    $(this).bind('click',function(e){
        let $this = $(this);
        let $tutorialPages = $('.tutorial-pages');
        let $tutorialPage = $tutorialPages.find('.'+$this.attr('data-tutorial'));
        let $tutorialPageVideo = $tutorialPage.find('video');
        if($tutorialPageVideo.length > 0){
            $tutorialPageVideo[0].currentTime = 0;
        }
        $('.tutorial-selectors').find('.active').removeClass('active')
        $this.addClass('active');
        $tutorialPages.find('.active').removeClass('active');
        $tutorialPage.addClass('active')
    })
})
