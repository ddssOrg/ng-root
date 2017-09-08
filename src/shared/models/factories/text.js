import { bindFontStyle, bindID, bindFocus, bindBlur, bindValue, bindTabIndex, giveFontClassText, escapeHtml } from '../utils';
import { pasteHook } from '../../hooks/paste';

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
  dataType: 'text'
})
export class UITextFactory extends UIElementFactory {

  /**
   * create element template
   */
  createTemplate({cell}) {
      return `<div 
      ${giveFontClassText(cell)}
      contenteditable="false"
      react-ele
      paste-text
      draggable="false"
      onchange="window.changeflag=true;window.closeFlag = true;" style="width: 100%;"
      type="text"
    >${escapeHtml(cell.value)}</div>`;
  }

  /**
   * @desc 创建text类型
   * @param  {} row
   * @param  {} cell
   * @param  {} uitab
   * @param  {} index
   * @param  {} rowIndex
   */
  compile(input) {
    let ele = input.cell.ele.children[0];

    input.cell.editable = true;

    bindFontStyle(input.cell, ele);
    bindFocus(ele, input.cell, input.scope);
    bindBlur(input.cell, ele, input.tab, input.scope);
    bindValue(input.cell, ele, input.tab, input.scope);

    pasteHook(input.scope, input.tab, input.$dataTable, input.row, input.cell, ele);
    // bindTabIndex(input, ele);

    return ele;
  }
}
