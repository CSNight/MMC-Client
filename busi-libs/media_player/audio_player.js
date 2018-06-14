define(function () {
    window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;
    var options = {};
    var _wave_surfer = window.WaveSurfer.create({
        container: '#waveform',
        waveColor: 'cyan',
        progressColor: '#ffffcc',
        splitChannels: true,
        plugins: [
            window.WaveSurfer.timeline.create({
                container: '#wave-timeline',
                primaryColor: '#fff',
                secondaryColor: '#fff',
                primaryFontColor: '#fff',
                secondaryFontColor: '#fff'
            }),
            window.WaveSurfer.regions.create({
                dragSelection: true
            })
        ]
    });

    var init = function () {
        set_val();
        init_list();
        options.ctx.clearRect(0, 0, options.cwidth, options.cheight);
        $('.controls').addClass('disabled');
        $('.controls').height(80);
        bind_event();
    };

    var set_val = function () {
        options = {
            'uid': getQueryString('uid'),
            'canvas': document.getElementById('canvas'),
            '_audio': $('audio')[0],
            'meterWidth': 10,//width of the meters in the spectrum
            'gap': 2, //gap between meters
            'capHeight': 2,
            'capStyle': '#fff',
            'capYPositionArray': [],//store the vertical position of hte caps for the previous frame
            '_AC': new AudioContext(),
            'cur_state': 'loop',
            'cur_play': 0
        };
        options.canvas.width = $('#canvas').width();
        options.canvas.height = $('#canvas').height();
        options.cwidth = options.canvas.width;
        options.cheight = options.canvas.height - 2;
        options.meterNum = options.canvas.width / (10 + 2);//count of the meters
        options.ctx = options.canvas.getContext('2d');
        options.gradient = options.ctx.createLinearGradient(0, 0, 0, 500);
        options.gradient.addColorStop(1, 'red');
        options.gradient.addColorStop(0.5, 'cyan');
        options.gradient.addColorStop(0, 'yellow');
        options._analyzer = options._AC.createAnalyser();
        options._audioSrc = options._AC.createMediaElementSource(options._audio);
        options._audioSrc.connect(options._analyzer);
        options._analyzer.connect(options._AC.destination);
    };

    var init_list = function () {
        clear();
        var data = {
            'uid': options.uid
        };
        var get_views = new RestQueryAjax(get_views_callback);
        get_views.get_views_REST(data);

        function get_views_callback(res) {
            if (res.response.status === 200) {
                var views = res.response.element;
                options.recent_list = views.recent;
                options.recent_list.sort(function (a, b) {
                    return a.time > b.time ? 1 : -1;// 时间正序
                });
                options.favorite_list = views.favorite;
                options.custom_list = views.custom;
                for (var i = 0; i < options.recent_list.length; i++) {
                    $('.p_recent').append(build_list(options.recent_list[i]['info'], i + 1, 'recent', options.recent_list[i]['time']));
                }
                bind_list_btn_event('.p_recent');
                for (var i = 0; i < options.favorite_list.length; i++) {
                    $('.p_favor').append(build_list(options.favorite_list[i], i + 1, 'favorite', ''));
                }
                bind_list_btn_event('.p_favor');
                for (var i = 0; i < options.custom_list.length; i++) {
                    $('.p_cus').append(build_list(options.custom_list[i], i + 1, 'custom', ''));
                }
                bind_list_btn_event('.p_cus');
            }
        }

        data = {
            'uid': options.uid,
            'm_type': 'audio'
        };
        var get_cache = new RestQueryAjax(get_lists_callback);
        get_cache.get_list_REST(data);

        function get_lists_callback(res) {
            if (res.response.status === 200) {
                options.cache_list = res.response.element;
                for (var i = 0; i < options.cache_list.length; i++) {
                    $('.p_now').append(build_list(options.cache_list[i], i + 1, 'playing', ''));
                }
                bind_list_btn_event('.p_now');
            }
        }
    };

    var bind_event = function () {
        $('.clear_list').click(function () {
            $('.p_now').html('');
            options.cache_list = [];
        });
        $('.loop_type').click(function () {
            var state = ['mif-loop', 'mif-shuffle', 'mif-infinite'];
            var cur_state = $(this).find('span').attr('class');
            var index = state.indexOf(cur_state);
            if (index === 2) {
                index = 0
            } else {
                index = index + 1;
            }
            options.cur_state = state[index].replace('mif-', '');
            $(this).find('span').attr('class', state[index]);
        });
        _wave_surfer.on('loading', function (per) {
            $('#donut_val').data('donut').val(per);
        });
        _wave_surfer.on('ready', function () {
            $('#donut_val').addClass('d-none');
            _wave_surfer.setMute(true);
            $('.play_bar').unbind();
            $('.play_bar').click(function () {
                if ($('.play_bar').hasClass('playing')) {
                    $('.play_bar').removeClass('playing');
                    options._audio.pause();
                } else {
                    $('.play_bar').addClass('playing');
                    options._audio.play();
                }
            });
            $('.controls').removeClass('disabled');
            options._audio.play();
        });
        $(options._audio).data('audio').options.onPlay = function () {
            if (!$('.play_bar').hasClass('playing')) {
                $('.play_bar').addClass('playing');
            }
            _wave_surfer.play();
            $('.play_disk').addClass('ani-rotate');
        };
        $(options._audio).data('audio').options.onPause = function () {
            if ($('.play_bar').hasClass('playing')) {
                $('.play_bar').removeClass('playing');
            }
            $('.play_disk').removeClass('ani-rotate');
            _wave_surfer.pause();
            var per = $('.stream-slider').find('.marker').find('.hint').html();
            if (per === '0') {
                _wave_surfer.stop();
            }
        };
        $(options._audio).data('audio').options.onStop = function () {
            if ($('.play_bar').hasClass('playing')) {
                $('.play_bar').removeClass('playing');
            }
            $('.play_disk').removeClass('ani-rotate');
            _wave_surfer.stop();
        };
        $(options._audio).data('audio').options.onEnd = function () {
            if ($('.play_bar').hasClass('playing')) {
                $('.play_bar').removeClass('playing');
            }
            $('.play_disk').removeClass('ani-rotate');
            _wave_surfer.stop();
            $('.p_now').find('.row').eq(get_next_play()).find('.mif-play').click();
        };
        $('.stream-slider').find('.marker')[0].onmouseup = function () {
            var per = $('.stream-slider').find('.marker').find('.hint').html();
            _wave_surfer.seekTo(per / 100);
        };
        $('.stream-slider').click(function () {
            var per = $('.stream-slider').find('.marker').find('.hint').html();
            _wave_surfer.seekTo(per / 100);
        });
        _wave_surfer.on('play', function () {
            renderFrame();
        });
        _wave_surfer.on('seek', function (per) {
            options._audio.currentTime = _wave_surfer.getCurrentTime()
        });
    };

    var bind_list_btn_event = function (par_c) {
        $(par_c).find('.no-decor').find('.mif-plus').unbind();
        $(par_c).find('.no-decor').find('.mif-bin').unbind();
        $(par_c).find('.no-decor').find('.mif-play').unbind();
        $(par_c).find('.no-decor').find('.mif-favorite').unbind();
        $(par_c).find('.no-decor').find('.mif-download').unbind();
        $(par_c).find('.no-decor').find('.mif-folder-plus').unbind();
        $(par_c).find('.no-decor').find('.mif-plus').click(function () {
            var fid = $(this).parent().attr('id');
            var list_t = $(this).parent().parent().attr('id');
            var origin_list = options[list_t];
            logic_now_recent(fid, list_t, origin_list);
        });
        $(par_c).find('.no-decor').find('.mif-bin').click(function () {
            var fid = $(this).parent().attr('id');
            var list_t = $(this).parent().parent().attr('id');
            if (list_t === 'cache_list') {
                $(this).parent().parent().parent().remove();
                return;
            }
            var data = {
                'uid': options.uid,
                'op_type': 'delete',
                'col': list_t.replace('_list', ''),
                'ids': JSON.stringify([fid])
            };
            var modify_rest = new RestQueryAjax(modify_callback);
            modify_rest.modify_views_REST(data);

            function modify_callback(res) {
                if (res.response.status === 200) {
                    $(par_c).find('#' + fid).parent().parent().remove();
                }
            }
        });
        $(par_c).find('.no-decor').find('.mif-play').click(function () {
            var fid = $(this).parent().attr('id');
            var list_t = $(this).parent().parent().attr('id');
            var origin_list = options[list_t];
            if (list_t !== 'cache_list') {
                logic_now_recent(fid, list_t, origin_list);
            }
            for (var i = 0; i < origin_list.length; i++) {
                if (list_t === 'recent_list') {
                    if (fid === origin_list[i]['info'].fid) {
                        var img_fid = eval('(' + origin_list[i]['info'].description + ')').shortcut;
                        init_music(fid, img_fid, origin_list[i]['info'].file_name);
                    }
                } else {
                    if (fid === origin_list[i].fid) {
                        var img_fid = eval('(' + origin_list[i].description + ')').shortcut;
                        init_music(fid, img_fid, origin_list[i].file_name);
                    }
                }
            }
            options.cur_play = $('.p_now').find('#' + fid).parent().parent().index();
        });
        $(par_c).find('.no-decor').find('.mif-favorite').click(function () {
            var fid = $(this).parent().attr('id');
            var data = {
                'uid': options.uid,
                'op_type': 'add',
                'col': 'favorite',
                'ids': JSON.stringify([fid])
            };
            var modify_rest = new RestQueryAjax(modify_callback);
            modify_rest.modify_views_REST(data);

            function modify_callback(res) {
                if (res.response.status === 200) {
                    init_favorite();
                    $('.p_favor').parent().parent().find('.heading').click();
                }
            }
        });
        $(par_c).find('.no-decor').find('.mif-download').click(function () {
            var fid = $(this).parent().attr('id');
            if (!fid) {
                return;
            }
            window.open(UrlConfig.getBaseURI() + 'file/download?uid=' + options.uid + '&fid=' + fid);
        });
        $(par_c).find('.no-decor').find('.mif-folder-plus').click(function () {
            var fid = $(this).parent().attr('id');
            var data = {
                'uid': options.uid,
                'op_type': 'add',
                'col': 'custom',
                'ids': JSON.stringify([fid])
            };
            var modify_rest = new RestQueryAjax(modify_callback);
            modify_rest.modify_views_REST(data);

            function modify_callback(res) {
                if (res.response.status === 200) {
                    init_custom();
                    $('.p_cus').parent().parent().find('.heading').click();
                }
            }
        });
    };

    var init_recent = function () {
        var data = {
            'uid': options.uid
        };
        var get_views = new RestQueryAjax(get_views_callback);
        get_views.get_views_REST(data);

        function get_views_callback(res) {
            if (res.response.status === 200) {
                $('.p_recent').html('');
                var views = res.response.element;
                options.recent_list = views.recent;
                options.recent_list.sort(function (a, b) {
                    return a.time > b.time ? 1 : -1;// 时间正序
                });
                for (var i = 0; i < options.recent_list.length; i++) {
                    $('.p_recent').append(build_list(options.recent_list[i]['info'], i + 1, 'recent', options.recent_list[i]['time']));
                }
                bind_list_btn_event('.p_recent');
            }
        }
    };

    var init_favorite = function () {
        var data = {
            'uid': options.uid
        };
        var get_views = new RestQueryAjax(get_views_callback);
        get_views.get_views_REST(data);

        function get_views_callback(res) {
            if (res.response.status === 200) {
                $('.p_favor').html('');
                var views = res.response.element;
                options.favorite_list = views.favorite;
                for (var i = 0; i < options.favorite_list.length; i++) {
                    $('.p_favor').append(build_list(options.favorite_list[i], i + 1, 'favorite', ''));
                }
                bind_list_btn_event('.p_favor');
            }
        }
    };

    var init_custom = function () {
        var data = {
            'uid': options.uid
        };
        var get_views = new RestQueryAjax(get_views_callback);
        get_views.get_views_REST(data);

        function get_views_callback(res) {
            if (res.response.status === 200) {
                $('.p_cus').html('');
                var views = res.response.element;
                options.custom_list = views.custom;
                for (var i = 0; i < options.custom_list.length; i++) {
                    $('.p_cus').append(build_list(options.custom_list[i], i + 1, 'custom', ''));
                }
                bind_list_btn_event('.p_cus');
            }
        }
    };

    var init_music = function (fid, fid_image, file_name) {
        options._audio.pause();
        $('.controls').addClass('disabled');
        $('.play_bar').unbind();
        var data = {
            'uid': options.uid,
            'fid': fid,
            'f_type': 'audio'
        };
        var rest_cache = new RestQueryAjax(cache_callback);
        rest_cache.cache_file_REST(data);

        function cache_callback(res) {
            if (res.response.status === 200) {
                var src = UrlConfig.getBaseURI() + 'trans/resource/audio/' + res.response.element.chd + '/' + res.response.element.name;
                options.ctx.clearRect(0, 0, options.cwidth, options.cheight);
                $('#donut_val').removeClass('d-none');
                $('#donut_val').data('donut').val(0);
                options._audio.crossOrigin = "anonymous";
                options._audio.src = src;
                options._audio.crossOrigin = "anonymous";
                _wave_surfer.load(src);
            }
        }

        if (fid_image !== 'UNKNOWN') {
            $('.m_thumbnail').attr('src', UrlConfig.getPreviewURL() + '?uid=' + options.uid + '&fid=' + fid_image + '&f_type=audio');
        } else {
            $('.m_thumbnail').attr('src', '../images/music.jpg');
        }
        $('.m_name').html(file_name);
    };

    var clear = function () {
        $('.p_recent').html('');
        $('.p_favor').html('');
        $('.p_now').html('');
        $('.p_cus').html('');
        options._audio.pause();
    };

    function logic_now_recent(fid, list_t, origin_list) {
        if (!check_contains(fid, '.p_now')) {
            for (var i = 0; i < origin_list.length; i++) {
                var index = $('.p_now').find('.row').length + 1;
                if (list_t === 'recent_list') {
                    if (fid === origin_list[i]['info'].fid) {
                        $('.p_now').append(build_list(origin_list[i]['info'], index, 'playing', ''));
                        options.cache_list.push(origin_list[i]['info']);
                        break;
                    }
                } else {
                    if (fid === origin_list[i].fid) {
                        $('.p_now').append(build_list(origin_list[i], index, 'playing', ''));
                        options.cache_list.push(origin_list[i]);
                        break;
                    }
                }
            }
        }
        bind_list_btn_event('.p_now');
        if (list_t !== 'recent_list') {
            var data = {
                'uid': options.uid,
                'op_type': 'add',
                'col': 'recent',
                'ids': JSON.stringify([fid])
            };
            var modify_rest = new RestQueryAjax(modify_callback);
            modify_rest.modify_views_REST(data);

            function modify_callback(res) {
                if (res.response.status === 200) {
                    init_recent();
                }
            }
        }
    }

    function check_contains(fid, col) {
        var is_c = false;
        $(col).find('.row').each(function () {
            if ($(this).find('.no-decor').attr('id') === fid) {
                is_c = true;
                return true;
            }
        });
        return is_c;
    }

    function get_next_play() {
        var total = $('.p_now').find('.row').length;
        if (options.cur_state === 'loop') {
            if ((options.cur_play + 1) === total) {
                return 0;
            } else {
                return options.cur_play + 1;
            }
        } else if (options.cur_state === 'shuffle') {
            var cur = Math.floor(Math.random() * total);
            if (cur === options.cur_play) {
                cur = Math.floor(Math.random() * total);
            }
            return cur;
        } else {
            return options.cur_play;
        }
    }

    function build_list(item, index, l_type, bz) {
        var html = '<div class="row bg-white fg-dark mr-2 ml-2 border-1 bd-red border-bottom">';
        html += '<div class="cell pt-2 pb-2 pr-0"><span class="mif-file-music fg-red"></span></div>';
        var btn_list = [];
        var list_name = item.file_name.replace('.mp3', '');
        if (list_name.length > 10) {
            list_name = list_name.substring(0, 10) + '...'
        }
        if (l_type === 'playing') {
            html += '<div class="cell pt-2 pb-2 pr-0 pl-0"><em>' + index + '</em></div>';
            html += '<div class="colspan-6 pt-2 pb-1 reduce-2">' + list_name + '</div>';
            html += '<div id="cache_list" class="colspan-4 pt-2 pb-1 bg-transparent text-center">';
            btn_list = ['mif-play', 'mif-favorite', 'mif-folder-plus', 'mif-download', 'mif-bin'];
            html = add_button(btn_list, item, html);
        } else if (l_type === 'recent') {
            html += '<div class="cell pt-2 pb-2 pr-0 pl-0"><em>' + index + '</em></div>';
            html += '<div class="colspan-4 pt-2 pb-1 reduce-2">' + list_name + '</div>';
            html += '<div class="colspan-2 pt-2 pb-2 pl-0 fg-gray reduce-5">' + cal_time(bz) + '</div>';
            html += '<div id="recent_list" class="colspan-4 pt-2 pb-1 bg-transparent text-center">';
            btn_list = ['mif-plus', 'mif-play', 'mif-favorite', 'mif-folder-plus', 'mif-download', 'mif-bin'];
            html = add_button(btn_list, item, html);
        } else if (l_type === 'favorite') {
            html += '<div class="cell pt-2 pb-2 pr-0 pl-0"><em>' + index + '</em></div>';
            html += '<div class="cell pt-2 pb-2 pl-0"><span class="mif-favorite fg-red"></span></div>';
            html += '<div class="colspan-5 pt-2 pb-1 reduce-2">' + list_name + '</div>';
            html += '<div id="favorite_list" class="colspan-4 pt-2 pb-1 bg-transparent text-center">';
            btn_list = ['mif-plus', 'mif-play', 'mif-folder-plus', 'mif-download', 'mif-bin'];
            html = add_button(btn_list, item, html);
        } else {
            html += '<div class="cell pt-2 pb-2 pr-0 pl-0"><em>' + index + '</em></div>';
            html += '<div class="colspan-6 pt-2 pb-1 reduce-2">' + list_name + '</div>';
            html += '<div id="custom_list" class="colspan-4 pt-2 pb-1 bg-transparent text-center">';
            btn_list = ['mif-plus', 'mif-play', 'mif-favorite', 'mif-download', 'mif-bin'];
            html = add_button(btn_list, item, html);
        }
        return html;
    }

    function add_button(button_list, item, str) {
        for (var i = 0; i < button_list.length; i++) {
            str += '<a id="' + item.fid + '" class="no-decor fg-red mr-2" href="javascript:"><span class="' + button_list[i] + '"></span></a>';
        }
        str += '</div></div>';
        return str
    }

    function cal_time(index) {
        if (index > 8) {
            return '';
        }
        var d_time = ['one day', 'two days', 'three days', 'four days', 'five days', 'six days', 'a week', 'a month', 'over a month'];
        return d_time[index];
    }

    function renderFrame() {
        var array = new Uint8Array(options._analyzer.frequencyBinCount);
        options._analyzer.getByteFrequencyData(array);
        var step = Math.round(array.length / 512); //sample limited data from the total array
        options.ctx.clearRect(0, 0, options.cwidth, options.cheight);
        for (var i = 0; i < options.meterNum; i++) {
            var value = array[i * step];
            if (options.capYPositionArray.length < Math.round(options.meterNum)) {
                options.capYPositionArray.push(value);
            }
            options.ctx.fillStyle = options.capStyle;
            //draw the cap, with transition effect
            if (value < options.capYPositionArray[i]) {
                options.ctx.fillRect(i * 12, options.cheight - (--options.capYPositionArray[i]), options.meterWidth, options.capHeight);
            } else {
                options.ctx.fillRect(i * 12, options.cheight - value, options.meterWidth, options.capHeight);
                options.capYPositionArray[i] = value;
            }
            options.ctx.fillStyle = options.gradient;
            options.ctx.fillRect(i * 12, options.cheight - value + options.capHeight, options.meterWidth, options.cheight);
        }
        requestAnimationFrame(renderFrame);
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

    return {
        'init': init,
        'init_music': init_music
    }
});