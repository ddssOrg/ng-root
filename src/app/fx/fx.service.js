import { cellvalidate } from './services';
import { FXUITable } from './ui-table';
import { calculationHook } from '../../shared/hooks/calculate.js';

angular.module('fx')
  .service('fxService', ['$timeout', '$filter', 'CellCompilePoolService', function ($timeout, $filter, CellCompilePoolService) {

    function setData(uimodule, tab, uidata, scope) {
      var setDataStart = Date.now();
      if (uidata.label) {
        uimodule.label.value = uidata.label;
      }
      //tableWidth
      if (uidata.tableWidth) {
        tab.table.width = uidata.tableWidth
        tab.table.autowidth = uidata.tableWidth;
      }

      //获取下载模板url
      if (uidata.downLoadTemplate && uidata.downLoadTemplate != null) {
        scope.uimodule.template = uidata.downLoadTemplate;
      }

      //获取上传文件url
      if (uidata.templateName && uidata.templateName != null) {
        scope.uimodule.templateName = uidata.templateName;
        //初始化上传组件
        initUploadFile(scope);
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
        var sortIndex = 0;
        uidata.datas.forEach((rowdata, rowIndex, rowArr) => {
          var row = { rowIndex: rowIndex, cells: [], data: rowdata };
          var xsbz = row.data.xsbz;
          if (scope.isQB) {
            if (xsbz == '2') {
              row.hide = true;
            } else {
              row.hide = false;
            }
          } else {
            if (xsbz == '1') {
              row.hide = true;
            } else {
              row.hide = false;
            }
          }
          if (!row.hide) {
            sortIndex++;
            row.xh = sortIndex;
          }
          row.cells = tab.table.columns.map((column, colIndex) => {
            var value;
            if (column.dynamic) {
              if (rowdata[column.dynamicGroup] && rowdata[column.dynamicGroup][column.colIndex]) {
                value = rowdata[column.dynamicGroup][column.colIndex][column.property];
              }
            } else {
              if (!row.hide && column.property == 'xh') {
                value = row.xh;
              } else {
                value = rowdata[column.property];
              }
            }
            var cell = {};
            Object.assign(cell, column);
            cell.colIndex = colIndex;
            cell.value = value;
            //设置加粗字体
            cell.font = { bold: false };
            if (tab.table.fontBoldRows && tab.table.fontBoldRows.indexOf(rowIndex) >= 0) {
              cell.font.bold = true;
            }
            //处理filter
            if (column.property == tab.table.filterProperty) {
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
              cell.validate = cellvalidate;
              if (cell.dataType == 'label') {
                cell.validate();
              }
            }

            return cell;
          });
          if (isNotNull(tab.table) && isNotNull(tab.table.filters)) {
            tab.table.filters.sort(function (a, b) { return b - a })
          }
          rows.push(row);
        });
        if (tab.table) {
          if (tab.table.tbody instanceof FXUITable) {
            tab.table.tbody.dispose();
          }
          tab.table.tbody = { rows: rows };
          var startTime = new Date().getTime();
          tab.table.tbody = FXUITable.factory(tab.table.tbody, scope, tab, uimodule);
          //console.log('table build time: ', new Date().getTime() - startTime);
        }
      }
      if (tab.table && tab.table.filterProperty && tab.table.filters.length > 0) {
        tab.table.filterChoose = tab.table.filters[0];
      }
      if (tab.subTable && tab.subTable != null) {
        //获取关联附件选择列表的表格代码
        scope.glfjBgdm = tab.id;
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
      if (tab.table && tab.table.tbody) {
        var startTime = new Date().getTime();
        tab.table.tbody.regroupRows();
        tab.table.tbody.regroupCells();
        tab.table.tbody.append(`#main_table_${tab.id}`);

        $timeout(() => {
          var startTime = new Date().getTime();
          renderTable(tab, tab.table.tbody, scope, uimodule);
        });
      }
    }

    function renderTable(uitab, tbody, scope, uimodule) {
      var sortIndex = 0;
      tbody.rows.forEach((row, rowIndex) => {

        switchShowType(row, scope);

        if (!row.hide) {
          sortIndex++;
          row.xh = sortIndex;
        }
        row.cells.forEach((cell, colIndex) => {
          let func = () => new Promise((resolve) => {
            if (!row.hide && cell.property == 'xh') {
              cell.value = row.xh;
            }
            cell.postBuild();
            resolve();
          });
          CellCompilePoolService.createTask(func);
        });
      });
      CellCompilePoolService.startCompile(40).then(() => {
        // init all data after load table finished.
        tbody.rows.forEach((row, rowIndex) => {
          row.cells.forEach((cell, colIndex) => {
            if (cell.dataType === 'number') {
              scope.numberCellChange(uitab, cell.colIndex);
              scope.numberInit(cell);
            }
          });
        });

        scope.$emit('ngRepeatFinished');
        scope.$apply();
      });
    }

    function rebuildTable(tab, tbody, scope, tabIndex) {
      var sortIndex = 0;
      //var hiddenIndex = 0;
      tbody.rows.forEach((row, rowIndex) => {

        switchShowType(row, scope);

        if (!row.hide) {
          sortIndex++;
          row.xh = sortIndex;
        }

        row.cells.forEach((cell, colIndex) => {
          if (!row.hide && cell.property == 'xh') {
            cell.value = row.xh;
            console.log(cell.value);
          }
          if (cell.dataType === 'number') {
            const input = { row, cell, tab, colIndex, rowIndex, tbody, scope, tabIndex };
            const ele = cell.ele.children[0];
            calculationHook(input, ele);
          }

        });
      });
    }

    function switchShowType(row, scope) {
      var xsbz = row.data.xsbz;
      var emptyRow = row.emptyRow && scope.emptyRowStatus;
      if (scope.isQB) {
        if (xsbz == '2') {
          row.hide = true;
        } else {
          if (emptyRow) {
            row.hide = true;
          } else {
            row.hide = false;
          }
        }
      } else {
        if (xsbz == '1') {
          row.hide = true;
        } else {
          if (emptyRow) {
            row.hide = true;
          } else {
            row.hide = false;
          }
        }
      }
    }

    function buildGlobeShowType(uidata, scope) {
      if (uidata.extend && scope.firstLoad) {
        var xsbz = uidata.extend.xsbz;
        if (xsbz == 'QB') {
          scope.isQB = true;
          $('#showTypeSpan').text('完整版');
          var buttions = scope.uimodule.toolbar.buttons;
          $.each(buttions, function (buttonIndex, uibuttion) {
            if (uibuttion.action == 'switchShowType') {
              uibuttion.status = false;
              uibuttion.label = '切换精简版';
              uibuttion.icon = 'icon-starter';
            }
          });
        } else if (xsbz == 'JB') {
          scope.isQB = false;
          $('#showTypeSpan').text('简易版');
          var buttions = scope.uimodule.toolbar.buttons;
          $.each(buttions, function (buttonIndex, uibuttion) {
            if (uibuttion.action == 'switchShowType') {
              uibuttion.status = true;
              uibuttion.label = '切换完整版';
              uibuttion.icon = 'icon-full';
            }
          });
        }
        scope.firstLoad = false;
      }
    }

    function buildGlobeEmptyRow(scope) {
      scope.emptyRowStatus = false;
      var buttions = scope.uimodule.toolbar.buttons;
      $.each(buttions, function (buttonIndex, uibuttion) {
        if (uibuttion.action == 'switchEmptyRow') {
          uibuttion.status = false;
          uibuttion.label = uibuttion.status ? uibuttion.labelOn : uibuttion.labelOff;
        }
      });
    }

    function initUploadFile(scope) {
      $("#uploadFileTemplate").cssFileUpload({
        url: '/ajax.sword?ctrl=DemoCtrl_uploadWdxmPic',
        simple: false,
        multiple: true,
        template: scope.uimodule.templateName ? scope.uimodule.templateName.split("_")[0] : "",
        data: { xmid: window.top.xmid, cjmxdm: scope.uimodule.templateName ? scope.uimodule.templateName.split("_")[1] : "" },
        onBeforeSelectFile: function (selectFile) {
          if (scope.uimodule.label && scope.uimodule.label.dataType == 'datetime' && isNull(scope.uimodule.label.value)) {
            setPrompt('请选择资料属期', false);
            return;
          }
          selectFile();
        },
        add: function (e, data) {
          //获取一次上传的文件数量
          scope.fileCount = data.files.length;
        },
        success: function (result, textStatus, jqXHR) {
          if (result.succ == true) {
            var bbrqz = "";
            if (scope.uimodule.label && scope.uimodule.label.value) {
              bbrqz = scope.uimodule.label.value;
            }
            $.ajax({
              url: '/ajax.sword?ctrl=ModifyXmfjGyCtrl_saveFxXmfjData',
              type: 'post',
              data: { xmid: window.top.xmid, cjmxdm: result.cjmxdm, cjbgdm: scope.glfjBgdm, cjbddm: cjbddm, fileCount: scope.fileCount, bbrqz: bbrqz },
              success: function (d) {
                $.ajax({
                  url: '/ajax.sword?ctrl=ModifyXmfjGyCtrl_queryFxFjsjData',
                  type: 'post',
                  data: { fxzbuuid: d.obj },
                  success: function (res) {
                    angular.forEach(scope.uimodule.tabs, function (tab) {
                      if (tab.id == scope.glfjBgdm) {
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
                          scope.$apply(function () {
                            tab.subTable.tbody = { rows: rows };
                          });
                        }
                      }
                    });
                  },
                });
              }
            });
          }
        }
      });
    }


    return {
      setData,
      renderTable,
      rebuildTable,
      buildGlobeShowType,
      buildGlobeEmptyRow
    }
  }]);