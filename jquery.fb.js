;(function($){

$.fb = function(options) {
  var o = $.extend({}, $.fb.defaults, options);

  var fb = {

    authenticating: false,

    // Initialize.
    init: function() {
      fb.debug('init');

      // Auto size canvas.
      if ( o.canvas.setSize ) {
        FB.Canvas.setSize();
      }

      // Determine Facebook account status.
      FB.getLoginStatus(function(r){
        switch ( r.status ) {

          // User is logged into Facebook and has authenticated your application.
          case 'connected':
            fb.debug('init.connected', r);
            fb.connected();

            break;

          // User is logged into Facebook and has not authenticated your application.
          case 'not_authorized':
            fb.debug('init.not_authorized', r);

            // Take over element to act as popup trigger.
            if ( o.authElement && $(o.authElement).length ) {
              $(o.authElement).bind(o.authElementEvent + '.fb', function(){
                fb.authenticating = true;
                fb.authenticate();
                return false;
              });
            }

            break;

          // User is not logged into Facebook.
          default:
            fb.debug('init.disconnected', r);

            // Take over element to act as popup trigger.
            if ( o.authElement && $(o.authElement).length ) {
              $(o.authElement).bind(o.authElementEvent + '.fb', function(){
                fb.authenticating = true;
                fb.authenticate();
                return false;
              });
            }

            fb.disconnected();

            break;
        }
      });

    },

    // Authenticate.
    authenticate: function() {
      FB.login(function(r){
        if ( r.authResponse ) {
          fb.debug('authenticate.success', r);

          // User is authenticating, redirect to page.
          if ( fb.authenticating && o.authElement && $(o.authElement).length ) {
            if ( $(o.authElement).data('fbRedirect') == 'true' ) {
              window.location.href = $(o.authElement).attr('href');
            }
          }

          fb.connected();
        }
        else {
          fb.debug('authenticate.failed', r);
        }
      }, { scope: o.scope });
    },

    // Connect.
    connected: function() {
      fb.debug('connected');
      o.connect.call(fb);
      fb.user();
    },

    disconnected: function() {
      fb.debug('disconnected');
      o.disconnect.call(fb);
    },

    // User.
    user: function() {
      FB.api('/me', function(r){
        fb.debug('user', r);
        o.user.call(fb, r);
      });
    },

    // Debug.
    debug: function(type, d) {
      if ( o.debug && window.console.log ) {
        window.console.log('[fb] ' + type);
        d ? window.console.log(d) : null;
      }
    }

  };

  // Initialize Facebook SDK when dom is ready.
  $(document).ready(function(){

    // Append required fb-root div to the dom.
    $('body').append('<div id="fb-root"></div>');

    // Initialize Facebook SDK.
    window.fbAsyncInit = function() {
      FB.init({
        appId: o.appId, //change the appId to your appId
        status: o.status,
        cookie: o.cookie,
        xfbml: o.xfbml,
        oauth: o.auth
      });

      // Initialize wrapper plugin.
      fb.init();
    };

  });

  return fb;
};

$.fb.defaults = {
  debug: false,

  // Facebook.
  appId: '', //change the appId to your appId
  status: true,
  cookie: true,
  xfbml: true,
  oauth: true,
  scope: 'email',

  // Canvas.
  canvas: {
    setSize: true,
  },

  // Authorize element.
  authElement: '#fb-authorize',
  authElementEvent: 'click',

  // Events.
  connect: function() { },
  disconnect: function() { },
  user: function() { }
};

})(jQuery);

// Load the SDK Asynchronously
(function(d){
  var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
  if (d.getElementById(id)) {return;}
  js = d.createElement('script'); js.id = id; js.async = true;
  js.src = "//connect.facebook.net/en_US/all.js";
  ref.parentNode.insertBefore(js, ref);
}(document));
