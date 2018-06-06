define(function () {
    window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;
    var cwidth, cheight, meterWidth, gap, capHeight, capStyle, meterNum, capYPositionArray = [], ctx, _AC, _analyzer,
        gradient;
    var _audio = $('audio')[0];
    var canvas = document.getElementById('canvas');
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
        //stares();
        ctx.clearRect(0, 0, cwidth, cheight);
        $('.controls').addClass('disabled');
        $('.controls').height(80);
        bind_event();
    };
    var set_val = function () {
        canvas.width = $('#canvas').width();
        canvas.height = $('#canvas').height();
        cwidth = canvas.width;
        cheight = canvas.height - 2;
        meterWidth = 10; //width of the meters in the spectrum
        gap = 2; //gap between meters
        capHeight = 2;
        capStyle = '#fff';
        meterNum = canvas.width / (10 + 2); //count of the meters
        capYPositionArray = []; ////store the vertical position of hte caps for the preivous frame
        ctx = canvas.getContext('2d');
        gradient = ctx.createLinearGradient(0, 0, 0, 500);
        gradient.addColorStop(1, 'red');
        gradient.addColorStop(0.5, 'cyan');
        gradient.addColorStop(0, 'yellow');
    };
    var bind_event = function () {
        _wave_surfer.on('loading', function (per) {
            $('#donut_val').data('donut').val(per);
        });
        _wave_surfer.on('ready', function () {
            $('#donut_val').addClass('d-none');
            _wave_surfer.setMute(true);
            $('.controls').removeClass('disabled');
        });
        $(_audio).data('audio').options.onPlay = function () {
            _wave_surfer.play();
        };
        $(_audio).data('audio').options.onPause = function () {
            _wave_surfer.pause();
            var per = $('.stream-slider').find('.marker').find('.hint').html();
            if (per === '0') {
                _wave_surfer.stop();
            }
        };
        $(_audio).data('audio').options.onStop = function () {
            _wave_surfer.stop();
        };
        $(_audio).data('audio').options.onEnd = function () {
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
            _audio.currentTime = _wave_surfer.getCurrentTime()
        });
    };
    var init_music = function (src) {
        clear();
        $('#donut_val').removeClass('d-none');
        $('#donut_val').data('donut').val(0);
        _audio.src = src;
        _audio.crossOrigin = "anonymous";
        _wave_surfer.load(src);
        _AC = new AudioContext();
        _analyzer = _AC.createAnalyser();
        var audioSrc = _AC.createMediaElementSource(_audio);
        audioSrc.connect(_analyzer);
        _analyzer.connect(_AC.destination);
    };

    var clear = function () {
        if (_analyzer) {
            _analyzer.disconnect(_AC.destination);
        }
        ctx.clearRect(0, 0, cwidth, cheight);
        if (_AC) {
            _AC.close().then();
            _AC = null;
        }
        _analyzer = null;

    };

    function renderFrame() {
        var array = new Uint8Array(_analyzer.frequencyBinCount);
        _analyzer.getByteFrequencyData(array);
        var step = Math.round(array.length / 512); //sample limited data from the total array
        ctx.clearRect(0, 0, cwidth, cheight);
        for (var i = 0; i < meterNum; i++) {
            var value = array[i * step];
            if (capYPositionArray.length < Math.round(meterNum)) {
                capYPositionArray.push(value);
            }
            ctx.fillStyle = capStyle;
            //draw the cap, with transition effect
            if (value < capYPositionArray[i]) {
                ctx.fillRect(i * 12, cheight - (--capYPositionArray[i]), meterWidth, capHeight);
            } else {
                ctx.fillRect(i * 12, cheight - value, meterWidth, capHeight);
                capYPositionArray[i] = value;
            }
            ctx.fillStyle = gradient;
            ctx.fillRect(i * 12, cheight - value + capHeight, meterWidth, cheight);
        }
        requestAnimationFrame(renderFrame);
    }

    return {
        'init': init,
        'init_music': init_music
    }
});