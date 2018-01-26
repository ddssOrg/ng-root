/**
 * angular http 请求sword公共service
 */
angular.module('ngSwordHttp', [])
  .service('swordHttp', ['$http', function ($http) {
    return {
      get: function (ctrl, params, succ, error) {
        var urlParams = '';
        for (var k in params) {
          urlParams += '&' + k + '=' + params[k];
        }
        try {
          urlParams += getAuditParams(); //审计日志参数
        } catch (e) {
        }
        $http.get("/ajax.sword?ctrl=" + ctrl + urlParams)
          .then(({ data, status, headers, config }) => {
            if (succ) {
              succ(data);
            }
          }).catch(({ data, status, headers, config }) => {
            if (error) {
              error(data);
            }
          });
      },
      post: function (ctrl, params, succ, error) {
        var postData = { tid: '', ctrl: ctrl };
        if (params) {
          var datas = new Array();
          for (var k in params) {
            if (params[k] !== 'ctrl' && params[k] !== 'tid') {
              var value = params[k];
              if (params[k] && params[k] instanceof Array) {
                value = params[k].join(',');
              }
              var pData = { name: k, value: value, sword: 'attr' };
              datas.push(pData);
            }
          }
          postData.data = datas;
        }
			
        //审计日志参数
        var decodeUrl = '';
        var audit_gndm = '';
        var audit_gnmc = ''
        var audit_gnpcuuid = '';
        try {
          decodeUrl = decodeURI(window.location.href);
          audit_gndm = $.getUrlParam(decodeUrl, 'audit_gndm');
          audit_gnmc = $.getUrlParam(decodeUrl, 'audit_gnmc');
          audit_gnpcuuid = $.getUrlParam(decodeUrl, 'audit_gnpcuuid');
        } catch (e) {
        }
        var data = {
          'postData': angular.toJson(postData),
          'audit_gndm': audit_gndm,
          'audit_gnmc': audit_gnmc,
          'audit_gnpcuuid': audit_gnpcuuid
        },
          transFn = function (data) {
            return $.param(data);
          },
          postCfg = {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
            transformRequest: transFn
          };
        $http.post("/ajax.sword?ctrl=" + ctrl + "&_t=" + (new Date().getTime()), data, postCfg)
          .then(({ data, status, headers, config }) => {
            if (data == null) {
              window.hideMask();
              window.top.BootstrapDialog.show({
                size: BootstrapDialog.SIZE_WIDE,
                type: BootstrapDialog.TYPE_DANGER,
                title: '系统提示',
                message: function (dialog) {
                  var div = $('<div></div>');
                  var message = $('<div></div>');
                  message.html('后台返回结果为空');
                  div.append(message);
                  return div;
                },
                draggable: true,
                buttons: [{
                  icon: 'icon-ok',
                  cssClass: 'btn-sm btn-primary',
                  autospin: false,
                  label: '确定',
                  action: function (dialog) {
                    dialog.close();
                  }
                }]
              }).getModalDialog().css('padding-top', '80px');
            } else if (data && data.exception) {
              window.hideMask();
              window.top.BootstrapDialog.show({
                size: BootstrapDialog.SIZE_WIDE,
                type: BootstrapDialog.TYPE_DANGER,
                title: '系统提示',
                message: function (dialog) {
                  var div = $('<div></div>');
                  var message = $('<div></div>');
                  message.html(data.exceptionName + ':<b>' + data.exceptionMes + '</b>');
                  var showDetailBtn = $('<a href="javascript:;"> 显示详细信息</a>');
                  var hideDetailBtn = $('<a href="javascript:;"> 隐藏详细信息</a>');
                  hideDetailBtn.css('display', 'none');
                  div.append(message);
                  message.append(showDetailBtn);
                  message.append(hideDetailBtn);
                  var detail = $('<div></div>');
                  detail.css({
                    'display': 'none',
                    'padding-top': '10px',
                    'overflow-y': 'scroll',
                    'height': '300px'
                  });
                  detail.html(data.debugMes);
                  div.append(detail);
                  $(showDetailBtn).click(function () {
                    detail.show();
                    hideDetailBtn.show();
                    showDetailBtn.hide();
                  });
                  $(hideDetailBtn).click(function () {
                    detail.hide();
                    hideDetailBtn.hide();
                    showDetailBtn.show();
                  });
                  return div;
                },
                draggable: true,
                buttons: [{
                  icon: 'icon-ok',
                  cssClass: 'btn-sm btn-primary',
                  autospin: false,
                  label: '确定',
                  action: function (dialog) {
                    dialog.close();
                  }
                }]
              }).getModalDialog().css('padding-top', '80px');
            } else {
              if (succ) {
                succ(data);
              }
            }
		    	
          }).catch(({ data, status, headers, config }) => {            
            if (error) {
              error(data);
            }
          });
      }
    }
  }]);