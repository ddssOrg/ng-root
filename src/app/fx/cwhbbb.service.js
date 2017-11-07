angular
  .module('fx')
  .service('cwhbbbService', ['swordHttp', (swordHttp) => {
    return {
      initUI: function (params, succ, err) {
        //ctrl在jsp页面变量中取
        swordHttp.post(ctrl + '_initUI', params, succ, err);
      },
      loadData: function (params, succ, err) {
        swordHttp.post(ctrl + '_loadData2', params, succ, err);
      },
      save: function (params, succ, err) {
        swordHttp.post(ctrl + '_save', params, succ, err);
      },
      saveRowData: function (params, succ, err) {
        swordHttp.post(ctrl + '_saveRowData', params, succ, err);
      },
      getFileList: function (params, succ, err) {
        swordHttp.post('XmFileGyCtrl_getXmFiles', params, succ, err);
      },
      delFiles: function (params, succ, err) {
        swordHttp.post('XmFileGyCtrl_deleteFiles', params, succ, err);
      },
      deleteRow: function (params, succ, err) {
        swordHttp.post(ctrl + '_delete', params, succ, err);
      },
      getLoadFiles: function (params, succ, err) {
        swordHttp.post('FxGyCtrl_getLoadFiles', params, succ, err);
      },
      loadFile: function (params, succ, err) {
        swordHttp.post(ctrl + '_loadFile', params, succ, err);
      },
      queryXmFiles: function (params, succ, err) {
        swordHttp.post('FxGyCtrl_queryXmFiles', params, succ, err);
      },
      queryPeriod: function (params, succ, err) {
        swordHttp.post('FxGyCtrl_queryPeriod', params, succ, err);
      },
      refreshColumn: function (params, succ, err) {
        swordHttp.post(ctrl + '_refreshColumn', params, succ, err);
      },
      queryEditFileOnlineIndex: function (params, succ, err) {
        swordHttp.post('FxGyCtrl_queryEditFileOnlineIndex', params, succ, err);
      },
      queryHasUploadOnline: function (params, succ, err) {
        swordHttp.post('FxGyCtrl_queryHasUploadOnline', params, succ, err);
      }
    }
  }]);
