import * as events from 'events';
import { isIE } from '../utils';

export const CELL_COLINDEX_CHANGED = 'CELL_COLINDEX_CHANGED';
export const CELL_COLSPAN_CHANGED = 'CELL_COLSPAN_CHANGED';
export const CELL_ROWSPAN_CHANGED = 'CELL_ROWSPAN_CHANGED';
export const CELL_HIDE_CHANGED = 'CELL_HIDE_CHANGED';
export const CELL_REMOVED = 'CELL_REMOVED';
export const CELL_FONT_CHANGED = 'CELL_FONT_CHANGED';
export const CELL_BEFORE_VALUE_CHANGED = 'CELL_BEFORE_VALUE_CHANGED';
export const CELL_VALUE_CHANGED = 'CELL_VALUE_CHANGED';
export const CELL_BEFORE_VALUES_CHANGED = 'CELL_BEFORE_VALUES_CHANGED';
export const CELL_VALUES_CHANGED = 'CELL_VALUES_CHANGED';
export const CELL_NAME_CHANGED = 'CELL_NAME_CHANGED';
export const CELL_WRITABLE_CHANGED = 'CELL_WRITABLE_CHANGED';
export const CELL_DISPOSE = 'CELL_DISPOSE';
export const CELL_SELECTNAME_CHANGED = 'CELL_SELECTNAME_CHANGED';
export const CELL_BUILD_DONE = 'CELL_BUILD_DONE';

export class UICell extends events.EventEmitter {

  get cellDataIndex() {
    return this._row.cells.indexOf(this);
  }

  get rowDataIndex() {
    return this._table.rows.indexOf(this._row);
  }

  get colIndex() {
    return this._colIndex;
  }

  set colIndex(value) {
    if (this._colIndex === value) return;
    this._colIndex = value;
    this.emit(CELL_COLINDEX_CHANGED, value);
  }

  get font() {
    return this._font;
  }

  set font(value) {
    if (this._font === value) return;
    this._font = value;
    this.emit(CELL_FONT_CHANGED, value);
  }

  get rowspan() {
    return this._rowspan;
  }

  set rowspan(value) {
    if (this._rowspan === value) return;
    this._rowspan = value;
    this._updateSpan();
  }

  get colspan() {
    return this._colspan;
  }

  set colspan(value) {
    if (this._colspan === value) return;
    this._colspan = value;
    this._updateSpan();
  }

  get hide() {
    return this._hide;
  }

  set hide(value) {
    if (this._hide === value) return;
    this._hide = value;
    this._hideCell();
  }

  get value() {
    return this._value;
  }

  set value(value) {
    if (value == this._value) return;
    this.emit(CELL_BEFORE_VALUE_CHANGED, this._value, value);
    this._value = value;
    this.emit(CELL_VALUE_CHANGED, value);
  }

  get values() {
    return this._values;
  }

  set values(value) {
    if (this._values === value) return;
    this.emit(CELL_BEFORE_VALUES_CHANGED, this._values, value);
    this._values = value;
    this.emit(CELL_VALUES_CHANGED, this._values, value);
  }

  get name() {
    return this._name;
  }

  set name(value) {
    if (this._name === value) return;
    this._name = value;
    this.emit(CELL_NAME_CHANGED, this._values, value);
  }

  get selectname(){
    return this._selectname;
  }

  set selectname(value) {
    this._selectname = value;
    this.emit(CELL_SELECTNAME_CHANGED, value);
  }

  get writable() {
    return this._writable;
  }

  set writable(value) {
    if (this._writable === value) return;
    this._writable = value;
    this.emit(CELL_WRITABLE_CHANGED, this._values, value);
  }

  get ele() {
    return this._ele;
  }

  get row() {
    return this._row;
  }

  set editable(value) {
    this._editable = value;
  }

  get editable() {
    return this._editable;
  }

  get visible() {
    return !this._hide;
  }

  set invalide(value) {
    if (value === this._invalide) return;
    this._invalide = value;
    this._setInvalide();
  }

  get invalide() {
    return this._invalide;
  }

  get cellAbove() {
    if (this.rowDataIndex === 0) return null;
    return this._table.rows[this.rowDataIndex - 1].cells[this.cellDataIndex];
  }

  get cellBelow() {
    if (this.rowDataIndex === this._table.rows.length - 1) return null;
    return this._table.rows[this.rowDataIndex + 1].cells[this.cellDataIndex];
  }

  set calculateAble(value) {
    this._calculateAble = value;
  }

  get calculateAble() {
    return this._calculateAble;
  }

  set bdAble(value) {
    this._bdAble = value;
  }

  get bdAble() {
    return this._bdAble;
  }

  constructor(obj = {}, row, cellEle) {
    super();
    // this._ele = document.createElement('td');
    this._ele = cellEle;
    this._colIndex = 0;
    this._font = {};
    
    this._rowspan = 1;
    this._colspan = 1;
    this._hide = false;
    this._value = '';
    this._values = null;
    this._name = '';
    this._writable = false;
    this._selectname = '';
    
    this.align = '';
    this.color = null;
    this.dataType = '';
    this.defValue = '';
    this.dynamic = false;
    this.dynamicGroup = null;
    this.group = false;
    this.nowrap = false;
    this.property = '';
    this._row = row;
    this._table = row.table;
    this._editable = false;
    this._invalide = false;
    this._calculateAble = true;
    this._bdAble = false;
  
    // not firing any event;
    Object.assign(this, obj, { _ele: cellEle });

    // this._row.on('ROW_INDEX_CHANGE', this._onRowIndexChange.bind(this));
    // this.on(CELL_HIDE_CHANGED, this._hideCell.bind(this));

    this._init();

  }

  append(index) {
    let $row = $(this._row.ele);
    let $cells = $row[0].cells
    let $ele = $(this._ele);
    if (!$cells.length) {
      $row.prepend(this._ele);
    } else {
      if (index < $cells.length) {
        $ele.insertBefore($cells[index]);
      } else {
        $ele.insertAfter($cells[$cells.length - 1]);
      }
    }
  }

  setValue(value) {
    this._value = value;
  }

  /**
   * gabage collection
   */
  dispose() {
    let $ele = $(this._ele);
    $ele.off();
    $ele.remove();
    this.removeAllListeners();
    this._table = null;
    this._row = null;
    this._ele = null;
    this._editable = false;
    this.emit(CELL_DISPOSE, this);
  }

  updateSpan() {
    this._updateSpan();
  }
  
  /**
   * update cell id when rowIndex changed;
   * @param {number} index 
   */
  onRowIndexChange(index) {
    this._updateID();
  }

  postBuild() {
    this._postBuild();
    this.emit(CELL_BUILD_DONE);
  }

  /**
   * update cell id
   */
  _updateID() {
    this._ele.id = ['td', this._table.tabid, this._row.rowIndex, this._colIndex].join('_');
  }

  /**
   * update cell span
   */
  _updateSpan() {
    if (this._ele) {
      this._ele.rowSpan = this._rowspan || 1;
      this._ele.colSpan = this._colspan || 1;
    }
  }

  /**
   * hide cell
   */
  _hideCell() {
    if (this._ele) {
      if (this._hide) {
        this._ele.style.display = 'none';
      } else {
        this._ele.style.display = null;
      }
    }
  }
  
  /**
   * set align
   */
  _setAlign() {
    if (this._ele) {
      this._ele.style.textAlign = this.align;
    }
  }

  _setPosition() {
    if (this._ele) {
      this._ele.style.position = 'relative';
    }
  }

  _setInvalide() {
    if (this._ele) {
      if (this._invalide) {
        this._ele.classList.add('invalide');
      } else {
        this._ele.classList.remove('invalide');
      }
    }
  }

  /**
   * init cell property
   */
  _init() {
    if (!isIE()) {
      this._ele.classList.add('unselectable');
    }
    this._updateID();
    this._updateSpan();
    this._setAlign();
    this._hideCell();
    this._setPosition();
  }

  _postBuild() {
    if (this._table.eleFactories[this.dataType]) {
      let func = this._table.eleFactories[this.dataType].compile;

      let input = {
        row: this._row,
        cell: this,
        tab: this._table._tab,
        colIndex: this._colIndex,
        rowIndex: this._row.rowIndex,
        $dataTable: this._table,
        scope: this._table.__scope,
        tabIndex: this._table.tabIndex,
      };
      let content = func(input);
    }
    
    this._ele.__celldata = this;
  }
  
}
