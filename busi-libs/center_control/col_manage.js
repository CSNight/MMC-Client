define(function (require) {
    var user_tree = require('busi-libs/center_control/center_user');
    var init = function () {
        uid = getQueryString('uid');
        role = getQueryString('role');
        setHtmlFrame();
        user_tree.init();
    };
    var setHtmlFrame = function () {
        var html = '<button class="pull-button"><span class="mif-menu fg-light"></span></button>';
        html += '<div class="suggest-box"><input data-role="search" data-clear-button="false" data-search-button-icon="<span class=\'mif-search fg-light\'></span>">';
        html += '<button class="holder"><span class="mif-search fg-light"></span></button></div>';
        html += '<ul class="navview-menu">';
        html += '<li id="home"><a href="javascript:;"><span class="icon"><span class="mif-home"></span></span><span class="caption">Home</span> </a></li>';
        html += '<li class="item-separator"></li><li class="item-header">Collections</li>';
        html += '<li><a href="javascript:;"><span class="icon ft" id="image"><span class="mif-image"></span></span><span class="caption">Images<b></b></span></a></li>';
        html += '<li><a href="javascript:;"><span class="icon ft" id="audio"><span class="mif-music"></span></span><span class="caption">Music<b></b></span></a></li>';
        html += '<li><a href="javascript:;"><span class="icon ft" id="video"><span class="mif-video-camera"></span></span><span class="caption">Video<b></b></span></a></li>';
        html += '<li><a href="javascript:;"> <span class="icon ft" id="doc"><span class="mif-books"></span></span><span class="caption">Documents<b></b></span></a></li>';
        html += '<li><a href="javascript:;"><span class="icon ft" id="package"><span class="mif-folder"></span></span><span class="caption">Packages<b></b></span></a></li></ul>';
        $('.navview-pane').html(html);
        $('.ft').parent().click(get_collections);
        $('.item-separator').click(refresh_file_count);
        $('#menu_home').click(function () {
            $('#home').click();
        });
    };
    var refresh_file_count = function () {
        var data = {
            'uid': uid,
            'f_type': 'all',
            'response_t': 'count_all'
        };
        var get_count = new RestQueryAjax(get_count_callback);
        get_count.count_file_REST(data);

        function get_count_callback(res) {
            if (res.response.status === 200) {
                $('.ft').each(function (index, ele) {
                    $(ele).siblings('.caption').find('b').html('(' + res.response.element[$(ele).attr('id')] + ')');
                });
            }
        }
    };

    function get_collections() {
        var f_type = $(this).find('.icon').attr('id');
        var data = {
            'uid': uid,
            'f_type': f_type,
            'response_t': 'detail'
        };
        var get_detail = new RestQueryAjax(get_count_callback);
        get_detail.count_file_REST(data);

        function get_count_callback(res) {
            if (res.response.status === 200) {
                switch (f_type) {
                    case 'image':
                        image_views(res.response.element);
                        break;
                    case 'video':
                        video_views(res.response.element);
                        break;
                    case 'audio':
                        music_views(res.response.element);
                        break;
                    case 'doc':
                        doc_views(res.response.element);
                        break;
                    case 'package':
                        package_views(res.response.element);
                        break;
                }
            }
        }

    }

    function image_views(els) {

    }

    function video_views(els) {

    }

    function music_views(els) {

    }

    function doc_views(els) {

    }

    function package_views(els) {

    }

    function getQueryString(name) {
        try {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
            var r = window.location.search.substr(1).match(reg);
            if (r != null) {
                return decodeURI(r[2]);
            }
            return null;
        } catch (err) {
            return null;
        }
    }

    function guid() {
        /**
         * @return {string}
         */
        function S4() {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }

        return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    }

    return {
        'init': init
    }
});