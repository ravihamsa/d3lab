(function () {


    var monthArray = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];


    var LBPController = function (config) {
        this.rootEl = config.rootEl;
        this.fullTimelineDays = config.fullTimelineDays || 1000;
        this.dayWidth = config.dayWidth || 50;
        this.rootWidth = parseInt(this.rootEl.style('width'));
        this.rootHeight = config.rootHeight || 400;

        this.visibleTimelineDays = Math.ceil(this.rootWidth / this.dayWidth);
        this.tableMargin = {
            top: 40,
            left: 60,
            right: 0,
            bottom: 50
        }
        this.rootInnerWidth = this.rootWidth - this.tableMargin.left - this.tableMargin.right;
        this.rootInnerHeight = this.rootHeight - this.tableMargin.top - this.tableMargin.bottom;


        this.startYear = config.startYear || 2013;
        this.startMonth = config.startMonth || 0;
        this.startDay = config.startDay || 1;
        this.scale = config.scale || 'day';

        this.rootEl.select('.lbp-inner')
            .style('left', this.tableMargin.left + 'px')
            .style('top', this.tableMargin.top + 'px')
            .style('width', this.rootInnerWidth + 'px')
        //.style('height', this.rootInnerHeight +'px')
    }

    LBPController.prototype = {
        initialize: function () {


        },

        renderLBP: function () {
            this.renderTimeLine(this.rootEl.select('.time-line'))
            this.renderGrid(this.rootEl.select('.grid-container'))
        },
        setWorkStreamData: function (workStreamData) {
            this.workStreamData = workStreamData;
        },
        getWorkStreamData: function () {
            return this.workStreamData;
        },
        refreshTimeLineData: function () {
            var windowData = this.generateTimeLineData()


            var yearData = _.map(_.groupBy(windowData, function (item) {
                return item.year
            }), function (groupedItem, index) {
                return {
                    year: index,
                    count: groupedItem.length
                }
            });

            var monthData = _.map(_.groupBy(windowData, function (item) {
                return item.year + '_' + item.month;
            }), function (groupedItem, index) {
                return {
                    month: groupedItem[0].month,
                    year: groupedItem[0].year,
                    count: groupedItem.length
                }
            });

            this.dayData = windowData;
            this.yearData = yearData;
            this.monthData = monthData;
        },
        _timeLineEnter: function () {
            var years = this.timeline.years;
            var months = this.timeline.months;
            var days = this.timeline.days;


            years.enter()
                .append('div')
                .attr('class', 'year')


            months.enter()
                .append('div')
                .attr('class', 'month')


            days.enter()
                .append('div')
                .style('width', (this.dayWidth) + 'px')


        },
        _timeLineExit: function () {
            var years = this.timeline.years;
            var months = this.timeline.months;
            var days = this.timeline.days;

            years.exit().remove();
            months.exit().remove();
            days.exit().remove();
        },
        _timeLineUpdate: function () {
            var years = this.timeline.years;
            var months = this.timeline.months;
            var days = this.timeline.days;
            var _this = this;
            years.style('width', function (d) {
                return (d.count * _this.dayWidth) + 'px';
            })
                .text(function (d) {
                    return d.year;
                })


            months.style('width', function (d) {
                return (d.count * _this.dayWidth) + 'px';
            })
                .text(function (d) {
                    return monthArray[d.month];
                })

            days.text(function (d) {return d.date})
                .attr('class', function (d) { return 'day d' + d.day })
        },
        updateTimeLine: function () {
            this.refreshTimeLineData();
            var years, months, days;

            years = this.timeline.yearLine.selectAll('div.year')
                .data(this.yearData)


            months = this.timeline.monthLine.selectAll('div.month')
                .data(this.monthData)

            days = this.timeline.dayLine.selectAll('div.day')
                .data(this.dayData)

            this.timeline.years = years;
            this.timeline.months = months;
            this.timeline.days = days;


            this._timeLineEnter();
            this._timeLineExit();
            this._timeLineUpdate();
        },
        renderTimeLine: function (root) {

            var _this = this;

            var yearLine = root.append('div')
                .attr('class', 'year-line');

            var monthLine = root.append('div')
                .attr('class', 'month-line');

            var dayLine = root.append('div')
                .attr('class', 'day-line');


            this.refreshTimeLineData();


            this.timeline = {
                yearLine: yearLine,
                monthLine: monthLine,
                dayLine: dayLine
            };
            this.updateTimeLine();


            var dragmove = function (d) {
                d.x = d3.event.x;
                tick();
            }

            var drag = d3.behavior.drag()
                .origin(Object)
                .on("drag", dragmove);

            var scrollThumb = this.rootEl.select('.scroll-thumb')
                .datum({x: 0, y: 0})
                .call(drag);

            var thumbWidth = ((this.rootInnerWidth / this.fullTimelineDays) * this.visibleTimelineDays);
            var activeRootWidth = this.rootInnerWidth - thumbWidth;

            var tick = function () {
                scrollThumb.style('transform', function (d) {
                    var xPos = Math.max(0, Math.min(activeRootWidth, d.x));
                    var windowStart = 0;
                    var positionPercentage = 0;
                    if (xPos !== 0) {
                        positionPercentage = (xPos / activeRootWidth);
                        windowStart = Math.floor(_this.fullTimelineDays * positionPercentage);
                    }

                    _this.startDay = windowStart;
                    _this.updateTimeLine();
                    return 'translateX(' + xPos + 'px)';

                })
            }

            scrollThumb.style('width', thumbWidth + 'px');


        },
        generateTimeLineData: function () {
            var steps = 1;
            var data = [];
            for (var i = 0, counter = 0; counter < this.visibleTimelineDays; i += steps) {
                var date = new Date(this.startYear, this.startMonth, this.startDay + i);
                var day = date.getDay();
                //if (day !== 0 && day !== 6) {
                data.push({
                    id: date.getDate() + '_' + date.getMonth() + '_' + date.getFullYear(),
                    day: date.getDay(),
                    date: date.getDate(),
                    month: date.getMonth(),
                    year: date.getFullYear()
                })
                counter++;
                // }
            }
            return data;
        },
        getWorkStreamData: function (workStreamCount) {
            var data = [];
            for (var i = 0; i < workStreamCount; i++) {
                data.push({
                    name: 'workStream_' + i,
                    id: i,
                    milestones: []
                })
            }
            return data;
        },
        renderGrid: function (root) {
            var _this = this;
            var gridExtension = 30;
            var workStreamData = this.getWorkStreamData(4);
            var workStreamCount = workStreamData.length;
            var rowCount = workStreamCount * 3;
            var dayWidth = this.dayWidth;
            var rootInnerWidth = this.rootInnerWidth;

            var visibleTimeLineDays = Math.ceil(rootInnerWidth / dayWidth);
            var colCount = this.visibleTimelineDays;
            var colorFun = d3.scale.category10()
            var strokeWidth = 0.5;

            root.style('left', -gridExtension + 'px');
            root.style('height', this.rootInnerHeight + 'px');
            root.style('width', (this.rootInnerWidth + gridExtension) + 'px');

            var svg = root.append('svg')
                .attr('width', rootInnerWidth + gridExtension)
                .attr('height', rowCount * dayWidth)


            var gridRect = svg.append('rect')
                .attr('width', rootInnerWidth)
                .attr('height', rowCount * dayWidth)
                .attr('stroke', '#eee')
                .attr('fill', 'transparent')
                .attr('x', gridExtension)
                .attr('stroke-width', strokeWidth)
            //.attr('transform', 'translate(30,0)');


            var rowContainer = svg.append('g')
                .attr('class', 'rows')
                .attr('transform', 'translate(' + gridExtension + ',0)');


            var colContainer = svg.append('g')
                .attr('class', 'columns')
                .attr('transform', 'translate(' + gridExtension + ',0)');


            var rows = rowContainer.selectAll('g.row')
                .data(workStreamData)
                .enter()
                .append('g')
                .attr('class', 'row')
                .attr('transform', function (data, index) {
                    var y = index * 3 * dayWidth;
                    return 'translate(0, ' + y + ')';
                })

            rows.append('path')
                .attr('d', function (data, index) {
                    var y = 0
                    return 'M -' + gridExtension + ' ' + y + ' L ' + ((visibleTimeLineDays * dayWidth) + gridExtension) + ' ' + y;
                })
                .attr('stroke', '#ff3300')
                .attr('stroke-width', strokeWidth)

            rows.append('text')
                .text(function (d) {
                    return d.name;
                })
                .attr('dx', -10)
                .attr('dy', -10)
                .style("text-anchor", "end")
                .attr("transform", function (d) {
                    return "rotate(-90)"
                });

            //.attr('y', function(d){return d * 3 * dayWidth})
            //.attr('width', (visibleTimeLineDays*dayWidth))
            //.attr('height', (3*dayWidth))
            //.attr('fill', function(d){return colorFun(d)})

            var cols = colContainer.selectAll('path.col')
                .data(_.range(0, colCount))
                .enter()
                .append('path')
                .attr('class', 'col')
                .attr('d', function (d) {
                    var x = d * dayWidth;
                    return 'M ' + x + ' 0 L ' + x + ' ' + (rowCount * dayWidth);
                })
                .attr('stroke', '#ddd')
                .attr('stroke-width', strokeWidth)

            //.attr('x', function(d){return d*dayWidth})
            //.attr('width', (dayWidth))
            //.attr('height', (rowCount*dayWidth))
            //.attr('fill', function(d){return colorFun(d)})
            //.attr('opacity', 0.2)


            var dragMove = function (d) {
                d.x -= d3.event.dx;
                _this.startDay = Math.floor(d.x / _this.dayWidth);
                _this.updateTimeLine();
            }

            var dragStart = function(d){
                d.x = _this.startDay * _this.dayWidth;
            }

            gridRect.datum({x: 0, y: 0});

            var drag = d3.behavior.drag()
                .origin(Object)
                .on('drag', dragMove)
                .on('dragstart', dragStart)

            gridRect.call(drag);

        }
    }


    //renderTimeLine(d3.select('.time-line'));

    //renderTimeTable(d3.select('.time-table'));

    //renderGrid(d3.select('.time-table'));

    //renderMileStones(d3.select('.mile-stones'))

    var lbpController = new LBPController({
        rootEl: d3.select('.lbp-container'),
        dayWidth: 50
    })

    lbpController.renderLBP();


})()