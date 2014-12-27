var year = d3.time.format('%Y');
var day = d3.time.format('%e');
var month = d3.time.format('%m')
var monthName = d3.time.format('%b')
var duration = 400;
var boxHeight = 30;


var dayUnitRatio = [1, 50, 60, 80]
var dayWidthArray = [30, 50/30, 60/90, 80/365]
var rootHeightArray = [90,60,60,30]
var quarterNameIndex = {
    Jan:'Q1',
    Apr:'Q2',
    Jul:'Q3',
    Oct:'Q4'
}

var getTranslateXY = function (x, y) {
    return 'translate(' + x + ',' + y + ')';
}


var TimeLineWidget = function (config) {
    this.config = config;
    this.rootWidth = parseInt(config.container.style('width'));
    this.rootHeight = 300;
    this.offset = 0;
    this.initialize();
}


var yearRollUpFun = function (leaves) {
    return {
        length: leaves.length,
        label: year(leaves[0]),
        date:leaves[0],
        endDate:d3.time.day.offset(leaves[leaves.length -1], 1)
    }
}

var monthRollUpFun = function (leaves) {
    return {
        length: leaves.length,
        label: monthName(leaves[0]),
        date:leaves[0],
        endDate:d3.time.day.offset(leaves[leaves.length -1], 1)
    }
}

var quarterRollUpFun = function (leaves) {
    return {
        length: leaves.length,
        label: quarterNameIndex[monthName(leaves[0])],
        date:leaves[0],
        endDate:d3.time.day.offset(leaves[leaves.length -1], 3)
    }
}

var dayRollUpFun = function (leaves) {
    return {
        length: leaves.length,
        label: day(leaves[0]),
        date:leaves[0],
        endDate:d3.time.day.offset(leaves[leaves.length -1], 1)
    }
}


var offsetDay = function(date, offset){
    return d3.time.day.offset(date, offset);
}




TimeLineWidget.prototype = {
    computeConfigs: function(){
        var config = this.config;
        this.dayWidth = dayWidthArray[config.scale];
        this.unitWidth = this.dayWidth * dayUnitRatio[config.scale]
        this.visibleTimeLineDays = Math.ceil(this.rootWidth / this.unitWidth);
        this.rootHeight =rootHeightArray[config.scale];
        this.xScale = d3.time.scale()
        this.xScale.range([0,this.rootWidth]);
    },
    initialize: function () {
        this.computeConfigs();
        this.populateData();
    },
    renderTimeLine: function () {
        var scale = this.config.scale;
        var yOffset = 0;

        this.rootSVG.attr('width', this.rootWidth).attr('height', this.rootHeight);

        this.renderTimeElements('year', function (d) {
            return year(d)
        }, yearRollUpFun, yOffset, 'red')
        yOffset+=boxHeight;

        if(scale ===1 || scale === 0){
            this.renderTimeElements('month', function (d) {
                return year(d) + '_' + month(d)
            }, monthRollUpFun,  yOffset, 'blue')
            yOffset+=boxHeight;
        }else{
            this.rootEl.selectAll('.month').remove();
        }


        if(scale === 2) {
            this.renderTimeElements('quarter', function (d) {
                return year(d) + '_' + Math.ceil(month(d) / 3);
            }, quarterRollUpFun, yOffset, 'orange')
            yOffset += boxHeight;
        }else{
            this.rootEl.selectAll('.quarter').remove();
        }

        if(scale === 0){
            this.renderTimeElements('day', function (d) {
                return year(d) + '_' + month(d) + '_' + day(d)
            }, dayRollUpFun,  yOffset, 'green')
            yOffset+=boxHeight;
        }else{
            this.rootEl.selectAll('.day').remove();
        }

    },
    renderTimeElements: function (className, keyFun, rollUpFun, yPos, color) {
        var _this = this;
        var config = this.config;
        var rootEl = this.rootEl;
        var dayWidth = dayWidthArray[config.scale];
        var selector = '.' + className;
        var timeLineData = d3.nest().key(keyFun).rollup(rollUpFun).entries(this.data);
        //console.log(this.data[0], this.data[this.data.length-1], timeLineData);


        var elements = rootEl.selectAll(selector)
            .data(timeLineData, function (d) {
                return d.id = d.key;
            });

        elements.exit().remove();

        var elementsEnter = elements.enter()
            .append('g')
            .attr('class', className)

        elementsEnter.append('rect')
            //.attr('fill', color)
            .attr('height', boxHeight)

        elementsEnter.append('text')
            .text(function (d) {
                return d.values.label;
            })
            .attr('dy', 20)
            .attr('dx', function (d) {
                return (d.values.length * dayWidth)/2;
            })
            .attr('fill', 'white')
            .attr('text-anchor', 'middle')


        var offset = 0;
        rootEl.selectAll(selector)
            .attr('transform', function (d) {
                d.offset = offset;
                offset += d.values.length;
                return getTranslateXY(_this.xScale(d.values.date), yPos)
            })
            .select('rect')
            .attr('width', function (d) {
                return (_this.xScale(d.values.endDate) - _this.xScale(d.values.date));
            })

        rootEl.selectAll(selector)
            .select('text')
            .attr('dx', function (d) {
                return (_this.xScale(d.values.endDate) - _this.xScale(d.values.date))/2;
            })

    },
    populateData: function () {
        var config = this.config;
        this.data = this.getDateData();
    },
    getDateData: function(){
        var config = this.config;
        var startDate = config.startDate;
        var fromYear = +year(startDate);
        var fromMonth = +month(startDate) - 1;
        var fromDay = +day(startDate);
        var visibleTimeLineDays = this.visibleTimeLineDays;
        var offset = this.offset;
        var offsetAndVisibleUnits = offset + visibleTimeLineDays;

        var data, from, to;

        switch (config.scale) {
            case 0:
                from = offsetDay(new Date(fromYear, fromMonth, fromDay), offset);
                to = offsetDay(new Date(fromYear, fromMonth, fromDay+50), offset);
                this.xScale.domain([from, to]);
                break;
            case 1:
                from = offsetDay(new Date(fromYear, fromMonth, fromDay), offset);
                to = offsetDay(new Date(fromYear, fromMonth+20, fromDay), offset);
                this.xScale.domain([from, to]);
                break;
            case 2:
                from = offsetDay(new Date(fromYear, fromMonth, fromDay), offset);
                to = offsetDay(new Date(fromYear, fromMonth+60, fromDay), offset);
                this.xScale.domain([from, to]);
                break;
            case 3:
                from = offsetDay(new Date(fromYear, fromMonth, fromDay), offset);
                to = offsetDay(new Date(fromYear+20, fromMonth, fromDay), offset);
                this.xScale.domain([from, to]);
                break;
        }


        return this.xScale.ticks(d3.time.day);

    },
    getDateData1: function () {
        var config = this.config;
        var startDate = config.startDate;
        var fromYear = +year(startDate);
        var fromMonth = +month(startDate) - 1;
        var fromDay = +day(startDate);
        var visibleTimeLineDays = this.visibleTimeLineDays;
        var offset = this.offset;
        var offsetAndVisibleUnits = offset + visibleTimeLineDays;

        var from, to, data;

        switch (config.scale) {
            case 0:
                from = new Date(fromYear, fromMonth, fromDay + offset)
                to = new Date(fromYear, fromMonth, fromDay + offsetAndVisibleUnits)
                data = d3.time.day.range(from, to);
                break;
            case 1:
                from = new Date(fromYear, fromMonth + offset, fromDay)
                to = new Date(fromYear, fromMonth + offsetAndVisibleUnits, fromDay)
                data = d3.time.day.range(from, to);

            case 2:
                offsetAndVisibleUnits *= 3;
                from = new Date(fromYear, fromMonth + (offset * 3), fromDay);
                to = new Date(fromYear, fromMonth + offsetAndVisibleUnits, fromDay)
                data = d3.time.day.range(from, to);
                break;
            case 3:
                from = new Date(fromYear + offset, fromMonth, fromDay);
                to = new Date(fromYear + offsetAndVisibleUnits, fromMonth, fromDay)
                data = d3.time.day.range(from, to);
                break;
        }
        console.log(from, to, offset);
        return data;
    },

    render: function () {
        var config = this.config;
        var w = this.rootWidth;
        var h = this.rootHeight;
        var svg = config.container.append('svg');
        this.rootSVG = svg;
        var xAxisEl = svg.append('g').attr('transform', 'translate(0,0)');
        this.rootEl = xAxisEl;
        this.renderTimeLine();

        /*

         var pos = 0;
         var index = 0;
         var yearEnter = xAxisEl.selectAll('.year')
         .data(d3.nest().key(function (d) {
         return year(d);
         }).entries(days), function (d) {
         d.x = pos;
         d.count = d.values.length;
         pos += d.count;
         return d.id = d.id || 'year' + index++;
         })
         .enter()
         .append('g')
         .attr('class', 'year')
         .attr('transform', function (d) {
         var x = d.x * config.dayWidth;
         var y = 0;
         return 'translate(' + x + ',' + y + ')';
         })

         yearEnter.append('rect')
         .attr('width', function (d) {
         return d.count * config.dayWidth;
         })
         .attr('height', 20)

         var monthPos = 0;
         var monthsEnter = xAxisEl.selectAll('.year')
         .selectAll('.month')
         .data(function (d) {
         monthPos=0;
         return d3.nest().key(function (d) {
         return monthName(d);
         }).entries(d.values)
         }, function (d) {
         d.x = monthPos;
         d.count = d.values.length;
         monthPos += d.count;
         console.log(monthPos, d.key, d.x);
         return d.id = d.id || 'month' + index++;
         })
         .enter()
         .append('g')
         .attr('class', 'month')
         .attr('transform', function (d) {
         var x = d.x * config.dayWidth;
         var y = 20;
         return 'translate(' + x + ',' + y + ')';
         })


         monthsEnter.append('rect')
         .attr('width', function (d) {
         return d.count * config.dayWidth;
         })
         .attr('height', 20)
         .attr('fill', 'red')

         monthsEnter.append('text')
         .text(function (d) {
         return d.key;
         })
         .attr('dx', 3)
         .attr('dy', 15)
         .style("text-anchor", "start")


         var dayPos = 0;
         var daysEnter = xAxisEl.selectAll('.month')
         .selectAll('.day')
         .data(function (d) {
         return d.values
         }, function (d) {
         d.x = dayPos;
         d.count = 1;
         dayPos += d.count;
         return d.id = d.id || 'day' + index++;
         })
         .enter()
         .append('g')
         .attr('class', 'day')
         .attr('id', function(d){return d.id})
         .attr('transform', function (d, i) {
         var x = i * config.dayWidth;
         var y = 20;
         return 'translate(' + x + ',' + y + ')';
         })


         daysEnter.append('rect')
         .attr('width', function (d) {
         return d.count * config.dayWidth;
         })
         .attr('height', 20)
         .attr('fill', 'green')

         daysEnter.append('text')
         .text(function (d) {
         return day(d);
         })
         .attr('dx', 3)
         .attr('dy', 15)
         .style("text-anchor", "start")

         */

    },
    setOffset: function (offset) {
        this.offset = offset;
        this.populateData();
        this.renderTimeLine();
    },
    setConfigs: function(map){
        for(var i in map){
            this.config[i] = map[i];
        }
        this.computeConfigs();
        this.populateData();
        this.renderTimeLine();
    }
}