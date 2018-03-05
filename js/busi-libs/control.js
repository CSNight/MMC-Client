define(function () {
    var initToggleThemeView = function (handle_event) {
        var info = L.control({position: 'bottomleft'});
        info.onAdd = function () {
            var popup = L.DomUtil.create('div');
            popup.innerHTML = "<div class='btn-group' role='group' aria-label='...'>" +
                "<button  value='grid' type='button' class='btn btn-default'>格网图</button>" +
                "<button value='heatmap' type='button' class='btn btn-default'>热力图</button></div>";
            handle_event(popup, map);
            return popup;
        };
        info.addTo(map);
    };
    //初始化时间控制控件，仅UI
    var initTimeControlView = function (loadLiveData, options_module) {
        var control = L.control({position: "topright"});
        control.onAdd = function () {
            var me = this;
            me._div = L.DomUtil.create('div', 'panel panel-primary controlPane');
            me._div.style.width = "300px";
            $("<div class='panel-heading text-center' id='toggle' style='cursor: pointer'>" +
                "<span class='panel-title text-center'>控制台</span>&nbsp;" +
                "<span class='glyphicon glyphicon-triangle-top' id='toggleIcon' ></span></div>").appendTo(me._div);
            var contentDiv = $("<div class='panel-body content center-block' style='font-size: 14px'></div>").appendTo(me._div);
            var optionsDiv = $("<div class='' id='options'></div>").appendTo(contentDiv);
            var defaultOption = options_module.DefaultControlOptions();
            $("<div class='form-group form-inline'><label class='text-right' for='startTime' >起始时间</label>" +
                "<input id='startTime' type='text' class='form-control.js input-sm' placeholder='" + defaultOption.startTime +
                "' value='" + defaultOption.startTime + "'/></div></div>").appendTo(optionsDiv);
            $("<div class='form-group form-inline'><label class='text-right' for='endTime' >终止时间</label>" +
                "<input id='endTime' type='text' class='form-control.js input-sm' placeholder='" + defaultOption.endTime +
                "' value='" + defaultOption.endTime + "'/></div></div>").appendTo(optionsDiv);
            $("<div class='form-group form-inline'><label class='text-right' for='speed' >刷新步长(ms)</label>" +
                "<input id='speed' type='number' min='1' class='form-control.js input-sm' placeholder='" + defaultOption.speed +
                "' value='" + defaultOption.speed + "'/></div></div>").appendTo(optionsDiv);
            $("<div class='form-group form-inline'><label class='text-right' for='frequency' >刷新频率(ms)</label>" +
                "<input id='frequency' type='number' min='1' class='form-control.js input-sm' placeholder='" + defaultOption.frequency +
                "' value='" + defaultOption.frequency + "'/></div></div>").appendTo(optionsDiv);
            $("<div class='form-group'><div class='form-horizontal text-center'><div class='form-group'>" +
                "<label  for='progress'>当前时间：</label><span class='form-control.js-static' id='progress'>未开始</span>" +
                "</div></div></div>").appendTo(contentDiv);
            $("<section><div class='form-inline text-center'>" +
                "<input id='start' type='button'  class='btn btn-default text-center' value='开始'/>&nbsp;" +
                "<input id='pause' type='button'  class='btn btn-default text-center' value='暂停'/>&nbsp;" +
                "<input id='stop' type='button'  class='btn btn-default text-center' value='停止'/>" +
                "</div></section>").appendTo(contentDiv);
            me._div.addEventListener('mouseover', function () {
                me._map.dragging.disable();
                me._map.scrollWheelZoom.disable();
                me._map.doubleClickZoom.disable();
            });
            me._div.addEventListener('mouseout', function () {
                me._map.dragging.enable();
                me._map.scrollWheelZoom.enable();
                me._map.doubleClickZoom.enable();
            });
            return me._div;
        };
        control.addTo(map);
        var dateOptions = {
            format: "YYYY-MM-DD HH:mm:ss",
            stepping: 1,
            showClose: true,
            locale: 'zh-cn'
        };
        $("#startTime").datetimepicker(dateOptions);
        $("#endTime").datetimepicker(dateOptions);
        $("#start").on('click', function () {
            $("#options").slideUp("fast", function () {
                toggle(this);
            });
            start(options_module);
        });
        $("#pause").on('click', pause);
        $("#stop").on('click', stop);
        $("#toggle").on('click', function () {
            $("#options").slideToggle("fast", function () {
                toggle(this);
            });
            return false;
        });

        function toggle(ele) {
            if ($(ele).is(":visible")) {
                $("#toggleIcon").attr('class', "glyphicon glyphicon-triangle-top");
            } else {
                $("#toggleIcon").attr('class', "glyphicon glyphicon-triangle-bottom");
            }
        }

        function start(options_module) {
            var options = options_module.ControlOptions();
            if (!timeControl) {
                timeControl = new SuperMap.TimeFlowControl(loadLiveData, options);
            } else {
                timeControl.updateOptions(options);
            }
            timeControl.start();
        }

        function pause() {
            timeControl.pause();
        }

        //停止播放
        function stop() {
            timeControl.stop();
            if (timeControl) {
                timeControl.destroy();
                timeControl = null;
            }
            if (liveRenderer) {
                map.removeLayer(liveRenderer);
                liveRenderer = null;
            }
            if (liveDataSet) {
                liveDataSet = null;
            }
            if (geoFenceLayer) {
                geoFenceLayer.remove();
                geoFenceLayer = null;
            }
        }
        return timeControl;
    };
    return {
        initToggleThemeView: initToggleThemeView,
        initTimeControlView: initTimeControlView
    };
});