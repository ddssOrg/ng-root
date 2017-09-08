import { UISelection } from './selection';
import { isIE } from '../../utils';

export class UISelectCell {

  constructor(table) {
    this._table = table;
    this._delegateEle = null;
    this.init();
  }

  init() {
    this._initSelectCell();
  }

  dispose() {
    $(this._table._ele).off('.ui-selectcell');
    this._table = null;
  }

  _initSelectCell() {
    $(this._table._ele).on('mousemove.ui-selectcell', (e) => {
      if (!this._table.selection.length) return;
      e.preventDefault();
    });
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
