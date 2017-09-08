//判断动态列是否设置过
export function checkIsNotEmptyDynamicHead(tab) {
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


export function getNumber(value, decimal) {
  value = value || 0;
  if (!isNumeric(value)) {
    return '';
  }
  typeof value === 'string' && (value = parseFloat(value));
  return value.toLocaleString(
    undefined, // use a string like 'en-US' to override browser locale
    { minimumFractionDigits: 2 }
  );
}

//失去焦点校验
export function cellvalidate(res) {
  var isnull = arguments[1];
  var cell = this;

  if (cell.unit && cell.value) {
    cell.value = cell.value.toString().replaceAll(cell.unit, '');
  }
  cell.invalide = false;
  var result = res ? res : { succ: true, propertyName: cell.propertyName, msg: [] };
  var addMsg = function (msg) {
    cell.invalide = true;
    result.succ = false;
    if (result.msg.indexOf(msg) < 0) {
      result.msg.push(msg);
    }
  }
  if (!isnull && cell.required && isNull(cell.value)) {
    addMsg('不能为空');
  }
  if (cell.minLength > 0 && (isNull(cell.value) || cell.value.toString().length < cell.minLength)) {
    addMsg('不能少于[' + cell.minLength + ']个字');
  }
  if (cell.maxLength && isNotNull(cell.value) && cell.value.toString().length > cell.maxLength) {
    addMsg('不能大于[' + cell.maxLength + ']位');
  }
  var formatInvalide = false;
  if (cell.regexp && isNotNull(cell.value) && cell.value != '---'
    && ((cell.dataType != 'number' && !(new RegExp(cell.regexp)).test(cell.value.toString()))
      || (cell.dataType == 'number' && !(new RegExp(cell.regexp)).test(cell.value.toString().replaceAll(',', ''))))) {
    addMsg('格式错误');
    formatInvalide = true;
  }
  if (cell.dataType == 'number' && !formatInvalide && isNotNull(cell.value)) {
    if (isNotNull(cell) && isNotNull(cell.value)) {
      cell.value = cell.value.toString().replaceAll(',', '');
    }
    if (cell.min && parseFloat(cell.value.toString() < cell.min)) {
      addMsg('不能小于[' + cell.min + ']');
    }
    if (cell.max && parseFloat(cell.value.toString()) > cell.max) {
      addMsg('不能大于[' + cell.max + ']');
    }
    if (cell.decimal != undefined) {
      if (cell.decimal > 0 && cell.value.toString().indexOf('.') >= 0
        && cell.value.toString().substring(cell.value.toString().indexOf('.') + 1).length > cell.decimal) {
        addMsg('小数位数不能超过[' + cell.decimal + ']位');
      }
      if (cell.decimal > 0 && (cell.value.toString().indexOf('.') < 0
        || cell.value.toString().substring(cell.value.toString().indexOf('.') + 1).length < cell.decimal)) {
        var num;
        if (cell.value.toString().indexOf('.') < 0) {
          cell.value += '.';
          num = cell.decimal;
        } else {
          num = cell.decimal - cell.value.toString().substring(cell.value.toString().indexOf('.') + 1).length;
        }
        cell.value += '0'.repeat(num);
      }
    
      if (cell.decimal == 0 && cell.value.toString().indexOf('.') >= 0) {
        addMsg('不能为小数');
      }
    }
    cell.value = getNumber(cell.value, cell.decimal);
  }
  if (cell.unit && cell.value) {
    cell.value = cell.value + cell.unit;
  }
  return result;
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
