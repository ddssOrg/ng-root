import * as events from 'events';
import { UICell } from './UICell.type';
import { UIRow, ROW_REMOVED, ROW_DEL_CHANGE } from './UIRow.type';
import { TableFactory } from './reflect';
import {
  UISelection,
  UIClipboard,
  UIEdit,
  EDIT_CELL_BLUR,
  EDIT_CELL_FOCUS,
  CONTEXT_NEW_DOWN,
  CONTEXT_NEW_UP,
} from './services';

import {
  UICheckBoxFactory,
  UIDateTimeFactory,
  UIDisableFactory,
  UIFileSelectFactory,
  UIHrefFactory,
  UILabelFactory,
  UINumberFactory,
  UISelectFactory,
  UITabFactory,
  UITextareaFactory,
  UITextFactory,
  UIUploadFactory
} from './factories';

export const ADD_ROW_EVENT = 'ADD_ROW_EVENT';
export const BEFORE_ROWS_CHANGED = 'BEFORE_ROWS_CHANGED';
export const AFTER_ROWS_CHANGED = 'AFTER_ROWS_CHANGED';
export const AFTER_SLECTION_CHANGED = 'AFTER_SLECTION_CHANGED';

/**
 * @abstract
 * abstract class
 */
@TableFactory({
  eleFactories: [
    UICheckBoxFactory,
    UIDateTimeFactory,
    UIDisableFactory,
    UIFileSelectFactory,
    UIHrefFactory,
    UILabelFactory,
    UINumberFactory,
    UISelectFactory,
    UITabFactory,
    UITextareaFactory,
    UITextFactory,
    UIUploadFactory
  ],
  cellFactory: (data, row, cellEle) => (new UICell(data, row, cellEle)),
  rowFactory: (data, table, rowEle) => (new UIRow(data, table, rowEle)),
})
export class UITable extends events.EventEmitter {

  set rows(value) {
    if (!value instanceof Array) {
      throw new Error('input must be instance of Array');
    }
    let newRows = value.map((rowData) => { return this._newRow(rowData) });
    let changes = this._findRowChange(this._rows, newRows);

    // raise rows before change event
    this.emit(BEFORE_ROWS_CHANGED, changes);
    // remove rows that left
    changes.rowsToRemove.forEach((r) => r.remove.bind(r));

    // add new rows
    this._createNewRows(newRows);
    // raise rows change event
    this.emit(AFTER_ROWS_CHANGED, this._rows);
  }

  get rows() {
    return this._rows;
  }

  get ele() {
    return this._ele;
  }

  get tabid() {
    return this._tabid;
  }

  get tab() {
    return this._tab;
  }

  get uimodule() {
    return this._uimodule;
  }

  get scope() {
    return this.__scope;
  }

  get tabIndex() {
    return this._uimodule.tabs.indexOf(this._tab);
  }

  get selection() {
    return this._selectionControl.selection;
  }

  get selectionControl(){
    return this._selectionControl;
  }

  /**
   * constructor of UITable
   * @param {*} tab 
   * @param {*} uimodule 
   */
  constructor(scope, tab, uimodule) {
    super();
    this.__scope = scope; // angular scope
    this._tab = tab;
    this._uimodule = uimodule;
    this._tabid = tab.id;
    this._rows = [];
    this._selectionControl = null;
    this._clipboardControl = null;
    this._editControl = null;
    this._contextMenuControl = null;

    // $(window).on('onload', function () {
    //   this.rows = [];
    //   $(window).off();
    // });
  }

  /**
   * triggered after table is inited
   * @protected
   */
  afterInit() {

  }

  /**
   * init the table data
   * @param {*} tbody data 
   * @param {*} tab data
   */
  init(data, tab) {
    if (!data.rows instanceof Array) {
      throw new Error('table rows should be instance of array.')
    }

    var startTime = Date.now();
    let rows = data.rows.map((row) => {
      return this._factoryRowStr(tab, row);
    }).join('');

    var startTime = Date.now();
    let tableEle = $(`<tbody tabindex="1" class="react-table">${rows}</tbody>`)[0];
    this._ele = tableEle;
    this._$ele = $(this._ele);

    this._selectionControl = new UISelection(this);
    this._clipboardControl = new UIClipboard(this);
    this._editControl = new UIEdit(this);
    

    this._editControl.on(EDIT_CELL_BLUR, (cell) => {
    });

    this._editControl.on(EDIT_CELL_FOCUS, (cell) => {
      this._selectionControl.select(cell);
    });

    data.rows.forEach((rowData, index) => {
      let row = this.rowFactory(rowData, this, tableEle.rows[index]);
      this._rows.push(row);
      this._initRow(row);
    });

    this.afterInit();
  }

  /**
   * 添加行
   * @param {*} rowData 
   * @param {*} position 
   */
  addRow(rowData, position = this._rows.length) {
    let row = this._newRow(rowData);
    this._addRow(row, position);
    // raise row add event;
    this.emit(ADD_ROW_EVENT, row);
    return row;
  }

  /**
   * append rendered tbody to a table
   * @param {HTMLTableElement} ele 
   */
  append(ele) {
    this._$ele.insertAfter($(ele).find('thead'));
  }

  /**
   * regroup cells 
   */
  regroupCells() {
    this._regroupCells();
  }

  regroupRows() {
    this._regroupRows();
  }

  /**
   * dispose the table and related events
   */
  dispose() {
    this._selectionControl.dispose();
    this._selectionControl = null;
    this._clipboardControl.dispose();
    this._clipboardControl = null;
    this._editControl.dispose();
    this._editControl = null;
    if(this._contextMenuControl){
      this._contextMenuControl.dispose();
      this._contextMenuControl = null;
    }    
    this.removeAllListeners();
    this.rows.forEach(row => row.dispose.bind(row));
    this._$ele.find('*').off();
    this._$ele.remove();
  }

  _initRow(row) {
    row.on(ROW_DEL_CHANGE, this._regroupCells.bind(this));
    row.on(ROW_REMOVED, this._regroupCells.bind(this));
  }

  /**
   * create new row and append to table
   * @param {*} row 
   * @param {*} index 
   */
  _addRow(row, index) {
    this._rows.splice(index, 0, row);
    row.on(ROW_REMOVED, (r, index) => {
      for (let i = index; i < this._rows.length; i++) {
        this._rows[i].rowIndex = i;
      };
    });
    this._initRow(row);

    // postbuild cells
    row.cells.forEach(cell => {
      cell.postBuild();
    });
    row.append(index);
  }

  /**
   * group cells if they are group cell and they have the same value
   */
  _regroupCells() {
    let rows = this._rows;
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      if ((rows[rowIndex].del || rows[rowIndex].hide)) continue;
      let row = rows[rowIndex];
      for (let colIndex = 0; colIndex < row.cells.length; colIndex++) {
        let cell = row.cells[colIndex];
        if (!cell.group || cell.value === '') continue;
        //console.log(cell, cell.cellDataIndex, cell.rowDataIndex);
        cell.hide = false;
        cell.rowspan = 1;
        while (
          ++rowIndex < rows.length
          && cell.value === rows[rowIndex].cells[cell.cellDataIndex].value
        ) {
          if ((rows[rowIndex].del || rows[rowIndex].hide)) continue;
          rows[rowIndex].cells[cell.cellDataIndex].hide = true;
          cell.rowspan++;
        }
        if (rowIndex < rows.length) rowIndex--;
      }
    }
  }

  /**
   * group row by its group cell's value
   */
  _regroupRows() {
    let rows = this._rows;
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      if ((rows[rowIndex].del || rows[rowIndex].hide)) continue;
      let row = rows[rowIndex];
      for (let colIndex = 0; colIndex < row.cells.length; colIndex++) {
        let cell = row.cells[colIndex];
        if (!cell.group || (cell.cellBelow && cell.cellBelow.value == cell.value)) continue;
        for (let nextRowIndex = rowIndex + 1; nextRowIndex < rows.length; nextRowIndex++) {
          let nextRow = rows[nextRowIndex];
          let nextCell = nextRow.cells[colIndex];
          if (nextCell.value === cell.value) {
            this._moveRow(nextRow, rowIndex + 1);
          }
        }
      }
    }
  }

  /**
   * move a row to given position
   * @param {UIRow} row 
   * @param {number} index 
   */
  _moveRow(row, index) {
    this._rows.splice(this._rows.indexOf(row), 1);
    this._rows.splice(index, 0, row);
    row.append(index);
    this._refreshRowIndex();
  }

  _refreshRowIndex() {
    this._rows.forEach((row, rowIndex) => {
      row.rowIndex = rowIndex;
    });
  }

  _newRow(rowData, ele = this._factoryRowEle(rowData)) {
    return this.rowFactory(rowData, this, ele);
  }

  _createNewRows(newRows) {
    for (let i = 0; i < newRows.length; i++) {
      let newRow = newRows[i];
      let flag = !this._rows.find(oldRow => {
        if (newRow.id) {
          return oldRow.id === newRow.id
        } else {
          return newRow._$track === oldRow._$track;
        }
      });
      if (flag) {
        this._addRow(newRow, i);
      }
    }
  }

  /**
   * find rows leaving and coming before changes applied
   * @param {UIRow[]} oldRows 
   * @param {UIROW[]} newRows 
   */
  _findRowChange(oldRows, newRows) {
    let rowsToRemove = [];
    let rowsToCreate = [];
    if (!newRows || !newRows.length) {
      rowsToRemove = oldRows;
      rowsToCreate = [];
    } else {
      rowsToRemove = oldRows.filter((oldRow, i) => !newRows.find(newRow => {
        if (newRow.id) {
          return newRow.id === oldRow.id;
        } else {
          return newRow._$track === oldRow._$track;
        }
      }));
      rowsToCreate = newRows.filter((newRow, i) => !oldRows.find(oldRow => {
        if (newRow.id) {
          return oldRow.id === newRow.id
        } else {
          return newRow._$track === oldRow._$track;
        }
      }));
    }

    return {
      rowsToRemove,
      rowsToCreate,
    };
  }

  /**
   * factory row element
   * @param {{Object}} rowData 
   */
  _factoryRowEle(rowData) {
    return $(this._factoryRowStr(this.tab, rowData))[0];
  }

  /**
   * factory cell's html string
   * @param {{cell, row, tab}} payload 
   */
  _factoryCellStr(payload) {
    let factory = this.eleFactories[payload.cell.dataType];
    if (!factory) return '';
    try {
      return factory.createTemplate(payload);
    } catch (e) {
      console.log(e.message);
      return '';
    }
  }

  /**
   * factory row html by given tab and row data
   * @param {Object} tab data
   * @param {Object} row data
   */
  _factoryRowStr(tab, row) {
    let cells = row.cells.map(cell => {
      let payload = {
        cell,
        row,
        tab,
      };
      return `
          <td class="react-cell" draggable="false" data-type="${cell.dataType}" tabindex="1">${this._factoryCellStr(payload)}</td>
        `;
    });
    return `<tr class="react-row">${cells.join('')}</tr>`;
  };
}
