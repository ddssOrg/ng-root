String.prototype.replaceAll = function (s1, s2) {
  return this.replace(new RegExp(s1, "gm"), s2);
}

/**
 * 页面初始化回调方法
 * @param tabs
 * @return
 */
function validateHbsAndBd(tabs) {
  var columns = tabs[0].table.columns;
  var rows = tabs[0].table.tbody.rows;
  validateData(tabs, columns, rows);
}

/**
 * 校验资产负债表中带到页面上的合并数和上期比对的对对数据是否一致
 * @return
 */
function validateData(tabs, columns, rows) {
  if (isNotNull(rows) && rows.length > 0) {
    for (var i = 0; i < rows.length; i++) {
      var xzbdyyEqualFlag = true;
      var row = rows[i];
      var snjezb = row.data.n[0];
      var bnjezb = row.data.n[1];
      var snje = snjezb.je;
      var snje_bd = snjezb.je_bd;
      var snzb = snjezb.zb;
      var snzb_bd = snjezb.zb_bd;
      var bnje = bnjezb.je;
      var bnje_bd = bnjezb.je_bd;
      var bnzb = bnjezb.zb;
      var bnzb_bd = bnjezb.zb_bd;
      if (snje != snje_bd) {
        row.cells[2].equalsFlag = true;
        xzbdyyEqualFlag = false;
      }
      if (snzb != snzb_bd) {
        row.cells[3].equalsFlag = true;
        xzbdyyEqualFlag = false;
      }
      if (bnje != bnje_bd) {
        row.cells[4].equalsFlag = true;
        xzbdyyEqualFlag = false;
      }
      if (bnzb != bnzb_bd) {
        row.cells[5].equalsFlag = true;
        xzbdyyEqualFlag = false;
      }
      var bqbsqbdje = row.data.bqbsqbdje;
      var bqbsqbdbl = row.data.bqbsqbdbl;
      var bqysqzbcy = row.data.bqysqzbcy;
      var bqbsqbdje_bd = row.data.bqbsqbdje_bd;
      var bqbsqbdbl_bd = row.data.bqbsqbdbl_bd;
      var bqysqzbcy_bd = row.data.bqysqzbcy_bd;
      if (bqbsqbdje != bqbsqbdje_bd) {
        row.cells[6].equalsFlag = true;
        xzbdyyEqualFlag = false;
      }
      if (bqbsqbdbl != bqbsqbdbl_bd) {
        row.cells[7].equalsFlag = true;
        xzbdyyEqualFlag = false;
      }
      if (bqysqzbcy != bqysqzbcy_bd) {
        row.cells[8].equalsFlag = true;
        xzbdyyEqualFlag = false;
      }
      if (!xzbdyyEqualFlag) {
        row.cells[11].equalsFlag = true;
      }
    }
  }
}

/**
 * 获取计算单元格的计算公式及各个值
 * @param cell
 * @param row
 * @param rowIndex
 * @returns
 */
function getCalculate(columns, cell, rows, rowIndex, colIndex, tabs, tab) {
  var row = rows[rowIndex];
  var tsxx = "最近一期比对的值为";
  var snjezb = row.data.n[0];
  var bnjezb = row.data.n[1];
  var snje_bd = snjezb.je_bd;
  var snzb_bd = snjezb.zb_bd;
  var snje = snjezb.je;
  var snzb = snjezb.zb;
  var bnje = bnjezb.je;
  var bnje_bd = bnjezb.je_bd;
  var bnzb = bnjezb.zb;
  var bnzb_bd = bnjezb.zb_bd;
  if (colIndex == 2) {
    tsxx = tsxx + snje_bd;
  }
  if (colIndex == 3) {
    tsxx = tsxx + snzb_bd + "%";
  }
  if (colIndex == 4) {
    tsxx = tsxx + bnje_bd;
  }
  if (colIndex == 5) {
    tsxx = tsxx + bnzb_bd + "%";
  }
  var bqbsqbdje = row.data.bqbsqbdje;
  var bqbsqbdbl = row.data.bqbsqbdbl;
  var bqysqzbcy = row.data.bqysqzbcy;
  var bqbsqbdje_bd = row.data.bqbsqbdje_bd;
  var bqbsqbdbl_bd = row.data.bqbsqbdbl_bd;
  var bqysqzbcy_bd = row.data.bqysqzbcy_bd;
  if (colIndex == 6) {
    tsxx = tsxx + bqbsqbdje_bd;
  }
  if (colIndex == 7) {
    tsxx = tsxx + bqbsqbdbl_bd + "%";
  }
  if (colIndex == 8) {
    tsxx = tsxx + bqysqzbcy_bd;
  }
  return tsxx;
}

/**
 * 校验当前单元格是否带出来的合并数和比对数相等
 * @param columns
 * @param cell
 * @param rows
 * @param rowIndex
 * @param colIndex
 * @param tab
 * @param tabs
 * @return
 */
function isCalculate(columns, cell, rows, rowIndex, colIndex, tab, tabs) {
  var cellValue = "";
  if (isNotNull(cell.value)) {
    cellValue = cell
      .value
      .replaceAll(",", "")
      .replaceAll("%", "");
  }

  var row = rows[rowIndex];
  var snjezb = row.data.n[0];
  var bnjezb = row.data.n[1];
  var snje = snjezb.je;
  var snje_bd = snjezb.je_bd;
  var snzb = snjezb.zb;
  var snzb_bd = snjezb.zb_bd;
  var bnje = bnjezb.je;
  var bnje_bd = bnjezb.je_bd;
  var bnzb = bnjezb.zb;
  var bnzb_bd = bnjezb.zb_bd;

  var bqbsqbdje = row.data.bqbsqbdje;
  var bqbsqbdbl = row.data.bqbsqbdbl;
  var bqysqzbcy = row.data.bqysqzbcy;
  var bqbsqbdje_bd = row.data.bqbsqbdje_bd;
  var bqbsqbdbl_bd = row.data.bqbsqbdbl_bd;
  var bqysqzbcy_bd = row.data.bqysqzbcy_bd;
  if (colIndex == 2) {
    if (cellValue != snje_bd) {
      return true;
    }
  } else if (colIndex == 3) {
    if (cellValue != snzb_bd) {
      return true;
    }
  } else if (colIndex == 4) {
    if (cellValue != bnje_bd) {
      return true;
    }
  } else if (colIndex == 5) {
    if (cellValue != bnzb_bd) {
      return true;
    }
  } else if (colIndex == 6) {
    if (cellValue != bqbsqbdje_bd) {
      return true;
    }
  } else if (colIndex == 7) {
    if (cellValue != bqbsqbdbl_bd) {
      return true;
    }
  } else if (colIndex == 8) {
    if (cellValue != bqysqzbcy_bd) {
      return true;
    }
  } else {
    return false;
  }
}

/**
 * 失去焦点校验当前单元格的合并数和上一期的比对数是否一致
 * @return
 */
function validateCellHbAndBd(uitab, colIndex, uirow, uicell) {
  var cellValue = "";
  if (isNotNull(uicell) && isNotNull(uicell.value)) {
    cellValue = uicell
      .value
      .replaceAll(",", "")
      .replaceAll("%", "");
  }
  if (isNotNull(uirow)) {
    var snjezb = uirow.data.n[0];
    var bnjezb = uirow.data.n[1];
    var snje = snjezb.je;
    var snje_bd = snjezb.je_bd;
    var snzb = snjezb.zb;
    var snzb_bd = snjezb.zb_bd;
    var bnje = bnjezb.je;
    var bnje_bd = bnjezb.je_bd;
    var bnzb = bnjezb.zb;
    var bnzb_bd = bnjezb.zb_bd;

    var bqbsqbdje = uirow.data.bqbsqbdje;
    var bqbsqbdbl = uirow.data.bqbsqbdbl;
    var bqysqzbcy = uirow.data.bqysqzbcy;
    var bqbsqbdje_bd = uirow.data.bqbsqbdje_bd;
    var bqbsqbdbl_bd = uirow.data.bqbsqbdbl_bd;
    var bqysqzbcy_bd = uirow.data.bqysqzbcy_bd;
    var xzbdyyfx_bd = uirow.data.xzbdyyfx_bd;
    if (colIndex == 2) {
      if (cellValue == snje_bd) {
        uicell.equalsFlag = false;
      } else {
        uicell.equalsFlag = true;
      }
    } else if (colIndex == 3) {
      if (cellValue == snzb_bd) {
        uicell.equalsFlag = false;
      } else {
        uicell.equalsFlag = true;
      }
    } else if (colIndex == 4) {
      if (cellValue == bnje_bd) {
        uicell.equalsFlag = false;
      } else {
        uicell.equalsFlag = true;
      }
    } else if (colIndex == 5) {
      if (cellValue == bnzb_bd) {
        uicell.equalsFlag = false;
      } else {
        uicell.equalsFlag = true;
      }
    } else if (colIndex == 6) {
      if (cellValue == bqbsqbdje_bd) {
        uicell.equalsFlag = false;
      } else {
        uicell.equalsFlag = true;
      }
    } else if (colIndex == 7) {
      if (cellValue == bqbsqbdbl_bd) {
        uicell.equalsFlag = false;
      } else {
        uicell.equalsFlag = true;
      }
    } else if (colIndex == 8) {
      if (cellValue == bqysqzbcy_bd) {
        uicell.equalsFlag = false;
      } else {
        uicell.equalsFlag = true;
      }
    } else if (colIndex == 11) {
      if (cellValue != xzbdyyfx_bd) {
        uicell.equalsFlag = false;
      } else {
        uicell.equalsFlag = true;
      }
    }
  }
}