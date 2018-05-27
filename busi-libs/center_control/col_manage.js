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
        gen_pages(pages);

        function build_html(_f) {
            var html = '<div class="cell bg-red mr-3"><div class="mb-5 img-container thumbnail pos-center">';
            html += '<img src="' + UrlConfig.getPreviewURL() + '?uid=' + uid + '&fid=' + _f.fid + '&f_type=image">';
            html += '<div class="image-overlay"><div>Size：' + _f.file_size + 'MB</div><div class="text-center">' + _f.file_name + '</div></div>';
            html += '<div class="pos-bottom-center text-center">';
            html += '<span class="fg-red mif-eye mr-6 preview" name="' + _f.fid + '"></span>';
            html += '<span class="fg-red mif-download download" name="' + _f.fid + '"></span></div></div></div>';
            return html
        }

        function after_show() {
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
                download(fid);
            });
            $('.cell').css('max-height', '244px');
            $('.img-container').css('max-height', '210px');
            $('img').css('max-height', '180px');
        }

        add_items(els, 0, 3, 8, build_html, after_show);
        setTimeout(function () {
            $('.wall').data('master').options.onBeforePage = function (dir, index, page, element) {
                if ((index + 1) < pages && dir === 'next') {
                    $('.wall').data('master').next();
                    add_items(els, index + 1, 3, 8, build_html, after_show);
                } else {
                    $('.wall').data('master').prev();
                    add_items(els, index - 1, 3, 8, build_html, after_show);
                }
            };
            $('.pages').height($('.navview-pane').height() - $('.controls-bottom').height());
        }, 100);
    }

    function video_views(els) {

    }

    function music_views(els) {
        $('.navview-content').html('');
    }

    function doc_views(els) {

        var pages = Math.ceil(els.length / 33);
        gen_pages(pages);

        function build_html(_f) {
            var inf = get_icons(_f.file_type, _f.f_type);
            var html = '<div class="cell mr-3"><div class="img-container pos-top-center">';
            html += '<img src="' + inf.p + '" name="' + inf.t + '"></div>';
            html += '<div style="font-size:10px" class="pos-bottom-center text-center"><div>' + _f.file_name + '</div>';
            html += '<div>Size:' + _f.file_size + 'MB</div><div name="' + _f.file_type + '">';
            html += '<span class="mif-eye mr-6 preview" name="' + _f.fid + '"></span>';
            html += '<span class="mif-download download" name="' + _f.fid + '"></span></div></div></div>';
            return html
        }

        function after_show() {
            $('.preview').unbind();
            $('.download').unbind();
            $('.preview').click(function () {
                var fid = $(this).attr('name');
                if (!fid) {
                    return;
                }
                var s = $(this).parent().parent().parent().find('img').attr('name');
                if (s === 'true') {
                    var data = {
                        'uid': uid,
                        'fid': fid,
                        'ext': $(this).parent().attr('name')
                    };
                    var convert_rest = new RestQueryAjax(convert_callback);
                    convert_rest.convert_doc_REST(data);

                    function convert_callback(res) {
                        if (res.response.status === 200) {
                            window.open(UrlConfig.getBaseURI() + 'trans/resource/doc/' + res.response.element.chd + '/' + res.response.element.name);
                        }
                    }
                } else {

                }
            });
            $('.download').click(function () {
                var fid = $(this).attr('name');
                if (!fid) {
                    return;
                }
                download(fid);
            });
            $('.cell').css('max-width', '128px');
            $('.img-container').css('max-height', '130px');
            $('img').css('max-height', '128px');
        }

        add_items(els, 0, 3, 11, build_html, after_show);
        setTimeout(function () {
            $('.wall').data('master').options.onBeforePage = function (dir, index, page, element) {
                if ((index + 1) < pages && dir === 'next') {
                    $('.wall').data('master').next();
                    add_items(els, index + 1, 3, 11, build_html, after_show);
                } else {
                    $('.wall').data('master').prev();
                    add_items(els, index - 1, 3, 11, build_html, after_show);
                }
            };
            $('.pages').height($('.navview-pane').height() - $('.controls-bottom').height());
        }, 100);
    }

    function package_views(els) {
        $('.navview-content').html('');
    }

    var download = function (fid) {
        $('#do_').remove();
        var download_html = '<form id="do_" style="display: none" method="post" action="' + UrlConfig.getBaseURI() + 'file/download">';
        download_html += '<input name="uid" value="' + uid + '">';
        download_html += '<input name="fid" value="' + fid + '">';
        download_html += '</form>';
        $('body').append(download_html);
        $('#do_').submit();
    };

    var add_items = function (els, page, rows, cols, callback, after) {
        if ($('#page' + page).find('.grid').html() !== "") {
            return;
        }
        for (var i = 0; i < rows; i++) {
            $('#page' + page).find('.grid').append('<div id="row' + i + page + '" class="row mt-2 mb-2"></div>');
            for (var j = 0; j < cols; j++) {
                if (page * rows * cols + i * cols + j >= els.length) {
                    $('#row' + i + page).append('<div class="cell mr-3"></div>');
                } else {
                    var _f = els[page * rows * cols + i * cols + j];
                    var html = callback(_f);
                    $('#row' + i + page).append(html);
                }
            }
        }
        after();
    };

    var gen_pages = function (pages) {
        $('.navview-content').html('<div class="wall bg-transparent" data-cls-control-prev="bg-white"' +
            'data-control-title="page $1 of $2" data-cls-control-next="bg-white" data-cls-control-title="fg-white" data-role="master"></div>');
        for (var k = 0; k < pages; k++) {
            $('.wall').append('<div id="page' + k + '" class="page"><div class="grid"></div></div>');
        }
    };

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

    function get_icons(f_ext, f_type) {
        var ft = {
            '.docm': {'t': false, 'p': '../images/docm.png'},
            '.doc': {'t': true, 'p': '../images/doc.png'},
            '.docx': {'t': true, 'p': '../images/doc.png'},
            '.xls': {'t': true, 'p': '../images/xls.png'},
            '.xlsx': {'t': true, 'p': '../images/xls.png'},
            '.ppt': {'t': true, 'p': '../images/ppt.png'},
            '.pptx': {'t': true, 'p': '../images/ppt.png'},
            '.xml': {'t': false, 'p': '../images/xml.png'},
            '.json': {'t': false, 'p': '../images/json.png'},
            '.pdf': {'t': false, 'p': '../images/pdf.png'},
            '.csv': {'t': false, 'p': '../images/csv.png'},
            '.zip': {'t': false, 'p': '../images/zip.png'},
            '.rar': {'t': false, 'p': '../images/rar.png'},
            '.tar.gz': {'t': false, 'p': '../images/zip.png'},
            '.wma': {'t': false, 'p': '../images/wma.png'},
            '.mp3': {'t': false, 'p': '../images/mp3.png'},
            '.unk': {'t': false, 'p': '../images/unknown.png'}
        };
        if (ft.hasOwnProperty(f_ext)) {
            return ft[f_ext]
        } else if (f_type === 'doc') {
            return ft['.docm']
        } else if (f_type === 'package') {
            return ft['.zip']
        } else if (f_type === 'audio') {
            return ft['.mp3']
        } else {
            return ft['.unk']
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