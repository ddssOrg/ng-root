import { giveFontClassText, escapeHtml } from '../utils';

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
  dataType: 'upload'
})
export class UIUploadFactory extends UIElementFactory {

  /**
   * create element template
   */
  createTemplate({ cell, row, tab }) {
    if (row.id && cell.haveCjmbFlag && tab.id != '10101-1' && tab.id != '10101-2'
      && tab.id != '10101-3' && tab.id != '10201-1' && tab.id != '10201-2' && tab.id != '10201-3' && tab.id != '10201-3' && tab.id != '10301-1') {
      return `
      <div react-ele ${giveFontClassText(cell)}>
        <a href="javascript:;" class="upload-ft">访谈</a> 
      </div>`;
              
    } else if (row.id && !cell.haveCjmbFlag) {
      return `
      <div react-ele ${giveFontClassText(cell)}> 
        <a href="javascript:;" class="upload-sc">上传</a>
        ${cell.value ? `<a href="javascript:;" class="upload-view">预览(${row.data.fjsl})</a> ` : ''}
        ${cell.value ? `<a href="javascript:;" class="upload-del">删除</a> ` : ''}
      </div>`;
    } else if (row.id && cell.haveCjmbFlag && (tab.id == '10101-1' || tab.id == '10101-2'
      || tab.id == '10101-3' || tab.id == '10201-1' || tab.id == '10201-2' || tab.id == '10201-3' || tab.id == '10201-3' || tab.id == '10301-1')) {
      return `
      <div react-ele ${giveFontClassText(cell)}> 
        <a href="javascript:;" class="upload-sc">上传</a> 
        ${cell.value ? `<a href="javascript:;" class="upload-view">预览(${row.data.fjsl})</a> ` : ''}
        ${cell.value ? `<a href="javascript:;" class="upload-del">删除</a> ` : ''}
        <a target="_blank" class="upload-template">模板</a> 
      </div>`;
    } else if (!row.id) {
      return `<div react-ele ${giveFontClassText(cell)}><a href="javascript:;" class="upload-save">保存</a></div>`;
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

    // many things to do
    $(ele).find('.upload-ft').click(() => {
      input.scope.openFtjl(input.cell);
      input.scope.$apply();
    });
    $(ele).find('.upload-view').click(() => {
      input.scope.viewFile(input.row.data.cjmxdm);
    })
    $(ele).find('.upload-del').click(() => {
      input.scope.delFile(input.row.data.cjmxdm, input.cell);
    });
    $(ele).find('.upload-save', () => {
      input.scope.exeCommand({ action: 'saveRow', tabid: input.tab.id }, input.row);
    });
    return ele;
  }
}
