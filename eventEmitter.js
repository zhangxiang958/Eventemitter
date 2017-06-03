var Event = (function(){

    var global = this,
        Event,
        _default = 'default';

    Event = (function(){

        var namespaceCache = {}, 
            _emit, 
            _on,
            _each,
            _slice = Array.prototype.slice;
    
        each = function(cache, fn){

            var ret;
            
            for(var i = 0, length = cache.length; i < length; i++) {

                var callback = cache[i];
                ret = fn.call(cache, callback, i);
            }
        }

        _emit = function(event, cache, args){

            var _self = this;
            
            return each(cache, function(data, i){
                return data.apply(_self, args);
            });
        }

        _on = function(event, cache, callback){
            
            if(!event) {
                return false; 
            }

            if(!cache[event]) {
                cache[event] = [];
            }

            cache[event].push(callback);
        }

        _remove = function(event, cache, callback){

            if(!event || cache[event]) {
                return false;
            }

            if(!callback) {
                cache[event] = [];
            }

            return each(cache[event], function(data, i){

                if(data === callback) {

                    this.splice(i, 1);
                    return true;
                }
            });
        }

        _use = function(namespace){

            var namespace = namespace || _default;

            var cache = {}, offlineStack = [], ret;

            ret = {
                on: function(event, callback){

                    _on(event, cache, callback);
                    
                    if(!offlineStack.length) {

                        return;
                    } else {

                        each(offlineStack, function(data, i){
                            data();
                        });
                    }

                    offlineStack = null;
                },
                emit: function(event){

                    if(!event) {
                        return;
                    }

                    var args = _slice.call(arguments, 1);

                    if(cache[event]) {

                        return _emit(event, cache[event], args);
                    } else {

                        if(offlineStack) {
                            offlineStack.push(function(){
                                return _emit(event, cache[event], args);
                            });
                        }
                    }

                },
                remove: function(event, callback){

                    return _remove(event, cache[event], callback);
                },
                one: function(event, callback){
                    _remove(event, cache[event], callback);

                    this.on(event, callback);
                }
            }

            return namespace ? 
                    (namespaceCache[namespace] ? 
                        namespaceCache[namespace] : namespaceCache[namespace] = ret ) 
                    : ret;
        }

        return {
            use: _use,
            on: function(event, callback){

                var instance = this.use();
                instance.on(event, callback);
            },
            emit: function(event){

                var instance = this.use();
                instance.emit.apply(this, arguments);
            },
            remove: function(event, callback){
                
                var instance = this.use();
                instance.remove(event, callback);
            },
            one: function(event, callback){

                var instance = this.use();
                instance.one(event, callback);
            }
        }

    })();

    return Event;

})();

//test code
// Event.
Event.on('click', function(data){
    console.log('test form console');
    console.log(data);
});

Event.emit('click', 1);

Event.use('namespace1').on('click', function(data){

    console.log(data);
});

Event.use('namespace1').emit('click', 'testname1');

Event.use('namespace2').on('click', function(data){

    console.log(data);
});

Event.use('namespace2').emit('click', 'testname2');

Event.emit('test', 3);

Event.on('test', function(data){
    console.log(data);
});