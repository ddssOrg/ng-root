import 'babel-polyfill';

import 'jquery';
import 'jquery-ui';
import 'jquery-contextmenu';
import 'blueimp-file-upload/js/jquery.iframe-transport.js';
import 'blueimp-file-upload/js/jquery.fileupload.js';
import 'blueimp-file-upload/js/jquery.fileupload-process.js';
import 'blueimp-file-upload/js/jquery.fileupload-image.js';

import 'blueimp-file-upload/js/jquery.fileupload-audio.js';
import 'blueimp-file-upload/js/jquery.fileupload-video.js';
import 'blueimp-file-upload/js/jquery.fileupload-validate.js';
import 'blueimp-file-upload/js/jquery.iframe-transport.js';


import 'angular';
import 'angular-route';
import 'ng-dialog';

import 'bootstrap';
import 'echarts';
import 'bootstrap3-dialog';

((jQuery) => {
  jQuery.fn.size = function () {
    return this.length;
  };
})(jQuery);


((jQuery) => {
  jQuery.debounce = (func, wait, immediate) => {
    var timeout;
    return function () {
      var context = this, args = arguments;
      var later = function () {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  };
})(jQuery);
