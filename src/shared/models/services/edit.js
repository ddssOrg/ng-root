import * as events from 'events';

export const EDIT_CELL_BLUR = 'EDIT_CELL_BLUR';
export const EDIT_CELL_FOCUS = 'EDIT_CELL_FOCUS';

export class UIEdit extends events.EventEmitter{

  constructor(table) {
    super();
    this._table = table;
    this._activeCell = null;

    this.init();
  }

  init() {
    let _that = this;
    $(this._table.ele).on('dblclick.uiedit', 'td.react-cell', function (e) {
      let cellEle = this;
      let cell = cellEle.__celldata;
      _that._onDoubleClick(cell);
      e.stopPropagation();
      e.preventDefault();
    });
    
    $(this._table.ele).on('keydown.uiedit', 'td.react-cell', function (e) {
      let cellEle = this;
      let cell = cellEle.__celldata;
      _that._onKeyDown(cell, e);
    });
    
  }

  _onDoubleClick(cell) {
    this._activateCell(cell, true);
  }
  
  _onKeyDown(cell, e) {
    var keyCode = e.keyCode || e.which; 
    if (keyCode === 9) {
      e.preventDefault();
      e.stopPropagation();
      let _cell = this._findNextCell(cell);
      if (_cell) {
        this._activateCell(_cell);
      } else {
        cell.ele.blur();
      }
    } else if (keyCode === 13) {
      if (this._activeCell !== cell) {
        e.preventDefault();
        e.stopPropagation();
        this._activateCell(cell);
        return;
      }
      if (cell.dataType === 'textarea') {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      let _cell = this._findNextRowCell(cell);
      if (_cell) {
        this._activateCell(_cell);
      } else {
        cell.ele.blur();
      }
    } else if (this._activeCell !== cell && !e.ctrlKey && !e.metaKey) {
      if ((e.keyCode >= 48 && e.keyCode <= 57)
        || (e.keyCode >= 96 && e.keyCode <= 105)
        || (e.keyCode >= 65 && e.keyCode <= 90)
        || (e.keyCode >= 186 && e.keyCode <= 192)
        || (e.keyCode >= 219 && e.keyCode <= 222)
        || e.keyCode === 8
      ) {
        this._activateCell(cell);
      }
    }
  }

  _activateCell(cell) {
    if (!cell.editable) return;
    this._activeCell = cell;
    let cellEle = cell.ele;
      
    cellEle.children[0].contentEditable = true;
    
    cellEle.children[0].focus();
    document.execCommand('selectAll', false, null);
    
    this.emit(EDIT_CELL_FOCUS, cell);
    $(cellEle.children[0])
      .off('blur.react-cell-edit')
      .on('blur.react-cell-edit', () => {
        this.emit(EDIT_CELL_BLUR, cell);
        cellEle.children[0].contentEditable = false;
        this._activeCell = null;
        $(cellEle.children[0]).off('blur.react-cell-edit');
      });
  }
  
  _findNextRowCell(cell) {
    let colIndex = cell.cellDataIndex;
    let rows = this._table.rows;
    for (let rowIndex = cell.rowDataIndex + 1; rowIndex < rows.length; rowIndex++) {
      let row = rows[rowIndex];
      if (row.cells[colIndex]
        && row.cells[colIndex].editable
        && row.cells[colIndex].visible
      ) {
        return row.cells[colIndex];
      }
    }
    return null;
  }
  
  _findNextCell(cell) {
    let colIndex = cell.cellDataIndex + 1;
    let rows = this._table.rows;
    for (let rowIndex = cell.rowDataIndex; rowIndex < rows.length; rowIndex++){
      let row = rows[rowIndex];
      while (row.cells[colIndex] ) {
        if (row.cells[colIndex].visible &&
          row.cells[colIndex].editable
        ) {
          return row.cells[colIndex];
        }
        colIndex++;
      }
      colIndex = 0;
    }
    return null;
  }
  
  dispose() {
    $(this._table.ele)
      .off('.uiedit')
      .find('td.react-cell')
      .off('.react-cell-edit');
    this.removeAllListeners();
    this._table = null;
  }
}
