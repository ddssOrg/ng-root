'use strict';

angular.module('xmcjgy')
  .directive('xmcjgy', [() => {
    return {
      restrcit: 'E',
      replace: true,
      templateUrl: 'app/uigy/uigy.html',
      controller: ['$timeout', '$scope', 'xmcjgyService', 'swordHttp', 'ngDialog', '$filter', '$sce', 'uigyService',
        xmcjgyController]
    };
  }]);

function xmcjgyController ($timeout, $scope, xmcjgyService, swordHttp, ngDialog, $filter, $sce, uigyService) {
    
  $scope.getAuditParams = function () {
    return getAuditParams();
  }
  $scope.ui = {
    tabIndex: 0,
    Index: -1,
    showZlsqinput: false,
  }
  $scope.showtimes;
  $scope.xmid = window.top.xmid;
  $scope.cjbddm = cjbddm;
  //初始化UI
  var initUI = function () {
    $scope.loadMsg = "界面初始化...";
    $scope.loading++;
    xmcjgyService.initUI({ xmid: window.top.xmid, cjbddm: cjbddm }, function (uimodule) {
      $scope.uimodule = uimodule;
      if (uimodule.scripts && uimodule.scripts.length > 0) {
        $(uimodule.scripts).each(function (index, script) {
          $(document.body).append('<script src="' + script + '"></script>');
        });
      }
      //判断默认提示
      $scope.initReport();
      initTabs();
    });
  }
	
  //执行配置的自定义脚本中的方法
  $scope.exeFuncs = function (uitab, uicell, rowIndex, colIndex) {
    if (uitab.funcs && uitab.funcs.length > 0) {
      $(uitab.funcs).each(function (i, func) {
        if (func.indexOf("Report") < 0 && window[func]) {
          window[func](uitab.table.columns, uitab.table.tbody.rows, uicell, rowIndex, colIndex, $scope.uimodule.tabs);
        }
      });
    }
  }
  $scope.selectedTableFilter = function (table, filter) {
    if (table.filterChoose == filter) {
      return;
    }
    table.filterChoose = filter;
  }
  $scope.fxB0203_1 = {
    myCreateYear: ""
  };
  //为销售结构分析用例的B0304-3-5的表格增加年份
  $scope.createYear = function (uitab, id, e) {
    uigyService.createYear(uitab, id, e, $scope.fxB0203_1);
  }
	
  //为销售结构分析用例的B0304-3-5的表格删除年份
  $scope.deleteYear = function (uitab, filter) {
    var table = uitab.table;
    var rows = table.tbody.rows;
    if (isNotNull(rows)) {
      for (var i = rows.length - 1; i >= 0; i--) {
        var data = rows[i].data;
        if (data.ssny == filter) {
          rows.remove(rows[i]);
        }
      }
    }
    table.filters.remove(filter);
    table.tbody.rows = rows;
    if (table.filterChoose == filter) {
      if (table && table.filterProperty && table.filters.length > 0) {
        table.filterChoose = table.filters[0];
      } else {
        table.filterChoose = "isEmpty";
      }
    }
  }
	
  //作废当前属期
  $scope.deleteSqData = function (time) {
    var tab = null;
    if (isNotNull($scope.uimodule.tabs) && $scope.uimodule.tabs.length > 0) {
      tab = $scope.uimodule.tabs[0];
      var fxbddm = "";
      if (isNotNull(tab)) {
        var id = tab.id;
        fxbddm = id.substring(0, id.indexOf("-"));
      }
      window.confirm('提示', '请确认是否作废当前属期数据?', function () {
        var viewData = { fxbddm: fxbddm, bbrqz: time };
        var url = "/ajax.sword?ctrl=FxGyCtrl_deleteSqData";
        $scope.times.splice($scope.times.indexOf($scope.checkedTime), 1);
        $.ajax({
          url: url,
          type: 'POST',
          dataType: 'json',
          data: viewData,
          success: function (data) {
            //作废成功回调
            if (data.success) {
              setPrompt("作废当期数据成功", true);
              $scope.uimodule.label.value = $scope.times.length > 0 ? $scope.times[0] : null;
              $scope.checkedTime = $scope.times.length > 0 ? $scope.times[0] : null;
              $scope.loadZlsqData($scope.checkedTime);
              //							 initData();
              //							 $scope.initReport();
              //							 initTimes();
            }
          }
        });
      });
    }
  }
	
  //获得焦点事件
  $scope.inputFocus = function (cell) {
    if ($scope.uimodule.label && $scope.uimodule.label.dataType == 'datetime' && isNull($scope.uimodule.label.value)) {
      alert('请选择资料属期');
      $('.ym-box').fadeIn(200);
    }
  }
  //	$('#zlsqinput').on('click', function(e) {
  //		e.stopPropagation();
  //	});
  $scope.showYmbox = false;
  $(document).on('click', function (e) {
    var ids = ['addsqsrk', 'ymbox', 'ymbox_year', 'ymbox_year_sub', 'ymbox_year_center', 'ymbox_year_add', 'ymbox_month', 'zlsqinput'];
    if (ids.indexOf($(e.target).attr('id')) >= 0) {
      if ($(e.target).attr('id') == 'addsqsrk') {
        $scope.showYmbox = !$scope.showYmbox;
        if ($scope.showYmbox) {
          return;
        }
      } else {
        return;
      }
    }
    $scope.$apply(function () {
      $('.ym-box').fadeOut(200);
    });
  });
      
  $scope.numberInit = function (cell) {
    if (isNotNull(cell.value)) {
      cell.value = $filter('number')(cell.value.toString().replaceAll(',', ''), cell.decimal);
    }
    if (cell.unit && isNotNull(cell.value)) {
      cell.value = cell.value + cell.unit;
    }
  }

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
            //						//分组列
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
  
  $scope.sumRowRefresh = function (uitab) {
    if (uitab.table && uitab.table.sumRow) {
      $(uitab.table.columns).each(function (colIndex, col) {
        if (!col.sumCol) {
          return true;//跳到下一列
        }
        $scope.numberCellChange(uitab, colIndex);
      });
    }
  }
  $scope.numberCellChange = function (uitab, colIndex) {
    if (uitab.table.sumRow && uitab.table.columns[colIndex].sumCol) {
      var sum = 0;
      angular.forEach(uitab.table.tbody.rows, function (row) {
        var cell = row.cells[colIndex];
        if (cell.validate) {
          var vres = cell.validate();
          if (vres.succ && isNotNull(cell.value)) {
            sum = floatAdd(sum, parseFloat(cell.value.toString().replaceAll(',', '')));
          }
        }
      });
      uitab.table.columns[colIndex].sum = sum;
      var colcell = uitab.table.columns[colIndex];
      if (colcell.decimal > 0 && (colcell.sum.toString().indexOf('.') < 0
        || colcell.sum.toString().substring(colcell.sum.toString().indexOf('.') + 1).length < colcell.decimal)) {
        var num;
        if (colcell.sum.toString().indexOf('.') < 0) {
          colcell.sum += '.';
          num = colcell.decimal;
        } else {
          num = colcell.decimal - colcell.sum.toString().substring(colcell.sum.toString().indexOf('.') + 1).length;
        }
        colcell.sum += '0'.repeat(num);
      }
      uitab.table.columns[colIndex].sum = $filter('number')(sum, uitab.table.columns[colIndex].decimal);
    }
  }
  
  //初始化数据
  var initData = function () {
    $scope.loadMsg = "数据加载中...";
    //遍历tab，分别加载各自的table数据
    var loadCount = $scope.uimodule.tabs.length;
    if (loadCount <= 0) {
      alert("请先进行任务分配，再操作本功能");
      return;
    }
    window.showMask();
    angular.forEach($scope.uimodule.tabs, function (tab) {
      loadCount--;
      var param = { xmid: window.top.xmid, cjbddm: cjbddm, cjbgdm: tab.id };
      if ($scope.uimodule.label) {
        param.jzrq = $scope.uimodule.label.value
      }
      //			if(tab.table.paging){
      //				param.pageNum = tab.table.paging.pageNum+'';
      //				param.pageSize = tab.table.paging.pageSize+'';
      //			}
      if (tab.type == 'table') {
        xmcjgyService.loadData(param, function (uidata) {
          //console.log(uidata);
          //set data
          if (cjbddm == "B0103" && uidata.succ == false) {
            alert(uidata.msg);
          } else if (uidata.msg && (uidata.succ || uidata.succ == 'false' || uidata.succ == false)) {
            //setPrompt(uidata.msg, uidata.succ);
            if (uidata.obj) {
              setData($scope.uimodule, tab, uidata.obj);
            }
          } else {
            setData($scope.uimodule, tab, uidata);
          }
          if (loadCount <= 0) {
            window.changeflag = false;
            window.hideMask();
          }
        });
      }
    });
  }
  initUI();
  //tab iframe 计算高度
  //	$scope.getTabIframeHeight = function(){
  //		var iframeheight = $(window).height()-120;
  //		return iframeheight;
  //	}
  //初始化往期期限
  var initTimes = function () {
    var param = { xmid: window.top.xmid, bddm: cjbddm };
    xmcjgyService.queryPeriod(param, function (resp) {
      $scope.times = resp;
      if ($scope.times) {
        if (!$scope.checkedTime) {
          $scope.checkedTime = $scope.times[0];
        }
      }
      window.changeflag = false;
    });
  }
  initTimes();
  //判断动态列是否设置过
  var checkIsNotEmptyDynamicHead = function (tab) {
    if (tab.table) {
      var hasEmptyHeadCell = false;
      $(tab.table.thead.headRows).each(function (index, hr) {
        $(hr.headCells).each(function (cindex, cell) {
          if (isNull(cell.value)) {
            hasEmptyHeadCell = true;
            return false;
          }
        });
        if (hasEmptyHeadCell) {
          return false;
        }
      });
      if (hasEmptyHeadCell) {
        return false;
      }
    }
    return true;
  }
  //判断是否ie或是Chrome内核的浏览器
  $scope.isIe = function () {
    return window.browser.versions.trident || window.browser.versions.webKit;
  }//判断是否ie
  $scope.editmoduleKeyup = function (id, edithead, editheads, $event) {
    if (event.keyCode == 13) {
      $scope.editmodleOff(id, edithead, editheads);
    }
  }
  $scope.setPageOfficeHeight = function () {
    return window.innerHeight - 10;
  }
  $scope.exeCommand = function (button) {
    if ('exit' === button.action) {
      window.top.MainPage.closeTab();
    } else if ('close' === button.action) {
      if (!!closeModalDialog) {
        closeModalDialog();
      }
    } else if ('viewCjmx' === button.action) {
      var viewCjmxUrl = '/sword?ctrl=XmXmcjmxglCtrl_initReadPage';
      window.top.MainPage.newTab('viewCjmx', '采集模型查看', 'icon-home', viewCjmxUrl, true);
    } else if ('viewTzbgjh' === button.action) {
      var xmid = window.top.xmid;
      var url = '/sword?ctrl=XmxjSyjhCtrl_edit' + '&xmid=' + xmid;
      window.top.MainPage.newTab('update_new_syjh' + xmid, '投资并购机会管理', 'icon-home', url);
    } else if ('search' === button.action) {
      slidingSearch();
    } else if ('gssearch' === button.action) {
      qygxslidSearch();
    } else if ('save' === button.action) {
      //保存"高管团队与薪酬结构"下的组织结构图
      // var iframeAngular = structure.window.document.querySelector('[ng-controller=structureController]');
      // if(iframeAngular != null){
      // 	window.changeflag = true;
      // 	changeflag = true;
      // 	var $iframeScope = structure.window.angular.element(iframeAngular).scope();
      // 	$iframeScope.saveStructure();
      // }
			
      if (window.changeflag == false) {
        setPrompt('没有修改，无需保存', true);
        return;
      }
			
      $('div[contenteditable="true"]').blur();
      var param = { xmid: window.top.xmid, cjbddm: $scope.cjbddm, fjuuid: $scope.fjuuid };
      if (_fileUuid) {
        param.fileUuid = _fileUuid;
      }
      var cjbgs = [];
      if ($scope.uimodule.label) {
        if ($scope.uimodule.label.dataType == 'datetime') {
          param.jzrq = $scope.uimodule.label.value;
          if (!param.jzrq) {
            alert("资料属期不能为空");
            return;
          }
        }
        if ($scope.uimodule.label.dataType == 'label') {
          if (!$scope.uimodule.label.value) {
            alert('请导入模版数据');
            return;
          }
          param.jzrq = $scope.uimodule.label.value;
        }
      }
      var invalide = false;
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
                  //暂时先注释掉吧
                  //$scope.uimodule.tabActiveIndex = tabIndex;
                  //锚点定位
                  $scope.ui.tabIndex = tabIndex;
                  /*$location.hash($scope.uimodule.tabs[tabIndex].id);
                      $anchorScroll();*/
                }
                if (cell.validate && !row.del) {
                  var result = cell.validate(validateResult.errors[cell.property]);
                  if (!result.succ) {
                    validateResult.succ = false;
                    invalide = true;
                    validateResult.errors[cell.property] = result;
                  }
                }
                if (cell.dataType == 'text'
                  || cell.dataType == 'textarea'
                  || cell.dataType == 'select'
                  || cell.dataType == 'datetime'
                  || cell.dataType == 'number'
                  || cell.dataType == 'dialog'
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
                    if (cell.dataType == 'select') {
                      cjmx[cell.property + '_zdy'] = cell.zdy;
                      //对于需要放开修改指标分类，项目分析指标的表格组装数据
                      if (tab.id == "A0101-1" || tab.id == "A0201-1" || tab.id == "A0201-4"
                        || tab.id == "A0201-5" || tab.id == "A0401-1" || tab.id == "A0501-1"
                        || tab.id == "B0301-1" || tab.id == "B0302-1" || tab.id == "B0303-1"
                        || tab.id == "B0304-1" || tab.id == "C0101-1" || tab.id == "C0102-1"
                        || tab.id == "C0201-2" || tab.id == "B0204-1" || tab.id == "C0205-1"
                        || tab.id == "C0206-1" || tab.id == "C0207-1" || tab.id == "C0208-1"
                        || tab.id == "C0209-1" || tab.id == "D0401-1" || tab.id == "D0401-2"
                        || tab.id == "D0201-1" || tab.id == "A0301-1" || tab.id == "D0202-1"
                        || tab.id == "D0301-1" || tab.id == "D0101-1" || tab.id == "B0403-1") {
                        cjmx["zbfldm"] = tab.table.tbody.rows[row.rowIndex].data.zbfl;
                        cjmx["zbflvalue"] = tab.table.tbody.rows[row.rowIndex].cells[2].value;
                        cjmx["selectvalue"] = tab.table.tbody.rows[row.rowIndex].cells[2].selectname;
                        if (cjmx["zbflvalue"] != cjmx["selectvalue"]) {
                          cjmx["zbflvalue"] = cjmx["selectvalue"];
                        }
                      } else if (tab.id == "10101-1" || tab.id == "10101-2" || tab.id == "10101-3" ||
                        tab.id == "10201-1" || tab.id == "10201-2" || tab.id == "10201-3" ||
                        tab.id == "10201-4" || tab.id == "10301-1") {
                        cjmx["zbfldm"] = tab.table.tbody.rows[row.rowIndex].data.zbfl;
                        //cjmx["zbfldm"] = tab.table.tbody.rows[row.rowIndex].cells[2].value;
                        cjmx["zbflvalue"] = tab.table.tbody.rows[row.rowIndex].cells[2].value;
                        cjmx["selectvalue"] = tab.table.tbody.rows[row.rowIndex].cells[2].selectname;
                        if (cjmx["zbflvalue"] != cjmx["selectvalue"]) {
                          cjmx["zbflvalue"] = cjmx["selectvalue"];
                        }
                      }
                    }
                  }
                }
              });
              cjmxs.push(cjmx);
            });
            if (!validateResult.succ) {
              //处理提示
              var errors = '';
              for (var k in validateResult.errors) {
                errors += ',' + validateResult.errors[k].propertyName + validateResult.errors[k].msg.join(',');
              }
              setPrompt(errors.substring(1), false);
            }
          }
          cjbg.cjmxs = cjmxs;
          //					//验证表头
          //					if(!checkIsNotEmptyDynamicHead(tab)){
          //						alert('请先添加动态列信息');
          //						invalide = true;
          //					}
          //把头也塞里
          if (!invalide && tab.table) {
            var title = [];
            angular.forEach(tab.table.thead.headRows, function (hr, headRowIndex) {
              var hrv = [];
              angular.forEach(hr.headCells, function (cell) {
                if (headRowIndex == 0) {
                  if (!cell.value) {
                    invalide = true;
                    setPrompt(cell.propertyName + "不能为空", false);
                  } else if (cell.regexp && isNotNull(cell.value)
                    && !(new RegExp(cell.regexp)).test(cell.value.toString())) {
                    invalide = true;
                    setPrompt(cell.propertyName + "格式错误", false);
                  } else if (hrv.indexOf(cell.value) >= 0) {
                    invalide = true;
                    setPrompt(cell.propertyName + "不能重复", false);
                  }
                }
                hrv.push(cell.value);
              });
              title.push(hrv);
            });
            cjbg.title = title;
          }
          if (!invalide && tab.subTable) {
            var fjs = [];
            if (tab.subTable.tbody) {
              angular.forEach(tab.subTable.tbody.rows, function (row) {
                var fjuuid = { fjuuid: row.id };
                fjs.push(fjuuid);
              });
            }
            cjbg.fjs = fjs;
          }
          if (tab.id != "A0101-2" && tab.id != "A0601-1") {//保存的时候，将股东层级结构和对外投资的表格数据过滤掉，这两个表格的数据只做展现，不做保存
            cjbgs.push(cjbg);
          }
        }
      });
      if (invalide) {
        return;
      }
      //param.cjbgs=cjbgs;
      param.datas = angular.toJson(cjbgs);
      if (window.isRunningCommand == true) {
        return;
      }
      window.showMask();
      window.isRunningCommand = true;
      xmcjgyService.save(param, function (data) {
        window.hideMask();
        if (data.succ) {
          setPrompt('保存成功', true);
          changeflag = false;
          if ($scope.uimodule.label && $scope.uimodule.label.value && $scope.uimodule.label.value.substring(0, 7) == $scope.checkedTime) {
            $scope.ui.showZlsqinput = false;
            initData();
            initTimes();
          } else if ($scope.uimodule.label && $scope.uimodule.label.value) {
            $scope.checkedTime = $scope.uimodule.label.value.substring(0, 7);
            initData();
            initTimes();
          } else {
            initData();
            initTimes();
          }
          //刷新图标
          $($scope.uimodule.tabs).each(function (i, t) {
            if (t.chart && t.chart.show) {
              t.chart.show = false;
              $timeout(function () {
                t.chart.show = true;
              }, 1000);
            }
          });
        } else {
          setPrompt(data.msg, false);
        }
        window.isRunningCommand = false;
      }, function () {
        window.hideMask();
        window.isRunningCommand = false;
        changeflag = true;
        //				alert('保存失败');
        setPrompt('保存失败', false);
      });
    } else if ('saveRow' == button.action) {
      var row = arguments[1];
      var param = { xmid: window.top.xmid, cjbddm: $scope.cjbddm, fjuuid: $scope.fjuuid };
      var cjbgs = [];
      var invalide = false;
      //			angular.forEach($scope.uimodule.tabs,function(tab,tabIndex){
      var tab = $scope.uimodule.tabs[$scope.uimodule.tabActiveIndex];
      var tabIndex = $scope.uimodule.tabActiveIndex;
      if (!invalide) {
        var cjbg = "";
        if (button.tabid != undefined || button.tabid != "") {
          cjbg = { cjbgdm: button.tabid };
        } else {
          cjbg = { cjbgdm: tab.id };
        }
        var cjmxs = [];
        if (tab.table && tab.table.tbody) {
          //一个表单的验证结果
          var validateResult = { succ: true, errors: {} };
          //						angular.forEach(tab.table.tbody.rows,function(row){
          var cjmx = { cjmxdm: row.id, isdel: row.del ? true : false };
          angular.forEach(row.cells, function (cell, cellIndex) {
            if (invalide) {
              $scope.uimodule.tabActiveIndex = tabIndex;
            }
            if (cell.validate && !row.del) {
              var result = cell.validate(validateResult.errors[cell.property]);
              if (!result.succ) {
                validateResult.succ = false;
                invalide = true;
                validateResult.errors[cell.property] = result;
              }
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
                if (cell.dataType == 'select') {
                  cjmx[cell.property + '_zdy'] = cell.zdy;
                }
              }
            }
          });
          cjmxs.push(cjmx);
          //						});
          if (!validateResult.succ) {
            //处理提示
            var errors = '';
            for (var k in validateResult.errors) {
              errors += validateResult.errors[k].propertyName + ':' + validateResult.errors[k].msg.join(',') + '<br>';
            }
            alert(errors);
          }
        }
        cjbg.cjmxs = cjmxs;
        //					//验证表头
        //					if(!checkIsNotEmptyDynamicHead(tab)){
        //						alert('请先添加动态列信息');
        //						invalide = true;
        //					}
        //把头也塞里
        if (!invalide && tab.table) {
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
        if (!invalide && tab.subTable) {
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
      if (invalide) {
        return;
      }
      //param.cjbgs=cjbgs;
      if (window.isRunningCommand == true) {
        return;
      }
      param.datas = angular.toJson(cjbgs);
      window.showMask();
      window.isRunningCommand = true;
      xmcjgyService.saveRowData(param, function (data) {
        window.hideMask();
        if (data.succ) {
          //					alert('保存成功');
          setPrompt('保存成功', true);
          changeflag = false;
          initData();
          initTimes();
          //刷新图标
          $($scope.uimodule.tabs).each(function (i, t) {
            if (t.chart && t.chart.show) {
              t.chart.show = false;
              $timeout(function () {
                t.chart.show = true;
              }, 1000);
            }
          });
          window.isRunningCommand = false;
        } else {
          alert(data.msg);
        }
      }, function () {
        window.hideMask();
        window.isRunningCommand = false;
        changeflag = true;
        //				alert('保存失败');
        setPrompt('保存失败', false);
      });
    } else if ('switchEmptyRow' == button.action) {
      button.status = !button.status;
      button.label = button.status ? button.labelOn : button.labelOff;
      $($scope.uimodule.tabs).each(function (tabIndex, tab) {
        var checkPropertys = button.extend[tab.id];
        if (!checkPropertys) {
          return true;//continue
        }
        $(tab.table.tbody.rows).each(function (rowIndex, row) {
          if (button.status) {
            var emptyRow = true;
            $(row.cells).each(function (cellIndex, cell) {
              if (checkPropertys.indexOf(cell.property) >= 0
                && ((cell.dataType != 'number' && isNotNull(cell.value))
                  || (cell.dataType == 'number' && !/^(0|0.0+)$/.test(cell.value)))) {
                emptyRow = false;
                return false;//break each
              }
            });
            if (emptyRow) {
              row.hide = true;
            } else {
              row.hide = false;
            }
          } else {
            row.hide = false;
          }
        });
        refreshGroup(tab);
      });
    } else if ('chart' === button.action) {
      var tab = arguments[1];
      if (isNotNull(tab) && isNotNull(tab.chart) && isNotNull($scope.uimodule) && isNotNull($scope.uimodule.label)) {
        tab.chart.url = tab.chart.url + "&bbrqz=" + $scope.uimodule.label.value;
      }
      button.status = !button.status;
      button.label = button.status ? button.labelOff : button.labelOn;
      tab.chart.show = button.status;
      //window.top.MainPage.newTab('report_line_'+tab.id,'图表','icon-bar-chart','/sword?ctrl='+ctrl+'_report&bgdm='+tab.id,true);
    } else if ('structure' === button.action) {
      var tab = arguments[1];
      if (isNotNull(tab) && isNotNull(tab.structure) && isNotNull($scope.uimodule) && isNotNull($scope.uimodule.label)) {
        tab.structure.url = tab.structure.url + "&xmid=" + window.top.xmid;
      }
      button.status = !button.status;
      button.label = button.status ? button.labelOff : button.labelOn;
      tab.structure.show = button.status;
      //window.top.MainPage.newTab('report_line_'+tab.id,'图表','icon-bar-chart','/sword?ctrl='+ctrl+'_report&bgdm='+tab.id,true);
    } else if ('add' === button.action) {
      var tab = arguments[1];
      //验证表头
      if (!checkIsNotEmptyDynamicHead(tab)) {
        alert('请先添加动态列信息');
        return;
      }
      //判断动态列是否有值，没有提示
      var flag = true;
      var row = { rowIndex: tab.table.tbody.rows.length, cells: [], data: {} };
      angular.forEach(tab.table.columns, function (column, colIndex, colArr) {
        var cell = angular.copy(column);
        row.data[column.property] = '';
        if (cell.dataType == 'select') {
          //增加获取焦点事件
          $timeout(function () {
            //:: toFix
            var selectId = "#select_" + tab.id + "_" + row.rowIndex + "_" + colIndex;
            $(selectId).focus();
            var h = $('#main_table_panel_' + tab.id).height();
            var th = $('#main_table_' + tab.id).height();
            $('#main_table_panel_' + tab.id).scrollTop(th - h + 35);
          }, 300);
          if (cell.options.length == 1) {
            //alert(cell.emptyOptionsMsg);
            if (isNotNull(tab) && (tab.id == "10302-1" || tab.id == "10102-1" || tab.id == "10202-1")) {
              //							alert("请维护访谈角色分类");
              flag = true;
            } else {
              flag = false;
            }
          }
        }
        cell.colIndex = colIndex;
        cell.value = '';
        if (cell.dataType == 'href') {
          cell.dataType = 'text';
          cell.property = cell.labelProperty;
        } else if (cell.dataType == 'label') {
          //					cell.dataType = 'text';
        }
        if (cell.dataType == 'text'
          || cell.dataType == 'textarea'
          || cell.dataType == 'select'
          || cell.dataType == 'datetime'
          || cell.dataType == 'number'
          || cell.dataType == 'label') {
          cell.validate = uigyService.cellValidation;
        }
        if (tab.id == "B0203-1" && cell.property == "ssny") {
          if (isNull(tab.table.filterChoose) || tab.table.filters.length <= 0) {
            alert("请先增加年份再增行录入数据");
            flag = false;
            return;
          } else {
            cell.value = tab.table.filterChoose;
            row.cells[colIndex] = cell;
          }
        } else {
          row.cells[colIndex] = cell;
        }
      });
      if (flag) {
        window.changeflag = true;
        tab.table.tbody.rows.push(row);
        //处理滚动条滚动到底部
        $timeout(function () {
          var h = $('#main_table_panel_' + tab.id).height();
          var th = $('#main_table_' + tab.id).height();
          $('#main_table_panel_' + tab.id).scrollTop(th - h + 35);
        }, 500);
      }
    } else if ('delete' === button.action) {
      var tab = arguments[1];
      //var selectedRowIds = [];
      var selectedNoIdRowIndexs = [];
      var selectedRowIndexs = [];
      var canDel = true;
      angular.forEach(tab.table.tbody.rows, function (row, rowIndex) {
        if (row.checked) {
          if (row.id) {
            selectedRowIndexs.push(rowIndex);
          } else {
            selectedNoIdRowIndexs.push(rowIndex);
          }
        }
      });
      if (selectedRowIndexs.length <= 0 && selectedNoIdRowIndexs.length <= 0) {
        setPrompt("请选中要删除的记录", false);
      } else {
        $('#prompt').parent().hide(500);
        window.changeflag = true;
        if (selectedRowIndexs.length > 0) {
          angular.forEach(selectedRowIndexs, function (index) {
            tab.table.tbody.rows[index].del = true;
          });
        }
        if (selectedNoIdRowIndexs.length > 0) {
          for (var i = selectedNoIdRowIndexs.length - 1; i >= 0; i--) {
            tab.table.tbody.rows.splice(selectedNoIdRowIndexs[i], 1);
          }
        }
        refreshGroup(tab);
        $scope.sumRowRefresh(tab);
        $scope.exeFuncs(tab);
        $scope.changeReport(tab);
      }
    } else if ('editcol' === button.action) {
      if ($scope.uimodule.label && $scope.uimodule.label.dataType == 'datetime' && isNull($scope.uimodule.label.value)) {
        alert('请选择资料属期');
        $('.ym-box').fadeIn(200);
        return;
      }
      var tab;
      if (button.tab) {
        tab = button.tab;
      } else {
        tab = arguments[1];
      }
      var editHeads = [];//编辑列
      var editHeadDescription = tab.table.thead.editHeadDescription;
      angular.forEach(tab.table.thead.headRows[0].headCells, function (headCell) {
        if (headCell.dataType == 'text') {
          var cell = angular.copy(headCell);
          cell.oldValue = cell.value;
          editHeads.push(cell);
        }
      });
      ngDialog.open({
        showClose: false,
        width: 340,
        template: 'uigy/templates/editcol.html',
        className: 'ngdialog-theme-plain',
        controller: function ($scope) {
          $scope.description = editHeadDescription;
          $scope.editHeads = editHeads;
          $scope.del = function (index) {
            if ($scope.editHeads[index].oldValue) {
              $scope.editHeads[index].isdel = true;
            } else {
              $scope.editHeads.splice(index, 1);
            }
			    		
          }
          $scope.candel = function () {
            return true;
          }
          $scope.checkRequired = function (head) {
            if (!head.value || (head.regexp && isNotNull(head.value)
              && !(new RegExp(head.regexp)).test(head.value.toString()))) {
              return {
                background: '#eff3f8'
              };
            } else {
              return {};
            }
          }
          $scope.add = function () {
            var newHead = angular.copy($scope.editHeads[0]);
            newHead.value = '';
            newHead.oldValue = '';
            newHead.isdel = false;
            $scope.editHeads.push(newHead);
          }
          $scope.ok = function () {
            //确认处理
            //验证
            var requiredErr = false;
            var formatErr = false;
            var columns = [];
            var tmp = [];
            var exists = false;
            angular.forEach($scope.editHeads, function (head) {
              if (!head.value) {
                requiredErr = true;
              }
              var col = {};
              col[head.property] = head.value;
              col.oldValue = head.oldValue;
              col.isdel = head.isdel;
              columns.push(col);
              if (tmp.indexOf(head.value) >= 0) {
                exists = true;
              } else {
                tmp.push(head.value);
              }
              tmp.push(head.value);
              if (!col.isdel && head.regexp && isNotNull(head.value)
                && !(new RegExp(head.regexp)).test(head.value.toString())) {
                formatErr = true;
              }
            });
            var errmsg = '';
            if (requiredErr) {
              errmsg += $scope.editHeads[0].propertyName + '不能为空;';
            }
            if (formatErr) {
              errmsg += $scope.editHeads[0].propertyName + '格式不正确;';
            }
            if (exists) {
              errmsg += '不能重复';
            }
            if (formatErr || requiredErr || exists) {
              alert(errmsg);
              return;
            } else {
              var param = { columns: angular.toJson(columns) };
              //请求后台
              var cjbg = { cjbgdm: tab.id };
              var cjmxs = [];
              if (tab.table && tab.table.tbody) {
                //保存表单信息
                angular.forEach(tab.table.tbody.rows, function (row) {
                  var cjmx = { cjmxdm: row.id, isdel: row.del ? true : false };
                  angular.forEach(row.cells, function (cell, cellIndex) {
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
              }
              cjbg.cjmxs = cjmxs;
              //把头也塞里
              if (tab.table) {
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
              //param.cjbgs=cjbgs;
              param.datas = angular.toJson(cjbg);
              window.showMask();
              xmcjgyService.refreshColumn(param, function (uidata) {
                window.hideMask();
                setData($scope.uimodule, tab, uidata);
              }, function () {
                window.hideMask();
                alert('编辑动态列失败');
              });
            }
            $scope.closeThisDialog(1);
          }
          $scope.editcol_keyup = function (event, head, editHeads, index) {
            var keycode = window.event ? event.keyCode : event.which;
            if (keycode == 13) {
              if (index == editHeads.length - 1) {
                $scope.ok();
              } else {
                $("input[name^='editHead']")[index + 1].focus();
              }
            }
          }
        }
      });
    } else if ('addFile' === button.action) {
      var tab = arguments[1];
      ngDialog.open({
        showClose: false,
        width: 1100,
        template: 'uigy/templates/file-select-dialog.html',
        className: 'ngdialog-theme-plain',
        controller: function ($scope) {
          $scope.viewOneFile = function (fileuuid) {
            var url = "/ywpt/page/viewFILE.jsp?uuid=" + fileuuid;
            top.MainPage.closeTab("menu_ckwj");
            window.top.MainPage.newTab('menu_ckwj', '预览文件', '', url, true);
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
          { cjbddms: ['10103'], files: [], loading: true }];
          angular.forEach($scope.tabs, function (tab) {
            xmcjgyService.queryXmFiles({ xmid: window.top.xmid, cjbddms: angular.toJson(tab.cjbddms) }, function (data) {
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
              alert('加载文件列表失败');
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
                  }
                }
              });
            });
            $scope.closeThisDialog(1);
          }
        }
      });
    } else if ('delFile' === button.action) {
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
        changflag = true;
      }
    } else if ('loadFile' === button.action) {
      var uimodule = $scope.uimodule;
      var pageScope = $scope;
      window.showMask();
      xmcjgyService.getLoadFiles({ xmid: window.top.xmid, cjbddm: cjbddm }, function (data) {
        var files = data;
        window.hideMask();
        if (files.length <= 0) {
          setPrompt('该分析对应的采集文件尚未提交', false);
          return;
        }
        showDialog(files);
      }, function () {
        setPrompt('加载文件列表失败', false);
      });
      var showDialog = function (files) {
        ngDialog.open({
          showClose: false,
          width: 1100,
          template: 'uigy/templates/load-file-dialog.html',
          className: 'ngdialog-theme-plain',
          closeByEscape: false,
          closeByDocument: false,
          overlay: true,
          onOpenCallback: function () {
            window.showHeaderMask();
          },
          preCloseCallback: function () {
            window.hideHeaderMask();
          },
          appendTo: top.body,
          controller: function ($scope) {
            $scope.files = files;
            $scope.selectedFile = function (uuid) {
              if (!$scope.seluuid || $scope.seluuid != uuid) {
                $scope.seluuid = uuid;
              } else {
                $scope.seluuid = false;
              }
            }
            $scope.loadFile = function () {
              window.showMask();
              xmcjgyService.loadFile({ xmid: window.top.xmid, cjbddm: cjbddm, fileUuid: $scope.seluuid }, function (data) {
                pageScope.fjuuid = $scope.seluuid;
                _fileUuid = $scope.seluuid;
                if (data.succ != null && data.succ != undefined && (data.succ == false || data.succ == 'false')) {
                  window.hideMask();
                  setPrompt(data.msg, false);
                } else if (data.succ != null && data.succ != undefined && (data.succ == true || data.succ == 'true')) {
                  window.changeflag = true;
                  angular.forEach(data.obj, function (d) {
                    angular.forEach(uimodule.tabs, function (tab) {
                      if (tab.id == d.id) {
                        setData($scope.uimodule, tab, d);
                      }
                    })
                  });
                  pageScope.checkedTime = data.obj[0].label;
                  if (pageScope.uimodule.hasReport) {
                    xmcjgyService.getReportData(new Object(), function (resp) {
                      pageScope.reportData = resp;
                      $("div[id^='linereport']").each(function () {
                        pageScope.initEcharts.push({
                          id: this.id,
                          echarts: echarts.init(this),
                        });
                      });
                      angular.forEach(uimodule.tabs, function (tab) {
                        pageScope.changeReport(tab);
                      });
                    }, function () {
                      alert('加载图表数据失败!');
                    });
                  }
                  if (data.msg) {
                    setPrompt(data.msg, false);
                  }
                  window.hideMask();
                } else {
                  window.changeflag = true;
                  angular.forEach(data, function (d) {
                    angular.forEach(uimodule.tabs, function (tab) {
                      if (tab.id == d.id) {
                        setData($scope.uimodule, tab, d);
                      }
                    })
                  });
                  pageScope.checkedTime = data[0].label;
                  if (pageScope.uimodule.hasReport) {
                    xmcjgyService.getReportData(new Object(), function (resp) {
                      pageScope.reportData = resp;
                      $("div[id^='linereport']").each(function () {
                        pageScope.initEcharts.push({
                          id: this.id,
                          echarts: echarts.init(this),
                        });
                      });
                      angular.forEach(uimodule.tabs, function (tab) {
                        pageScope.changeReport(tab);
                      });
                    }, function () {
                      alert('加载图表数据失败!');
                    });
                  }
                  window.hideMask();
                }
              }, function () {
                setPrompt('加载文件数据失败', false);
              });
              $scope.closeThisDialog(1);
            }
          }
        });
      }
			
    } else if ('ztpj' === button.action) {
      var url = 'resources/pageoffice/editztpj.jsp?cjbddm=' + cjbddm + '&xmid=' + window.top.xmid;
      //判断浏览器如果是ie 就用内嵌打开，如果是其他就link方式打开
      if (window.browser.versions.trident) {//ie内核
        top.MainPage.closeTab("menu_ztpj");
        window.top.MainPage.newTab('menu_ztpj', '总体评价', 'icon-home', '/' + url, true);
      } else {
        window.location.href = pageofficelink.replace('_url_', url);
      }
    } else if ('xmjzfx' === button.action) {
      var url = 'resources/pageoffice/editXmtzJz.jsp?cjbddm=' + cjbddm + '&xmid=' + window.top.xmid;
      //判断浏览器如果是ie 就用内嵌打开，如果是其他就link方式打开
      if (window.browser.versions.trident) {//ie内核
        top.MainPage.closeTab("menu_ztpj");
        window.top.MainPage.newTab('menu_ztpj', '总体评价', 'icon-home', '/' + url, true);
      } else {
        window.location.href = pageofficelink.replace('_url_', url);
      }
    } else if ('editmb' === button.action) {
      var uimodule = $scope.uimodule;
      var cjbgdm = $scope.uimodule.tabActiveCjbgdm;
      var zlsq = $scope.uimodule.label.value;
      var pageScope = $scope;
      var tables = $scope.uimodule.tabs;
      window.showMask();
      xmcjgyService.queryYssj({ xmid: window.top.xmid, fxbgdm: cjbgdm, zlsq: zlsq }, function (data) {
        window.hideMask();
        showDialog(data);
      }, function () {
        window.hideMask();
        alert('加载\数据失败失败');
      });
      var showDialog = function (tab) {
        ngDialog.open({
          showClose: false,
          width: 1100,
          template: 'uigy/templates/show-mb-yss-msg-dialog.html',
          className: 'ngdialog-theme-plain',
          controller: function ($scope) {
            $scope.tab = tab;
            $scope.save = function () {
              if (window.isRunningCommand == true) {
                return;
              }
              window.showMask();
              var param = {
                xmid: $scope.tab.obj.xmid,
                zlsq: $scope.tab.obj.zlsq,
                fxbgdm: $scope.tab.obj.fxbgdm,
                mbfjuuid: $scope.tab.obj.mbfjuuid,
                titles: angular.toJson($scope.tab.obj.titles),
                datas: angular.toJson($scope.tab.obj.datas),
              };
              window.isRunningCommand = true;
              xmcjgyService.saveYssj(param, function (data) {
                if (data.succ) {
                  xmcjgyService.loadYssj(data.obj, function (uidata) {
                    if (!uidata) {
                      alert('数据加载失败');
                    }
                    for (var i = 0; i < uidata.length; i++) {
                      for (var j = 0; j < tables.length; j++) {
                        if (tables[j].id == uidata[i].id) {
                          setData($scope.uimodule, tables[j], uidata[i]);
                        }
                      }
                    }
                    window.hideMask();
                    alert('保存成功');
                    changeflag = false;
                    $scope.closeThisDialog(1);
                  });
                  window.isRunningCommand = false;
                } else {
                  window.hideMask();
                  alert(data.msg);
                }
              }, function () {
                window.hideMask();
                window.isRunningCommand = false;
                alert('保存失败');
                changeflag = true;
                $scope.closeThisDialog(1);
              });
            };
            $scope.addRows = function () {
              var tab = angular.copy($scope.tab.obj.datas[$scope.tab.obj.datas.length - 1]);
              for (var key in tab) {
                tab[key] = '';
              }
              $scope.tab.obj.datas.push(tab);
            };
            $scope.delRows = function () {
              for (var i = 0; i < $scope.tab.obj.datas.length; i++) {
                if ($scope.tab.obj.datas[i].checked) {
                  $scope.tab.obj.datas.splice(i--, 1);
                }
              }
            };
            $scope.toFix = function (data, key, type) {
              if (data && key && data[key]) {
                if (type == "put") {
                  data[key] = data[key] + ',';
                  data[key] = data[key].replace(/,/gm, '');
                } else if (type == "fix") {
                  var num = parseFloat((data[key] + "").replace(/[^\d\.-]/g, "")).toFixed(2) + "";
                  var l = num.split(".")[0].split("").reverse(),
                    r = num.split(".")[1];
                  t = "";
                  for (i = 0; i < l.length; i++) {
                    t += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length ? "," : "");
                  }
                  data[key] = t.split("").reverse().join("") + "." + r;
                }
              }
            }
          }
        });
      }
    } else if ('invalid' === button.action) {
      var tab = null;
      var time = $scope.checkedTime;
      if (isNotNull($scope.uimodule.tabs) && $scope.uimodule.tabs.length > 0) {
        tab = $scope.uimodule.tabs[0];
        var fxbddm = "";
        if (isNotNull(tab)) {
          var id = tab.id;
          fxbddm = id.substring(0, id.indexOf("-"));
        }
        window.confirm('提示', '请确认是否作废当前属期数据?', function () {
          var viewData = { fxbddm: fxbddm, bbrqz: time };
          var url = "/ajax.sword?ctrl=FxGyCtrl_deleteSqData";
          $scope.times.splice($scope.times.indexOf($scope.checkedTime), 1);
          $.ajax({
            url: url,
            type: 'POST',
            dataType: 'json',
            data: viewData,
            success: function (data) {
              //作废成功回调
              if (data.success) {
                setPrompt("作废当期数据成功", true);
                $scope.uimodule.label.value = $scope.times.length > 0 ? $scope.times[0] : null;
                $scope.checkedTime = $scope.times.length > 0 ? $scope.times[0] : null;
                $scope.loadZlsqData($scope.checkedTime);
                //								 initData();
                //								 $scope.initReport();
                //								 initTimes();
              }
            }
          });
        });
      }
    }
  }
  $scope.viewOneFile = function (fileuuid) {
    var url = "/ywpt/page/viewFILE.jsp?uuid=" + fileuuid;
    top.MainPage.closeTab("menu_ckwj");
    window.top.MainPage.newTab('menu_ckwj', '预览文件', '', url, true);
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
      template: 'uigy/templates/textarea-dialog.html',
      className: 'ngdialog-theme-plain',
      controller: function ($scope) {
        //		    	$scope.shouldBeOpen = true;
        $scope.description = angular.copy(cell.value);
        $scope.save = function () {
          cell.value = angular.copy($scope.description);
          window.changeflag = true;
          cell.validate();
          $scope.closeThisDialog(1);
        }
      }
    });
  }
  //查看file
  $scope.viewFile = function (cjmxdm, isRefXm) {
    var url;
    if (isRefXm == '0') {
      url = "/ywpt/page/viewFILE.jsp?xmid=0&cjmxdm=" + cjmxdm;
    } else {
      url = "/ywpt/page/viewFILE.jsp?xmid=" + window.top.xmid + "&cjmxdm=" + cjmxdm;
    }
    top.MainPage.closeTab("menu_ckwj");
    window.top.MainPage.newTab('menu_ckwj', '预览文件', '', url, true);
  }
  //删除file
  $scope.delFile = function (cjmxdm, cell, uirow) {
    var xmid;
    if (cell.isRefXm == '0') {
      xmid = '0';
    } else {
      xmid = window.top.xmid;
    }
    var param = { xmid: xmid, cjmxdm: cjmxdm };
    ngDialog.open({
      showClose: false,
      width: 1000,
      template: 'uigy/templates/file-dialog.html',
      className: 'ngdialog-theme-plain',
      controller: function ($scope) {
        xmcjgyService.getFileList(param, function (data) {
          $scope.files = data;
        }, function () {
          alert('加载附件列表失败');
        });
		    	
        $scope.delFile = function () {
          var uuids = '';
          var count = 0;
          angular.forEach($scope.files, function (file) {
            if (file.checked) {
              uuids += ',' + file.uuid;
              count++;
            }
          });
          if (uuids.length == 0) {
            alert('请选中要删除的文件');
            return;
          }
          xmcjgyService.delFiles({ uuids: uuids.substring(1) }, function (data) {
            if (data.succ) {
              setPrompt('删除成功', true);
              $scope.closeThisDialog(1);
              if (count == $scope.files.length) {
                cell.value = false;
              }
              if (!isNull(uirow.data.fjsl)) {
                uirow.data.fjsl = parseInt(uirow.data.fjsl) - count;
              }
            } else {
              alert(data.msg);
            }
          }, function () {
            setPrompt('删除失败', false);
          });
		    		
        }
      }
    });
		
  }
  //拼链接方法
  $scope.getHref = function (href, params) {
    //暂时支持带问好并且带参数的和不带问号的，params 必须a=1&b=2这种格式
    var url = href;
    if (href.indexOf('?') < 0) {
      url += '?1=1';
    }
    return url + '&' + params;
  }
  //文件获取
  $scope.fileSelect = function (cjmxdm) {
		
  }
  $scope.showDialog = function (uicell, uirow) {
    if (uicell.type == 'dialog') {
      if ('url' == uicell.showType) {
        ngDialog.open({
          showClose: false,
          width: 800,
          template: 'uigy/templates/dialog.html',
          className: 'ngdialog-theme-plain',
          controller: function ($scope) {
            $scope.url = angular.copy(uicell.href);
            $scope.height = angular.copy(uicell.height);
          }
        });
      } else if ('datasource' == uicell.showType) {
        var datasource = uirow.data.datasource;
        window.showMask();
        xmcjgyService.loadDataSource(datasource.ctrl, datasource.param, function (data) {
          window.hideMask();
          ngDialog.open({
            showClose: false,
            width: 800,
            template: 'uigy/templates/show-xxxx-dialog.html',
            className: 'ngdialog-theme-plain',
            controller: function ($scope) {
              $scope.tab = data;
            }
          });
        }, function () {
          window.hideMask();
          alert('加载\数据失败失败');
        });
      }
    } else {
      window.top.MainPage.newTab('detail' + uicell.value, '详情', 'icon-home', uicell.href, true);
    }
  }
  //tab超长隐藏部分标签 功能
  $scope.tabsTooLong = false;
  var initTabs = function () {
    //jquery 获取可显示tab宽度
    var docWidth = $(document).width() - 30;
    //计算总长度
    var width = 0;
    $($scope.uimodule.tabs).each(function (i, t) {
      t.width = $.trim(t.title).length * 13 + 40;
      width += t.width;
      if ($scope.tabsTooLong) {
        t.show = false;
      } else if ((width - docWidth + 40) > 0) {
        $scope.tabsTooLong = true;
        t.show = false;
      } else {
        t.show = true;
      }
    });
  }
  //向右翻
  $scope.tabsRight = function () {
    if (!$scope.tabsTooLong || $scope.uimodule.tabs[$scope.uimodule.tabs.length - 1].show)
      return;
    var leftIndex = -1, rightIndex = -1;
    $($scope.uimodule.tabs).each(function (i, t) {
      if (leftIndex < 0) {
        if (t.show) {
          leftIndex = i;
        } else {
          return true;//continue
        }
      } else if (rightIndex < 0) {
        if (!t.show) {
          rightIndex = i;
        } else {
          return true;//continue
        }
      } else {
        return false;//break loop
      }
    });
    $scope.uimodule.tabs[leftIndex].show = false;
    $scope.uimodule.tabs[rightIndex].show = true;
  }
  //向左翻
  $scope.tabsLeft = function () {
    if (!$scope.tabsTooLong || $scope.uimodule.tabs[0].show)
      return;
    var leftIndex = -1, rightIndex = -1;
    for (var i = $scope.uimodule.tabs.length - 1; i >= 0; i--) {
      var t = $scope.uimodule.tabs[i];
      if (rightIndex < 0) {
        if (t.show) {
          rightIndex = i;
        } else {
          continue;
        }
      } else if (leftIndex < 0) {
        if (!t.show) {
          leftIndex = i;
        } else {
          continue;
        }
      } else {
        break;
      }
    }
    $scope.uimodule.tabs[leftIndex].show = true;
    $scope.uimodule.tabs[rightIndex].show = false;
  }
  //激活某个标签处理
  $scope.activeTab = function (index) {
    if (!$scope.tabsTooLong || index == 0 || index == $scope.uimodule.tabs - 1)
      return;
    if (!$scope.uimodule.tabs[index - 1].show) {
      $scope.tabsLeft();
    } else if (!$scope.uimodule.tabs[index + 1].show) {
      $scope.tabsRight();
    }
  }
  //tab 超长切换功能结束
  //计算table最大高度
  $scope.getTableMaxHeight = function () {
    var height = $(window).height() - 100 - 24;
    if ($scope.uimodule && $scope.uimodule.tabs && $scope.uimodule.tabs.length > 1) {
      height = height - 26;
    }
    if (height < 400) {
      return 400;
    } else {
      return height;
    }
  }
  //设置iframe高度$scope.setPageOfficeHeight
  window.onresize = function () {
    $scope.$apply(function () {
      $scope.getTableMaxHeight();
      //			$scope.setPageOfficeHeight();
    });
  }

  //div实现自动换行
  $scope.getTextareaDivText = function (value) {
    if (value) {
      return $sce.trustAsHtml(value.replace(/\n/g, "<br/>"));
    } else {
      return "";
    }
  }
  //自动文本域高度
  //	$scope.getTextAreaHeight = function(uirow){
  //		if(!uirow||!uirow.cells||uirow.cells.length<=0){
  //			return 16;
  //		}
  //		var maxHeight=16;
  //		$(uirow.cells).each(function(i,c){
  //			if(c.dataType=='textarea'){
  //				var h=16;
  //				if(c.value&&c.value.indexOf('\n')>0){
  //					h = 16*c.value.split("\n").length;
  //				}
  //				if(maxHeight<h){
  //					maxHeight=h;
  //				}
  //			}
  //		});
  //		return maxHeight;
  //	}
  //	$scope.resetTextAreaHeightOnKeyup = function(event,uicell){
  //		if (event.keyCode === 13){
  //			uicell.height += 16;
  //			uicell.value += "\r\n ";
  //		}else if(event.keyCode === 8){
  //			var height = 16*uicell.value.split("\n").length;
  //			console.log("\n",height,uicell.height);
  //			if(uicell.height-height==16){
  //				uicell.height -= 16;
  //			}
  //		}
  //	}
	

  $scope.makeCjbgsData = function (tab) {
    var invalide = false;
    if (!invalide) {
      var cjbg = {
        cjbgdm: tab.id,
        bbrqz: $scope.uimodule.label.value
      };
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
            if (cell.validate && !row.del) {
              var result = cell.validate(validateResult.errors[cell.property]);
              if (!result.succ) {
                validateResult.succ = false;
                invalide = true;
                validateResult.errors[cell.property] = result;
              }
            }
            if (cell.dataType == 'text'
              || cell.dataType == 'textarea'
              || cell.dataType == 'select'
              || cell.dataType == 'datetime'
              || cell.dataType == 'number'
              || cell.dataType == 'dialog'
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
                if (cell.dataType == 'select') {
                  cjmx[cell.property + '_zdy'] = cell.zdy;
                  //对于需要放开修改指标分类，项目分析指标的表格组装数据
                  if (tab.id == "A0101-1" || tab.id == "A0201-1" || tab.id == "A0201-4"
                    || tab.id == "A0201-5" || tab.id == "A0401-1" || tab.id == "A0501-1"
                    || tab.id == "B0301-1" || tab.id == "B0302-1" || tab.id == "B0303-1"
                    || tab.id == "B0304-1" || tab.id == "C0101-1" || tab.id == "C0102-1"
                    || tab.id == "C0201-2" || tab.id == "B0204-1" || tab.id == "C0205-1"
                    || tab.id == "C0206-1" || tab.id == "C0207-1" || tab.id == "C0208-1"
                    || tab.id == "C0209-1" || tab.id == "D0401-1" || tab.id == "D0401-2"
                    || tab.id == "D0201-1" || tab.id == "A0301-1" || tab.id == "D0202-1"
                    || tab.id == "D0301-1" || tab.id == "D0101-1" || tab.id == "B0403-1") {
											
                    cjmx["zbfldm"] = tab.table.tbody.rows[row.rowIndex].data.zbfl;
                    cjmx["zbflvalue"] = tab.table.tbody.rows[row.rowIndex].cells[2].value;
                    cjmx["selectvalue"] = tab.table.tbody.rows[row.rowIndex].cells[2].selectname;
                    if (cjmx["zbflvalue"] != cjmx["selectvalue"]) {
                      cjmx["zbflvalue"] = cjmx["selectvalue"];
                    }
                  } else if (tab.id == "10101-1" || tab.id == "10101-2" || tab.id == "10101-3" ||
                    tab.id == "10201-1" || tab.id == "10201-2" || tab.id == "10201-3" ||
                    tab.id == "10201-4" || tab.id == "10301-1") {
                    cjmx["zbfldm"] = tab.table.tbody.rows[row.rowIndex].data.zbfl;
                    //cjmx["zbfldm"] = tab.table.tbody.rows[row.rowIndex].cells[2].value;
                    cjmx["zbflvalue"] = tab.table.tbody.rows[row.rowIndex].cells[2].value;
                    cjmx["selectvalue"] = tab.table.tbody.rows[row.rowIndex].cells[2].selectname;
                    if (cjmx["zbflvalue"] != cjmx["selectvalue"]) {
                      cjmx["zbflvalue"] = cjmx["selectvalue"];
                    }
                  }
                }
              }
            }
          });
          cjmxs.push(cjmx);
        });
        if (!validateResult.succ) {
          //处理提示
          var errors = '';
          for (var k in validateResult.errors) {
            errors += ',' + validateResult.errors[k].propertyName + validateResult.errors[k].msg.join(',');
          }
          setPrompt(errors.substring(1), false);
        }
      }
      cjbg.cjmxs = cjmxs;
      //			//验证表头
      //			if(!checkIsNotEmptyDynamicHead(tab)){
      //				alert('请先添加动态列信息');
      //				invalide = true;
      //			}
      //把头也塞里
      if (!invalide && tab.table) {
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
      if (!invalide && tab.subTable) {
        var fjs = [];
        if (tab.subTable.tbody) {
          angular.forEach(tab.subTable.tbody.rows, function (row) {
            var fjuuid = { fjuuid: row.id };
            fjs.push(fjuuid);
          });
        }
        cjbg.fjs = fjs;
      }
    }
    if (invalide || !cjbg) {
      return;
    }
    return cjbg;
  }
	
	
  function getRandom(arrs) {
    var index = Math.floor(Math.random() * arrs.length);
    arrs.splice(index, 1);
    return arrs[index];
  }
  function getColorRandom() {
    var arrs = new Array();
    for (var i = 0; i < echartsColor.length; i++) {
      arrs.push(getRandom(echartsColor));
    }
    return arrs;
  }
  $scope.initEcharts = new Array();
  $scope.echartsColor = getColorRandom();
  $scope.reportData = "";
  $scope.initReport = function () {
    if ($scope.uimodule.hasReport) {
      xmcjgyService.getReportData(new Object(), function (resp) {
        $scope.reportData = resp;
        $("div[id^='linereport']").each(function () {
          $scope.initEcharts.push({
            id: this.id,
            echarts: echarts.init(this),
          });
        });
        if (isNotNull($scope.uimodule.label) && $scope.uimodule.label.value) {
          $scope.selectedTime($scope.uimodule.label.value);
        } else {
          initData();
        }
      }, function () {
        alert('加载图表数据失败!');
      });
    } else {
      if (isNotNull($scope.uimodule.label) && $scope.uimodule.label.value) {
        $scope.selectedTime($scope.uimodule.label.value);
      } else {
        initData();
      }
    }
  }
  $scope.changeReport = function (uitab) {
    if ($scope.uimodule.hasReport) {
      if (uitab.funcs && uitab.funcs.length > 0) {
        $(uitab.funcs).each(function (index, func) {
          if (func.indexOf("Report") >= 0 && window[func]) {
            var option = window[func]($scope.makeCjbgsData(uitab), $scope.reportData);//setOption(option)
            if (!option.color || !option.color.length || option.color.length <= 0) {
              option.color = $scope.echartsColor;
            }
            angular.forEach($scope.initEcharts, function (initEchart, eindex) {
              if (initEchart.id == 'linereport' + uitab.id + '-' + index) {
                initEchart.echarts.clear();
                initEchart.echarts.setOption(option);
              }
            });
            uitab.chart.show = false;
            $(uitab.footerbar.buttons).each(function (btnIndex, button) {
              if ('chart' == button.action) {
                button.status = false;
                button.label = button.labelOn;
              }
            });
            for (var i = 0; i < $scope.reportData.length; i++) {
              var report = $scope.reportData[i];
              if (uitab.id == report.fxbgdm) {
                if (report.data && report.data.length > 0) {
                  uitab.chart.show = true;
                  $(uitab.footerbar.buttons).each(function (btnIndex, button) {
                    if ('chart' == button.action) {
                      button.status = true;
                      button.label = button.labelOff;
                    }
                  });
                  break;
                }
              }
            }
          }
        });
      }
    }
  }
  $scope.openFtjl = function (ftjlURL) {
    //判断浏览器如果是ie 就用内嵌打开，如果是其他就link方式打开
    if (window.browser.versions.trident) {//ie内核
      top.MainPage.closeTab("menu_ftjl");
      window.top.MainPage.newTab('menu_ftjl', '访谈记录', 'icon-home', '/' + ftjlURL, true);
    } else {
      window.location.href = pageofficelink.replace('_url_', ftjlURL);
    }
  }
	
  $scope.slideToggle = function () {
    $(".function_click_icon").toggleClass("function_menu_click");
    $(".font-awesome-icon").toggleClass("icon-th-large").toggleClass("icon-remove");
    $(".function_menu_list").slideToggle("quick");
  }
  $scope.initDrag = function () {
    //init position right down corn
    $(".new_function_menu").css("right", "1px");
    $(".new_function_menu").css("bottom", "40%");
    //setTimeout('$(".new_function_menu").css("width",$(".new_function_menu").width())',100);//set fix width to prevent drag slide width change
    //setTimeout('autoTextarea()',1000);//set fix width to prevent drag slide width change
    $(".new_function_menu").draggable({
      containment: "body",
      handle: ".function_menu_click_move",
      start: function () {
        $(".new_function_menu").css("right", "");
        $(".new_function_menu").css("bottom", "");
      },
      stop: function () {
        var right = $(window).width() - $(".new_function_menu").position().left - $(".new_function_menu").width();
        var bottom = $(window).height() - $(".new_function_menu").position().top - $(".new_function_menu").height();
        if (bottom <= 0) bottom = 0; //按钮不允许超出下边界
        $(".new_function_menu").css("left", "");
        $(".new_function_menu").css("top", "");
        $(".new_function_menu").css("right", right + "px");
        $(".new_function_menu").css("bottom", bottom);
        $(".new_function_menu").css("width", '180px');
      }
    });
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
        $(document).find('#hidden_focus_hotKey').focus();
        $scope.exeCommand(uibuttion);
        event.preventDefault();
      }
    });
  }
	
  /**
   * 新的编辑动态列方法
   */
  $scope.editmodleCache = new Array();
  $scope.editmodleOn = function (id, edithead) {
    for (var i = 0; i < $scope.editmodleCache.length; i++) {
      var cache = $scope.editmodleCache[i];
      if (cache.id == id) {
        $scope.editmodleCache.splice(i--, 1);
      }
    }
    $scope.editmodleCache.push({
      id: id,
      value: edithead.value,
    });
    window.setTimeout("$('#" + id + "').focus();", 50);
  }
  $scope.editmodleOff = function (id, edithead, editheads) {
    if (!edithead.value || (edithead.regexp && isNotNull(edithead.value)
      && !(new RegExp(edithead.regexp)).test(edithead.value.toString()))) {
      $($scope.editmodleCache).each(function (index, cache) {
        if (cache.id == id) {
          edithead.value = cache.value;
          setPrompt(edithead.propertyName + '格式错误', false);
          //					window.setTimeout("$('#"+id+"').focus();", 50);
          return 0;
        }
      });
    } else {
      var pass = true;
      $(editheads).each(function (index, head) {
        if (id != (head.property + index) && edithead.value == head.value) {
          $($scope.editmodleCache).each(function (i, cache) {
            if (cache.id == id) {
              edithead.value = cache.value;
              setPrompt(edithead.propertyName + '不能重复', false);
              pass = false;
              //							window.setTimeout("$('#"+id+"').focus();", 50);
              return 0;
            }
          });
        }
      });
      if (pass) {
        edithead.editmodle = !edithead.editmodle;
      }
    }
  }
  $scope.addcolumn = function (addHead, table, index) {
    var addHeadRows = new Array();
    //对表头与复杂表头计数
    var headCounts = new Array();
    $(table.thead.headRows).each(function (rowIndex, row) {
      headCounts.push({
        rowIndex: rowIndex,
        count: 0,
        begin: row.headCells.length,
      });
      $(row.headCells).each(function (cellIndex, cell) {
        if (rowIndex == 0 && cell.property == addHead.property) {
          headCounts[rowIndex].count++;
          if (cellIndex < headCounts[rowIndex].begin) {
            headCounts[rowIndex].begin = cellIndex;
          }
        } else if (cell.dynamic && cell.dynamicGroup == addHead.property) {
          headCounts[rowIndex].count++;
          if (cellIndex < headCounts[rowIndex].begin) {
            headCounts[rowIndex].begin = cellIndex;
          }
        }
      });
    });
    //复制表头
    var length = headCounts[0].count;
    var order = index - headCounts[0].begin;
    $(headCounts).each(function (countIndex, count) {
      count.count = count.count / length;
      for (var i = 0; i < count.count; i++) {
        addHeadRows.push({
          rowIndex: count.rowIndex,
          cellIndex: order * count.count + count.begin + count.count + i,
          cell: angular.copy(table.thead.headRows[count.rowIndex].headCells[order * count.count + count.begin + i]),
        });
        if (count.rowIndex == 0) {
          addHeadRows[addHeadRows.length - 1].cell.value = null;
          addHeadRows[addHeadRows.length - 1].cell.colIndex = addHeadRows[addHeadRows.length - 1].cell.colIndex + count.count;
          addHeadRows[addHeadRows.length - 1].cell.editmodle = true;
        }
      }
    });
		
    //表格计数
    var addColumns = new Array();
    var bodyCounts = new Array();
    $(table.tbody.rows).each(function (rowIndex, row) {
      bodyCounts.push({
        rowIndex: rowIndex,
        count: 0,
        begin: row.cells.length,
      });
      $(row.cells).each(function (cellIndex, cell) {
        if (cell.dynamic && cell.dynamicGroup == addHead.property) {
          bodyCounts[rowIndex].count++;
          if (cellIndex < bodyCounts[rowIndex].begin) {
            bodyCounts[rowIndex].begin = cellIndex;
          }
        }
      });
    });
    //复制表格
    $(bodyCounts).each(function (countIndex, count) {
      count.count = count.count / length;
      for (var i = 0; i < count.count; i++) {
        addColumns.push({
          rowIndex: count.rowIndex,
          cellIndex: order * count.count + count.begin + count.count + i,
          cell: angular.copy(table.tbody.rows[count.rowIndex].cells[order * count.count + count.begin + i]),
        });
        addColumns[addColumns.length - 1].cell.value = null;
        addColumns[addColumns.length - 1].cell.colIndex = addColumns[addColumns.length - 1].cell.colIndex + count.count;
      }
    });
		
    //粘贴单元格
    $(addHeadRows).each(function (index, headRow) {
      var cell = headRow.cell;
      var rowIndex = headRow.rowIndex;
      var cellIndex = headRow.cellIndex;
      table.thead.headRows[rowIndex].headCells.splice(cellIndex, 0, cell);
      for (var i = cellIndex + 1; i < table.thead.headRows[rowIndex].headCells.length; i++) {
        table.thead.headRows[rowIndex].headCells[i].colIndex = table.thead.headRows[rowIndex].headCells[i].colIndex + 1;
      }
    });
    $(addColumns).each(function (index, column) {
      var cell = column.cell;
      var rowIndex = column.rowIndex;
      var cellIndex = column.cellIndex;
      table.tbody.rows[rowIndex].cells.splice(cellIndex, 0, cell);
      for (var i = cellIndex + 1; i < table.tbody.rows[rowIndex].cells.length; i++) {
        table.tbody.rows[rowIndex].cells[i].colIndex = table.tbody.rows[rowIndex].cells[i].colIndex + 1;
      }
    });
		
    //处理合计行
    //合计行计数
    var sumCount = 0;
    var sumBegin = table.columns.length;
    var sumColumns = new Array();
    $(table.columns).each(function (colIndex, column) {
      if (column.dynamic && column.dynamicGroup == addHead.property) {
        sumCount++;
        if (colIndex < sumBegin) {
          sumBegin = colIndex;
        }
      }
    });
    //复制合计行
    sumCount = sumCount / length;
    for (var i = 0; i < sumCount; i++) {
      sumColumns.push({
        cellIndex: order * sumCount + sumBegin + sumCount + i,
        cell: angular.copy(table.columns[order * sumCount + sumBegin + i]),
      });
      sumColumns[sumColumns.length - 1].cell.value = null;
    }
    $(sumColumns).each(function (colIndex, column) {
      var cell = column.cell;
      var cellIndex = column.cellIndex;
      table.columns.splice(cellIndex, 0, cell);
      for (var i = cellIndex + 1; i < table.columns.length; i++) {
        table.columns[i].colIndex = table.columns[i].colIndex + 1;
      }
    });
    changeflag = true;
    window.changeflag = true;
    var count = headCounts[headCounts.length - 1].count;
    table.width = (table.width ? table.width : 1300) + count * 80;
    window.setTimeout("$('#" + addHead.property + (index + 1) + "').focus();", 50);
  }
	
  $scope.delcolumn = function (addHead, table, index) {
    window.confirm('提示', '请确认是否删除当前列?', function () {
      var addHeadRows = new Array();
      //对表头与复杂表头计数
      var headCounts = new Array();
      $(table.thead.headRows).each(function (rowIndex, row) {
        headCounts.push({
          rowIndex: rowIndex,
          count: 0,
          begin: row.headCells.length,
        });
        $(row.headCells).each(function (cellIndex, cell) {
          if (rowIndex == 0 && cell.property == addHead.property) {
            headCounts[rowIndex].count++;
            if (cellIndex < headCounts[rowIndex].begin) {
              headCounts[rowIndex].begin = cellIndex;
            }
          } else if (cell.dynamic && cell.dynamicGroup == addHead.property) {
            headCounts[rowIndex].count++;
            if (cellIndex < headCounts[rowIndex].begin) {
              headCounts[rowIndex].begin = cellIndex;
            }
          }
        });
      });
      //复制表头
      var length = headCounts[0].count;
      if (length <= 1) {
        return;
      }
      //			else if(!confirm("你确定删除此记录吗？")){
      //				return;
      //			}
      var order = index - headCounts[0].begin;
      $(headCounts).each(function (countIndex, count) {
        count.count = count.count / length;
        for (var i = 0; i < count.count; i++) {
          addHeadRows.push({
            rowIndex: count.rowIndex,
            cellIndex: order * count.count + count.begin + i,
          });
        }
      });
			
      //表格计数
      var addColumns = new Array();
      var bodyCounts = new Array();
      $(table.tbody.rows).each(function (rowIndex, row) {
        bodyCounts.push({
          rowIndex: rowIndex,
          count: 0,
          begin: row.cells.length,
        });
        $(row.cells).each(function (cellIndex, cell) {
          if (cell.dynamic && cell.dynamicGroup == addHead.property) {
            bodyCounts[rowIndex].count++;
            if (cellIndex < bodyCounts[rowIndex].begin) {
              bodyCounts[rowIndex].begin = cellIndex;
            }
          }
        });
      });
      //复制表格
      $(bodyCounts).each(function (countIndex, count) {
        count.count = count.count / length;
        for (var i = 0; i < count.count; i++) {
          addColumns.push({
            rowIndex: count.rowIndex,
            cellIndex: order * count.count + count.begin + i,
          });
        }
      });
      addHeadRows.sort(function (row1, row2) {
        return row2.cellIndex - row1.cellIndex;
      });
      addColumns.sort(function (row1, row2) {
        return row2.cellIndex - row1.cellIndex;
      });
      //粘贴单元格
      $(addHeadRows).each(function (index, headRow) {
        var rowIndex = headRow.rowIndex;
        var cellIndex = headRow.cellIndex;
        $scope.$apply(function () {
          table.thead.headRows[rowIndex].headCells.splice(cellIndex, 1);
        });
        for (var i = cellIndex; i < table.thead.headRows[rowIndex].headCells.length; i++) {
          table.thead.headRows[rowIndex].headCells[i].colIndex = table.thead.headRows[rowIndex].headCells[i].colIndex - 1;
        }
      });
      $(addColumns).each(function (index, column) {
        var rowIndex = column.rowIndex;
        var cellIndex = column.cellIndex;
        $scope.$apply(function () {
          table.tbody.rows[rowIndex].cells.splice(cellIndex, 1);
        });
        for (var i = cellIndex; i < table.tbody.rows[rowIndex].cells.length; i++) {
          table.tbody.rows[rowIndex].cells[i].colIndex = table.tbody.rows[rowIndex].cells[i].colIndex - 1;
        }
      });
			
      //处理合计行

      //合计行计数
      var sumCount = 0;
      var sumBegin = table.columns.length;
      var sumColumns = new Array();
      $(table.columns).each(function (colIndex, column) {
        if (column.dynamic && column.dynamicGroup == addHead.property) {
          sumCount++;
          if (colIndex < sumBegin) {
            sumBegin = colIndex;
          }
        }
      });
      //复制合计行
      sumCount = sumCount / length;
      for (var i = 0; i < sumCount; i++) {
        sumColumns.push({
          cellIndex: order * sumCount + sumBegin + i,
        });
      }
      sumColumns.sort(function (row1, row2) {
        return row2.cellIndex - row1.cellIndex;
      });
      $(sumColumns).each(function (colIndex, column) {
        var cellIndex = column.cellIndex;
        $scope.$apply(function () {
          table.columns.splice(cellIndex, 1);
        });
      });
      changeflag = true;
      window.changeflag = true;
      var count = headCounts[headCounts.length - 1].count;
      table.width = (table.width ? table.width : 1300) - count * 80;
    }, function () {
    });
  }
  $scope.editcolumn = function (uiheadcell, $event, index) {
    uiheadcell.editmodle = !uiheadcell.editmodle;
    $event.target.parentNode.parentNode.parentNode.className = "ng-scope";
    $scope.editmodleOn(uiheadcell.property + index, uiheadcell);
  }
  $scope.countDynamic = function (headCells) {
    var count = 0;
    $(headCells).each(function (index, head) {
      if ((head.dynamic || head.dynamic == 'true') && head.dynamic != 'false') {
        count++;
      }
    });
    return count;
  }
	
  /**
   * 添加暑期
   */
  var addTime = function (ym) {
    $scope.times.push(ym);
    window.changeflag = true;
  }
  var caniclickthemonth = false;
  var initYearMonthPicker = function () {
    $('.ym-box>.year>.center').html($scope.uimodule.label.value ? $scope.uimodule.label.value.substring(0, 4) : new Date().getYear());
    $('.ym-box>.year>.left').unbind();
    $('.ym-box>.year>.left').click(function () {
      var year = $('.ym-box>.year>.center').html();
      $('.ym-box>.year>.center').html(parseInt(year) - 1);
    });
    $('.ym-box>.year>.right').unbind();
    $('.ym-box>.year>.right').click(function () {
      var year = $('.ym-box>.year>.center').html();
      $('.ym-box>.year>.center').html(parseInt(year) + 1);
    });
    $('.ym-box>.month>span').unbind();
    $('.ym-box>.month>span').click(function () {
      if (caniclickthemonth) {
        caniclickthemonth = false;
        var y = $('.ym-box>.year>.center').html();
        var m = $(this).attr('month');
        if ($scope.times.indexOf(y + '-' + m) >= 0) {
          setPrompt('所选属期已存在', false);
          $scope.uimodule.label.value = y + '-' + m;
          $scope.checkedTime = y + '-' + m
          $('.ym-box').fadeOut(200);
          $scope.loadZlsqData(y + '-' + m);
        } else {
          $scope.uimodule.label.value = y + '-' + m;
          $scope.checkedTime = y + '-' + m
          $('.ym-box').fadeOut(200);
          $scope.loadZlsqData(y + '-' + m);
        }
      }
    });
    caniclickthemonth = true;
    $('.ym-box').fadeIn(200);
  };
	
  //公共
  $scope.loadZlsqData = function (time) {
    $scope.checkedTime = time;
    $scope.uimodule.label.value = time;
    //遍历tab，分别加载各自的table数据
    window.showMask();
    var loadCount = $scope.uimodule.tabs.length;
    angular.forEach($scope.uimodule.tabs, function (tab) {
      if (tab.type == 'table') {
        var param = { xmid: window.top.xmid, cjbddm: cjbddm, cjbgdm: tab.id, jzrq: $scope.checkedTime };
        xmcjgyService.loadData(param, function (uidata) {
          if (loadCount == 0) {
            if (time && $scope.times.indexOf(time) < 0) {
              addTime(time);
            } else {
              window.changeflag = false;
            }
            window.hideMask();
          }
          $scope.sumRowRefresh(tab);
        });
      } else {
        loadCount--;
        if (loadCount == 0) {
          if (time && $scope.times.indexOf(time) < 0) {
            addTime(time);
          } else {
            window.changeflag = false;
          }
          window.hideMask();
        }
      }
    });
  }
	
  $scope.saveZlsqData = function () {
    $('div[contenteditable="true"]').blur();
    var param = { xmid: window.top.xmid, cjbddm: $scope.cjbddm, fjuuid: $scope.fjuuid };
    if (_fileUuid) {
      param.fileUuid = _fileUuid;
    }
    var cjbgs = [];
    if ($scope.uimodule.label) {
      if ($scope.uimodule.label.dataType == 'datetime') {
        param.jzrq = $scope.uimodule.label.value;
        if (!param.jzrq) {
          alert("资料属期不能为空");
          return;
        }
      }
      if ($scope.uimodule.label.dataType == 'label') {
        if (!$scope.uimodule.label.value) {
          alert('请导入模版数据');
          return;
        }
        param.jzrq = $scope.uimodule.label.value;
      }
    }
    var invalide = false;
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
                //暂时先注释掉吧
                //$scope.uimodule.tabActiveIndex = tabIndex;
                //锚点定位
                $scope.ui.tabIndex = tabIndex;
                /*$location.hash($scope.uimodule.tabs[tabIndex].id);
                    $anchorScroll();*/
              }
              if (cell.validate && !row.del) {
                var result = cell.validate(validateResult.errors[cell.property]);
                if (!result.succ) {
                  validateResult.succ = false;
                  invalide = true;
                  validateResult.errors[cell.property] = result;
                }
              }
              if (cell.dataType == 'text'
                || cell.dataType == 'textarea'
                || cell.dataType == 'select'
                || cell.dataType == 'datetime'
                || cell.dataType == 'number'
                || cell.dataType == 'dialog'
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
                  if (cell.dataType == 'select') {
                    cjmx[cell.property + '_zdy'] = cell.zdy;
                    //对于需要放开修改指标分类，项目分析指标的表格组装数据
                    if (tab.id == "A0101-1" || tab.id == "A0201-1" || tab.id == "A0201-4"
                      || tab.id == "A0201-5" || tab.id == "A0401-1" || tab.id == "A0501-1"
                      || tab.id == "B0301-1" || tab.id == "B0302-1" || tab.id == "B0303-1"
                      || tab.id == "B0304-1" || tab.id == "C0101-1" || tab.id == "C0102-1"
                      || tab.id == "C0201-2" || tab.id == "B0204-1" || tab.id == "C0205-1"
                      || tab.id == "C0206-1" || tab.id == "C0207-1" || tab.id == "C0208-1"
                      || tab.id == "C0209-1" || tab.id == "D0401-1" || tab.id == "D0401-2"
                      || tab.id == "D0201-1" || tab.id == "A0301-1" || tab.id == "D0202-1"
                      || tab.id == "D0301-1" || tab.id == "D0101-1" || tab.id == "B0403-1") {
                      cjmx["zbfldm"] = tab.table.tbody.rows[row.rowIndex].data.zbfl;
                      cjmx["zbflvalue"] = tab.table.tbody.rows[row.rowIndex].cells[2].value;
                      cjmx["selectvalue"] = tab.table.tbody.rows[row.rowIndex].cells[2].selectname;
                      if (cjmx["zbflvalue"] != cjmx["selectvalue"]) {
                        cjmx["zbflvalue"] = cjmx["selectvalue"];
                      }
                    } else if (tab.id == "10101-1" || tab.id == "10101-2" || tab.id == "10101-3" ||
                      tab.id == "10201-1" || tab.id == "10201-2" || tab.id == "10201-3" ||
                      tab.id == "10201-4" || tab.id == "10301-1") {
                      cjmx["zbfldm"] = tab.table.tbody.rows[row.rowIndex].data.zbfl;
                      //cjmx["zbfldm"] = tab.table.tbody.rows[row.rowIndex].cells[2].value;
                      cjmx["zbflvalue"] = tab.table.tbody.rows[row.rowIndex].cells[2].value;
                      cjmx["selectvalue"] = tab.table.tbody.rows[row.rowIndex].cells[2].selectname;
                      if (cjmx["zbflvalue"] != cjmx["selectvalue"]) {
                        cjmx["zbflvalue"] = cjmx["selectvalue"];
                      }
                    }
                  }
                }
              }
            });
            cjmxs.push(cjmx);
          });
          if (!validateResult.succ) {
            //处理提示
            var errors = '';
            for (var k in validateResult.errors) {
              errors += ',' + validateResult.errors[k].propertyName + validateResult.errors[k].msg.join(',');
            }
            setPrompt(errors.substring(1), false);
          }
        }
        cjbg.cjmxs = cjmxs;
        //				//验证表头
        //				if(!checkIsNotEmptyDynamicHead(tab)){
        //					alert('请先添加动态列信息');
        //					invalide = true;
        //				}
        //把头也塞里
        if (!invalide && tab.table) {
          var title = [];
          angular.forEach(tab.table.thead.headRows, function (hr, headRowIndex) {
            var hrv = [];
            angular.forEach(hr.headCells, function (cell) {
              if (headRowIndex == 0) {
                if (!cell.value) {
                  invalide = true;
                  setPrompt(cell.propertyName + "不能为空", false);
                } else if (cell.regexp && isNotNull(cell.value)
                  && !(new RegExp(cell.regexp)).test(cell.value.toString())) {
                  invalide = true;
                  setPrompt(cell.propertyName + "格式错误", false);
                } else if (hrv.indexOf(cell.value) >= 0) {
                  invalide = true;
                  setPrompt(cell.propertyName + "不能重复", false);
                }
              }
              hrv.push(cell.value);
            });
            title.push(hrv);
          });
          cjbg.title = title;
        }
        if (!invalide && tab.subTable) {
          var fjs = [];
          if (tab.subTable.tbody) {
            angular.forEach(tab.subTable.tbody.rows, function (row) {
              var fjuuid = { fjuuid: row.id };
              fjs.push(fjuuid);
            });
          }
          cjbg.fjs = fjs;
        }
        if (tab.id != "A0101-1" && tab.id != "A0601-1") {//保存的时候，将股东层级结构和对外投资的表格数据过滤掉，这两个表格的数据只做展现，不做保存
          cjbgs.push(cjbg);
        }
      }
    });
    if (invalide) {
      return;
    }
    param.datas = angular.toJson(cjbgs);
    if (window.isRunningCommand == true) {
      return;
    }
    window.showMask();
    window.isRunningCommand = true;
    xmcjgyService.save(param, function (data) {
      window.hideMask();
      if (data.succ) {
        setPrompt('保存成功', true);
        changeflag = false;
        $scope.uimodule.label.value = $scope.checkedTime;
        $scope.loadZlsqData($scope.uimodule.label.value);
        //刷新图标
        $($scope.uimodule.tabs).each(function (i, t) {
          if (t.chart && t.chart.show) {
            t.chart.show = false;
            $timeout(function () {
              t.chart.show = true;
            }, 1000);
          }
        });
        window.isRunningCommand = false;
      } else {
        setPrompt(data.msg, false);
      }
    }, function () {
      window.hideMask();
      window.isRunningCommand = false;
      changeflag = false;
      setPrompt('保存失败', false);
    });
  }
	
  /**
   * 添加属期
   */
  $scope.addsqsrk = function () {
    $('#prompt').parent().hide(500);
    if (window.changeflag) {
      window.confirm('提示', '本期数据尚未保存,是否保存?', function () {
        $scope.saveZlsqData();
      }, function () {
        initYearMonthPicker();
      });
    } else {
      initYearMonthPicker();
    }
  }
	
  $scope.selectedTime = function (time) {
    if ($scope.checkedTime != time) {
      if (window.changeflag) {
        window.confirm('提示', '本期数据尚未保存,是否保存?', function () {
          $scope.checkedTime = time;
          $scope.saveZlsqData();
        }, function () {
          $scope.loadZlsqData(time);
        });
      } else {
        $scope.loadZlsqData(time);
      }
    }
  }
  //当前表格有无选中行
  $scope.hasSelectedRow = function (tab) {
    if (tab && tab.table && tab.table.tbody && tab.table.tbody.rows) {
      var count = 0;
      angular.forEach(tab.table.tbody.rows, function (row, rowIndex) {
        if (row.checked) {
          count++;
        }
      });
      return count;
    } else {
      return 0;
    }
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
  //锚点行数计数
  $scope.anchorPointLineCount = function (uimodule) {
    if (uimodule && uimodule.hasZlsq && uimodule.label && uimodule.label.show && $scope.times && $scope.times.length >= 0) {
      if (uimodule && uimodule.tabs && uimodule.tabs.length >= 2 && uimodule.tabs[1].title != '综合分析意见') {
        return Math.ceil($scope.times.length / 4) > Math.ceil(uimodule.tabs.length / 5) ? Math.ceil($scope.times.length / 4) : Math.ceil(uimodule.tabs.length / 5);
      } else {
        return Math.ceil($scope.times.length == 0 ? 1 : $scope.times.length / 4);
      }
    } else {
      if (uimodule && uimodule.tabs && uimodule.tabs.length >= 2 && uimodule.tabs[1].title != '综合分析意见') {
        return Math.ceil(uimodule.tabs.length / 7);
      } else {
        return 0;
      }
    }
  }
  //计算锚点的高度
  $scope.anchorPointHeight = function (uimodule, uitab) {
    var line = $scope.anchorPointLineCount(uimodule);
    if (uitab.title != '综合分析意见' && uitab.type != 'iframe') {
      return line == 0 ? 0 : ($('#nav-box').height() + 10);
    } else {
      return line != 0 ? 32 * line - 32 : -43;
    }
  }
	
  $scope.initqygxSearch = function () {
    var cjbddm = $scope.cjbddm;
    if (cjbddm == "B0304") {
      getDjsCompanyList();
    }
  }

  //设置数据
  function setData(uimodule, tab, uidata) {
  
    if (tab.id == "A0101-2" && isNotNull(uidata.extend) && uidata.extend.haveNoZQFlag) {
      alert("当前目标企业还没有进行公司企业信息抓取，请先抓取当前目标企业信息");
      return;
    }
  
    if (uidata.label) {
      //tab.label.value = uidata.label;
      uimodule.label.value = uidata.label;

    }
    //tableWidth
    if (uidata.tableWidth) {
      if (isNotNull(tab.table)) {
        tab.table.width = uidata.tableWidth
      }
    }
    //filter
    if (tab.table && tab.table.filterProperty) {
      tab.table.filters = [];
    }
    //如果有设置表头，在此处理
    if (uidata && uidata.thead) {
      tab.table.thead = uidata.thead;
    }
    if (uidata && uidata.columns) {
      tab.table.columns = uidata.columns;
    }
    if (uidata && uidata.datas) {
      var rows = [];
      angular.forEach(uidata.datas, function (rowdata, rowIndex, rowArr) {
        var row = { rowIndex: rowIndex, cells: [], data: rowdata };
        if (isNotNull(tab) && isNotNull(tab.table) && isNotNull(tab.table.columns)) {
          angular.forEach(tab.table.columns, function (column, colIndex, colArr) {
            var value;
            if (column.dynamic) {
              if (rowdata[column.dynamicGroup] && rowdata[column.dynamicGroup][column.colIndex]) {
                value = rowdata[column.dynamicGroup][column.colIndex][column.property];
              }
            } else {
              value = rowdata[column.property];
            }
            var cell = angular.copy(column);
            cell.colIndex = colIndex;
            cell.value = value;
            
            if (tab.id == "D0101-3" && colIndex == 1 && isNotNull(rowdata.mgsmcgpdm) && rowdata.mgsmcgpdm != "") {//母公司股票代码
              cell.href = "sword?ctrl=QyxxCtrl_initqyxxPage&gpdm=" + rowdata.mgsmcgpdm + "";
              cell.type = "TAB";
            } else if (tab.id == "D0101-3" && colIndex == 2 && isNotNull(rowdata.mcgpdm) && rowdata.mcgpdm != "") {//公司股票代码
              cell.href = "sword?ctrl=QyxxCtrl_initqyxxPage&gpdm=" + rowdata.mcgpdm + "";
              cell.type = "TAB";
            } else if (tab.id == "D0101-3" && isNotNull(rowdata.mgsmcgpdm) && rowdata.mgsmcgpdm == "") {//母公司股票代码
              cell.href = "";
            }
            else if (tab.id == "A0101-2" && colIndex == 1 && isNotNull(rowdata.zgsmcgpdm) && rowdata.zgsmcgpdm != "") {//子公司股票代码
              cell.href = "sword?ctrl=QyxxCtrl_initqyxxPage&gpdm=" + rowdata.zgsmcgpdm + "";
              cell.type = "TAB";
            } else if (tab.id == "A0101-2" && colIndex == 2 && isNotNull(rowdata.mcgpdm) && rowdata.mcgpdm != "") {//股东公司股票代码
              cell.href = "sword?ctrl=QyxxCtrl_initqyxxPage&gpdm=" + rowdata.mcgpdm + "";
              cell.type = "TAB";
            } else if (tab.id == "A0101-2" && isNotNull(rowdata.zgsmcgpdm) && rowdata.mcgpdm == "") {
              cell.href = "";
            }
            //设置加粗字体
            cell.font = { bold: false };
            if (tab.table.fontBoldRows && tab.table.fontBoldRows.indexOf(rowIndex) >= 0) {
              cell.font.bold = true;
            }
            //处理filter
            if (tab.table.filterProperty && column.property == tab.table.filterProperty) {
              if (tab.table.filters.indexOf(value) < 0) {
                tab.table.filters.push(value);
              }
            }
            if (!cell.hide && cell.group && rowIndex != 0) {
              //分组列
              var cellGroup = function (step) {
                if (value === rows[rowIndex - step].cells[colIndex].value) {
                  if (!rows[rowIndex - step].cells[colIndex].hide) {
                    rows[rowIndex - step].cells[colIndex].rowspan++;
                    cell.hide = true;
                  } else {
                    cellGroup(step + 1);
                  }
                }
              }
              cellGroup(1);
            } else if (cell.dataType == 'id') {
              row.id = value;
            } else if (cell.dataType == 'upload' && rowdata.downLoadFileUrl != "") {
            
              cell.haveCjmbFlag = true;
              cell.cjmbFileUrl = rowdata.downLoadFileUrl;
              if (rowdata.ftjlURL) {
                cell.ftjlURL = rowdata.ftjlURL;
              }
            }
            if (tab.table.disableRows) {
              for (var i = 0; i < tab.table.disableRows.length; i++) {
                if (tab.table.disableRows[i] == rowIndex && cell.dataType != 'label') {
                  cell.dataType = 'disable';
                  cell.value = '';
                }
              }
            }
            if (cell.dataType == 'text'
              || cell.dataType == 'textarea'
              || cell.dataType == 'select'
              || cell.dataType == 'datetime'
              || cell.dataType == 'number'
              || cell.dataType == 'label') {
              cell.validate = uigyService.cellValidation;
              if (cell.dataType == 'label') {
                cell.validate();
              }
            }
          
            row.cells[colIndex] = cell;
          });
        }
      
        if (isNotNull(tab.table) && isNotNull(tab.table.filters)) {
          tab.table.filters.sort(function (a, b) { return b - a })
        }
        rows[rowIndex] = row;
      });
      if (tab.table) {
        tab.table.tbody = { rows: rows };
      }
    }
    if (tab.table && tab.table.filterProperty && tab.table.filters.length > 0) {
      tab.table.filterChoose = tab.table.filters[0];
    }
    if (uidata && uidata.subDatas) {
      var rows = [];
      angular.forEach(uidata.subDatas, function (rowdata, rowIndex, rowArr) {
        var row = { rowIndex: rowIndex, cells: [] };
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
      });
      if (isNotNull(tab.subTable)) {
        tab.subTable.tbody = { rows: rows };
      }
    }
    $scope.loading--;
    $scope.changeReport(tab);
  }
	
  //获取待进行比较的
  function getDjsCompanyList() {
    var cjbddm = $scope.cjbddm;
    var viewData = { cjbddm: cjbddm };
    var url = "/ajax.sword?ctrl=FxGyCtrl_getDjsCompanyList";
    $.ajax({
      url: url,
      type: 'POST',
      dataType: 'json',
      data: viewData,
      success: function (data) {
        if (data.success) {
          var companyList = data.data;
          var gslist = [];
          if (isNotNull(companyList)) {
            for (var i = 0; i < companyList.length; i++) {
              var company = new Object();
              company.mc = companyList[i].mc;
              company.ishas = companyList[i].ishas;
              //company.ishas = i % 3;
              gslist.push(company);
            }
          }
          var rylist;
          $(".qygxSearch").qygxSearch({
            gslist: gslist,
            rylist: [],
            callback: function (data) {
              if (isNotNull(data)) {
                var companys = data.gsmcs;
                var psersons = data.rymcs;
                var companyArr = [];
                var personArr = [];
                if (companys != null && companys.length > 0) {
                  for (var i = 0; i < companys.length; i++) {
                    var company = {};
                    company.mc = companys[i];
                    companyArr.push(company);
                  }
                }
                if (psersons != null && psersons.length > 0) {
                  for (var i = 0; i < psersons.length; i++) {
                    var pserson = {};
                    pserson.mc = psersons[i];
                    personArr.push(pserson);
                  }
                }
                getRelationShip(companyArr, personArr);
              }
            }
          });
        }
      }
    });
  }
	
  //对获取到的公司列表和人员列表做关系疑似比较
  function getRelationShip(companyData, personData) {
    var param = new Object();
    param.company = angular.toJson(companyData);
    param.person = angular.toJson(personData);
    param.mbqymc = mbqymc;
		
		
    xmcjgyService.queryCompanyRelationShip(param, function (data) {
      //window.hideMask();
      if (data.succ) {
				
      } else {
      }
    }, function () {
			
    });
  }
};