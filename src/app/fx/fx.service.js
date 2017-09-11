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
        //console.log('table appending time: ', new Date().getTime() - startTime);

        $timeout(() => {
          var startTime = new Date().getTime();
          renderTable(tab, tab.table.tbody, scope, uimodule);
          //console.log('table rendering time: ', new Date().getTime() - startTime);
        });
      }
      //console.log('set data time:', Date.now() - setDataStart);
    }

    function renderTable(uitab, tbody, scope, uimodule) {
      var sortIndex = 0;
      tbody.rows.forEach((row, rowIndex) => {
        //console.log(row);

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
      var hiddenIndex = 0;
      tbody.rows.forEach((row, rowIndex) => {

        switchShowType(row, scope);

        if (!row.hide) {
          sortIndex++;
          row.xh = sortIndex;
        }else{
          hiddenIndex++;
        }

        row.cells.forEach((cell, colIndex) => {
          if (!row.hide && cell.property == 'xh') {
            cell.value = row.xh;
          }
          if (cell.dataType === 'number') {
            const input = { row, cell, tab, colIndex, rowIndex, tbody, scope, tabIndex };
            const ele = cell.ele.children[0];
            calculationHook(input, ele);
          }

        });
      });
      if(hiddenIndex == tbody.rows.length){      
        tbody.empty = true;
      }else{
        tbody.empty = false;
      }
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

    function buildGlobeShowType(uidata,scope) {
      if (uidata.extend && scope.firstLoad) {
        var xsbz = uidata.extend.xsbz;
        if (xsbz == 'QB') {
          scope.isQB = true;
          $('#showTypeSpan').text('完整版');
          var buttions = scope.uimodule.toolbar.buttons;
          $.each(buttions, function (buttonIndex,uibuttion) {    
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
          $.each(buttions, function (buttonIndex,uibuttion) {
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

    function buildGlobeEmptyRow(scope){
      scope.emptyRowStatus = false;
      var buttions = scope.uimodule.toolbar.buttons;
      $.each(buttions, function (buttonIndex,uibuttion) {
        if (uibuttion.action == 'switchEmptyRow') {
          uibuttion.status = false;
          uibuttion.label = uibuttion.status?uibuttion.labelOn:uibuttion.labelOff;
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