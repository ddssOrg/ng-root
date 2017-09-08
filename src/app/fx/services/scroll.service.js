export class ScrollService {

  get loadIndex() {
    return this._loadIndex;
  }
  
  constructor(dataMap, cjbgdmArr) {
    this._dataMap = dataMap;
    this._cjbgdmArr = cjbgdmArr;
    this.loading = false;
    this._eles = {};
    this._loadIndex = 0;
    this.bgdm = '';
    this.container = $('body')[0];
    this.doc = document.documentElement;
  }

  startLoading() {
    if (this.loading) return false;
    if (!this._isScrollBottom()) return false;
    if (this._hasLoaded()) return false;
    this.loading = true;
    return true;
  }

  stopLoading() {
    this.loading = false;
  }

  _isScrollBottom() {
    let docHeight = 0;
    let keys = this._dataMap.keys();
    keys.forEach((key, index) => {
      var _tab = this._eles[key] || document.getElementById(key);
      if (!_tab) { return };
      docHeight += _tab.getBoundingClientRect().height;
      this._eles[key] = _tab;
    });
    return (this.container.scrollTop + window.innerHeight + 20 >= docHeight
      && this.container.scrollTop > 20) || (this.doc.scrollTop + window.innerHeight + 20 >= docHeight
        && this.doc.scrollTop > 20);
  }

  _hasLoaded() {
    this._loadIndex = this._dataMap.keys().length;
    this.bgdm = this._cjbgdmArr[this._loadIndex];
    let _tableEle = this._eles['main_table_' + this.bgdm] || document.getElementById('main_table_' + this.bgdm);
    let _flag = false;
    this._eles['main_table_' + this.bgdm] = _tableEle;
    if (!_tableEle
      || !_tableEle.tBodies
      || !_tableEle.tBodies.children
      || !_tableEle.tBodies.children.length
    ) {
      return false;
    }
    return true;
  }
}