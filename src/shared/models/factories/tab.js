import { bindFontStyle, bindID, bindValue, bindFocus, bindBlur, giveFontClassText, escapeHtml } from '../utils';
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
  dataType: 'TAB'
})
export class UITabFactory extends UIElementFactory {

  /**
   * create element template
   */
  createTemplate({cell}) {
    if (cell.href != '' && cell.href != '/') {
      return `<a react-ele href="javascript:;"style="font-weight: bold;" ${giveFontClassText(cell)} >${escapeHtml(cell.value)}</a>`;
    } else {
      return `<span react-ele ${giveFontClassText(cell)}>${escapeHtml(cell.value)}</span>`;
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

    if (input.cell.href != '' && input.cell.href != '/') {
      ele.addEventListener('click', () => {
        input.scope.showDialog(input.cell, input.row);
        input.scope.$apply();
      });
    }
    // bindFontStyle(input.cell, ele);
    ele.innerText = input.row.data[input.cell.labelProperty];
    return ele;
  }
}
