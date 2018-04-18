
var QIM_HELPER = QIM_HELPER || {}

QIM_HELPER.session = null;
QIM_HELPER.proxy   = { }

QIM_HELPER.core = function($) {

    var PROXY_LEN = 2;

    var _connect = function(callback) {
        var proxy_num = PROXY_LEN;

        var get_service = function(name) {
            QIM_HELPER.session.service(name).then(
                function(proxy) {
                    QIM_HELPER.proxy[name] = proxy;
                    proxy_num--;
                    if (proxy_num <= 0) callback();
                },
                function(error) {
                    console.error( error );
                    result_func();
                }
            );
        }

        QiSession(function( session ) {
            QIM_HELPER.session = session;

            get_service('ALMemory');
            get_service('ALAudioPlayer');
        })
    }

    var _self = {
        init: function() {
            _connect( function() {
                console.log("Connected qim.");
                pepper_onStart();
            });
        }
    }
    return _self;
}(jQuery);

function EventSubscription(event) {
    this._event       = event;
    this._internalId  = null;
    this._sub         = null;
    this._unsubscribe = false;
}
EventSubscription.prototype.setId = function(id) {
    this._internalId = id;
}
EventSubscription.prototype.setSubscriber = function(sub) {
    this._sub = sub;
}
EventSubscription.prototype.unsubscribe = function() {
    if (this._internalId != null && this._sub != null) {
        this._sub.signal.disconnect(this._internalId);
    } else {
        this._unsubscribe = true;
    }
}

$.raiseALMemoryEvent = function(name, val) {
    QIM_HELPER.proxy.ALMemory.raiseEvent(name, val);
}

$.subscribeToALMemoryEvent = function(name, func, then_func) {
    var evt = new EventSubscription(name);
    QIM_HELPER.proxy.ALMemory.subscriber(name).then(function(sub) {
        evt.setSubscriber(sub);
        sub.signal.connect(func).then(function(id) {
            evt.setId(id);
            if (then_func) then_func(id);
        });
    });
    return evt;
}

$.getService = function(serviceName, thenCallback) {
    return QIM_HELPER.session.service(serviceName).then(thenCallback);
}

var BASE_PATH = "/home/nao/.local/share/PackageManager/apps/";

var AudioPlayer = {
    play: function(file_name) {
        var _path = AudioPlayer.html_path + file_name;
        QIM_HELPER.proxy.ALAudioPlayer.playFileFromPosition(_path, 0, 0.8, 0);
    },
    stop: function() {
        QIM_HELPER.proxy.ALAudioPlayer.stopAll();
    }
}
var _uri = location.href.split("/");
AudioPlayer.html_path = BASE_PATH + _uri[_uri.length - 2] + "/sounds/";

$( QIM_HELPER.core.init );
