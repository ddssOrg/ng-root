import { UISelection } from './selection';
import { isIE } from '../../utils';
import { newRow } from '../../../app/fx/services/providers';

export class UIClipboard {

  constructor(table) {
    this._table = table;
    this._delegateEle = null;
    this.init();
  }

  init() {
    if (document.queryCommandSupported('copy')) {
      this._delegateEle = document.getElementById('_clipboardDelegator');
      this._delegateEle || this._creatDelegateElement();
    }
    this._initCopy();
    this._initPaste();
  }

  dispose() {
    $(this._table._ele).off('.ui-clipboard');
    this._table = null;
  }

  copySelection() {
    this._copySelection();
  }

  pasteSelection() {
    this._pasteSelection();
    this._table.scope.$apply();


    input.scope.numberCellChange(input.tab, input.cell.colIndex);
    input.scope.sumRowRefresh(input.tab);
  }

  _initPaste() {
    $(this._table._ele).on('paste.ui-clipboard', (e) => {
      if (!this._table.selection.length) return;
      this._pasteSelection(e);
      this._table.scope.sumRowRefresh(this._table.tab);
      this._table.scope.$apply();
      event.preventDefault();
      event.stopPropagation();
      return false;
    });
  }

  _initCopy() {
    $(this._table._ele).on('copy.ui-clipboard', (e) => {
      if (!this._table.selection.length) return;
      this._copySelection(e);
      e.preventDefault();
    });
  }

  _pasteSelection(e) {
    let pastedText = this._getClipboardData(e);

    let formatted = pastedText.split('\n').map(s => s.split('\t'));
    if (!formatted.length || !formatted[0].length) return;

    let selection = this._sortSelections(this._table.selection);
    let cell = this._table.selection[0];
    let _rowIndex = 0;
    formatted.forEach((rowData, rowIndex) => {
      if (_rowIndex == 0) {
        _rowIndex = cell.rowDataIndex + rowIndex;
      }
      let _row = this._getEnenabledRow(this._table.rows, _rowIndex);
      rowData.forEach((cellData, cellIndex) => {
        if ($.trim(cellData) == '') {
          return;
        }
        if (cell.rowDataIndex + rowIndex >= this._table.rows.length) {
          if (!this._table.tab.table.addRowEnabled) {
            return;
          }
          for (var i = 0; i < cell.rowDataIndex + rowIndex + 1 - this._table.rows.length; i++) {
            let row = newRow(this._table.tab);
            row && this._table.addRow(row);
            let new_cell = this._table.rows[row.rowIndex].cells[cell.cellDataIndex + cellIndex];
            new_cell.value = cellData;
          }
          window.changeflag = true;
          window.closeFlag = true;
          this._table.scope.$apply();
          return;
        }


        let _cell = _row.cells[cell.cellDataIndex + cellIndex];
        if (!_cell || !_cell.editable) return;
        _cell.value = $.trim(formatted[rowIndex][cellIndex]);
        try {
          this._table.scope.exeFuncs(this._table.tab, _cell, _row.rowIndex, _cell.colIndex);
        } catch (e) {
          console.log('exe func error:' + e);
        }
        _cell.validate && _cell.validate();
        this._table.scope.numberCellChange(this._table.tab, _cell.colIndex);
      });
      _rowIndex = _row.rowIndex + 1;
    });

    window.changeflag = true;
    window.closeFlag = true;

  }

  _getEnenabledRow(rows, rowIndex) {
    if (rows.length == rowIndex - 1) {
      return;
    }
    let _row = rows[rowIndex];
    if (_row.hide) {
      rowIndex++;
      _row = this._getEnenabledRow(rows, rowIndex);
    }
    return _row;
  }

  _copySelection(e) {
    let result = this._formatCopyContent(this._table.selection);
    //console.log(result);;

    this._copyTextToClipboard(result, e);
  }

  _formatCopyContent(selection) {
    if (!selection || !selection.length) return;
    selection = this._sortSelections(selection);

    let rowIndex = selection[0].row.rowIndex;
    let pasteStr = [];
    let rowStr = [];
    pasteStr.push(rowStr);
    selection.forEach(cell => {
      if (rowIndex !== cell.row.rowIndex) {
        rowIndex = cell.row.rowIndex;
        rowStr = [];
        pasteStr.push(rowStr);
      }
      rowStr.push(cell.value);
    });

    return pasteStr
      .map(row => row.join('\t'))
      .join('\n');
  }

  _sortSelections(selection) {
    return UISelection.sortSelections(selection);
  }

  _getClipboardData(event) {
    if (!document.queryCommandSupported('paste') || !document.queryCommandEnabled('paste')) {
      if (isIE()) {
        return window.clipboardData.getData('Text');
      } else {
        return event.originalEvent.clipboardData.getData('Text');
      }
    } else {
      !this._delegateEle && this._creatDelegateElement();
      this._delegateEle.select();
      document.execCommand('paste');
      return this._delegateEle.value;
    }
  }

  _copyTextToClipboard(text, event) {
    if (!document.queryCommandSupported('copy') || !document.queryCommandEnabled('copy')) {
      if (isIE()) {
        window.clipboardData.setData('Text', text);
      } else {
        event.originalEvent.clipboardData.setData('Text', text);
      }
    } else {
      !this._delegateEle && this._creatDelegateElement();
      this._delegateEle.value = text;
      this._delegateEle.select();
      document.execCommand('copy');
    }
  }

  _creatDelegateElement() {
    let textArea = document.createElement("textarea");
    textArea.id = '_clipboardDelegator';

    // Place in top-left corner of screen regardless of scroll position.
    textArea.style.position = 'fixed';
    textArea.style.top = 0;
    textArea.style.left = 0;

    // Ensure it has a small width and height. Setting to 1px / 1em
    // doesn't work as this gives a negative w/h on some browsers.
    textArea.style.width = '2em';
    textArea.style.height = '2em';

    // We don't need padding, reducing the size if it does flash render.
    textArea.style.padding = 0;

    // Clean up any borders.
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';

    // Avoid flash of white box if rendered for any reason.
    textArea.style.background = 'transparent';
    document.body.appendChild(textArea);

    this._delegateEle = textArea;
  }

}
