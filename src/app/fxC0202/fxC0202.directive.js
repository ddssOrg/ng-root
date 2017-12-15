angular.module('fxC0202')
    .directive('cwhbbbgnzxfx', [() => {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'app/fxC0202/fxC0202.html',
            controller: ['$timeout', '$scope', 'cwhbbbgnzxService', 'swordHttp', 'ngDialog', '$filter', '$sce', '$interval', 'fxC0202Service', cwhbbbgnzxFxController]
        }
    }]);

function cwhbbbgnzxFxController($timeout, $scope, cwhbbbgnzxService, swordHttp, ngDialog, $filter, $sce, $interval, fxC0202Service) {

    $scope.getAuditParams = function () {
        return getAuditParams();
    }
    $scope.xmid = window.top.xmid;
    $scope.cjbddm = cjbddm;
    $scope.isQB = true;
    $scope.xsbz = 'QB';
    $scope.emptyRowStatus = false;
    $scope.glfjBgdm = '';
    $scope.ui = {
        tabIndex: 0,
        Index: 0,
    };

    //判断是否ie
    $scope.isIe = function () {
        return window.browser.versions.trident;
    }

	/**
	 * 点选资料属期的选择框
	 */
    $scope.checkedSQ = new Array();
    $scope.selectSQ = function (uiheadcell) {
        if (uiheadcell.checked) {
            if ($scope.checkedSQ.indexOf(uiheadcell.value) < 0) {
                $scope.checkedSQ.push(uiheadcell.value);
            }
        } else {
            while ($scope.checkedSQ.indexOf(uiheadcell.value) >= 0) {
                $scope.checkedSQ.splice($scope.checkedSQ.indexOf(uiheadcell.value), 1);
            }
        }
    }

    //初始化UI
    var initUI = function () {
        $scope.loadMsg = "界面初始化...";
        $scope.loading++;
        cwhbbbgnzxService.initUI({ xmid: xmid, cjbddm: cjbddm }, function (uimodule) {
            $scope.uimodule = uimodule;
            initData();
        });
    }

    $scope.changeXszt = function () {
        $($scope.uimodule.tabs).each(function (tabIndex, tab) {
            if (tab && tab.table && tab.table.tbody && tab.table.tbody.rows) {
                var index = 0;
                $(tab.table.tbody.rows).each(function (rowIndex, row) {
                    $(row.cells).each(function (cellIndex, cell) {
                        if ('xsbz' == cell.property) {
                            var value = cell.value;
                            //有效标志为空默认为全表
                            if (tab.xsbz) {
                                tab.xsbz = tab.xsbz + '';
                            } else {
                                tab.xsbz = 'QB';
                            }
                            if ('JB' == tab.xsbz && '1' == value) {
                                row.hide = true;
                            } else if ('QB' == tab.xsbz && '2' == value) {
                                row.hide = true;
                            } else {
                                row.hide = false;
                                $(row.cells).each(function (cellIndex, cell) {
                                    if ('hc' == cell.property || 'xh' == cell.property) {
                                        cell.value = ++index;
                                    }
                                });
                            }
                        }
                    });
                });
                refreshGroup(tab);
            }
        });
    }
    //初始化数据
    // var initData = function () {
    //     $scope.loadMsg = "数据加载中...";
    //     var winWidth;
    //     if (window.innerWidth) {
    //         winWidth = window.innerWidth;
    //     } else if ((document.body) && (document.body.clientWidth)) {
    //         winWidth = document.body.clientWidth;
    //     }
    //     //遍历tab，分别加载各自的table数据
    //     angular.forEach($scope.uimodule.tabs, function (tab) {
    //         $scope.loading++;
    //         var param = { xmid: xmid, cjbddm: cjbddm, cjbgdm: tab.id, winWidth: winWidth + '' };
    //         cwhbbbgnzxService.loadData(param, function (uidata) {
    //             if (isNotNull(uidata.datas) && uidata.datas.length <= 0) {
    //                 $scope.nodatas = true;
    //             }
    //             fxC0202Service.setData(tab, uidata, $scope);
    //         });
    //     });


    var initData = function () {
        $scope.loadMsg = "数据加载中...";
        var winWidth;
        if (window.innerWidth) {
            winWidth = window.innerWidth;
        } else if ((document.body) && (document.body.clientWidth)) {
            winWidth = document.body.clientWidth;
        }
        //遍历tab，分别加载各自的table数据
        var param = { xmid: xmid, cjbddm: cjbddm, tabs: angular.toJson($scope.uimodule.tabs), winWidth: winWidth + '' };
        cwhbbbgnzxService.loadAllData(param, function (uidatas) {
            angular.forEach($scope.uimodule.tabs, function (tab) {
                angular.forEach(uidatas, function (uidata) {
                    if (tab.id == uidata.id) {
                        if (isNotNull(uidata.datas) && uidata.datas.length <= 0) {
                            $scope.nodatas = true;
                        }
                        fxC0202Service.setData(tab, uidata, $scope);
                        return false;
                    }
                });
            });
        });
    }

    initUI();
    //公共
    //初始化上传附件插件
    var initUploadFile = function (uidataId) {
        $("#uploadFileTemplate").cssFileUpload({
            url: '/ajax.sword?ctrl=DemoCtrl_uploadWdxmPic',
            simple: false,
            multiple: true,
            template: $scope.uimodule.templateName ? $scope.uimodule.templateName.split("_")[0] : "",
            data: { xmid: window.top.xmid, cjmxdm: $scope.uimodule.templateName ? $scope.uimodule.templateName.split("_")[1] : "" },
            onBeforeSelectFile: function (selectFile) {
                if ($scope.uimodule.label && $scope.uimodule.label.dataType == 'datetime' && isNull($scope.uimodule.label.value) && $scope.zlsqbg.indexOf($scope.glfjBgdm) >= 0) {
                    $scope.sflrsqFlag = false;
                    setPrompt('请选择资料属期', false);
                    return;
                }
                selectFile();
            },
            add: function (e, data) {
                //获取一次上传的文件数量
                $scope.fileCount = data.files.length;
            },
            success: function (result, textStatus, jqXHR) {
                if (result.succ == true) {
                    var bbrqz = "";
                    if ($scope.uimodule.label && $scope.uimodule.label.value) {
                        bbrqz = $scope.uimodule.label.value;
                    }
                    $.ajax({
                        url: '/ajax.sword?ctrl=ModifyXmfjGyCtrl_saveFxXmfjData',
                        type: 'post',
                        data: { xmid: window.top.xmid, cjmxdm: result.cjmxdm, cjbgdm: $scope.glfjBgdm, cjbddm: cjbddm, fileCount: $scope.fileCount, bbrqz: bbrqz },
                        success: function (res) {
                            angular.forEach($scope.uimodule.tabs, function (tab) {
                                if (tab.id == $scope.glfjBgdm) {
                                    var rows = [];
                                    angular.forEach(res, function (rowdata, rowIndex, rowArr) {
                                        var row = { rowIndex: rowIndex, cells: [] };
                                        if (isNotNull(tab.subTable)) {
                                            angular.forEach(tab.subTable.columns, function (column, colIndex, colArr) {
                                                var value = rowdata[column.property];
                                                var cell = angular.copy(column);
                                                cell.colIndex = colIndex;
                                                cell.value = value;
                                                if (cell.dataType == 'id') {
                                                    row.id = value;
                                                }
                                                row.cells[colIndex] = cell;
                                            });
                                            rows[rowIndex] = row;
                                        }
                                    });
                                    if (isNotNull(tab.subTable)) {
                                        $scope.$apply(function () {
                                            tab.subTable.tbody = { rows: rows };
                                        });
                                    }
                                }
                            });
                        }
                    });
                }
            }
        });
    }
    $scope.exeCommand = function (command) {
        if ('exit' === command.action) {
            window.top.MainPage.closeTab();
        } else if ('compareTime' === command.action) {
            //1、日期检验
            var param = {
                xmid: $scope.xmid,
                cjbddm: $scope.cjbddm,
            };
            if ($scope.uimodule.tabActiveIndex > 0) {
                var id = $scope.uimodule.tabs[$scope.uimodule.tabActiveIndex].id;
                if (isNotNull(id.split('_')) && id.split('_').length >= 2) {
                    param.bnnd = id.split('_')[2];
                    param.snnd = id.split('_')[1];
                }
            } else {
                if (!$scope.checkedSQ || (isNotNull($scope.checkedSQ) && $scope.checkedSQ.length != 2)) {
                    setPrompt('请选中两期资料属期！', false);
                    return;
                }
                param.bnnd = $scope.checkedSQ[0];
                param.snnd = $scope.checkedSQ[1];
            }
            var hasBD = false;
            $($scope.uimodule.tabs).each(function (tabIndex, tab) {
                var cjbgdm = tab.id;
                if (cjbgdm.indexOf(param.bnnd) > 0 && cjbgdm.indexOf(param.snnd) > 0) {
                    hasBD = true;
                    return true;
                }
            });
            if (hasBD) {
                window.confirm('提示', param.snnd + '与' + param.bnnd + '已比对，是否重新比对？', function () {
                    //直接调用存储过程
                    angular.forEach($scope.uimodule.tabs, function (tab) {
                        if ('C0202-1' == tab.id || 'C0203-1' == tab.id || 'C0204-1' == tab.id) {
                            param.cjbgdm = tab.id;
                            cwhbbbgnzxService.querySjxx(param, function (uidata) {
                                if (uidata.extend && isNotNull(uidata.extend.tabs) && uidata.extend.tabs) {
                                    for (var i = 0; i < uidata.extend.tabs.length; i++) {
                                        var hasTab = false;
                                        if (isNotNull($scope.uimodule) && isNotNull($scope.uimodule.tabs)) {
                                            for (var j = 0; j < $scope.uimodule.tabs.length; j++) {
                                                if (uidata.extend.tabs[i].id == $scope.uimodule.tabs[j].id) {
                                                    hasTab = true;
                                                    if (uidata.datas.length <= 0) {
                                                        $scope.nodatas = true;
                                                    } else {
                                                        fxC0202Service.setData($scope.uimodule.tabs[j], uidata, $scope);
                                                    }
                                                    break;
                                                }
                                            }
                                        }
                                        if (!hasTab) {
                                            $scope.uimodule.tabs.splice($scope.uimodule.tabs.length - 2, 0, uidata.extend.tabs[i]);
                                            if (uidata.datas.length <= 0) {
                                                $scope.nodatas = true;
                                            } else {
                                                fxC0202Service.setData($scope.uimodule.tabs[$scope.uimodule.tabs.length - 3], uidata, $scope);
                                            }
                                        }
                                    }
                                }
                                //$scope.changeXszt();
                                window.changeflag = true;
                                changeflag = true;
                            }, function () {
                                setPrompt('比对信息异常！', false);
                            });
                        }
                    });
                }, function () {

                });
            } else {
                angular.forEach($scope.uimodule.tabs, function (tab) {
                    if ('C0202-1' == tab.id || 'C0203-1' == tab.id || 'C0204-1' == tab.id) {
                        param.cjbgdm = tab.id;
                        cwhbbbgnzxService.querySjxx(param, function (uidata) {
                            if (uidata.extend && isNotNull(uidata.extend.tabs) && uidata.extend.tabs) {
                                for (var i = 0; i < uidata.extend.tabs.length; i++) {
                                    var hasTab = false;
                                    for (var j = 0; j < $scope.uimodule.tabs.length; j++) {
                                        if (uidata.extend.tabs[i].id == $scope.uimodule.tabs[j].id) {
                                            hasTab = true;
                                            if (uidata.datas.length <= 0) {
                                                $scope.nodatas = true;
                                            } else {
                                                fxC0202Service.setData($scope.uimodule.tabs[j], uidata, $scope);
                                            }
                                            break;
                                        }
                                    }
                                    if (!hasTab) {
                                        $scope.uimodule.tabs.splice($scope.uimodule.tabs.length - 2, 0, uidata.extend.tabs[i]);
                                        if (uidata.datas.length <= 0) {
                                            $scope.nodatas = true;
                                        } else {
                                            fxC0202Service.setData($scope.uimodule.tabs[$scope.uimodule.tabs.length - 3], uidata, $scope);
                                        }
                                    }
                                }
                            }
                            //$scope.changeXszt();
                            window.changeflag = true;
                            changeflag = true;
                        }, function (data) {
                            setPrompt('比对信息异常！', false);
                        });
                    }
                });
            }
        } else if ('switchEmptyRow' == command.action) {
            command.status = !command.status;
            command.label = command.status ? command.labelOn : command.labelOff;
            $($scope.uimodule.tabs).each(function (tabIndex, tab) {
                var checkPropertys = command.extend[tab.id.split('_')[0]];
                if (!checkPropertys) {
                    return true;//continue
                }
                if (tab.table.tbody) {
                    $(tab.table.tbody.rows).each(function (rowIndex, row) {
                        if (command.status) {
                            row.emptyRow = true;
                            $scope.emptyRowStatus = true;
                            $(row.cells).each(function (cellIndex, cell) {
                                if (checkPropertys.indexOf(cell.property) >= 0
                                    && (isNotNull(cell.value) && cell.value != '---') && (!/^(0|0.0+)$/.test(cell.value))) {
                                    row.emptyRow = false;
                                    return false;//break each
                                }
                            });
                        } else {
                            $scope.emptyRowStatus = false;
                        }
                    });
                    fxC0202Service.rebuildTable(tab, tab.table.tbody, $scope, tabIndex);
                    //refreshGroup(tab);
                }
            });
        } else if ('save' === command.action) {
            var param = { xmid: $scope.xmid, cjbddm: $scope.cjbddm };
            var cjbgs = [];
            var invalide = false;
            var calculateErr = false;
            angular.forEach($scope.uimodule.tabs, function (tab, tabIndex) {
                if (!invalide) {
                    var cjbg = { cjbgdm: tab.id };
                    var cjmxs = [];
                    if (tab.table && tab.table.tbody) {
                        //一个表单的验证结果
                        var validateResult = { succ: true, errors: {} };
                        angular.forEach(tab.table.tbody.rows, function (row) {
                            var cjmx = { cjmxdm: row.id, isdel: row.del ? true : false };
                            angular.forEach(row.cells, function (cell, cellIndex) {
                                if (invalide) {
                                    $scope.uimodule.tabActiveIndex = tabIndex;
                                }
                                if (cell.validate) {
                                    var result = cell.validate(validateResult.errors[cell.property]);
                                    if (!result.succ) {
                                        validateResult.succ = false;
                                        invalide = true;
                                        validateResult.errors[cell.property] = result;
                                    }
                                }
                                if (isNotNull(cell.equalsFlag) && cell.equalsFlag) {
                                    calculateErr = true;
                                }
                                if (cell.dataType == 'text'
                                    || cell.dataType == 'textarea'
                                    || cell.dataType == 'select'
                                    || cell.dataType == 'datetime'
                                    || cell.dataType == 'number'
                                    || cell.dataType == 'label') {
                                    var value = cell.value;
                                    if (cell.dataType == 'number' && value) {
                                        value = value.toString().replaceAll(',', '');
                                    }
                                    if (cell.unit) {
                                        value = value.toString().replaceAll(cell.unit, '');
                                    }
                                    if (cell.dynamic) {
                                        if (cjmx[cell.dynamicGroup]) {
                                            cjmx[cell.dynamicGroup][cell.colIndex] = {};
                                            cjmx[cell.dynamicGroup][cell.colIndex][cell.property] = value;
                                        } else {
                                            cjmx[cell.dynamicGroup] = [];
                                            cjmx[cell.dynamicGroup][cell.colIndex] = {};
                                            cjmx[cell.dynamicGroup][cell.colIndex][cell.property] = value;
                                        }
                                    } else {
                                        cjmx[cell.property] = value;
                                    }
                                }
                            });
                            cjmxs.push(cjmx);
                        });
                        if (!validateResult.succ) {
                            //处理提示
                            var errors = '';
                            for (var k in validateResult.errors) {
                                errors += validateResult.errors[k].propertyName + ':' + validateResult.errors[k].msg.join(',') + '<br>';
                            }
                            setPrompt(errors, false);
                        }
                    }
                    cjbg.cjmxs = cjmxs;
                    //把头也塞里
                    if (tab.table && (tab.id != 'C0202-3' && tab.id != 'C0203-3' && tab.id != 'C0204-3')) {
                        var title = [];
                        angular.forEach(tab.table.thead.headRows, function (hr) {
                            var hrv = [];
                            angular.forEach(hr.headCells, function (cell) {
                                hrv.push(cell.value);
                            });
                            title.push(hrv);
                        });
                        cjbg.title = title;
                    }
                    if (tab.subTable) {
                        var fjs = [];
                        if (tab.subTable.tbody) {
                            angular.forEach(tab.subTable.tbody.rows, function (row) {
                                var fjuuid = { fjuuid: row.id };
                                fjs.push(fjuuid);
                            });
                        }
                        cjbg.fjs = fjs;
                    }
                    cjbgs.push(cjbg);
                }
            });
            if (invalide) {
                return;
            }
            var saveaction = function () {
                if (window.changeflag == false) {
                    setPrompt('没有修改，无需保存', true);
                    return;
                }
                if (window.isRunningCommand == true) {
                    return;
                }
                param.datas = angular.toJson(cjbgs);
                window.showMask();
                window.isRunningCommand = true;
                cwhbbbgnzxService.save(param, function (data) {
                    window.hideMask();
                    if (data.succ) {
                        setPrompt('保存成功', true);
                        window.isRunningCommand = false;
                        window.changeflag = false;
                    } else {
                        setPrompt(data.msg, false);
                        window.isRunningCommand = false;
                    }
                }, function () {
                    window.isRunningCommand = false;
                    window.hideMask();
                    setPrompt('保存失败', false);
                });
                changeflag = false;//保存之后不再如果在关闭保存提示框，不再提示页面数据局做了修改，但是没有保存的提示
            }
            if (calculateErr) {
                window.confirm('提示', '页面中有数据和最近一期比对数据不一致，是否继续保存？', function () {
                    saveaction();
                });
            } else {
                saveaction();
            }
        } else if ('addFile' === command.action) {
            var tab = arguments[1];
            ngDialog.open({
                showClose: false,
                width: 1100,
                template: 'app/fx/templates/file-select-dialog.html',
                className: 'ngdialog-theme-plain',
                controller: ['$scope', ($scope) => {
                    $scope.viewOneFile = function (fileuuid) {
                        var url = "/ywpt/page/viewFILE.jsp?uuid=" + fileuuid;
                        top.MainPage.closeTab("menu_ckwj");
                        window.top.MainPage.newTab('menu_ckwj', '预览文件', 'icon-home', url, true);
                    }
                    var fjuuids = [];
                    if (tab.subTable.tbody) {
                        angular.forEach(tab.subTable.tbody.rows, function (row) {
                            fjuuids.push(row.id);
                        });
                    }
                    var checkFj = function (fjuuid) {
                        return fjuuids.indexOf(fjuuid) >= 0;
                    }
                    $scope.tabs = [{ cjbddms: ['10101', '10102'], files: [], loading: true },
                    { cjbddms: ['10201', '10202'], files: [], loading: true },
                    { cjbddms: ['10301', '10302'], files: [], loading: true },
                    { cjbddms: ['10103'], files: [], loading: true }],
                        { cjbddms: ['00102'], files: [], loading: true };
                    angular.forEach($scope.tabs, function (tab) {
                        cwhbbbgnzxService.queryXmFiles({ xmid: window.top.xmid, cjbddms: angular.toJson(tab.cjbddms) }, function (data) {
                            tab.files = data;
                            var lastCjmxflmc, lastZlmc, lastIndex1, lastIndex2, rowspan1 = 1, rowspan2 = 1;
                            angular.forEach(tab.files, function (file, index) {
                                file.checked = checkFj(file.uuid);
                                file.rowspan = 1;
                                file.cjmxflmcShow = true;
                                file.cjmxmcShow = true;
                                if (index == 0 || file.cjmxflmc != lastCjmxflmc) {
                                    file.cjmxflmcShow = true;
                                    file.cjmxmcShow = true;
                                    lastIndex1 = index;
                                    lastIndex2 = index;
                                    lastCjmxflmc = file.cjmxflmc;
                                    lastZlmc = file.cjmxmc;
                                    rowspan1 = 1;
                                    file.rowspan1 = 1;
                                    rowspan2 = 1;
                                    file.rowspan2 = 1;
                                } else {
                                    if (file.cjmxflmc == lastCjmxflmc) {
                                        file.cjmxflmcShow = false;
                                        tab.files[lastIndex1].rowspan1++;
                                        if (file.cjmxmc == lastZlmc) {
                                            file.cjmxmcShow = false;
                                            tab.files[lastIndex2].rowspan2++;
                                        } else {
                                            lastIndex2 = index;
                                            file.rowspan2 = 1;
                                            lastZlmc = file.cjmxmc;
                                            file.cjmxmcShow = true;
                                        }
                                    }
                                }
                            });
                            tab.loading = false;
                        }, function () {
                            setPrompt('加载文件列表失败', false);
                        });
                    });
                    $scope.hasCheckedFile = function () {
                        var has = false;
                        angular.forEach($scope.tabs, function (tab) {
                            angular.forEach(tab.files, function (file) {
                                if (file.checked) {
                                    has = true;
                                }
                            });
                        });
                        return has;
                    }
                    $scope.selectedFile = function () {
                        if (!tab.subTable.tbody) {
                            tab.subTable.tbody = { rows: [] };
                        }
                        angular.forEach($scope.tabs, function (ftab) {
                            angular.forEach(ftab.files, function (file) {
                                if (file.checked) {
                                    var has = false;
                                    angular.forEach(tab.subTable.tbody.rows, function (row) {
                                        if (row.id == file.uuid) {
                                            has = true;
                                        }
                                    });
                                    if (!has) {
                                        var row = { id: file.uuid, cells: [] };
                                        angular.forEach(tab.subTable.columns, function (cell) {
                                            var newCell = angular.copy(cell);
                                            newCell.value = file[newCell.property];
                                            row.cells.push(newCell);
                                        });
                                        tab.subTable.tbody.rows.push(row);
                                        window.changeflag = true;
                                        window.closeFlag = true;
                                    }
                                }
                            });
                        });
                        $scope.closeThisDialog(1);
                    }
                }]
            });
        } else if ('delFile' === command.action) {
            var tab = arguments[1];
            var selectedIndexs = [];
            if (isNotNull(tab.subTable.tbody)) {
                angular.forEach(tab.subTable.tbody.rows, function (row, index) {
                    if (row.checked) {
                        selectedIndexs.push(index);
                    }
                });
            }
            if (selectedIndexs.length <= 0) {
                setPrompt('请选择要删除的附件', false);
                return;
            } else {
                for (var i = selectedIndexs.length - 1; i >= 0; i--) {
                    tab.subTable.tbody.rows.splice(selectedIndexs[i], 1);
                }
                window.changeflag = true;
                window.closeFlag = true;
            }
        }
    }

    //刷新表单
    var refreshGroup = function (tab) {
        angular.forEach(tab.table.tbody.rows, function (row, rowIndex, rowArr) {
            if (!row.del && !row.hide) {
                angular.forEach(row.cells, function (cell, colIndex, colArr) {
                    var value = cell.value;
                    if (cell.group) {
                        cell.hide = false;
                        cell.rowspan = 1;
                    }
                    if (!cell.hide && cell.group && rowIndex != 0) {
                        //分组列
                        var cellGroup = function (step) {
                            if ((rowIndex - step) < 0) {
                                return;
                            }
                            if (value === tab.table.tbody.rows[rowIndex - step].cells[colIndex].value) {
                                if (tab.table.tbody.rows[rowIndex - step].cells[colIndex].hide
                                    || tab.table.tbody.rows[rowIndex - step].del == true
                                    || tab.table.tbody.rows[rowIndex - step].hide == true) {
                                    cellGroup(step + 1);
                                } else {
                                    tab.table.tbody.rows[rowIndex - step].cells[colIndex].rowspan++;
                                    cell.hide = true;
                                }
                            }
                        }
                        cellGroup(1);
                    }
                });
            }
        });
    }

    //文本域编辑框
    $scope.editTextArea = function (cell) {
        if (cell.dataType !== 'textarea') {
            return;
        }
        if (cell.height != 16) {
            return;
        }
        if (!cell.showDialog) {
            return;
        }
        ngDialog.open({
            showClose: false,
            width: 800,
            template: 'textareaDialog.html',
            className: 'ngdialog-theme-plain',
            controller: function ($scope) {
                $scope.description = angular.copy(cell.value);
                $scope.save = function () {
                    cell.value = angular.copy($scope.description);
                    window.changeflag = true;
                    $scope.closeThisDialog(1);
                }
            }
        });
    }

    $scope.getTextareaDivText = function (value) {
        if (value) {
            return $sce.trustAsHtml(value.replace(/\n/g, "<br/>"));
        } else {
            return "";
        }
    }

    $scope.mainTableInit = function () {
        var winH = $(window).height() - 190;
        $('.main_table').css('max-height', winH);
    }

    $scope.getPageOfficeHeight = function () {
        var height = $(window).height() - 60 - 24;
        if (isNotNull($scope.uimodule) && $scope.uimodule.tabs && isNotNull($scope.uimodule.tabs) && $scope.uimodule.tabs.length > 1) {
            height = height - 26;
        }
        if (height < 510) {
            return 510;
        } else {
            return height;
        }
    }
    $scope.setPageOfficeHeight = function () {
        return window.innerHeight - 10;
    }
    //设置iframe高度$scope.setPageOfficeHeight
    window.onresize = function () {
        $scope.$apply(function () {
            $scope.getPageOfficeHeight();
        });
    }

    $scope.numberInit = function (cell) {
        if (isNotNull(cell.value)) {
            cell.value = $filter('number')(cell.value.toString().replaceAll(',', ''), cell.decimal);
        }
        if (cell.unit && isNotNull(cell.value)) {
            cell.value = cell.value + cell.unit;
        }
    }

    $scope.slideToggle = function () {
        $(".function_click_icon").toggleClass("function_menu_click");
        $(".font-awesome-icon").toggleClass("icon-th-large").toggleClass("icon-remove");
        $(".function_menu_list").slideToggle("quick");
    }
    $scope.regHotKey = function (uibuttion) {
        var hotKey = uibuttion.hotKey;
        if (!hotKey) {
            return;
        }
        var hdx = hotKey.indexOf("+");
        var key1 = hotKey.substring(0, hdx).toLowerCase();
        var key2 = hotKey.substring(hdx + 1, hotKey.length);
        var ctrlKey = false;
        var altKey = false;
        var shiftKey = false;
        if (key1 == "ctrl") {
            ctrlKey = true;
        } else if (key1 == "alt") {
            altKey = true;
        } else if (key1 == "shift") {
            shiftKey = true;
        }
        $(document).bind("keydown", function (event) {
            var m = String.fromCharCode(event.keyCode);
            if (event.ctrlKey == ctrlKey && event.altKey == altKey && event.shiftKey == shiftKey && m == key2) {
                $scope.exeCommand(uibuttion.action);
                event.preventDefault();
            }
        });
    }
    //屏蔽鼠标右键
    $scope.initrightmenu = function () {
        $("body").rightMenu({
            isglcx: false,
        });
    }
    $scope.getTop = function () {
        var top = $('#nav-box').height();
        return top - 27;
    }

    //作废比对数据
    $scope.deleteData = function (title, id, index) {
        window.confirm('提示', '是否删除' + title + '比对结果？', function () {
            for (var i = 0; i < $scope.uimodule.tabs.length; i++) {
                var tab = $scope.uimodule.tabs[i];
                if (tab.id.substring(8) == id.substring(8)) {
                    $scope.uimodule.tabs.splice(i--, 1);
                }
            }
            cwhbbbgnzxService.deleteData({ xmid: xmid, cjbddm: cjbddm, cjbgdm: id }, function (uidata) {
                if (uidata) {
                    setPrompt(uidata.msg, uidata.succ);
                }
            });
        });
    }

    //当前附件列表有无选中行
    $scope.hasSelectedFjlbRow = function (tab) {
        if (tab && tab.subTable && tab.subTable.tbody && tab.subTable.tbody.rows) {
            var count = 0;
            angular.forEach(tab.subTable.tbody.rows, function (row, rowIndex) {
                if (row.checked) {
                    count++;
                }
            });
            return count;
        } else {
            return 0;
        }
    }

    $scope.viewOneFile = function (fileuuid) {
        var url = "/ywpt/page/viewFILE.jsp?uuid=" + fileuuid;
        top.MainPage.closeTab("menu_ckwj");
        window.top.MainPage.newTab('menu_ckwj', '预览文件', 'icon-home', url, true);
    }

}