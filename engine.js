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

    var getModuleProperty = function (moduleName, propertyName){
        var handlerName = 'get' + propertyName.replace(/[a-z]/, function (g) {
                return g.toUpperCase()
            })
        var module = moduleIndex[moduleName];
        if(module[handlerName]){
            return module[handlerName].call(module);
        }else{
            return 'property getter undefined';
        }
    }

    var configs = {scale:0, level:0, view:'gantt', startDate: new Date(2010, 11, 1), offset:0, gridHeight:0};

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
        getProperty: function(moduleName, propertyName){
            return getModuleProperty(moduleName, propertyName.replace(/\.([a-z])/g, function (g) {
                return g.toUpperCase()
            }).replace(/\./g, ''))
        },
        setConfigs:function(configObject){
            for(var i in configObject){
                if(configs[i] !== configObject[i]){
                    configs[i]=configObject[i];
                    this.triggerMethod(i+'.change', {key:i, value:configObject[i]});
                }

            }
            this.triggerMethod('configs.change', configs);
            //configs = configObject;
        },
        moduleIndex:moduleIndex,
        start: function(){

            var container = this.getConfig('container')//.append('svg');
            var rootWidth = parseInt(container.style('width'));
            var rootHeight = parseInt(container.style('height'));
            this.setConfig('rootWidth', rootWidth);
            this.setConfig('rootHeight', rootHeight);
            var svgContainer = container.append('svg').attr('width', this.getConfig('rootWidth')).attr('height', this.getConfig('rootHeight'));
            var timeLineContainer = svgContainer.append('svg').attr('class','time-line');
            var lbpContainer = svgContainer.append('svg').attr('class','lbp-element');


            timeLineContainer.attr('width', rootWidth-140).attr('height', configs.rootHeight).attr('x', 40);
            lbpContainer.attr('width', rootWidth-140).attr('x', 40).attr('y',90);

            var timeLineWidget = new TimeLineWidget({
                container:timeLineContainer
            })

            this.add('timeLine', timeLineWidget);

            var lbpWidget = new LBPTree({
                container: lbpContainer
            })

            this.add('lbp', lbpWidget);

            timeLineWidget.render();
            lbpWidget.render();
        },
        getConfig: function(n){
            return configs[n];
        },
        setConfig: function(n, value){
            var oldValue = configs[n];
            configs[n]=value;
            this.triggerMethod(n+'.change', {key:n, value:value, oldValue:oldValue});
            this.triggerMethod('configs.change', configs);
        },
        getConfigs: function(){
            return configs;
        },
        getModule: function(name){
            return moduleIndex[name];
        }
    };


    window.visEngine = engine;


})(window)
