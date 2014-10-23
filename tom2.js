(function(){

    var startYear = 2012;
    var startMonth = 0;
    var startDay = 1;

    var fullTimeLineDays = 4000;


    var monthArray = ['January', 'February', 'March', 'April', 'May', 'June', 'July','August', 'September', 'October', 'November', 'December'];

    var generateData = function (startYear, startMonth, startDay, dayCount, steps) {
        var data = [];
        for (var i = 0; i < dayCount; i+=steps) {
            var date = new Date(startYear, startMonth, startDay + i);
            data.push({
                id: date.getDate() + '_' + date.getMonth() + '_' + date.getFullYear(),
                day: date.getDay(),
                date: date.getDate(),
                month: date.getMonth(),
                year: date.getFullYear()
            })
        }
        return data;
    }




    var margin = {top: 20, right: 0, bottom: 0, left: 100},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var dayWidth = 20;

    var root = d3.select('#timeLine2');
    var rootWidth = parseInt(root.style('width'));

    var visibleTimeLineDays = Math.ceil(rootWidth / dayWidth);


    var yearLine = root.append('div')
        .attr('class', 'year-line');

    var monthLine = root.append('div')
        .attr('class', 'month-line');

    var dayLine = root.append('div')
        .attr('class', 'day-line');


    var years, months, days;

    var renderData = function(){
        var windowData = generateData(2013, 0, 1, fullTimeLineDays, 1)

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
            .style('width', function(d){
                return (d.count * dayWidth)+'px';
            })
            .text(function (d) {
                return d.year;
            })


        months.enter()
            .append('div')
            .attr('class', 'month')
            .style('width', function(d){
                return (d.count * dayWidth)+'px';
            })
            .text(function (d) {
                return monthArray[d.month];
            })


        days.enter()
            .append('div')
            .attr('class', function (d) {
                return 'day d' + d.day
            })
            .text(function (d) {
                return d.date
            })
    }

    var updateData = function(start){

        var windowData = generateData(2013, 0, start+1, visibleTimeLineDays, 1)

        var yearData = _.map(_.groupBy(windowData, function (item) {
            return item.year
        }),function (groupedItem, index) {
            return {
                year: index,
                count: groupedItem.length
            }
        });

        console.log(yearData, 'yearData');


        years = yearLine.selectAll('div.year')
            .data(yearData)
            .style('width', function(d){
                return (d.count * dayWidth)+'px';
            })
            .text(function (d) {
                return d.year;
            })



        years.enter()
            .append('div')
            .attr('class', 'year')
            .style('width', function(d){
                return (d.count * dayWidth)+'px';
            })
            .text(function (d) {
                return d.year;
            })


        years.exit().remove();



    }
    renderData(0);




    var dragmove = function(d){
        d.x=d3.event.x;
        tick();
    }

    var drag = d3.behavior.drag()
        .origin(Object)
        .on("drag", dragmove);

    var scrollThumb = d3.select('.scroll-thumb2')
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
            root.style('left', -(windowStart*dayWidth)+'px')
            updateData(windowStart);
            return 'translateX('+xPos+'px)';
        })
    }

    scrollThumb.style('width', thumbWidth+'px');
})()