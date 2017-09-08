import { bindFontStyle, bindID, bindFocus, bindBlur, bindValue, bindPaste, bindTabIndex, giveFontClassText, escapeHtml } from '../utils';

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

import { pasteHook } from '../../hooks/paste';
import { contentEditable } from '../../hooks/content-editable';


@ElementFactory({
  dataType: 'textarea'
})
export class UITextareaFactory extends UIElementFactory {

  /**
   * create element template
   */
  createTemplate({cell}) {
    return `
    <div react-ele
      ${giveFontClassText(cell)}
      draggable="false"
      ng-paste-text
      contenteditable="false" paste-text
      style="outline:none;position: relative;z-index: 1;margin: 3px;min-height:16px;white-space:normal;word-break:break-all;word-wrap:break-word; " 
    >${escapeHtml(cell.value)}</div>`;
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

    input.cell.editable = true;

    bindID(input.tab, input.cell, input.row, ele, 'textarea');
    contentEditable(ele, (text) => {
      input.cell.setValue(text);
    });
    input.cell.on(CELL_VALUE_CHANGED, () => {
      ele.innerText = input.cell.value;
    });
    // bindTabIndex(input, ele);
    // bindPaste(input, ele);
    return ele;
  }
}