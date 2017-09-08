import { UICell } from '../../../shared/models'

export class FXUICell extends UICell {
  set hbsEqualsFlag(value) {
    if (value === this._hbsEqualsFlag) return;
    this._hbsEqualsFlag = value;
    this._setJSInvalid();
  }

  set invalide(value) {
    if (value === this._invalide) return;
    this._invalide = value;
    this._setInvalide();
    this._setJSInvalid();
  }
  
  constructor(data, row, cellEle) {
    super(data, row, cellEle);
    this._hbsEqualsFlag = false;
  }

  _setJSInvalid() {
    if (this._ele) {
      if (!this._invalide && this._hbsEqualsFlag) {
        this._ele.classList.add('jsinvalide');
      } else {
        this._ele.classList.remove('jsinvalide');
      }
    }
  }
}
