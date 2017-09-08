import { bindFontStyle } from '../utils';
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
  dataType: 'checkbox'
})
export class UICheckBoxFactory extends UIElementFactory {

  /**
   * create element template
   */
  createTemplate() {
    return `<input 
      react-ele
      type="checkbox"
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

    ele.checked = input.row.checked;
    input.row.on(ROW_CHECKED, (value) => {
      ele.checked = value;
    });
    ele.addEventListener('change', () => {
      input.row.checked = ele.checked;
      input.scope.$apply();
    });
    return ele;
  }
}
