define(function () {
    var uid, role, _msfTable, unique_id;
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
                        return '<a id="' + data + '">' + data + '</a>';
                    },
                    "title": "File Name",
                    "width": "400px"
                },
                {"data": 'file_type', "title": "File Type", "width": "100px"},
                {"data": "file_size", "title": "File Size(MB)", "width": "150px"},
                {"data": "create_time", "title": "Upload Date", "width": "270px", "type": "date"},
                {
                    "data": "btn", "title": "Operation", "width": "100px",
                    "render": function (data, type, full, meta) {
                        var html = '<a name="' + data + '" href="javascript:;" class="down fg-yellow"><span class="mif-download ml-4"></span></a>';
                        html += '<a name="' + data + '" href="javascript:;" class="del fg-yellow"><span class="mif-bin ml-4"></span></a>';
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
                "create_time": new Date(Math.round(data[i].create_time * 1000)).toLocaleString(),
                "btn": data[i].fid
            };
            files.push(tmp);
        }
        _msfTable.rows.add(files).draw(false);
        $('#file_list tbody').on('click', 'tr', function () {
            $(this).toggleClass('selected');
        });
        bindEvent(sid);
        $('.paginate_button').click(function () {
            bindEvent(sid);
        });
    };

    var clear = function () {
        _msfTable.rows().remove().draw();
    };

    var uploadFiles = function (sid) {
        uploadDialog(sid);
    };

    var bindEvent = function (sid) {
        $(".down").unbind();
        $(".del").unbind();
        $(".down").click(function () {
            var fid = $(this).attr('name');
            if (!fid) {
                return;
            }
            $('#do_').remove();
            var download_html = '<form id="do_" style="display: none" method="post" action="' + UrlConfig.getBaseURI() + 'file/download">';
            download_html += '<input name="uid" value="' + uid + '">';
            download_html += '<input name="fid" value="' + fid + '">';
            download_html += '</form>';
            $('body').append(download_html);
            $('#do_').submit();
        });
        $(".del").click(function () {
            var fid = $(this).attr('name');
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
                } else if (res.response.status === 200) {
                    $('.mif-spinner4').attr('name', 'true');
                    $('.mif-spinner4').parent().trigger('click');
                }
            }
        });
    };

    function uploadDialog(sid) {
        var html = '<select id="f_type" data-role="select" data-prepend="File Type" class="mt-2 mb-2"><option id="image">Image</option>';
        html += '<option id="audio">Music</option><option id="video">Video</option><option id="doc">Document</option>';
        html += '<option id="package">Package</option></select>';
        html += '<button id="f_selector" class="button mr-2" disabled><span class="mif-folder"></span></button>';
        html += '<button id="f_uploader" class="button" disabled><span class="mif-upload"></span></button>';
        html += '<input id="transform" class="place-right" type="checkbox" data-role="checkbox" data-caption="Media Type Transform" data-hint-text="make media online type" disabled>';
        html += '<div id="op_status" class="fg-cyan"></div>';
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
                            $('.js-dialog-close').attr("disabled", false);
                            $('#op_status').html('Waiting for process transform and save');
                            after_upload_process($('#f_type')[0].options[$('#f_type')[0].selectedIndex].id)
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
                var data = {
                    'uid': uid,
                    'unique_id': unique_id,
                    'sid': sid,
                    'f_type': $('#f_type')[0].options[$('#f_type')[0].selectedIndex].id,
                    'description': ''
                };
                var cut = {};
                for (var t in _FileList) {
                    cut[_FileList[t]['path']] = _FileList[t]['des']
                }
                data['description'] = JSON.stringify(cut);
                var add_file = new RestQueryAjax(add_file_callback);
                add_file.add_file_REST(data);

                function add_file_callback(res) {
                    if (res.response.status === 200) {
                        $('.mif-spinner4').attr('name', 'true');
                        $('.mif-spinner4').parent().trigger('click');
                    }
                }
            },
            onOpen: function (e) {
                var t_selector = $('#f_type');
                var f_selector = $('#f_selector');
                $('#op_status').html('');
                t_selector[0].selectedIndex = -1;
                t_selector.change(function (e) {
                    $('#op_status').html('Waiting for select files');
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
            unique_id = guid();
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
            $('#op_status').html('Waiting for upload files');
            for (var key in _FileList) {
                upload_exec(_FileList[key], key, accept);
            }
            $('#f_uploader').attr("disabled", true);
            $('.js-dialog-close').attr("disabled", true);
        });
    }

    function upload_exec(obj, id, accept) {
        var reader = new FileReader();
        var step = 4 * 1024 * 1024;
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
            fd.append('unique_id', unique_id);
            var xhr = new XMLHttpRequest();
            xhr.open('post', "http://127.0.0.1:5000/file/upload", true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    if (onSuccess)
                        onSuccess();
                }
            };
            // 开始发送
            xhr.send(fd);
        }
    }

    function after_upload_process(f_type) {
        var data = {
            'f_type': f_type,
            'is_trans': $('#transform').prop('checked'),
            'unique_id': unique_id
        };
        var after_upload = new RestQueryAjax(after_callback);
        after_upload.after_upload_REST(data);

        function after_callback(res) {
            if (res.response.status === 200) {
                for (var i = 0; i < res.response.element.length; i++) {
                    var l = res.response.element[i];
                    for (var x in _FileList) {
                        if (l.file_path.indexOf(_FileList[x].name.substr(0, _FileList[x].name.lastIndexOf('.'))) > 0) {
                            _FileList[x]['path'] = l.file_path;
                            _FileList[x]['des'] = l.shortcut;
                        }
                    }
                }
                Metro.dialog.close($('.dialog'));
            } else {
                alert('Files process failed, Please try again or redo upload the files');
            }
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
        'Upload': uploadFiles,
        'clear': clear
    }
})
;