angular.module('fx')
  .service('fxTableHeadService', [() => {
    const editModleCache = [];

    function editModleOn(id, edithead) {
      for (var i = 0; i < editModleCache.length; i++) {
        var cache = editModleCache[i];
        if (cache.id == id) {
          editModleCache.splice(i--, 1);
        }
      }
      editModleCache.push({
        id: id,
        value: edithead.value,
      });
    }

    function editModleOff(id, edithead, editheads) {
      if (!edithead.value || (edithead.regexp && isNotNull(edithead.value)
        && !(new RegExp(edithead.regexp)).test(edithead.value.toString()))) {
        editModleCache.forEach((cache, index) => {
          if (cache.id == id) {
            edithead.value = cache.value;
            setPrompt(edithead.propertyName + '格式错误', false);
            //					window.setTimeout("$('#"+id+"').focus();", 50);
            return 0;
          }
        });
      } else {
        var pass = true;
        editheads.forEach((head, index) => {
          if (id != (head.property + index) && edithead.value == head.value) {
            editModleCache.forEach((cache, i) => {
              if (cache.id == id) {
                edithead.value = cache.value;
                setPrompt(edithead.propertyName + '不能重复', false);
                pass = false;
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

    function editmoduleKeyup(id, edithead, editheads, $event) {
      if (event.keyCode == 13) {
        editModleOff(id, edithead, editheads);
      }
    }

    function calculatorWidth(cells){
      var width = $('#content').width();
      var sumWidth = 0;
      $(cells).each(function(cellIndex, cell){
        sumWidth = sumWidth + cell.width;
      });
      var newWidth = Math.ceil(width*sumWidth/100);
      return width > newWidth ? width : newWidth;
    }

    function addColumn(addHead, table, headCellIndex) {
      let addHeadRows = [];
      //对表头与复杂表头计数
      let headCounts = [];
      table.thead.headRows.forEach((row, rowIndex) => {
        headCounts.push({
          rowIndex: rowIndex,
          count: 0,
          begin: row.headCells.length,
        });
        row.headCells.forEach((cell, cellIndex) => {
          if (
            (rowIndex == 0 && cell.property == addHead.property) ||
            (cell.dynamic && cell.dynamicGroup == addHead.property)
          ) {
            headCounts[rowIndex].count++;
            if (cellIndex < headCounts[rowIndex].begin) {
              headCounts[rowIndex].begin = cellIndex;
            }
          }
        });
      });

      //复制表头
      let length = headCounts[0].count;
      let order = headCellIndex - headCounts[0].begin;
      headCounts.forEach((headCount, countIndex) => {
        headCount.count = headCount.count / length;
        for (let i = 0; i < headCount.count; i++) {
          let cell = table.thead.headRows[headCount.rowIndex].headCells[order * headCount.count + headCount.begin + i];
          addHeadRows.push({
            rowIndex: headCount.rowIndex,
            cellIndex: order * headCount.count + headCount.begin + headCount.count + i,
            cell: angular.copy(cell),
          });
          if (headCount.rowIndex == 0) {
            addHeadRows[addHeadRows.length - 1].cell.value = null;
            addHeadRows[addHeadRows.length - 1].cell.colIndex = addHeadRows[addHeadRows.length - 1].cell.colIndex + headCount.count;
            addHeadRows[addHeadRows.length - 1].cell.editmodle = true;
          }
        }
      });

      //表格计数
      let addColumns = [];
      let bodyCounts = [];
      table.tbody.rows.forEach((row, rowIndex) => {
        let newBodyCount = {
          rowIndex: rowIndex,
          count: 0,
          begin: row.cells.length,
        };
        bodyCounts.push(newBodyCount);
        row.cells.forEach((cell, cellIndex) => {
          if (cell.dynamic && cell.dynamicGroup == addHead.property) {
            newBodyCount.count++;
            if (cellIndex < newBodyCount.begin) {
              newBodyCount.begin = cellIndex;
            }
          }
        });
      });

      //复制表格
      bodyCounts.forEach((bodyCount, countIndex) => {
        bodyCount.count = bodyCount.count / length;
        for (let i = 0; i < bodyCount.count; i++) {
          let cell = table.tbody.rows[bodyCount.rowIndex].cells[order * bodyCount.count + bodyCount.begin + i];
          addColumns.push({
            rowIndex: bodyCount.rowIndex,
            cellIndex: order * bodyCount.count + bodyCount.begin + bodyCount.count + i,
            cell: Object.assign({}, cell),
          });
          let curCell = addColumns[addColumns.length - 1].cell;
          if (curCell.dataType == 'disable') {
            curCell.value = '---';
          } else {
            curCell.value = curCell.value == '---' ? '---' : '0.00';
          }
          curCell.colIndex = cell.colIndex + bodyCount.count;
        }
      });

      //粘贴单元格
      addHeadRows.forEach((headRow, index) => {
        let cell = headRow.cell;
        let rowIndex = headRow.rowIndex;
        let cellIndex = headRow.cellIndex;
        table.thead.headRows[rowIndex].headCells.splice(cellIndex, 0, cell);
        for (let i = cellIndex + 1; i < table.thead.headRows[rowIndex].headCells.length; i++) {
          table.thead.headRows[rowIndex].headCells[i].colIndex = table.thead.headRows[rowIndex].headCells[i].colIndex + 1;
        }
      });

      addColumns.forEach((column, index) => {
        let cell = column.cell;
        let rowIndex = column.rowIndex;
        let cellIndex = column.cellIndex;
        // table.tbody.rows[rowIndex].cells.splice(cellIndex, 0, cell);
        table.tbody.rows[rowIndex].addCell(cell, cellIndex);
        // for (let i = cellIndex + 1; i < table.tbody.rows[rowIndex].cells.length; i++) {
        //   table.tbody.rows[rowIndex].cells[i].colIndex = table.tbody.rows[rowIndex].cells[i].colIndex + 1;
        // }
      });

      //处理合计行
      //合计行计数
      let sumCount = 0;
      let sumBegin = table.columns.length;
      let sumColumns = [];
      table.columns.forEach((column, colIndex) => {
        if (column.dynamic && column.dynamicGroup == addHead.property) {
          sumCount++;
          if (colIndex < sumBegin) {
            sumBegin = colIndex;
          }
        }
      });

      //复制合计行
      sumCount = sumCount / length;
      for (let i = 0; i < sumCount; i++) {
        let cell = table.columns[order * sumCount + sumBegin + i];
        sumColumns.push({
          cellIndex: order * sumCount + sumBegin + sumCount + i,
          cell: angular.copy(cell),
        });
        sumColumns[sumColumns.length - 1].cell.value = null;
      }
      sumColumns.forEach((column, colIndex) => {
        let cell = column.cell;
        let cellIndex = column.cellIndex;
        table.columns.splice(cellIndex, 0, cell);
        for (let i = cellIndex + 1; i < table.columns.length; i++) {
          table.columns[i].colIndex = table.columns[i].colIndex + 1;
        }
      });

      //let count = headCounts[headCounts.length - 1].count;
      //table.width = (table.width ? table.width : 1300) + count * 80;

      window.changeflag = true;
      window.closeFlag = true;
      table.width = calculatorWidth(table.thead.headRows[0].headCells);
      //window.setTimeout("$('#"+addHead.property+(index+1)+"').focus();", 50);

    }

    function delColumn(addHead, table, index) {

      let addHeadRows = [];
      //对表头与复杂表头计数
      let headCounts = [];
      table.thead.headRows.forEach((row, rowIndex) => {
        headCounts.push({
          rowIndex: rowIndex,
          count: 0,
          begin: row.headCells.length,
        });
        row.headCells.forEach((cell, cellIndex) => {
          if (
            (rowIndex == 0 && cell.property == addHead.property) ||
            (cell.dynamic && cell.dynamicGroup == addHead.property)
          ) {
            headCounts[rowIndex].count++;
            if (cellIndex < headCounts[rowIndex].begin) {
              headCounts[rowIndex].begin = cellIndex;
            }
          }
        });
      });

      //复制表头
      let length = headCounts[0].count;
      if (length <= 1) {
        return;
      }
      let order = index - headCounts[0].begin;
      headCounts.forEach((count, countIndex) => {
        count.count = count.count / length;
        for (let i = 0; i < count.count; i++) {
          addHeadRows.push({
            rowIndex: count.rowIndex,
            cellIndex: order * count.count + count.begin + i,
          });
        }
      });

      //表格计数
      let addColumns = [];
      let bodyCounts = [];
      table.tbody.rows.forEach((row, rowIndex) => {
        bodyCounts.push({
          rowIndex: rowIndex,
          count: 0,
          begin: row.cells.length,
        });
        row.cells.forEach((cell, cellIndex) => {
          if (cell.dynamic && cell.dynamicGroup == addHead.property) {
            bodyCounts[rowIndex].count++;
            if (cellIndex < bodyCounts[rowIndex].begin) {
              bodyCounts[rowIndex].begin = cellIndex;
            }
          }
        });
      });
      //复制表格
      bodyCounts.forEach((count, countIndex) => {
        count.count = count.count / length;
        for (let i = 0; i < count.count; i++) {
          addColumns.push({
            rowIndex: count.rowIndex,
            cellIndex: order * count.count + count.begin + i,
          });
        }
      });
      addHeadRows.sort((row1, row2) => {
        return row2.cellIndex - row1.cellIndex;
      });
      addColumns.sort((cell1, cell2) => {
        return cell1.cellIndex - cell2.cellIndex;
      });
      //粘贴单元格
      addHeadRows.forEach((headRow, index, ) => {
        let rowIndex = headRow.rowIndex;
        let cellIndex = headRow.cellIndex;
        table.thead.headRows[rowIndex].headCells.splice(cellIndex, 1);
      });
      addColumns.forEach((column, index, ) => {
        let rowIndex = column.rowIndex;
        let cellIndex = column.cellIndex;
        let row = table.tbody.rows[rowIndex];
        row.removeCell(row.cells[cellIndex]);
        // table.tbody.rows[rowIndex].cells.splice(cellIndex, 1);
      });

      //处理合计行

      //合计行计数
      let sumCount = 0;
      let sumBegin = table.columns.length;
      let sumColumns = [];
      table.columns.forEach((column, colIndex) => {
        if (column.dynamic && column.dynamicGroup == addHead.property) {
          sumCount++;
          if (colIndex < sumBegin) {
            sumBegin = colIndex;
          }
        }
      });
      //复制合计行
      sumCount = sumCount / length;
      for (let i = 0; i < sumCount; i++) {
        sumColumns.push({
          cellIndex: order * sumCount + sumBegin + i,
        });
      }
      sumColumns.sort((cell1, cell2) => {
        return cell2.cellIndex - cell1.cellIndex;
      });
      sumColumns.forEach((column, colIndex) => {
        let cellIndex = column.cellIndex;
        table.columns.splice(cellIndex, 1);
      });

      let count = headCounts[headCounts.length - 1].count;
      table.width = calculatorWidth(table.thead.headRows[0].headCells);
      window.changeflag = true;
      window.closeFlag = true;
    }

    function countDynamic(headCells) {
      let count = 0;
      headCells.forEach((head, index) => {
        if (head.dynamic && head.dynamic != 'false') {
          count++;
        }
      });
      return count;
    }

    function checkedAll(checkedProperty, uitab, checked) {
      if (checkedProperty && uitab && uitab.table && uitab.table.tbody && uitab.table.tbody.rows && uitab.table.tbody.rows.length > 0) {
        var propertys = angular.copy(checkedProperty);
        if (propertys.indexOf('#ROW#') >= 0) {
          $(uitab.table.tbody.rows).each(function (rowIndex, row) {
            row.checked = checked;
          });
          propertys.splice(propertys.indexOf('#ROW#'), 1);
        }
        if (propertys.length > 0) {
          $(uitab.table.tbody.rows).each(function (rowIndex, row) {
            $(row.cells).each(function (cellIndex, cell) {
              if (propertys.indexOf(cell.property) >= 0) {
                cell.checked = checked;
              }
            });
          });
        }
      }
      if (checkedProperty && uitab && uitab.subTable && uitab.subTable.tbody && uitab.subTable.tbody.rows && uitab.subTable.tbody.rows.length > 0) {
        var propertys = angular.copy(checkedProperty);
        if (propertys.indexOf('#SUBROW#') >= 0) {
          $(uitab.subTable.tbody.rows).each(function (rowIndex, row) {
            row.checked = checked;
          });
          propertys.splice(propertys.indexOf('#SUBROW#'), 1);
        }
        if (propertys.length > 0) {
          $(uitab.subTable.tbody.rows).each(function (rowIndex, row) {
            $(row.cells).each(function (cellIndex, cell) {
              if (propertys.indexOf(cell.property) >= 0) {
                cell.checked = checked;
              }
            });
          });
        }
      }
    }

    return {
      editModleCache,
      editModleOn,
      editModleOff,
      countDynamic,
      addColumn,
      delColumn,
      editmoduleKeyup,
      checkedAll
    };
  }]);
