(function(){


    var dayWidth = 50;
    var dayWidth = 50;

    var fullTimeLineDays = 1000;


    var monthArray = ['January', 'February', 'March', 'April', 'May', 'June', 'July','August', 'September', 'October', 'November', 'December'];

    var generateWorkStreamData = function() {

        var year, month, day, arr, wsIndex;
        arr = [];
        var startYear = 2014;
        year = Math.floor(Math.random() * 6) + startYear;
        month = Math.floor(Math.random() * 11);
        day = Math.floor(Math.random() * 30) + 1;
        wsIndex = Math.floor(Math.random() * 6);

        for (var i = 0; i < 50; i++) {

            arr.push({
                name: 'Milestone ' + i,
                date: new Date(year, month, day),
                wsIndex: wsIndex,
                type: Math.floor(Math.random() * 3)
            });
        }

        return arr;
    };


    var generateTimeLineData = function (startYear, startMonth, startDay, dayCount, steps) {
        var data = [];
        for (var i = 0; i < dayCount; i+=steps) {
            var date = new Date(startYear, startMonth, startDay + i);
            var day = date.getDay();
            //if(day !== 0  &&  day !== 6){
                data.push({
                    id: date.getDate() + '_' + date.getMonth() + '_' + date.getFullYear(),
                    day: date.getDay(),
                    date: date.getDate(),
                    month: date.getMonth(),
                    year: date.getFullYear()
                })
            //}
            //console.log(day, date.getDate() + '_' + date.getMonth() + '_' + date.getFullYear())

        }
        return data;
    }




    var renderTimeLine = function(root){

        var rootWidth = parseInt(root.style('width'));

        var visibleTimeLineDays = Math.ceil(rootWidth / dayWidth);

        var yearLine = root.append('div')
            .attr('class', 'year-line');

        var monthLine = root.append('div')
            .attr('class', 'month-line');

        var dayLine = root.append('div')
            .attr('class', 'day-line');

        var years, months, days;

        var updateData = function(start){

            var windowData = generateTimeLineData(2013, 0, start+1, visibleTimeLineDays, 1)

            var yearData = _.map(_.groupBy(windowData, function (item) {
                return item.year
            }),function (groupedItem, index) {
                return {
                    year: index,
                    count: groupedItem.length
                }
            });

            var monthData = _.map(_.groupBy(windowData, function (item) {
                return item.year +'_'+item.month;
            }),function (groupedItem, index) {
                return {
                    month: groupedItem[0].month,
                    year: groupedItem[0].year,
                    count: groupedItem.length
                }
            });

            years = yearLine.selectAll('div.year')
                .data(yearData)

            months = monthLine.selectAll('div.month')
                .data(monthData)

            days = dayLine.selectAll('div.day')
                .data(windowData)

            years.enter()
                .append('div')
                .attr('class', 'year')


            months.enter()
                .append('div')
                .attr('class', 'month')


            days.enter()
                .append('div')
                .attr('class', function (d) {
                    return 'day d' + d.day
                })
                .style('width', (dayWidth)+'px')




                years.data(yearData).style('width', function(d){
                    return (d.count * dayWidth)+'px';
                })
                .text(function (d) {
                    return d.year;
                })


                months.data(monthData).style('width', function(d){
                    return (d.count * dayWidth)+'px';
                })
                .text(function (d) {
                    return monthArray[d.month];
                })


                days.data(windowData).text(function (d) {
                    return d.date
                })



            years.exit().remove();
            months.exit().remove();
            days.exit().remove();


        }
        updateData(0);

        var dragmove = function(d){
            d.x=d3.event.x;
            tick();
        }

        var drag = d3.behavior.drag()
            .origin(Object)
            .on("drag", dragmove);

        var scrollThumb = d3.select('.scroll-thumb')
            .datum({x:0, y:0})
            .call(drag);

        var thumbWidth = ((rootWidth/fullTimeLineDays)*visibleTimeLineDays);
        var activeRootWidth = rootWidth - thumbWidth;

        var tick = function(){
            scrollThumb.style('transform', function(d){
                var xPos = Math.max(0,Math.min(activeRootWidth, d.x));
                var windowStart = 0;
                var positionPercentage = 0;
                if(xPos !== 0) {
                    positionPercentage = (xPos/activeRootWidth);
                    windowStart = Math.floor(fullTimeLineDays * positionPercentage);
                }
                updateData(windowStart);
                return 'translateX('+xPos+'px)';
            })
        }

        scrollThumb.style('width', thumbWidth+'px');
    }


    var renderGrid = function(root){
        var workStreamCount = 3;
        var rowCount = workStreamCount * 3;
        var rootWidth = parseInt(root.style('width'));
        var visibleTimeLineDays = Math.ceil(rootWidth / dayWidth);
        var colCount = visibleTimeLineDays;
        var colorFun =  d3.scale.category10()

        root.style('height', (rowCount*dayWidth)+'px')

        var rowContainer = root.append('div')
            .attr('class', 'rows')


        var colContainer = root.append('div')
            .attr('class', 'columns')


        var rows = rowContainer.selectAll('div.row')
            .data(_.range(0,rowCount))
            .enter()
            .append('div')
            .attr('class', 'row')
            .style('width', (visibleTimeLineDays*dayWidth)+'px')
            .style('height', (3*dayWidth)+'px')
            //.style('background-color', function(d){return colorFun(d)})

        var cols = colContainer.selectAll('div.col')
            .data(_.range(0,colCount))
            .enter()
            .append('div')
            .attr('class', 'col')
            .style('width', (dayWidth)+'px')
            .style('height', (rowCount*dayWidth)+'px')

    }

    renderTimeLine(d3.select('.time-line'));

    //renderTimeTable(d3.select('.time-table'));

    renderGrid(d3.select('.time-table'));









})()