import { bindFontStyle, bindID, bindFocus, giveFontClassText } from '../utils';
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
import { datePicker } from '../../hooks/date-picker';



@ElementFactory({
  dataType: 'datetime'
})
export class UIDateTimeFactory extends UIElementFactory {

  /**
   * create element template
   */
  createTemplate({cell}) {
    return `<input 
      react-ele
      onchange="window.changeflag=true;window.closeFlag = true;"
      type="text"
      style="width: 100%;"
      value="${escapeStr(cell.value)}" 
      class="l_member_date ${giveFontClassText(cell, true)}"
    />`;
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

    datePicker(ele, false, input.cell.format, false, (value) => {
      input.cell.value = value;
    });
    bindFontStyle(ele);
    bindFocus(ele, input.cell, input.scope);
    bindTabIndex(input, ele);

    ele.addEventListener('blur', () => {
      if (input.cell.validate) {
        input.cell.validate()
      }
      input.scope.exeFuncs(input.tab);
    });

    pasteHook(input.scope, input.tab, input.$dataTable, input.row, input.cell, ele);
  }
}
