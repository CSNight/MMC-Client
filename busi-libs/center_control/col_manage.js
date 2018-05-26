define(function (require) {
    var uid, role;
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
            $('.navview-content').html('');
            user_tree.init();
        });
        $('#home').click(function () {
            $('.navview-content').html('');
            user_tree.init();
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
        var pages = Math.ceil(els.length / 24);
        $('.navview-content').html('<div class="wall bg-transparent" data-cls-control-prev="bg-white"' +
            'data-control-title="page $1 of $2" data-cls-control-next="bg-white" data-cls-control-title="fg-white" data-role="master"></div>');

        function add_items(page) {
            if ($('#page' + page).find('.grid').html() !== "") {
                return;
            }
            for (var i = 0; i < 3; i++) {
                $('#page' + page).find('.grid').append('<div id="row' + i + page + '" class="row mt-2 mb-2"></div>');
                for (var j = 0; j < 8; j++) {
                    if (page * 24 + i * 8 + j >= els.length) {
                        $('#row' + i + page).append('<div class="cell mr-3"></div>');
                    } else {
                        var img_file = els[page * 24 + i * 8 + j];
                        var html = '<div class="cell bg-red mr-3"><div class="mb-5 img-container thumbnail pos-center">';
                        html += '<img src="' + UrlConfig.getPreviewURL() + '?uid=' + uid + '&fid=' + img_file.fid + '&f_type=image">';
                        html += '<div class="image-overlay"><div>Size：' + img_file.file_size + 'MB</div><div class="text-center">' + img_file.file_name + '</div></div>';
                        html += '<div class="pos-bottom-center text-center">';
                        html += '<span class="fg-red mif-eye mr-6 preview" name="' + img_file.fid + '"></span>';
                        html += '<span class="fg-red mif-download download" name="' + img_file.fid + '"></span></div></div></div>';
                        $('#row' + i + page).append(html);
                    }
                }
            }
            $('.preview').unbind();
            $('.download').unbind();
            $('.preview').click(function () {
                var fid = $(this).attr('name');
                if (!fid) {
                    return;
                }
                var data = {
                    'uid': uid,
                    'fid': fid,
                    'f_type': 'image'
                };
                var rest_cache = new RestQueryAjax(cache_callback);
                rest_cache.cache_file_REST(data);

                function cache_callback(res) {
                    if (res.response.status === 200) {
                        window.open(UrlConfig.getBaseURI() + 'trans/resource/image/' + res.response.element.chd + '/' + res.response.element.name);
                    }
                }
            });
            $('.download').click(function () {
                var fid = $(this).attr('name');
                if (!fid) {
                    return;
                }
                $('#do_').remove();
                var download_html = '<form id="do_" style="display: none" method="post" action="' + UrlConfig.getBaseURI() + 'file/download">';
                download_html += '<input name="uid" value="' + uid + '">';
                download_html += '<input name="fid" value="' + fid + '">';
                download_html += '</form>';
                $('body').append(download_html);
                $('#do_').submit();
            });
            $('.cell').css('max-height', '244px');
            $('.img-container').css('max-height', '210px');
            $('img').css('max-height', '180px');
        }

        for (var k = 0; k < pages; k++) {
            $('.wall').append('<div id="page' + k + '" class="page"><div class="grid"></div></div>');
        }
        add_items(0);
        setTimeout(function () {
            $('.wall').data('master').options.onBeforePage = function (dir, index, page, element) {
                if ((index + 1) === pages && dir === 'next') {
                    add_items(0);
                    $('.wall').data('master').toPage(0);
                } else if ((index + 1) < pages && dir === 'next') {
                    $('.wall').data('master').next();
                    add_items(index + 1);
                } else if (index === 0 && dir === 'prev') {
                    $('.wall').data('master').toPage(pages - 1);
                    add_items(pages - 1);
                } else {
                    $('.wall').data('master').prev();
                    add_items(index - 1);
                }
            };
            $('.pages').height($('.navview-pane').height() - $('.controls-bottom').height());
        }, 100);
    }

    function video_views(els) {
        $('.navview-content').html('');
    }

    function music_views(els) {
        $('.navview-content').html('');
    }

    function doc_views(els) {
        $('.navview-content').html('');
    }

    function package_views(els) {
        $('.navview-content').html('');
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