define(function (require) {
    var uid, role, _msfTable;
    var _FileList = {};
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
                        var html = '<a id="' + data + '" href="javascript:;" class="down"><span class="mif-download ml-4"></span></a>';
                        html += '<a id="' + data + '" href="javascript:;" class="del"><span class="mif-bin ml-4"></span></a>';
                        return html;
                    }
                }
            ]
        });
        _msfTable.rows().remove().draw();
    };
    var setTableRows = function (data, sid) {
        var files = [];
        _msfTable.rows().remove().draw();
        $('a[class="down"]').unbind();
        $('a[class="del"]').unbind();
        for (var i = 0; i < data.length; i++) {
            var tmp = {
                "fid": data[i].fid,
                "file_name": data[i].file_name,
                "file_type": data[i].f_type,
                "file_size": data[i].file_size,
                "create_time": data[i].create_time,
                "btn": data[i].fid
            };
            files.append(tmp);
        }
        _msfTable.rows.add(files).draw(false);
        $('#file_list tbody').on('click', 'tr', function () {
            $(this).toggleClass('selected');
        });
        $('a[class="down"]').click(function () {
            var fid = $(this).attr('id');
            if (!fid) {
                return;
            }
            var data = {
                uid: uid,
                fid: fid
            };
            var rest_down = new RestQueryAjax(download_callback);
            rest_down.download_file_REST(data);

            function download_callback(res) {
                if (res.response.status === 101) {
                    alert("File doesn't exist!");
                }
            }
        });
        $('a[class="del"]').click(function () {
            var fid = $(this).attr('id');
            if (!fid) {
                return;
            }
            var data = {
                "uid": uid,
                "fid": fid,
                "sid": sid
            };
            var rest_del = new RestQueryAjax(del_callback);
            rest_del.del_file_REST(data);

            function del_callback(res) {
                if (res.response.status === 101) {
                    alert("File doesn't exist!");
                }
            }
        });
    };
    var uploadFiles = function (sid) {
        uploadDialog();
    };

    function uploadDialog() {
        var html = '<select id="f_type" data-role="select" data-prepend="File Type" class="mt-2 mb-2"><option id="image">Image</option>';
        html += '<option id="audio">Music</option><option id="video">Video</option><option id="doc">Document</option>';
        html += '<option id="package">Package</option></select>';
        html += '<button id="f_selector" class="button mr-2" disabled><span class="mif-folder"></span></button>';
        html += '<button id="f_uploader" class="button" disabled><span class="mif-upload"></span></button>';
        html += '<input id="transform" class="place-right" type="checkbox" data-role="checkbox" data-caption="Media Type Transform" disabled>';
        html += '<div id="_list" style="overflow-y: auto;overflow-x: hidden;margin-top: 10px"></div>';
        Metro.dialog.create({
            title: "<span class='mif-upload mr-4'></span>Upload Files",
            content: html,
            width: 500,
            actions: [
                {
                    caption: "<span class='mif-checkmark'></span> OK",
                    cls: "alert",
                    onclick: function () {
                        if ($('.progress__bar--blue').length === $('.progresss').length) {

                        } else {
                            alert("Please wait for upload complete")
                        }
                    }
                },
                {
                    caption: "<span class='mif-cross'></span> Cancel",
                    cls: "js-dialog-close"
                }
            ],
            onClose: function (e) {

            },
            onOpen: function (e) {
                var t_selector = $('#f_type');
                var f_selector = $('#f_selector');
                t_selector[0].selectedIndex = -1;
                t_selector.change(function (e) {
                    $('#transform').prop('checked', false);
                    if (t_selector[0].selectedIndex === 2 || t_selector[0].selectedIndex === 1) {
                        $('#transform').data('checkbox').toggleState();
                        $('#transform')[0].disabled = false;
                        $('#transform').parent().removeClass('disabled');
                    } else {
                        $('#transform')[0].disabled = true;
                    }
                    f_selector[0].disabled = false;
                    f_selector.unbind();
                    $('#f_selector').click(function () {
                        buttonMultiUpload(t_selector[0].options[t_selector[0].selectedIndex].id);
                    });
                });
            }
        });
    }


    // 批量图片上传
    function buttonMultiUpload(accept) {
        var html = '<input id="get_files" type="file" multiple="multiple" style="display:none" accept="' + accept + '/*" />';
        $(html).insertAfter($('#f_selector'));
        var file_box = $('#get_files');
        file_box.change(function () {
            if (!file_box.val()) {
                $(file_box).remove();
                Metro.toast.create("Invalid file selection!", null, 5000, "bg-red fg-white");
                return;
            }
            if (file_box[0].files.length > 10) {
                $(file_box).remove();
                Metro.toast.create("Too many files to upload! Please select 10 below", null, 5000, "bg-red fg-white");
                return;
            }
            _FileList = {};
            console.log(file_box[0].files);
            file_size_type_check(accept, file_box[0]);
            file_upload_list(accept);
            $(file_box).remove();
        });
        file_box.click();
    }

    function file_size_type_check(f_type, file_bin) {
        for (var i = 0, file; file = file_bin.files[i++];) {
            var file_type = file.name.substr(file.name.lastIndexOf('.')).toLocaleLowerCase();
            switch (f_type) {
                case "image":
                    if (file.size > 20 * 1024 * 1024) {
                        continue;
                    }
                    break;
                case "audio":
                    if (file.size > 20 * 1024 * 1024) {
                        continue;
                    } else if (file_type !== ".mp3" && file_type !== ".wma") {
                        continue;
                    }
                    break;
                case "package":
                    if (file_type !== ".zip" && file_type !== ".tar.gz" && file_type !== ".rar"
                        && file_type !== ".7z" && file_type !== ".exe" && file_type !== ".msi") {
                        continue;
                    }
                    break;
                default:
                    break;
            }
            _FileList[guid()] = {
                name: file.name,
                file: file,
                upload: false
            };
        }
    }

    function file_upload_list(accept) {
        $('#_list').html('');
        for (var key in _FileList) {
            var name = _FileList[key].name.substring(0, 10) + '...  Progress: ';
            $('#_list').append('<div id="_' + key + '" class="progresss progress--active" style="width:400px;float:left">' +
                '<b class="progress__bar"><span class="progress__text">' + name + '<em>0%</em></span></b></div>' +
                '<span id="' + key + '" class="file_bin mif-bin float-right mt-1 mr-1"></span>');
            if ($('#_list').height() > 200) {
                $('#_list').height(200);
            }
        }
        $('.file_bin').click(function () {
            delete _FileList[$(this).attr('id')];
            $('#_' + $(this).attr('id')).remove();
            $(this).remove();
        });
        $('#f_uploader')[0].disabled = $('.progresss').length <= 0;
        $('#f_uploader').unbind();
        $('#f_uploader').click(function () {
            for (var key in _FileList) {
                upload_exec(_FileList[key], key, accept);
            }
        });
    }

    function upload_exec(obj, id, accept) {
        var reader = new FileReader();
        var step = 2 * 1024 * 1024;
        var total = obj.file.size;
        var cuLoaded = 0;
        console.info("文件大小：" + obj.file.size);
        var startTime = new Date();
        // 读取一段成功
        reader.onload = function (e) {
            // 处理读取的结果
            var loaded = e.loaded;
            // 将分段数据上传到服务器
            uploadFile(reader.result, cuLoaded,
                function () {
                    console.info('loaded:' + cuLoaded + 'current:' + loaded);
                    // 如果没有读完，继续
                    cuLoaded += loaded;
                    $('#_' + id).find('.progress__text').find('em').html((Math.floor(100 * cuLoaded / total)).toString() + "%");
                    $('#_' + id).find('.progress__bar')[0].style.width = (Math.floor(100 * cuLoaded / total)).toString() + "%";
                    if (cuLoaded < total) {
                        readBlob(cuLoaded);
                    } else {
                        console.log('总共用时：' + (new Date().getTime() - startTime.getTime()) / 1000);
                        cuLoaded = total;
                        _FileList[id].upload = true;
                        $('#_' + id).find('.progress__bar').addClass('progress__bar--blue');
                    }
                });
        };

        // 指定开始位置，分块读取文件
        function readBlob(start) {
            // 指定开始位置和结束位置读取文件
            var blob = obj.file.slice(start, start + step);
            reader.readAsArrayBuffer(blob);
        }

        // 开始读取
        readBlob(0);

        // 关键代码上传到服务器
        function uploadFile(result, startIndex, onSuccess) {
            var blob = new Blob([result]);
            // 提交到服务器
            var fd = new FormData();
            fd.append('file', blob);
            fd.append('name', obj.file.name);
            fd.append('index', startIndex);
            fd.append('f_type', accept);
            var xhr = new XMLHttpRequest();
            xhr.open('post', "http://127.0.0.1:5000/file/upload", true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    if (onSuccess)
                        onSuccess();
                }
            };
            // 开始发送
            xhr.send(fd);
        }
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

    function guid() {
        /**
         * @return {string}
         */
        function S4() {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16)
                .substring(1);
        }

        return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    }

    return {
        'init': init,
        'setRows': setTableRows,
        'Upload': uploadFiles
    }
})
;