import * as events from 'events';
import { UISelection } from './selection';

export const CONTEXT_NEW_UP = 'CONTEXT_NEW_UP';
export const CONTEXT_NEW_DOWN = 'CONTEXT_NEW_DOWN';
export const CONTEXT_DELETE = 'CONTEXT_DELETE';
export const CONTEXT_COPY = 'CONTEXT_COPY';
export const CONTEXT_PASTE = 'CONTEXT_PASTE';
export const CONTEXT_RECALC = 'CONTEXT_RECALC';
export const CONTEXT_REGROUP = 'CONTEXT_REGROUP';

export class UIContextMenu extends events.EventEmitter {
  constructor(table) {
    super();
    this._table = table;
    
    this._init();
  }

  dispose() {
    $.contextMenu('destroy', this._ctxmenuDelegator);
    this.removeAllListeners();
    this._table = null;
  }

  get _ctxmenuDelegator() {
    return `#${this._table.tabid} td.react-cell`;
  }

  /**
   * accpet cell's context-menu response
   * @param {string} command 
   */
  _triggerContext(command) {
    switch (command) {
      case CONTEXT_RECALC:
        this.emit(CONTEXT_RECALC, UISelection.sortSelections(this._table.selection));  
        break;  
      case CONTEXT_COPY:
        this._table._clipboardControl.copySelection();
        break;
      case CONTEXT_DELETE:
        this._table._selectionControl.removeSelection();
        break;
      case CONTEXT_NEW_DOWN:
        this.emit(CONTEXT_NEW_DOWN, UISelection.sortSelections(this._table.selection));
        break;
      case CONTEXT_NEW_UP:
        this.emit(CONTEXT_NEW_UP, UISelection.sortSelections(this._table.selection));
        break;
      case CONTEXT_PASTE:
        this._table._clipboardControl.pasteSelection();
        break;
      case CONTEXT_REGROUP:
        this._table.regroupRows();
        this._table.regroupCells();
        this._table._selectionControl.clear();
        break;
    }
  }

  _init() {
    let _that = this;
    let options = {
      selector: this._ctxmenuDelegator,
      callback: function(key, opt) {
        _that._triggerContext(key)
      },
      items: {
        [CONTEXT_RECALC]: {
          name: '重新计算',
          disabled: function (key, opt) {
            let cell = this[0].__celldata;
            let table = cell._table;
            return table.selection.find(_cell => {
              return !isCalculate(
                table.columns,
                _cell,
                table.rows,
                _cell.rowDataIndex,
                _cell.cellDataIndex,
                table.tab,
                table.scope.uimodule.tabs
              );
            });
          }
        },
        "sep0": "---------",
        [CONTEXT_REGROUP]: {
          name: '整理表格',
          visible: function () {
            let cell = this[0].__celldata;
            let row = cell.row;
            return row.cells.find(cell => cell.group);
          }
        },
        [CONTEXT_NEW_UP]: {
          name: "插入上方行",
          disabled: function (key, opt) {
            let cell = this[0].__celldata;
            return !(cell._table._tab
              && cell._table._tab.footerbar
              && cell._table._tab.footerbar.buttons
              && cell._table._tab.footerbar.buttons.find(button => button.action === 'add'));
          },
        },
        [CONTEXT_NEW_DOWN]: {
          name: "插入下方行",
          disabled: function (key, opt) {
            let cell = this[0].__celldata;
            return !(cell._table._tab
              && cell._table._tab.footerbar
              && cell._table._tab.footerbar.buttons
              && cell._table._tab.footerbar.buttons.find(button => button.action === 'add'));
          }
        },
        "sep1": "---------",
        [CONTEXT_COPY]: {
          name: "复制",
          visible: () => document.queryCommandSupported('copy'),
          disabled: function () {
            let cell = this[0].__celldata;
            return !cell.editable;
          },
        },
        [CONTEXT_PASTE]: {
          name: "黏贴",
          visible: () => document.queryCommandSupported('copy'),
          disabled: function () {
            let cell = this[0].__celldata;
            return !cell.editable;
          },
        },
        "sep2": "---------",
        [CONTEXT_DELETE]: {
          name: "删除行",
          disabled: function (key, opt) {
            let cell = this[0].__celldata;
            return !(cell._table._tab
              && cell._table._tab.footerbar
              && cell._table._tab.footerbar.buttons
              && cell._table._tab.footerbar.buttons.find(button => button.action === 'delete'));
          }
        },
      }
    };
    $.contextMenu(options);
  }
}
