define(function () {
    var init = function () {
        setHtmlFrame();
    };
    var setHtmlFrame = function () {
        var html = '<button class="pull-button"><span class="mif-menu fg-light"></span></button>';
        html += '<div class="suggest-box"><input data-role="search" data-clear-button="false" data-search-button-icon="<span class=\'mif-search fg-light\'></span>">';
        html += '<button class="holder"><span class="mif-search fg-light"></span></button></div>';
        html += '<ul class="navview-menu">';
        html += '<li id="home"><a href="#"><span class="icon"><span class="mif-home"></span></span><span class="caption">Home</span> </a></li>';
        html += '<li class="item-separator"></li><li class="item-header">Collections</li>';
        html += '<li><a href="#"><span class="icon"><span class="mif-image"></span></span><span class="caption">Images</span></a></li>';
        html += '<li><a href="#"><span class="icon"><span class="mif-music"></span></span><span class="caption">Music</span></a></li>';
        html += '<li><a href="#"><span class="icon"><span class="mif-video-camera"></span></span><span class="caption">Video</span></a></li>';
        html += '<li><a href="#"> <span class="icon"><span class="mif-books"></span></span><span class="caption">Documents</span></a></li>';
        html += '<li><a href="#"><span class="icon"><span class="mif-folder"></span></span><span class="caption">Packages</span></a></li></ul>';
        $('.navview-pane').html(html);
    };
    return {
        'init': init
    }
});