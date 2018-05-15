define(function (require) {
    var uid, role, _msfTable;
    var init = function () {
        uid = getQueryString('uid');
        role = getQueryString('role');
        $('#userrole').html($('#userrole').html().replace('User', role));
        $('#userrole').attr('name', uid);
        setHtmlFrame();
    };
    var setHtmlFrame = function () {
        _msfTable = $('#file_list').DataTable({

            columns: [
                {"data": "fid", "title": "Index", "width": "50px"},
                {
                    "data": "file_name",
                    "render": function (data, type, full, meta) {
                        return '<a href="' + data + '">' + data + '</a>';
                    },
                    "title": "File Name",
                    "width": "400px"
                },
                {"data": 'file_type', "title": "File Type", "width": "100px"},
                {"data": "file_size", "title": "File Size(MB)", "width": "150px"},
                {"data": "create_time", "title": "Upload Date", "width": "200px", "type": "date"},
                {
                    "data": "btn", "title": "Operation", "width": "200px",
                    "render": function (data, type, full, meta) {
                        var html = '<a href="javascript:;"><span class="mif-download ml-4"></span></a>';
                        html += '<a href="javascript:;"><span class="mif-cog ml-4"></span></a>';
                        html += '<a href="javascript:;"><span class="mif-bin ml-4"></span></a>';
                        return html;
                    }
                }
            ]
        });
        _msfTable.rows.add([{
            "fid": "1",
            "file_name": "dsadsa",
            "file_type": "mp4",
            "file_size": "111",
            "create_time": "2018/09/09",
            "btn": ""
        }]).draw();
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

    return {
        'init': init
    }
});