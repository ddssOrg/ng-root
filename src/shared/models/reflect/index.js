/**
 * Table factory meta
 * @param {*}  
 */
export function TableFactory({eleFactories, cellFactory, rowFactory}) {
  return function decorator(target) {
    target.prototype.eleFactories = target.prototype.eleFactories || {};
    if (eleFactories) {
      eleFactories.forEach((eleFactory) => {
        target.prototype.eleFactories[eleFactory.dataType] = new eleFactory;
      });
    }
    if (cellFactory) {
      target.prototype.cellFactory = cellFactory;
    }
    if (rowFactory) {
      target.prototype.rowFactory = rowFactory;
    }
  }
}

/**
 * Element Factory meta
 * @param {*}  
 */
export function ElementFactory({dataType}) {
  return function decorator(target) {
      target.dataType = dataType;
   }
}
