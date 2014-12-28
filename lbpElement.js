(function(window){


    var barHeight = 50;

    var duration = 400;
    var color = d3.scale.category10();

    var LBPTree = function(config){
        this.container = config.container;
    }


    LBPTree.prototype = {
        initialize:function(){
            //var config = this.engine.getConfigs();
            this.computeConfigs();
            //this.rootWidth = parseInt(this.container.style('width'));
            this.nodeIndex = 100;
            this.levelForced = true;
        },

        computeConfigs: function () {
            var config = this.engine.getConfigs();
            this.rootNode = {children: config.workStreamData.map(function(item){
                return item.metadata.root;
            }), x0: 0, y0: 0, name:'root', groupType:'root'};
        },

        render: function(){
            var config = this.engine.getConfigs();
            var svg = this.container;
            svg.attr('width', config.rootWidth)
            this.container = svg;
            this.renderTree(this.rootNode);
        },
        renderTree: function(source){
            var _this = this;
            var engine = _this.engine;
            var rootEl = this.container;
            var forcedLevel = engine.getConfig('level');
            if(!source){
                source = this.rootNode;
            }

            var startDate = engine.getConfig('startDate');
            var xScale = engine.getProperty('timeLine', 'xScale')

            var tree = d3.layout.tree()
                .nodeSize([0, 0])
                .value(function(d){
                    return d.duration;
                })


            var visit = function(node, level){
                if(_this.levelForced){
                    if(level > forcedLevel){
                        if(node.children){
                            node._children = node.children;
                            node.children = null;
                        }
                    }else{
                        if(node._children){
                            node.children = node._children;
                            node._children = null;
                        }
                    }
                }
                var children =  node.children || node._children;
                if(children){
                    var len = children.length;
                    for(var i=0; i<len; i++){
                        visit(children[i], level+1);
                    }
                    node.offset = d3.min(children, function(d){
                        return d.offset || 0;
                    })
                    node.duration = d3.max(children, function(d){
                        return (d.duration || 0) + (d.offset || 0);
                    })
                }
            }

            visit(this.rootNode, -1);


            var click = function (d) {
                _this.levelForced = false;

                if (d3.event.defaultPrevented) return;
                if (d.children) {
                    d._children = d.children;
                    d.children = null;
                } else {
                    d.children = d._children;
                    d._children = null;
                }
                _this.renderTree(d);
            }

            var nodes = tree(this.rootNode);
            var heightOffset = -barHeight;

            nodes.forEach(function(n, i){
                if(n.groupType === 'root' || n.groupType === 'el-code-2'){
                    n.y = -1000;
                    if(n.groupType === 'el-code-2'){
                        heightOffset+=barHeight;
                    }

                }else{
                    n.y = heightOffset;
                    heightOffset+=barHeight;
                }
                n.x = xScale(d3.time.day.offset(startDate, n.offset));
                n.width = xScale(d3.time.day.offset(startDate, n.offset + n.duration)) - n.x;

            });

            //rootEl.attr('height', heightOffset);
            engine.setConfig('gridHeight', Math.max(engine.getConfig('gridHeight'), heightOffset));

            var nodeElements =  this.container.selectAll('.node')
                .data(nodes, function(d){
                    return d.id = d.id || _this.nodeIndex++;
                })





            var nodesEnter = nodeElements.enter()
                .append('g')
                .attr('class', function(d){
                    return 'node '+ d.groupType;
                })
                .style('opacity',0)
                .attr("transform", function (d) {
                    return 'translate('+ d.x +','+source.y0+')'
                });

            nodesEnter.append('rect')
                .attr('height', 30)
                .attr('y', 20)
                .attr('fill', function(d){
                    if(d.groupType === 'task'){
                        return '#000'
                    }else{
                        return color(d.groupType);
                    }
                })
                .on("click", click)

            nodesEnter.append('text')
                .text(function(d){return d.name})
                .attr('text-anchor', 'start')
                .attr('dx', 0)
                .attr('dy', 15)


            rootEl.selectAll('.node')
                .transition()
                .duration(duration)
                .attr('transform', function(d){
                    return 'translate('+ d.x+','+ d.y+')';
                })
                .style('opacity',1)

            rootEl.selectAll('.node')
                .select('rect')
                .attr('width', function(d){
                    return d.width;
                })


            nodeElements.exit()
                .transition()
                .duration(duration)
                .attr("transform", function (d) {
                    return 'translate('+ d.x +','+source.y0+')'
                })
                .style('opacity',0)
                .remove();



            nodes.forEach(function (d) {
                d.x0 = d.x;
                d.y0 = d.y;
            });

        },
        onOffsetChange: function(){
            this.renderTree();
        },
        onScaleChange: function(){
            this.renderTree();
        },
        onLevelChange: function(change){
            this.levelForced = true;
            this.renderTree();
        }
    }

    window.LBPTree = LBPTree;


})(window)