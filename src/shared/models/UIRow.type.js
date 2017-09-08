import * as events from 'events';
import { UICell } from './UICell.type';

let rowTracker = 0;

export const ROW_DEL_CHANGE = 'ROW_DEL_CHANGE';
export const ROW_INDEX_CHANGE = 'ROW_INDEX_CHANGE';
export const ROW_REMOVED = 'ROW_REMOVED';
export const ROW_CELLS_CHANGED = 'ROW_CELLS_CHANGED';
export const ROW_BEFORE_CELLS_CHANGED = 'ROW_BEFORE_CELLS_CHANGED';
export const ROW_CHECKED = 'ROW_CHECKED';
export const ROW_HIDE_CHANGED = 'ROW_HIDE_CHANGED';
export const ROW_DISPOSE = 'ROW_DISPOSE';

export class UIRow extends events.EventEmitter {

  set cells(value) {
    if (!value instanceof Array) {
      throw new Error('cells should be instance of Array');
    }
    const newCells = value.map(cellData => this._table.cellFactory(cellData, this));
    this.emit(ROW_BEFORE_CELLS_CHANGED, this._cells, newCells);
    this._cells = newCells;
    this.emit(ROW_CELLS_CHANGED, this._cells);
  }
  get cells() {
    return this._cells;
  }

  get del() {
    return this._del;
  }

  // set del(value) {
  //   if (this._del === value) return;
  //   this._del = value;
  //   this._toggleHide();
  //   this.emit(ROW_DEL_CHANGE, value);
  // }

  get ele() {
    return this._ele;
  }

  get hide() {
    return this._hide;
  }

  set hide(value) {
    if (this._hide === value) return;
    this._hide = value;
    this._toggleHide();
    // if(value){
    //   $(this._ele).find('.cell_calculate').hide();
    // }else{
    //   $(this._ele).find('.cell_calculate').show();
    // }
  }

  set checked(value) {
    this._checked = value;
    this.emit(ROW_CHECKED, value);
  }

  get checked() {
    return this._checked;
  }

  /**
   * row index getter
   */
  get rowIndex() {
    return this._rowIndex;
  }

  set rowIndex(value) {
    this._rowIndex = value;
    this.emit(ROW_INDEX_CHANGE, value);
    this.cells.forEach(cell => {
      cell.onRowIndexChange();
    });
    this._updateID();
  }

  get table() {
    return this._table;
  }

  get isFirst() {
    let rows = this._table.rows;
    let i = 0;
    while (i < rows.length) {
      if (!rows[i]._hide && !rows[i]._del) break;
      i++;
    }
    if (rows[i] === this) return true;
    return false;
  }

  get isLast() {
    let rows = this._table.rows;
    let i = rows.length - 1;
    while (i > 0) {
      if (!rows[i]._hide && !rows[i]._del) break;
      i--;
    }
    if (rows[i] === this) return true;
    return false;
  }

  constructor(obj = {}, table, rowEle) {
    super();
    this.id = '';
    this._ele = rowEle;
    // this._ele = document.createElement('tr');
    // this._ele.classList.add('react-row');
    this._rowIndex = '';
    this._cells = [];
    this._del = false;
    this._$track = '';
    this._checked = false;
    this._data = obj;
    this._hide = false;
    
    this._table = table;

    this.setMaxListeners(50);

    // not firing any event
    let data = Object.assign({}, obj);
    data.cells && delete data.cells;
    Object.assign(this, data);

    this._init();
  }


  /**
   * remove row from ui, if reserved flag is false, then remove data as well
   * @param {boolean} reserved 
   */
  remove(reserved = false) {
    let index = this._table.rows.indexOf(this);
    if (!reserved) {
      this._table.rows.splice(index, 1);
    }
    // this._cells.forEach(cell => {
    //   cell.dispose();
    // });
    this._del = true;
    this.hide = true;
    // raise del event;
    this.emit(ROW_REMOVED, this, index);
    // this.dispose();
  }

  addCell(cellData, colIndex = this.cells.length) {
    let payload = {
      cell: cellData,
      row: this,
      tab: this._table.tab,
    };
    let tmplt = `
      <td class="react-cell" draggable="false" data-type="${cellData.dataType}" tabindex="1">
        ${this._table._factoryCellStr(payload)}
      </td>`;
    let ele = $(tmplt)[0];
    let cell = this._table.cellFactory(cellData, this, ele);
    this._cells.splice(colIndex, 0, cell);
    this._refreshCellsIndex();
    cell.append(colIndex);
    cell.postBuild();

    return cell;
  }

  removeCell(cell) {
    cell.dispose();
    this._cells.splice(this._cells.indexOf(cell), 1);
  }

  /**
   * append this tr element to tbody at given index
   * @param {number} index 
   */
  append(index) {
    let $table = $(this._table.ele);
    let $rows = $table.children('.react-row');
    let $ele = $(this._ele);
    if (!$rows.length) {
      $table.prepend(this._ele);
    } else {
      if (index < $rows.length) {
        $ele.insertBefore($rows[index]);
      } else {
        $ele.insertAfter($rows[$rows.length - 1]);
      }
    }
  }

  dispose() {
    this.emit(ROW_DISPOSE);
    this._cells.forEach(cell => cell.dispose.bind(cell));
    this.removeAllListeners();
    this._table = null;
    this._data = null;
    this._cells = null;
    $(this._ele).remove();
    $(this._ele).find('*').off();
  }

  _refreshCellsIndex() {
    this._cells.forEach((cell, colIndex) => {
      cell.colIndex = colIndex;
    });
  }

  _init() {
    // bind inner event listener
    this.on(ROW_CELLS_CHANGED, this._cellsChanged.bind(this));
    this.on(ROW_BEFORE_CELLS_CHANGED, this._beforeCellChanged.bind(this));

    if (!this._$track) {
      this._$track = rowTracker++;
    }

    // add cells;
    if (this._data.cells) {
      this._data.cells.forEach((cellData, colIndex) => {
        let cell = this._table.cellFactory(cellData, this, this._ele.cells[colIndex]);
        this._cells.push(cell);
      });
    }
  }

  _toggleHide() {
    if (this._ele) {
      if (this._del || this._hide) {
        this._ele.style.display = 'none';
        //$(this._ele).find('.cell_calculate').hide();
      } else {
        this._ele.style.display = null;
        //$(this._ele).find('.cell_calculate').hide();
      }
    }    
    this.emit(ROW_HIDE_CHANGED, this._del || this._hide);
  }

  _cellsChanged(cells) {
    if (this._ele) {
      cells.forEach(cell => {
        this._ele.appendChild(cell._ele);
      });
    }
  }

  _beforeCellChanged(oldCells, newCelss) {
    oldCells.forEach(cell => cell.dispose.bind(cell));
  }

  /**
   * update row id
   */
  _updateID() {
    this._ele.id = ['tr', this._table.tabid, this._rowIndex].join('_');
  }

}