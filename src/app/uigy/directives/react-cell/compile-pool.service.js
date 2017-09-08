angular.module('xmcjgy')
  .service('CellCompilePoolService', ['$timeout', function ($timeout) {

    var _compilePool = [];
    var _compileStarted = false;

    var createTask = function (proc) {
      _compilePool.push(proc);
    };

    var startCompile = function (maxLength) {
      return new Promise((resolve) => {
        if (!_compileStarted) {
          _compileStarted = true;
          $timeout(function () {
            _runCompile(maxLength).then(() => {
              resolve();
            });
          })
        }
      });
      
    }

    var removeTask = function (proc) {
      var index = _compilePool.indexOf(proc);
      if (index !== -1) {
        _compilePool.splice(index, 1);
      }
    }
    
    var _runCompile = function (maxLength) {
      return new Promise((resolve) => {
        if (!_compilePool.length) {
          _compileStarted = false;
          resolve();
          return;
        }
        var $promises = _compilePool.length > maxLength ? _compilePool.splice(0, maxLength)
          : _compilePool.splice(0, _compilePool.length);
                  
        return Promise.all($promises.map(function (p) { return p(); })).then(function () {
          $timeout(function () {
            _runCompile(maxLength).then(() => {
              resolve();
            });
          }, 1);
        });
      });
      
    };

    return {
      startCompile: startCompile,
      createTask: createTask,
      removeTask: removeTask,
    };
  }]);