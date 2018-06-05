(function () {
    var r = new RegExp("(^|(.*?\\/))(include-trdlibs\.js)(\\?|$)"), s = document
        .getElementsByTagName('script'), src, m, targetScript;
    for (var i = 0; i < s.length; i++) {
        src = s[i].getAttribute('src');
        if (src) {
            m = src.match(r);
            if (m) {
                relativePath = m[1] || "./";
                targetScript = s[i];
                break;
            }
        }
    }

    function inputScript(inc) {
        var script = '<' + 'script type="text/javascript" src="' + relativePath
            + inc + '"' + '><' + '/script>';
        document.writeln(script);
    }

    function inputCSS(style) {
        var css = '<' + 'link rel="stylesheet" href="' + relativePath
            + style + '"' + '><' + '/>';
        document.writeln(css);
    }

    function inArray(arr) {
        for (var index in arr) {
            switch (arr[index]) {
                case 'mapv':
                    inputScript('mapv/mapv.min.js');
                    break;
                case 'turf':
                    inputScript('turf/turf.min.js');
                    break;
                case 'echarts':
                    inputScript('echart/echarts.min.js');
                    break;
                case 'd3':
                    inputScript('d3/d3.min.js');
                    break;
                case 'd3-layer':
                    inputScript('leaflet/leaflet-d3Layer.min.js');
                    break;
                case 'd3-hexbin':
                    inputScript('d3/d3-hexbin.v0.2.min.js');
                    break;
                case 'elasticsearch':
                    inputScript('elasticsearch/elasticsearch.min.js');
                    break;
                case 'leaflet-heat':
                    inputScript('leaflet/leaflet.heat.js');
                    break;
                case 'leaflet-draw':
                    inputScript('leaflet/leaflet.draw.js');
                    inputCSS("leaflet/css/leaflet.draw.css");
                    break;
                case 'leaflet-pm':
                    inputScript('leaflet/leaflet.pm.min.js');
                    inputCSS("leaflet/css/leaflet.pm.css");
                    break;
                case 'leaflet-markercluster':
                    inputScript('leaflet/leaflet.markercluster.js');
                    inputCSS("leaflet/css/MarkerCluster.css");
                    inputCSS("leaflet/css/MarkerCluster.Default.css");
                    break;
                case 'leaflet-sidebyside':
                    inputScript('leaflet/leaflet-side-by-side.min.js');
                    break;
                case 'leaflet-osmsbuildings':
                    inputScript('leaflet/OSMBuildings-Leaflet.js');
                    break;
                case 'leaflet-minimap':
                    inputScript('leaflet/Control.MiniMap.min.js');
                    inputCSS("leaflet/css/Control.MiniMap.min.css");
                    break;
                case 'leaflet-iconpulse':
                    inputScript('leaflet/L.Icon.Pulse.js');
                    inputCSS("leaflet/css/L.Icon.Pulse.css");
                    break;
                case 'ztree':
                    inputScript("jquery/jquery.ztree.all.js");
                    break;
                case 'jq-colorpicker':
                    inputScript("jquery/jquery.colorpicker.js");
                    break;
                case 'jq-scrollTo':
                    inputScript("jquery/jquery.scrollTo.min.js");
                    break;
                case 'jq-nicescroll':
                    inputScript("jquery/jquery.nicescroll.min.js");
                    break;
                case 'jq-dateTables':
                    inputScript("jquery/jquery.datatables.min.js");
                    inputCSS("jquery/css/jquery.datatables.min.css");
                    break;
                case 'bootstrap':
                    inputScript("bootstrap/bootstrap.min.js");
                    inputCSS("bootstrap/css/bootstrap.min.css");
                    inputScript("bootstrap/bootstrap-datetimepicker.min.js");
                    inputCSS("bootstrap/css/bootstrap-datetimepicker.min.css");
                    inputScript("bootstrap/bootstrap-select.min.js");
                    inputCSS("bootstrap/css/bootstrap-select.min.css");
                    break;
                case 'moment':
                    inputScript("common/moment.min.js");
                    inputScript("common/zh-cn.js");
                    break;
                case 'geohash':
                    inputScript("common/geohash.js");
                    break;
                case "randomColor":
                    inputScript("common/randomColor.min.js");
                    inputCSS("bootstrap/css/bootstrap-datetimepicker.min.css");
                    break;
                case "metro.v4":
                    inputScript("metro/v4/js/metro.v4.js");
                    inputCSS("metro/v4/css/metro-all.css");
                    inputCSS("metro/v4/css/metro-icons.css");
                    break;
                case "metro.v3":
                    inputScript("metro/v3/js/metro.v3.js");
                    inputCSS("metro/v3/css/metro.css");
                    inputCSS("metro/v3/css/metro-icons.css");
                    inputCSS("metro/v3/css/metro-responsive.css");
                    break;
                case "font-awesome":
                    inputCSS("font-awesome/font-awesome.min.css");
                    break;
                case "wave_surfer":
                    inputScript("media/wavesurfer.min.js");
                    inputScript("media/wavesurfer.timeline.min.js");
                    inputScript("media/wavesurfer.spectrogram.min.js");
                    inputScript("media/wavesurfer.regions.min.js");
                    inputScript("media/wavesurfer.elan.min.js");
                    break;
            }
        }
    }

    // 加载类库资源文件
    function load() {
        var includes = (targetScript.getAttribute('include') || "").split(",");
        var excepts = (targetScript.getAttribute('excepts') || "").split(",");
        if (excepts.length > 0) {
            if (excepts.indexOf("jquery") === -1) {
                inputScript("jquery/jquery.min.js");
            }
            if (excepts.indexOf("leaflet") === -1) {
                inputCSS("leaflet/css/leaflet.css");
                inputScript("leaflet/leaflet.js");
            }
        }
        inArray(includes);

    }

    load();
})();
