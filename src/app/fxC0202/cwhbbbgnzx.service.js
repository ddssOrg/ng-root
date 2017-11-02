angular
  .module('fxC0202')
  .service('cwhbbbgnzxService', ['swordHttp', (swordHttp) => {
    return {
      initUI: function (params, succ, err) {
        //ctrl在jsp页面变量中取
        swordHttp.post(ctrl + '_initUI', params, succ, err);
      },
      loadData: function (params, succ, err) {
        //查询最新的已比对数据
        swordHttp.post(ctrl + '_loadData', params, succ, err);
      },
      querySjxx: function (params, succ, err) {
        //查询最新的已比对数据
        swordHttp.post(ctrl + '_querysjxx', params, succ, err);
      },
      save: function (params, succ, err) {
        swordHttp.post(ctrl + '_save', params, succ, err);
      },
      deleteData: function (params, succ, err) {
        swordHttp.post(ctrl + '_deleteData', params, succ, err);
      }
    }
  }]);
