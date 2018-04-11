(function () {
    var r = new RegExp("(^|(.*?\\/))(include-3rdlibs\.js)(\\?|$)"), s = document
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
                    inputScript('map-v/mapv.min.js');
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
            }
        }
    }

    // 加载类库资源文件
    function load() {
        var includes = (targetScript.getAttribute('include') || "").split(",");
        var excludes = (targetScript.getAttribute('exclude') || "").split(",");
        inputScript("jquery/jquery.min.js");
        inputCSS("leaflet/css/leaflet.css");
        inputScript("leaflet/leaflet.js");
        inArray(includes);

    }

    load();
})();
