import {
  bindFontStyle,
  bindID,
  bindValue,
  bindFocus,
  bindPaste,
  bindTabIndex,
  giveFontClassText,
  escapeHtml,
  getNumber,
} from '../utils';

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

import {
  pasteHook,
  calculationHook,
} from '../../hooks';

@ElementFactory({
  dataType: 'number'
})
export class UINumberFactory extends UIElementFactory {

  /**
   * create element template
   */
  createTemplate({ cell }) {
    return `
    <div react-ele
      contenteditable="false"      
      draggable="false"
      ${giveFontClassText(cell)}
      style="width: 100%; text-align: right; "
      type="text">${escapeHtml(cell.value)}</div>`;
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
    // ele.value = input.cell.value || 0;

    input.cell.value = getNumber(input.cell.value);
    input.cell.editable = true;

    input.cell.on(CELL_VALUE_CHANGED, () => {
      $(ele).text($.trim(input.cell.value));
    });
    bindID(input.tab, input.cell, input.row, ele, 'number');
    bindFocus(ele, input.cell, input.scope);
  
    ele.addEventListener('blur', () => {
      input.cell.value = ele.innerText;
      try {
        input.scope.exeFuncs(input.tab, input.cell, input.row.rowIndex, input.cell.colIndex);
      } catch (e) {
        console.log('exe func error:' + e);
      }
      input.cell.validate && input.cell.validate();
      input.scope.numberCellChange(input.tab, input.cell.colIndex);
      input.scope.sumRowRefresh(input.tab);
      input.scope.$apply();
      window.changeflag = true;
      window.closeFlag = true;
    });

    ele.addEventListener('keydown', (e) => {
      if (document.activeElement === ele && ele.contentEditable === 'true') {
        if ((e.keyCode >= 48 && e.keyCode <= 57)
          || (e.keyCode >= 96 && e.keyCode <= 105)
          || (e.keyCode >= 65 && e.keyCode <= 90)
          || (e.keyCode >= 186 && e.keyCode <= 192)
          || (e.keyCode >= 219 && e.keyCode <= 222)
          || e.keyCode === 8
        ) {
          e.stopPropagation();
        }
      }
    });

    ele.innerText = input.cell.value;
    calculationHook(input, ele);
    
    // bindPaste(input, ele);
    // pasteHook(input.scope, input.tab, input.$dataTable, input.row, input.cell, ele);

    // return ele;
  }
}
