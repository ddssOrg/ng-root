angular.module('xmcjgy').service('xmcjgyService', ['swordHttp', function (swordHttp) {
  return {
    initUI: (params, succ, err) => {
      //ctrl在jsp页面变量中取
      swordHttp.post(ctrl + '_initUI', params, succ, err);
    },
    loadData: (params, succ, err) => {
      swordHttp.post(ctrl + '_loadData', params, succ, err);
    },
    save: (params, succ, err) => {
      swordHttp.post(ctrl + '_save', params, succ, err);
    },
    saveRowData: (params, succ, err) => {
      swordHttp.post(ctrl + '_saveRowData', params, succ, err);
    },
    getFileList: (params, succ, err) => {
      swordHttp.post('XmFileGyCtrl_getXmFiles', params, succ, err);
    },
    delFiles: (params, succ, err) => {
      swordHttp.post('XmFileGyCtrl_deleteFiles', params, succ, err);
    },
    deleteRow: (params, succ, err) => {
      swordHttp.post(ctrl + '_delete', params, succ, err);
    },
    getLoadFiles: (params, succ, err) => {
      swordHttp.post('FxGyCtrl_getLoadFiles', params, succ, err);
    }, loadFile: (params, succ, err) => {
      swordHttp.post(ctrl + '_loadFile', params, succ, err);
    }, queryXmFiles: (params, succ, err) => {
      swordHttp.post('FxGyCtrl_queryXmFiles', params, succ, err);
    }, queryPeriod: (params, succ, err) => {
      swordHttp.post('FxGyCtrl_queryPeriod', params, succ, err);
    }, refreshColumn: (params, succ, err) => {
      swordHttp.post(ctrl + '_refreshColumn', params, succ, err);
    },
    queryYssj: (params, succ, err) => {
      swordHttp.post('FxGyCtrl_queryYssj', params, succ, err);
    },
    saveYssj: (params, succ, err) => {
      swordHttp.post('FxGyCtrl_saveEditYssj', params, succ, err);
    },
    loadYssj: (params, succ, err) => {
      swordHttp.post(ctrl + '_loadYssj', params, succ, err);
    },
    loadDataSource: function (datasource, params, succ, err) {
      swordHttp.post(datasource, params, succ, err);
    },
    getReportData: (params, succ, err) => {
      swordHttp.post(ctrl + '_getReportData', params, succ, err);
    },
    updateEchartsPicBase64: (params, succ, err) => {
      swordHttp.post('FxGyCtrl_updateEchartsPicBase64', params, succ, err);
    },
    queryCompanyRelationShip: (params, succ, err) => {
      swordHttp.post('WbzldcFxGyCtrl_queryCompanyRelationShip', params, succ, err);
    },
  }
}]);
