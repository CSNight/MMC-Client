define(function (require) {
    var uid, role, current_col = "", play_list = [];
    var display = {
        'doc': [142, 194],
        'package': [142, 194],
        'audio': [157, 190],
        'image': [196, 225],
        'video': [182, 189]
    };
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
        $('.ft').parent().click(function () {
            current_col = $(this).children('span').attr('id');
            get_collections(current_col);
        });
        $('.item-separator').click(refresh_file_count);
        $('#menu_home').click(function () {
            $('.navview-content').html('');
            user_tree.init();
            current_col = "";
        });
        $('#home').click(function () {
            $('.navview-content').html('');
            user_tree.init();
            current_col = "";
        });
        $(window).resize(debounce(function () {
            if (current_col !== "") {
                get_collections(current_col);
            }
        }, 100, true));
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

    function get_collections(f_type) {
        var data = {
            'uid': uid,
            'f_type': f_type,
            'response_t': 'detail'
        };
        var get_detail = new RestQueryAjax(get_count_callback);
        get_detail.count_file_REST(data);
        var _cell = [];

        function get_count_callback(res) {
            if (res.response.status === 200) {
                switch (f_type) {
                    case 'image':
                        _cell = calrc('image');
                        image_views(res.response.element, _cell[0], _cell[1]);
                        break;
                    case 'video':
                        _cell = calrc('video');
                        video_views(res.response.element, _cell[0], _cell[1]);
                        break;
                    case 'audio':
                        _cell = calrc('audio');
                        music_views(res.response.element, _cell[0], _cell[1]);
                        break;
                    case 'doc':
                        _cell = calrc('doc');
                        doc_views(res.response.element, _cell[0], _cell[1]);
                        break;
                    case 'package':
                        _cell = calrc('package');
                        package_views(res.response.element, _cell[0], _cell[1]);
                        break;
                }
            }
        }
    }

    function image_views(els, r, c) {
        var pages = Math.ceil(els.length / (r * c));
        gen_pages(pages);

        function build_html(_f) {
            var html = '<div class="cell bg-red mr-3"><div class="mb-5 img-container thumbnail pos-center">';
            html += '<img src="' + UrlConfig.getPreviewURL() + '?uid=' + uid + '&fid=' + _f.fid + '&f_type=image">';
            html += '<div class="image-overlay"><div>Size：' + _f.file_size + 'MB</div><div class="text-center" style="word-break:break-all;word-wrap:break-word">' + _f.file_name + '</div></div>';
            html += '<div class="pos-bottom-center text-center">';
            html += '<span class="fg-red ani-hover-flash mif-eye mr-6 preview" name="' + _f.fid + '"></span>';
            html += '<span class="fg-red ani-hover-flash mif-download download" name="' + _f.fid + '"></span></div></div></div>';
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
                window.open(UrlConfig.getBaseURI() + 'file/download?uid=' + uid + '&fid=' + fid);
            });
            $('.cell').css('max-height', '244px');
            $('.img-container').css('max-height', '210px');
            $('img').css('max-height', '180px');
        }

        add_items(els, 0, r, c, build_html, after_show);
        setTimeout(function () {
            $('.wall').data('master').options.onBeforePage = function (dir, index, page, element) {
                if ((index + 1) < pages && dir === 'next') {
                    $('.wall').data('master').next();
                    add_items(els, index + 1, r, c, build_html, after_show);
                } else {
                    $('.wall').data('master').prev();
                    add_items(els, index - 1, r, c, build_html, after_show);
                }
            };
            $('.pages').height(r * (display['image'][1] + 40));
        }, 100);
    }

    function video_views(els, r, c) {
        var pages = Math.ceil(els.length / (r * c));
        gen_pages(pages);

        function build_html(_f) {
            var descrp = eval('(' + _f.description + ')');
            var inf = get_icons(_f.file_type, _f.f_type);
            var _src = inf.p;
            if (descrp['shortcut'] !== 'UNKNOWN') {
                _src = UrlConfig.getPreviewURL() + '?uid=' + uid + '&fid=' + descrp.shortcut + '&f_type=video';
            }
            var html = '<div class="cell bg-cyan mr-3"><div class="mt-2 img-container thumbnail pos-top-center">';
            html += '<img src="' + _src + '" name="' + inf.t + '"></div>';
            html += '<div class="reduce-5 pos-bottom-center text-center"><div style="height: 54px">' + _f.file_name + '</div>';
            html += '<div>Size:' + _f.file_size + 'MB</div><div name="' + _f.file_type + '">';
            html += '<span class="mif-play ani-hover-flash mr-6 play" name="' + _f.fid + '"></span>';
            html += '<span class="mif-download ani-hover-flash  download" name="' + _f.fid + '"></span></div></div></div>';
            return html
        }

        function after_show() {
            $('.play').unbind();
            $('.download').unbind();
            $('.play').click(function () {
                var fid = $(this).attr('name');
                if (!fid) {
                    return;
                }
                var data = {
                    'uid': uid,
                    'fid': fid,
                    'f_type': 'video'
                };
                var rest_cache = new RestQueryAjax(cache_callback);
                rest_cache.cache_file_REST(data);
                $('body').append('<div class="overlay"><div class="pos-absolute pos-center"><div data-role="activity" data-type="cycle" data-style="color"></div>Processing Cache</div></div>');

                function cache_callback(res) {
                    $('.overlay').remove();
                    if (res.response.status === 200) {
                        window.open(UrlConfig.getBaseURI() + 'trans/resource/video/' + res.response.element.chd + '/' + res.response.element.name);
                    }
                }
            });
            $('.download').click(function () {
                var fid = $(this).attr('name');
                if (!fid) {
                    return;
                }
                window.open(UrlConfig.getBaseURI() + 'file/download?uid=' + uid + '&fid=' + fid);
            });
            $('.cell').css('max-height', '186px');
            $('img').css('max-height', '80px');
        }

        add_items(els, 0, r, c, build_html, after_show);
        setTimeout(function () {
            $('.wall').data('master').options.onBeforePage = function (dir, index, page, element) {
                if ((index + 1) < pages && dir === 'next') {
                    $('.wall').data('master').next();
                    add_items(els, index + 1, r, c, build_html, after_show);
                } else {
                    $('.wall').data('master').prev();
                    add_items(els, index - 1, r, c, build_html, after_show);
                }
            };
            $('.pages').height(r * (display['audio'][1] + 50));
        }, 100);
    }

    function music_views(els, r, c) {
        var pages = Math.ceil(els.length / (r * c));
        gen_pages(pages);
        play_list = [];
        var btn_play = '<button class="pos-absolute pos-bottom-center mt-10 play_list shortcut">';
        btn_play += '<span class="tag">0</span><span class="caption">PlayList</span>';
        btn_play += '<span class="mif-play icon"></span></button>';
        $('.navview-content').append(btn_play);
        $('.play_list').click(function () {
            if (play_list.length > 0) {
                var data = {
                    'uid': uid
                };
                var create_view = new RestQueryAjax(create_view_callback);
                create_view.create_views_REST(data);

                function create_view_callback(res) {
                    if (res.response.status === 200) {
                        data = {
                            'uid': uid,
                            'm_type': 'audio',
                            'ids': JSON.stringify(play_list)
                        };
                        var cache_list = new RestQueryAjax(cache_list_callback);
                        cache_list.cache_list_REST(data);

                        function cache_list_callback(res2) {
                            if (res2.response.status === 200) {
                                window.open('audio.html?uid=' + uid);
                            }
                        }
                    }
                }
            }
        });

        function build_html(_f) {
            var descrp = eval('(' + _f.description + ')');
            var inf = get_icons(_f.file_type, _f.f_type);
            var _src = inf.p;
            if (descrp['shortcut'] !== 'UNKNOWN') {
                _src = UrlConfig.getPreviewURL() + '?uid=' + uid + '&fid=' + descrp.shortcut + '&f_type=audio';
            }
            var html = '<div class="cell bg-cyan mr-3"><div class="mt-2 img-container thumbnail pos-top-center">';
            html += '<img src="' + _src + '" name="' + inf.t + '">';
            html += '<div class="image-overlay reduce-5 text-center"><div>Artist:\r\n' + descrp.artist + '</div>';
            html += '<div class="text-center">Album:\n' + descrp.album + '</div></div></div>';
            html += '<div class="reduce-5 pos-bottom-center text-center"><div  style="height:36px">' + _f.file_name + '</div>';
            html += '<div>Size:' + _f.file_size + 'MB</div><div name="' + _f.file_type + '">';
            html += '<span class="mif-plus ani-hover-flash mr-6 add_list" name="' + _f.fid + '"></span>';
            html += '<span class="mif-minus ani-hover-flash mr-6 remove_list" name="' + _f.fid + '"></span>';
            html += '<span class="mif-play ani-hover-flash mr-6 play" name="' + _f.fid + '"></span>';
            html += '<span class="mif-download ani-hover-flash  download" name="' + _f.fid + '"></span></div></div></div>';
            return html
        }

        function after_show() {
            $('.add_list').unbind();
            $('.play').unbind();
            $('.download').unbind();
            $('.add_list').click(function () {
                var fid = $(this).attr('name');
                if (fid && play_list.indexOf(fid) < 0) {
                    play_list.push(fid);
                    $('.play_list').find('.tag').html(play_list.length);
                }
                $(this).addClass('fg-red');
            });
            $('.remove_list').click(function () {
                var fid = $(this).attr('name');
                if (fid) {
                    if (play_list.indexOf(fid) >= 0) {
                        play_list.splice(play_list.indexOf(fid), 1);
                    }
                    $('.play_list').find('.tag').html(play_list.length);
                }
                $(this).siblings('.add_list').removeClass('fg-red');
            });
            $('.play').click(function () {
                var fid = $(this).attr('name');
                if (!fid) {
                    return;
                }
                var data = {
                    'uid': uid,
                    'fid': fid,
                    'f_type': 'audio'
                };
                var rest_cache = new RestQueryAjax(cache_callback);
                rest_cache.cache_file_REST(data);
                $('body').append('<div class="overlay"><div class="pos-absolute pos-center"><div data-role="activity" data-type="cycle" data-style="color"></div>Processing Cache</div></div>');

                function cache_callback(res) {
                    $('.overlay').remove();
                    if (res.response.status === 200) {
                        var _file_src = UrlConfig.getBaseURI() + 'trans/resource/audio/' + res.response.element.chd + '/' + res.response.element.name;
                    }
                }
            });
            $('.download').click(function () {
                var fid = $(this).attr('name');
                if (!fid) {
                    return;
                }
                window.open(UrlConfig.getBaseURI() + 'file/download?uid=' + uid + '&fid=' + fid);
            });
            $('.cell').css('max-width', '157px');
            $('.img-container').css('max-height', '130px');
            $('img').css('max-height', '128px');
        }

        add_items(els, 0, r, c, build_html, after_show);
        setTimeout(function () {
            $('.wall').data('master').options.onBeforePage = function (dir, index, page, element) {
                if ((index + 1) < pages && dir === 'next') {
                    $('.wall').data('master').next();
                    add_items(els, index + 1, r, c, build_html, after_show);
                } else {
                    $('.wall').data('master').prev();
                    add_items(els, index - 1, r, c, build_html, after_show);
                }
            };
            $('.pages').height(r * (display['audio'][1] + 50));
        }, 100);
    }

    function doc_views(els, r, c) {
        var pages = Math.ceil(els.length / (r * c));
        gen_pages(pages);

        function build_html(_f) {
            var inf = get_icons(_f.file_type, _f.f_type);
            var html = '<div class="cell mr-3"><div class="img-container pos-top-center">';
            html += '<img src="' + inf.p + '" name="' + inf.t + '"></div>';
            html += '<div style="font-size:10px" class="pos-bottom-center text-center"><div>' + _f.file_name + '</div>';
            html += '<div>Size:' + _f.file_size + 'MB</div><div name="' + _f.file_type + '">';
            html += '<span class="mif-eye ani-hover-flash mr-6 preview" name="' + _f.fid + '"></span>';
            html += '<span class="mif-download ani-hover-flash download" name="' + _f.fid + '"></span></div></div></div>';
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
                    $('body').append('<div class="overlay"><div class="pos-absolute pos-center"><div data-role="activity" data-type="cycle" data-style="color"></div>Processing Cache</div></div>');

                    function convert_callback(res) {
                        $('.overlay').remove();
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
                window.open(UrlConfig.getBaseURI() + 'file/download?uid=' + uid + '&fid=' + fid);
            });
            $('.cell').css('max-width', '128px');
            $('.img-container').css('max-height', '130px');
            $('img').css('max-height', '128px');
        }

        add_items(els, 0, r, c, build_html, after_show);
        setTimeout(function () {
            $('.wall').data('master').options.onBeforePage = function (dir, index, page, element) {
                if ((index + 1) < pages && dir === 'next') {
                    $('.wall').data('master').next();
                    add_items(els, index + 1, r, c, build_html, after_show);
                } else {
                    $('.wall').data('master').prev();
                    add_items(els, index - 1, r, c, build_html, after_show);
                }
            };
            $('.pages').height(r * (display['doc'][1] + 40));
        }, 100);
    }

    function package_views(els, r, c) {
        var pages = Math.ceil(els.length / (r * c));
        gen_pages(pages);

        function build_html(_f) {
            var inf = get_icons(_f.file_type, _f.f_type);
            var html = '<div class="cell mr-3"><div class="img-container pos-top-center">';
            html += '<img src="' + inf.p + '" name="' + inf.t + '"></div>';
            html += '<div style="font-size:10px" class="pos-bottom-center text-center"><div style="word-break:break-all;word-wrap:break-word">' + _f.file_name + '</div>';
            html += '<div >Size:' + _f.file_size + 'MB</div><div name="' + _f.file_type + '">';
            html += '<span class="mif-eye ani-hover-flash mr-6 preview" name="' + _f.fid + '"></span>';
            html += '<span class="mif-download ani-hover-flash download" name="' + _f.fid + '"></span></div></div></div>';
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
                    window.open(UrlConfig.getBaseURI() + 'trans/zip_list?uid=' + uid + "&fid=" + fid + '&ext=' + $(this).parent().attr('name'));
                }
            });
            $('.download').click(function () {
                var fid = $(this).attr('name');
                if (!fid) {
                    return;
                }
                window.open(UrlConfig.getBaseURI() + 'file/download?uid=' + uid + '&fid=' + fid);
            });
            $('.cell').css('max-width', '128px');
            $('.img-container').css('max-height', '130px');
            $('img').css('max-height', '128px');
        }

        add_items(els, 0, r, c, build_html, after_show);
        setTimeout(function () {
            $('.wall').data('master').options.onBeforePage = function (dir, index, page, element) {
                if ((index + 1) < pages && dir === 'next') {
                    $('.wall').data('master').next();
                    add_items(els, index + 1, r, c, build_html, after_show);
                } else {
                    $('.wall').data('master').prev();
                    add_items(els, index - 1, r, c, build_html, after_show);
                }
            };
            $('.pages').height(r * (display['doc'][1] + 40));
        }, 100);
    }

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
        $('.navview-content').html('<div class="wall bg-transparent" data-cls-control-prev="bg-white" data-control-title="page $1 of $2" data-cls-control-next="bg-white" data-cls-control-title="fg-white" data-role="master"></div>');
        for (var k = 0; k < pages; k++) {
            $('.wall').append('<div id="page' + k + '" class="page"><div class="grid"></div></div>');
        }
    };

    var debounce = function (func, threshold, execAsap) {
        var timeout;
        return function debounced() {
            var obj = this, args = arguments;

            function delayed() {
                if (!execAsap)
                    func.apply(obj, args);
                timeout = null;
            };
            if (timeout)
                clearTimeout(timeout);
            else if (execAsap)
                func.apply(obj, args);
            timeout = setTimeout(delayed, threshold || 100);
        };
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
            '.vsd': {'t': true, 'p': '../images/vsd.png'},
            '.vsdx': {'t': true, 'p': '../images/vsd.png'},
            '.txt': {'t': true, 'p': '../images/txt.png'},
            '.xml': {'t': false, 'p': '../images/xml.png'},
            '.json': {'t': false, 'p': '../images/json.png'},
            '.pdf': {'t': false, 'p': '../images/pdf.png'},
            '.csv': {'t': false, 'p': '../images/csv.png'},
            '.zip': {'t': true, 'p': '../images/zip.png'},
            '.rar': {'t': true, 'p': '../images/rar.png'},
            '.gz': {'t': true, 'p': '../images/zip.png'},
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

    function calrc(f_type) {
        var cw = display[f_type][0];
        var ch = display[f_type][1];
        var tw = $('.navview-content').width();
        var th = $('.navview-pane').height() - 160;
        var cc = Math.ceil(tw / cw) - 1;
        var rc = Math.ceil(th / ch) - 1;
        return [rc, cc];
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