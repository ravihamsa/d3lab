(function (window) {
    var year = d3.time.format('%Y');
    var day = d3.time.format('%e');
    var month = d3.time.format('%m')
    var monthName = d3.time.format('%b')
    var boxHeight = 30;

    var rootHeightArray = [90, 60, 60, 30]


    var quarterNameIndex = {
        Jan: 'Q1',
        Apr: 'Q2',
        Jul: 'Q3',
        Oct: 'Q4'
    }

    var getTranslateXY = function (x, y) {
        return 'translate(' + x + ',' + y + ')';
    }



    var yearRollUpFun = function (leaves) {
        return {
            length: leaves.length,
            label: year(leaves[0]),
            date: leaves[0],
            endDate: d3.time.day.offset(leaves[leaves.length - 1], 1)
        }
    }

    var monthRollUpFun = function (leaves) {
        return {
            length: leaves.length,
            label: monthName(leaves[0]),
            date: leaves[0],
            endDate: d3.time.day.offset(leaves[leaves.length - 1], 1)
        }
    }

    var quarterRollUpFun = function (leaves) {
        return {
            length: leaves.length,
            label: quarterNameIndex[monthName(leaves[0])],
            date: leaves[0],
            endDate: d3.time.day.offset(leaves[leaves.length - 1], 3)
        }
    }

    var dayRollUpFun = function (leaves) {
        return {
            length: leaves.length,
            label: day(leaves[0]),
            date: leaves[0],
            endDate: d3.time.day.offset(leaves[leaves.length - 1], 1)
        }
    }

    var offsetDay = function (date, offset) {
        return d3.time.day.offset(date, offset);
    }

    var TimeLineWidget = function (config) {
        this.config = config;
        this.rootWidth = parseInt(config.container.style('width'));
        this.rootHeight = config.rootHeight || 300;
        this.offset = 0;
        this.initialize();
    }

    TimeLineWidget.prototype = {
        initialize: function () {
            this.computeConfigs();
            this.populateData();
        },
        computeConfigs: function () {
            var config = this.config;
            this.timeLineHeight = rootHeightArray[config.scale]
            this.gridHeight = this.rootHeight - this.timeLineHeight;
            this.xScale = d3.time.scale()
            this.xScale.range([0, this.rootWidth]);
        },
        renderTimeLine: function () {
            var scale = this.config.scale;
            var yOffset = 0;

            this.rootSVG.attr('width', this.rootWidth).attr('height', this.rootHeight);

            this.renderTimeElements('year', function (d) {
                return year(d)
            }, yearRollUpFun, yOffset, 'red')
            yOffset += boxHeight;

            if (scale === 1 || scale === 0) {
                this.renderTimeElements('month', function (d) {
                    return year(d) + '_' + month(d)
                }, monthRollUpFun, yOffset, 'blue')
                yOffset += boxHeight;
            } else {
                this.rootEl.selectAll('.month').remove();
            }

            if (scale === 2) {
                this.renderTimeElements('quarter', function (d) {
                    return year(d) + '_' + Math.ceil(month(d) / 3);
                }, quarterRollUpFun, yOffset, 'orange')
                yOffset += boxHeight;
            } else {
                this.rootEl.selectAll('.quarter').remove();
            }

            if (scale === 0) {
                this.renderTimeElements('day', function (d) {
                    return year(d) + '_' + month(d) + '_' + day(d)
                }, dayRollUpFun, yOffset, 'green')
                yOffset += boxHeight;
            } else {
                this.rootEl.selectAll('.day').remove();
            }

        },
        renderTimeElements: function (className, keyFun, rollUpFun, yPos, color) {
            var _this = this;
            var config = this.config;
            var rootEl = this.rootEl;
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
                .attr('fill', 'white')
                .attr('text-anchor', 'middle')

            elementsEnter.append('line')

            rootEl.selectAll(selector)
                .attr('transform', function (d) {
                    return getTranslateXY(_this.xScale(d.values.date), yPos)
                })
                .select('rect')
                .attr('width', function (d) {
                    return (_this.xScale(d.values.endDate) - _this.xScale(d.values.date));
                })

            rootEl.selectAll(selector)
                .select('text')
                .attr('dx', function (d) {
                    return (_this.xScale(d.values.endDate) - _this.xScale(d.values.date)) / 2;
                })

            rootEl.selectAll(selector)
                .select('line')
                .attr('y1', 0)
                .attr('y2', _this.rootHeight)

        },
        populateData: function () {
            var config = this.config;
            this.data = this.getDateData();
        },
        getDateData: function () {
            var config = this.config;
            var startDate = config.startDate;
            var fromYear = +year(startDate);
            var fromMonth = +month(startDate) - 1;
            var fromDay = +day(startDate);
            var offset = this.offset;

            var from, to;

            switch (config.scale) {
                case 0:
                    from = offsetDay(new Date(fromYear, fromMonth, fromDay), offset);
                    to = offsetDay(new Date(fromYear, fromMonth, fromDay + 50), offset);
                    this.xScale.domain([from, to]);
                    break;
                case 1:
                    from = offsetDay(new Date(fromYear, fromMonth, fromDay), offset);
                    to = offsetDay(new Date(fromYear, fromMonth + 30, fromDay), offset);
                    this.xScale.domain([from, to]);
                    break;
                case 2:
                    from = offsetDay(new Date(fromYear, fromMonth, fromDay), offset);
                    to = offsetDay(new Date(fromYear, fromMonth + 90, fromDay), offset);
                    this.xScale.domain([from, to]);
                    break;
                case 3:
                    from = offsetDay(new Date(fromYear, fromMonth, fromDay), offset);
                    to = offsetDay(new Date(fromYear + 20, fromMonth, fromDay), offset);
                    this.xScale.domain([from, to]);
                    break;
            }

            return this.xScale.ticks(d3.time.day);

        },

        render: function () {
            var config = this.config;
            var w = this.rootWidth;
            var h = this.rootHeight;
            var svg = config.container.append('svg');
            this.rootSVG = svg;
            this.rootEl = this.rootSVG;
            this.renderTimeLine();

        },
        setOffset: function (offset) {
            this.offset = offset;
            this.populateData();
            this.renderTimeLine();
        },
        setConfigs: function (map) {
            for (var i in map) {
                this.config[i] = map[i];
            }
            this.computeConfigs();
            this.populateData();
            this.renderTimeLine();
        }
    }

    window.TimeLineWidget = TimeLineWidget;

})(window)