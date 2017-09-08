import { bindFontStyle, bindID, bindFocus, giveFontClassText, escapeHtml } from '../utils';

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
  dataType: 'href'
})
export class UIHrefFactory extends UIElementFactory {

  /**
   * create element template
   */
  createTemplate({ cell }) {
    if (cell.value) {
      return '<a react-ele style="font-weight: bold;" target="_blank" ${giveFontClassText(cell)}>${escapeHtml(cell.value)}</a>';
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

    if (input.cell.value) {
      ele.href = `/download.sword?ctrl=DemoCtrl_downloadallfile&mbpath=${input.cell.value}${input.scope.getAuditParams()}`;
    } else {
      bindFontStyle(input.cell, ele);
    }

    ele.innerText = input.row.data[input.cell.labelProperty];

    return ele;
  }
}
