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
            '_AC': new AudioContext()
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
        var data = {
            'uid': options.uid
        };
        var get_views = new RestQueryAjax(get_views_callback);
        get_views.get_views_REST(data);

        function get_views_callback(res) {
            if (res.response.status === 200) {
                var views = res.response.element;
                var recent_list = views.recent;
                recent_list.sort(function (a, b) {
                    return a.time > b.time ? 1 : -1;// 时间正序
                });
                var favorite_list = views.favorite;
                var custom_list = views.custom;
                for (var i = 0; i < recent_list.length; i++) {
                    $('.p_recent').append(build_list(recent_list[i]['info'], i + 1, 'recent', recent_list[i]['time']));
                }
                for (var i = 0; i < favorite_list.length; i++) {
                    $('.p_favor').append(build_list(favorite_list[i], i + 1, 'favorite', ''));
                }
                for (var i = 0; i < custom_list.length; i++) {
                    $('.p_cus').append(build_list(custom_list[i], i + 1, 'custom', ''));
                }
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
                var cache_list = res.response.element;
                for (var i = 0; i < cache_list.length; i++) {
                    $('.p_now').append(build_list(cache_list[i], i + 1, 'playing'), '');
                }
            }
        }
    };
    var bind_event = function () {
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

    var init_music = function (fid, fid_image, file_name) {
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
            html += '<div class="colspan-4 pt-2 pb-1 bg-transparent text-center">';
            btn_list = ['mif-play', 'mif-favorite', 'mif-folder-plus', 'mif-download', 'mif-bin'];
            html = add_button(btn_list, item, html);
        } else if (l_type === 'recent') {
            html += '<div class="cell pt-2 pb-2 pr-0 pl-0"><em>' + index + '</em></div>';
            html += '<div class="colspan-4 pt-2 pb-1 reduce-2">' + list_name + '</div>';
            html += '<div class="colspan-2 pt-2 pb-2 pl-0 fg-gray reduce-5">' + cal_time(bz) + '</div>';
            html += '<div class="colspan-4 pt-2 pb-1 bg-transparent text-center">';
            btn_list = ['mif-plus', 'mif-play', 'mif-favorite', 'mif-folder-plus', 'mif-download', 'mif-bin'];
            html = add_button(btn_list, item, html);
        } else if (l_type === 'favorite') {
            html += '<div class="cell pt-2 pb-2 pr-0 pl-0"><em>' + index + '</em></div>';
            html += '<div class="cell pt-2 pb-2 pl-0"><span class="mif-favorite fg-red"></span></div>';
            html += '<div class="colspan-5 pt-2 pb-1 reduce-2">' + list_name + '</div>';
            html += '<div class="colspan-4 pt-2 pb-1 bg-transparent text-center">';
            btn_list = ['mif-plus', 'mif-play', 'mif-folder-plus', 'mif-download', 'mif-bin'];
            html = add_button(btn_list, item, html);
        } else {
            html += '<div class="cell pt-2 pb-2 pr-0 pl-0"><em>' + index + '</em></div>';
            html += '<div class="colspan-6 pt-2 pb-1 reduce-2">' + list_name + '</div>';
            html += '<div class="colspan-4 pt-2 pb-1 bg-transparent text-center">';
            btn_list = ['mif-plus', 'mif-play', 'mif-favorite', 'mif-download', 'mif-bin'];
            html = add_button(btn_list, item['info'], html);
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