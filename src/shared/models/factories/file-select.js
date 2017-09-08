import { giveFontClassText } from '../utils';

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
  dataType: 'fileselect'
})
export class UIFileSelectFactory extends UIElementFactory {

  /**
   * create element template
   */
  createTemplate({cell}) {
    return `
      <div react-ele ${giveFontClassText(cell)}> 
        <a href="javascript:;">获取</a>
        ${cell.value ? `<a href="javascript:;">预览</a> ` : ''}
      </div>`;
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
    let links = $(ele).find(a);
    ele.children[0].addEventListener('click', () => {
      input.fileSelect(input.row.id);
      input.scope.$apply();
    });
    ele.children[1].addEventListener('click', () => {
      input.viewFile(input.row.id);
      input.scope.$apply();
    });
    return ele;
  }
}
