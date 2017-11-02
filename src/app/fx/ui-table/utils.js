import { pasteHook } from '../../../shared/hooks/paste';

import {
  UICell,
  UIRow,
  UITable,
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
  ROW_BEFORE_CELLS_CHANGED,
  ROW_CELLS_CHANGED,
  ROW_DEL_CHANGE,
  ROW_CHECKED,
  ROW_INDEX_CHANGE,
  ROW_REMOVED,
} from '../../../shared/models';

/**
 * utils
 */

export function bindFontStyle(cell, ele) {
  giveFontClass(cell, ele);
  // cell.on(CELL_FONT_CHANGED, () => {
  //   giveFontClass(cell, ele);
  // });
}

export function bindID(tab, cell, row, ele, type) {
  let onIndexChanged = () => {
    _giveID(tab, cell, row, ele, type);
  }
  onIndexChanged();
  cell.on(CELL_COLINDEX_CHANGED, onIndexChanged);
  row.on(ROW_INDEX_CHANGE, onIndexChanged);
}

export function bindValue(cell, ele, scope) {
  ele.addEventListener('change', () => {
    cell.value = ele.value;
    window.changeflag = true;
    window.closeFlag = true;
    scope && scope.$apply();
  });
  cell.on(CELL_VALUE_CHANGED, () => {
    ele.value = cell.value;
  });
  ele.value = cell.value;
}

export function bindFocus(ele, cell, scope) {
  ele.addEventListener('focus', () => {
    if(scope.inputFocus){
      scope.inputFocus(cell);
    }    
  });
}

export function bindBlur(cell, ele, tab, scope) {
  ele.addEventListener('blur', () => {
    cell.validate();
    try {
      if(scope.exeFuncs){
        scope.exeFuncs(tab);
      }      
    } catch (e){
      console.log('exe funcn error:' + e);
    }
    scope.$apply();
  });
}

export function _giveID(tab, cell, row, ele, type) {
  ele.id = [type, tab.id, row.rowIndex, cell.colIndex].join('_');
}

export function giveFontClass(cell, ele) {
  if (cell.font && cell.font.bold) {
    ele.classList.add('font-bold-row');
  } else {
    ele.classList.remove('font-bold-row');
  }
}

export function bindPaste(input, ele) {
  ele.addEventListener('mouseenter', () => {
    if (ele.getAttribute('paste-text') === 'true') return;
    pasteHook(input.scope, input.tab, input.$dataTable, input.row, input.cell, ele);
    ele.setAttribute('paste-text', 'true');
  });
}

export function bindTabIndex(input, ele) {
  input.cell.on(CELL_COLINDEX_CHANGED, () => {
    giveTabIndex(input, ele);
  });
  input.row.on(ROW_INDEX_CHANGE, () => {
    giveTabIndex(input, ele);
  });
}

export function giveTabIndex(input, ele) {
  ele.tabIndex = calTabIndex(input);
}


export function escapeStr(value) {
  return value ? value.toString().replace(/\"/g, '\\\"') : '';
}

export function escapeHtml(value) {
  return String(value || '').replace(/[&<>"'`=\/]/g, function (s) {
    return entityMap[s];
  });
}

export function giveFontClassText(cell, isInClass=false) {
  if (cell.font && cell.font.bold) {
    return isInClass ? 'font-bold-row' : 'class="font-bold-row"';
  } else {
    return '';
  }
}
