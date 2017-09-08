angular.module('xmcjgy')
  .service('uigyService', ['$filter', ($filter) => {
  
    //为销售结构分析用例的B0304-3-5的表格增加年份
    const createYear = (uitab, id, e, fxB0203_1) => {
      let keycode = window.event ? e.keyCode : e.which;
      if (keycode == 13) {
        let year = fxB0203_1.myCreateYear;
        let reg = new RegExp("^\\d{4}$");
        let table = uitab.table;
        if (year == "") {
          uitab.showInput = false;
        } else if (!reg.test(year)) {
          alert("请输入四位整数年份");
          fxB0203_1.myCreateYear = "";
        } else {
          if (table.filters.indexOf(year) < 0) {
            table.filters.push(year);
            fxB0203_1.myCreateYear = "";
            uitab.showInput = false;
            if (isNotNull(table) && isNotNull(table.filters)) {//年度排序
              table.filters.sort(function (a, b) { return b - a })
            }
            if (table && table.filterProperty && table.filters.length > 0) {
              table.filterChoose = year;
            }
          } else {
            alert("输入的年份已存在");
            fxB0203_1.myCreateYear = "";
          }
        }
      }
    };

    /**
     * 单元格验证
     * @param {} res 
     */
    const cellValidation = function (res) {
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
      if (cell.required && isNull(cell.value)) {
        addMsg('不能为空');
      }
      if (cell.minLength > 0 && (isNull(cell.value) || cell.value.toString().length < cell.minLength)) {
        addMsg('不能少于[' + cell.minLength + ']个字');
      }
      if (cell.maxLength && isNotNull(cell.value) && cell.value.toString().length > cell.maxLength) {
        addMsg('不能大于[' + cell.maxLength + ']个字');
      }
      var formatInvalide = false;
      if (cell.regexp && isNotNull(cell.value)
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
        cell.value = $filter('number')(cell.value, cell.decimal);
      }
      if (cell.unit && cell.value) {
        cell.value = cell.value + cell.unit;
      }
      return result;
    };

    return {
      createYear,
      cellValidation,
    };
  }]);
