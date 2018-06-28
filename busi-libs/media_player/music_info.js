define(function () {
    var current_infos = null;
    var file_info = null;
    var current_index = 0;
    var current_t = null;
    var line_height = 24;
    var init = function () {
        setFrameHtml();


    };

    var setFrameHtml = function () {
        var html = '<div class="w-100 overflow music_info mt-2">';
        html += '<ul class="t-menu open horizontal compact align-right">';
        html += '<li><a class="m_title" href="javascript:" style="width: 400px;text-align: center"></a></li>';
        html += '<li><a id="change_lrc" href="javascript:"><span class="mif-featured-play-list icon"></span></a></li>';
        html += '<li><a href="javascript:"><span class="mif-info icon"></span></a></li>';
        html += '</ul></div><div class="lyric h-100 mb-4 no-overflow">';
        html += '<ul class="lrc text-center fg-white" style="height: 180px;list-style-type:none" id="lrc">暂无歌词</ul></div>';
        $('.info').append(html);
    };

    var init_song = function (fid, uid, song_name, lyric_info) {
        $('.m_title').html('');
        $('.lrc').html('暂无歌词');
        if (lyric_info !== 0) {
            build_lyric(eval('(' + lyric_info + ')'));
            $('.m_title').html(song_name);
            return;
        }
        get_info(fid, uid);
        var data = {
            'uid': uid,
            'song_name': song_name
        };
        var rest_info = new RestQueryAjax(info_callback);
        rest_info.get_info_REST(data);

        function info_callback(res) {
            if (res.response.status === 200) {
                current_infos = res.response.element;
                $('.change_lrc').unbind();
                $('.change_lrc').click(change_lyric);
                if ($('.lrc').html() !== '暂无歌词') {
                    return;
                }
                for (var i = 0; i < current_infos.length; i++) {
                    if (current_infos[i].lyric !== 'UNKNOWN') {
                        var lyric_list = current_infos[i].lyric;
                        build_lyric(lyric_list);
                        current_index = i;
                        $('.m_title').html(current_infos[i].song_name);
                        break;
                    }
                }
            }
        }
    };

    var find_now = function (t) {
        var current_time = parseInt(t);
        $('.lr_line').removeClass('now');
        $('.lr_line').removeClass('pre_now');
        for (var i = 0; i < $('.lr_line').length; i++) {
            var line_time = parseInt($('.lr_line').eq(i).attr('id'));
            if (line_time >= current_time) {
                clearTimeout(current_t);
                $('.lr_line').eq(i).addClass('now');
                if (i > 3) {
                    var sco = document.getElementById('lrc');
                    sco.scrollTop = (i + 1 - 4) * $('.lr_line')[0].clientHeight;
                }
                var next_line = $('.lr_line').eq($('.now').index() + 1);
                var next_time = parseFloat($(next_line).attr('id'));
                var gap = next_time - t;
                $(next_line).addClass('pre_now');
                current_t = setTimeout(function () {
                    console.log('next');
                    $('.lr_line').removeClass('now');
                    $(next_line).addClass('now').removeClass('pre_now');
                    if ($('.lr_line').length > 0) {
                        line_height = $('.lr_line')[0].clientHeight;
                    }
                    if ($(next_line)[0].offsetTop > line_height * 4) {
                        var index = $(next_line).index() + 1 - 4;
                        var sco = document.getElementById('lrc');
                        sco.scrollTop = index * $('.lr_line')[0].clientHeight;
                    }
                }, gap * 1000);
                break;
            }
        }
    };

    var clear = function () {
        $('.lr_line').removeClass('now');
        clearTimeout(current_t);
    };

    var pause = function () {
        clearTimeout(current_t);
        $('.pre_now').removeClass('pre_now');
    };

    var scroll = function (t) {
        var current_time = $('.now').length > 0 ? parseInt($('.now').attr('id')) : 0;
        if ($('.now').index() + 1 === $('.lr_line').length) {
            return;
        }
        if (current_time === 0) {
            $('.lr_line').eq(0).addClass('now');
        }
        if (parseInt(t) >= current_time && $('.pre_now').length === 0) {
            var next_line = $('.lr_line').eq($('.now').index() + 1);
            var next_time = parseFloat($(next_line).attr('id'));
            var gap = next_time - t;
            $(next_line).addClass('pre_now');
            current_t = setTimeout(function () {
                console.log('next');
                $('.lr_line').removeClass('now');
                $('.pre_now').removeClass('pre_now');
                $(next_line).addClass('now');
                if ($('.lr_line').length > 0) {
                    line_height = $('.lr_line')[0].clientHeight;
                }
                if ($(next_line)[0].offsetTop > line_height * 4) {
                    var index = $(next_line).index() + 1 - 4;
                    var sco = document.getElementById('lrc');
                    sco.scrollTop = index * $('.lr_line')[0].clientHeight;
                }
            }, gap * 1000);
        }
    };

    var get_info = function (fid, uid) {
        var data = {
            'uid': uid,
            'fid': fid
        };
        var rest_info = new RestQueryAjax(info_callback);
        rest_info.get_audio_info_REST(data);

        function info_callback(res) {
            if (res.response.status === 200) {
                if (res.response.element.length > 0) {
                    file_info = eval('(' + res.response.element[0].description + ")");
                }
            }
        }
    };

    var change_lyric = function () {
        var html = '<select data-role="select" class="mt-2 lrc_select">';
        for (var i = 0; i < current_infos.length; i++) {
            if (current_infos[i].lyric !== 'UNKNOWN') {
                html += "<option value='" + i + "'>" + current_infos[i].song_name + '(' + current_infos[i].song_id + ')' + "</option>";
            }
        }
        html += '</select>';
        Metro.dialog.create({
            title: 'Select A Lyric From List',
            content: html,
            width: 500,
            actions: [
                {
                    caption: "<span class='mif-checkmark'></span> OK",
                    cls: "alert",
                    onclick: function () {
                        clear();
                        $('.lrc').html('暂无歌词');
                        current_index = $('.lrc_select')[0].children[0].selectedIndex;
                        build_lyric(current_infos[current_index].lyric);
                        $('.m_title').html(current_infos[current_index].song_name);
                        Metro.dialog.close($('.dialog'));
                    }
                },
                {
                    caption: "<span class='mif-cross'></span> Cancel",
                    cls: "js-dialog-close"
                }
            ]
        });
    };

    var update_info = function () {
        var html = '';
    };

    function build_lyric(lyric_list) {
        $('.lrc').html('');
        for (var j = 0; j < lyric_list.length; j++) {
            $('.lrc').append('<li class="lr_line" id="' + lyric_list[j].sec + '">' + lyric_list[j].text + '</li>');
        }
        $('.lrc').niceScroll({
            'cursorwidth': '8px',
            'cursorcolor': '#388cd2',
            'cursorborderradius': '5px',
            'cursoropacitymax': 0.8,
            'mousescrollstep': 100
        });
        $('.lr_line').removeClass('now');
    }

    return {
        'init': init,
        'init_song': init_song,
        'go': scroll,
        'clear': clear,
        'find': find_now,
        'pause': pause
    }
});