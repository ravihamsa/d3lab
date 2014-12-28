(function(window){


    var barHeight = 50;

    var LBPTree = function(config){
        this.container = config.container;
    }


    LBPTree.prototype = {
        initialize:function(){
            //var config = this.engine.getConfigs();
            //this.computeConfigs();
            this.nodeIndex = 100;
        },

        computeConfigs: function () {
            var config = this.engine.getConfigs();
            var timeLine = config.timeLine;
            this.timeLineHeight = timeLine.timeLineHeight;
            this.xScale = timeLine.xScale;
            this.offset = timeLine.offset;
            this.rootNode = {children: workStreamData.map(function(item){
                return item.metadata.root;
            }), x0: 20, y0: 30, name:'root', groupType:'root'};
        },

        render: function(){
            var config = this.config;
            var svg = config.container.append('svg');
            this.rootSVG = svg;
            this.renderTree();
        },
        renderTree: function(){
            var _this = this;
            var rootEl = this.rootSVG;
            var timeLine = this.timeLine;
            var startDate = timeLine.config.startDate;
            var xScale = timeLine.xScale;

            var tree = d3.layout.tree()
                .nodeSize([0, 0])
                .value(function(d){
                    return d.duration;
                })


            var visit = function(node){
                var children =  node.children;
                if(children){
                    var len = children.length;
                    for(var i=0; i<len; i++){
                        visit(children[i]);
                    }
                    node.offset = d3.min(children, function(d){
                        return d.offset || 0;
                    })
                    node.duration = d3.max(children, function(d){
                        return (d.duration || 0) + (d.offset || 0);
                    })
                }
            }

            visit(this.rootNode);

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

            rootEl.attr('width', this.rootWidth).attr('height', heightOffset);

            var nodeElements =  this.rootSVG.selectAll('.node')
                .data(nodes, function(d){
                    return d.id = d.id || _this.nodeIndex++;
                })


            nodeElements.exit().remove();

            var nodesEnter = nodeElements.enter()
                .append('g')
                .attr('class', function(d){
                    return 'node '+ d.groupType;
                });

            nodesEnter.append('rect')
                .attr('height', 20)
                .attr('y', 20)
                .attr('fill', function(d){
                    if(d.groupType === 'task'){
                        return '#000'
                    }else{
                        return 'orange';
                    }
                })

            nodesEnter.append('text')
                .text(function(d){return d.name})
                .attr('text-anchor', 'start')
                .attr('dx', 0)
                .attr('dy', 15)


            rootEl.selectAll('.node')
                .transition()
                .duration(40)
                .attr('transform', function(d){
                    return 'translate('+ d.x+','+ d.y+')';
                })

            rootEl.selectAll('.node')
                .select('rect')
                .attr('width', function(d){
                    return d.width;
                })
        }
    }

    window.LBPTree = LBPTree;


})(window)