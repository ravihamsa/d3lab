(function (window) {


    var moduleIndex = {};

    var scaleArray = ['day', 'month', 'quarter', 'year']


    var callModuleHandlers = function (eventName, eventObj) {
        var handlerName = 'on' + eventName.replace(/[a-z]/, function (g) {
                return g.toUpperCase()
            })
        for (var i in moduleIndex) {
            var module = moduleIndex[i];
            if (module) {
                if (module[handlerName]) {
                    module[handlerName].call(module, eventObj);
                }
            }
        }
    }

    var configs = {scale:0, level:0, view:'gantt', startDate: new Date(2010, 11, 1), offset:0};

    var engine = {
        add: function (moduleName, moduleInstance) {
            moduleInstance.engine = this;
            moduleIndex[moduleName] = moduleInstance;
            moduleInstance.initialize();
        },
        triggerMethod: function (eventName, eventObj) {
            var curEventName = eventName;
            do {
                callModuleHandlers(curEventName.replace(/\.([a-z])/g, function (g) {
                    return g.toUpperCase()
                }).replace(/\./g, ''), eventObj)
                curEventName = curEventName.substr(0, curEventName.lastIndexOf('.'));
            } while (/\./.test(curEventName))
            callModuleHandlers(curEventName, eventObj);
        },
        setConfigs:function(configObject){
            for(var i in configObject){
                configs[i]=configObject[i];
            }
            this.triggerMethod('configs.change', configs);
            //configs = configObject;
        },
        moduleIndex:moduleIndex,
        start: function(){
            moduleIndex['timeLine'].render();
            //moduleIndex['lbp'].render();
        },
        getConfig: function(n){
            return configs[n];
        },
        setConfig: function(n, value){
            configs[n]=value;
            this.triggerMethod(n+'.change', n, value);
            this.triggerMethod('configs.change', configs);
        },
        getConfigs: function(){
            return configs;
        }
    };


    window.visEngine = engine;


})(window)
