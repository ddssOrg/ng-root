import { bindFontStyle, bindID, bindValue, bindFocus, bindBlur, bindTabIndex, escapeHtml, giveFontClassText } from '../utils';
import { selectHook } from '../../hooks/select';

import {
  UICell,
  CELL_DISPOSE,
  CELL_BEFORE_VALUE_CHANGED,
  CELL_BEFORE_VALUES_CHANGED,
  CELL_COLINDEX_CHANGED,
  CELL_COLSPAN_CHANGED,
  CELL_FONT_CHANGED,
  CELL_HIDE_CHANGED,
  CELL_NAME_CHANGED,
  CELL_REMOVED,
  CELL_ROWSPAN_CHANGED,
  CELL_VALUE_CHANGED,
  CELL_VALUES_CHANGED,
  CELL_WRITABLE_CHANGED,
  CELL_SELECTNAME_CHANGED,
} from '../UICell.type';
import {
  ROW_BEFORE_CELLS_CHANGED,
  ROW_CELLS_CHANGED,
  ROW_DEL_CHANGE,
  ROW_CHECKED,
  ROW_INDEX_CHANGE,
  ROW_REMOVED,
  UIRow,
} from '../UIRow.type';
import {
  AFTER_ROWS_CHANGED,
  BEFORE_ROWS_CHANGED,
  UITable,
} from '../UITable.type';
import {
  UIElementFactory
} from '../UIElementFactory.type';
import {
  ElementFactory,
} from '../reflect';

@ElementFactory({
  dataType: 'select'
})
export class UISelectFactory extends UIElementFactory {

  /**
   * create element template
   */
  createTemplate({ row, cell }) {
    if (!cell.custom && !row.id) {
      return `
      <select react-ele
        ${giveFontClassText(cell)}
        style="width: 100%;position: relative;z-index: 1;" 
        onchange="window.changeflag=true;window.closeFlag = true;"/>
        ${cell.options.map(opt => `<option value="${opt.value}">${opt.name}</option>`)}
      </select>`;
    } else if ((cell.custom && !row.id) || cell.writeable) {
      let value = '';
      if (cell.options) {
        let _opt = cell.options.find(opt => opt.value === cell.value);
        value = _opt.name;
      }
      return `<input react-ele
      ${giveFontClassText(cell)}
      onchange="window.changeflag=true;window.closeFlag = true;"
      value="${escapeHtml(value)}" 
      placeholder="请选择"
      style="width: 100%;" type="text" />`;
    } else if (row.id && !cell.writeable) {
      return cell.options.map(opt => `<div><span>${opt.name}</span></div>`);
    } else {
      return '';
    }
  }

  /**
   * @desc 创建check类型
   * @param  {} row
   * @param  {} cell
   * @param  {} uitab
   * @param  {} index
   * @param  {} rowIndex
   */
  compile(input) {
    let ele = input.cell.ele.children[0];

    if (!input.cell.custom && !input.row.id) {
      bindFontStyle(input.cell, ele);
      bindValue(input.cell, ele, input.scope);
      bindFocus(ele, input.cell, input.scope);
      bindBlur(input.cell, ele, input.tab, input.scope);
      // bindTabIndex(input, ele);

      return ele;
    } else if ((input.cell.custom && !input.row.id) || input.cell.writeable) {
      bindBlur(input.cell, ele, input.tab, input.scope);
      bindID(input.tab, input.cell, input.row, ele, 'select');
      bindFontStyle(input.cell, ele);
      bindFocus(ele, input.cell, input.scope);
      // bindTabIndex(input, ele);

      selectHook(input.scope, $(ele), input.cell);
      input.cell.on(CELL_SELECTNAME_CHANGED, (value) => {
        ele.value = value;
      });
      ele.addEventListener('change', () => {
        input.cell.selectname = ele.value;
      });

      return ele;
    } else if (input.row.id && !input.cell.writeable) {
      return ele;
    } else {
      return null;
    }
  }
}
