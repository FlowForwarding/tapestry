if (typeof NCI === 'undefined')
   NCI = {};
 
NCI.nciLatestValue = $('#nciLatestValue');
NCI.nepLatestValue = $('#nepLatestValue');
NCI.qpsLatestValue = $('#qpsLatestValue');
NCI.collectorsLatestValue = $('#collectorsLatestValue');
NCI.lastUpdateTime = $('#lastUpdateTime');

NCI.ifMobile = function(){
	return /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);
};

NCI.currentNCI = 0;
NCI.collectors = [];
NCI.collectorsUpdateDate = "";
NCI.nciUpdateDate = "";
NCI.nciActivities = [];

NCI.setNciLatestValue = function (val, time, activities) {
	NCI.nciUpdateDate = time;
	NCI.nciActivities = activities;
	var colorClass = val > NCI.currentNCI ? 'green' : val == NCI.currentNCI ? 'black' : 'red';
	NCI.currentNCI = val;
	var newVal = NCI.parceNumberForView(val);
	NCI.nciLatestValue.html('<val class="' + colorClass + '"> ' + newVal + ' </val><br><i>updated &nbsp;' + time + '</i> ');
	NCI.lastUpdateTime.html('updated &nbsp;' + time);
};

NCI.setNepLatestValue = function (newVal, time) {
	NCI.nepLatestValue.html('<val>' + newVal + '</val><br><i>updated &nbsp;' + time + '</i>');
};

NCI.setQpsLatestValue = function (newVal, time) {
	NCI.qpsLatestValue.html('<val>' + newVal + '</val> <br><i>updated &nbsp;' + time + '</i>');
};

NCI.setCollectorsLatestValue = function (collectors, time) {
	var newVal = NCI.parceNumberForView(collectors.length);
	NCI.collectors = collectors;
	NCI.collectorsUpdateDate =  time;
	NCI.collectorsLatestValue.html('<val>' + newVal + '</val> <br><i>updated &nbsp;' + time + '</i>');
};

NCI.convertDateForServer = function(date){
	//we need to get such format in UTC 2013-10-27T13:11:39Z for server
	var returnDate = new Date(date).toISOString();
	returnDate = returnDate.substring(0, returnDate.length - 5) + "Z";
	return returnDate;
};

NCI.parceDateForLastUpdate = function(stringDate){
	var date = new Date(new Date(stringDate) - NCI.time_adjustment);
	var showDate = date.getMonth() + '.' + date.getDate() + '.' + date.getFullYear() % 100
		+ '  ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
	return showDate;
};

NCI.parceNumberForView = function(labelValue, fixVal){
    return Math.abs(Number(labelValue)) >= 1.0e+9

         ? Math.abs(Number(labelValue)) / 1.0e+9.toFixed(1) + " B"
         : Math.abs(Number(labelValue)) >= 1.0e+6

         ? (labelValue/ 1.0e+6).toFixed(1)  + " M"
         : Math.abs(Number(labelValue)) >= 1.0e+3

         ? (labelValue / 1.0e+3).toFixed(1) + " K"
         : Math.abs(Number(labelValue)).toFixed(fixVal);
};

$('.round-info').on('touchend', function(){
	$('.round-info').trigger('click');
})

NCI.zoomLinks = (function(){
	var me = $('.zoom-panel a');
	
	me.setTimePeriod = function(period){
		var foundDisabled = false;
		$.each(me, function(index, link){
			if (period - link.dataset.time < 0){
				if (foundDisabled)
					$(link).addClass('disabled');
				foundDisabled = true;	
			}
		});
	};
	
	me.on('click', function(){
		if ($(this).hasClass('disabled'))
			return;
		NCI.zoomLinks.removeClass('selected');
		
		if ((NCI.curChartPeriod <= NCI.chartPeriods.twoyears && this.dataset.time <= NCI.chartPeriods.twoyears) ||
			(NCI.curChartPeriod  > NCI.chartPeriods.tenyears && this.dataset.time > NCI.chartPeriods.tenyears)){
			var ranges = NCI.DetectRangesForPeiod( this.dataset.time, NCI.chartData);		
			NCI.chart.updateOptions({
				dateWindow: [ ranges[0],  ranges[1]]
			});
		} else {
			NCI.chartData = [];
			NCI.chart.updateOptions({file: NCI.chartData});
			NCI.curChartPeriod =  this.dataset.time <= NCI.chartPeriods.twoyears ? NCI.chartPeriods.twoyears : NCI.chartPeriods.tenyears;
			NCI.detailedChartPeriod = this.dataset.time;
			NCI.Connection.moreData(new Date() - NCI.curChartPeriod, new Date(), NCI.numOfPoints);
		};

		$(this).addClass('selected');
	});
	
	return me;
}());

NCI.collectorsTable = (function(){
	var me = $('#collectorsInfo');
	var table = me.find("#collectorsTableBody");
	var pagination = me.find("#collectorsPagination");
	var collectorsgeneral = me.find(".collectorsGeneral");
	var numOnPage = 10;
	var collectors = [];
	var pages = [];
	var currentPage;
	
	me.showDataForPage = function(page){
		var lastIndex = numOnPage*page  > collectors.length ? collectors.length : numOnPage*page;
		var content = "";
	    for (var i = numOnPage*(page-1); i< lastIndex; i++){
	   	    var collectorInfo = collectors[i];
			content += "<tr><td>" +  collectorInfo.name + "</td><td>" +  
			collectorInfo.ip + "</td><td>" +  NCI.parceNumberForView(collectorInfo.nep) + "</td><td>" +  
			NCI.parceNumberForView(collectorInfo.qps) + "</td></tr>";
		};
		table.html(content);
	};
	
	me.on('click', '.pager', function(){
		me.showDataForPage(this.dataset.page)
		currentPage.removeClass("current");
		currentPage = $(this);
		currentPage.addClass("current");
	});
	
	me.fillData = function(collectorsArray){
		collectorsgeneral.html(collectorsArray.length + " collectors at " + NCI.collectorsUpdateDate);
		collectors = [].concat(collectorsArray);
		
	  // this is dots
	  // <li class="unavailable"><a href="">&hellip;</a></li>
		
		var pageCount = collectors.length/numOnPage;
		if (pageCount > 1) {
			if (pageCount > Math.round(pageCount)) {
				pageCount = Math.round(pageCount) + 1;
			} else {
				pageCount = Math.round(pageCount);
			}
			var paginationContent = "<li class='arrow unavailable'><a>&laquo;</a></li>"
			for (var i = 0; i < pageCount; i++){
				paginationContent += '<li class="pager" data-page="' + (i + 1) + '"><a>' + (i + 1) + '</a></li>';
			}
			paginationContent += "<li class='arrow'><a>&raquo;</a></li>"
			pagination.html(paginationContent);
		} else {
			pagination.html("");
		}
		pages = pagination.find("li");
		me.showDataForPage(1);
		if (pages.length > 0){
			currentPage = $(pages[1]);
			currentPage.addClass("current");	
		}

	}
	
	return me;
}());

NCI.nciHistogram = (function(){
	var me = $('#nciDetails');
	
	var activities = [];
	var histogramGeneral = $("#histogramGeneral");
	
	me.show = function(){
		$("#nciHistogram").text('');
		histogramGeneral.html("<b>The NETWORK COMPLEXITY INDEX at &nbsp;&nbsp;</b> <i>" + NCI.nciUpdateDate + "</i>" );
	    activities = [].concat(NCI.nciActivities);
		
		var scale = 30;
		
		var chart = d3.select("#nciHistogram");

		var margin = {top: 40, right: 40, bottom: 40, left:40},
		    width = 600,
		    height = 300;

		var x = d3.scale.linear()
		    .domain([0, d3.max(activities, function(d) { return d.endpoints; })])
		    .range([width - margin.left - margin.right, 0]);

		var y = d3.scale.linear()
		    .domain([0, d3.max(activities, function(d) { return d.size; })])
		    .range([height - margin.top - margin.bottom, 0]);

		var xAxis = d3.svg.axis()
		    .scale(x)
		    .orient('bottom')
		    .tickSize(0)
		    .tickPadding(8);

		var yAxis = d3.svg.axis()
		    .scale(y)
		    .orient('right')
			.tickSize(0)
		    .tickPadding(8);

		var svg = chart.append('svg')
		  //  .attr('class', 'chart')
		    .attr('width', width)
		    .attr('height', height)
		    .append('g')
		    .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

		svg.selectAll('g')
		    .data(activities)
		    .enter().append('rect')
		   // .attr('class', 'bar')
		    .attr('x', function(d) { return  width - margin.left - margin.right - x(d.endpoints) })
		    .attr('y', function(d) { return  y(d.size)})
		    .attr('width', function(d) { return  x(d.endpoints)})
		    .attr('height', 18)

		svg.append('g')
		    .attr('class', 'x axis')
		    .attr('transform', 'translate(0, ' + (height - margin.top - margin.bottom) + ')')
		    .call(xAxis);

		svg.append('g')
		  .attr('class', 'y axis')
		  .attr('transform', 'translate(' + (width - margin.right - margin.left) + ')')
		  .call(yAxis);

	};
	
	return me;
}());

NCI.socialGraph = (function(){
	var me = $('#socialGraph');
	
	var chart = d3.select("#socialGraph"),
	    width = 400,
	    height = 300,
		margin = {top: 10, right: 10, bottom: 10, left:10};
	
	var edges = [
	    {target1: 0, value1: 1, target2: 10, value2: 4},
	    {target1: 0, value1: 1, target2: 5, value2: 4},
	    {target1: 0, value1: 1, target2: 10, value2: 9},
	    {target1: 5, value1: 4, target2: 8, value2: 9}
	];
	
	var dim = 10;
     
	me.show = function(){
		$("#socialGraph").text('');
		
		var x = d3.scale.linear()
		    .domain([0, d3.max(edges, function(d) { return Math.max(d.target1, d.target2) })])
		    .range([0, width - margin.left - margin.right]);
		
		var y = d3.scale.linear()
		    .domain([0, d3.max(edges, function(d) { return Math.max(d.value1, d.value2) })])
			.range([0, height - margin.top - margin.bottom]);	

		var svg = chart.append('svg')
		    .attr('class', 'chart')
		    .attr('width', width)
		    .attr('height', height)
		    .append('g')
		    .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');
			
		svg.selectAll('g')
		    .data(edges)
			.enter().append('rect')
			.attr('x', function(d) { return x(d.target1) - dim/2 })
			.attr('y', function(d) { return y(d.value1) - dim/2 })
			.attr('width', function(d) { return  dim })
			.attr('height', dim);
		
		svg.selectAll('g')
		    .data(edges)
			.enter().append('rect')
			.attr('x', function(d) { return x(d.target2) - dim/2 })
			.attr('y', function(d) { return y(d.value2) - dim/2 })
			.attr('width', function(d) { return  dim })
			.attr('height', dim);
			
		svg.selectAll('g')
		    .data(edges)
			.enter().append('line')
			.attr("stroke-width", 1)
			.attr("stroke", "black")
			.attr("x1", function(d) { return x(d.target1); })
			.attr("x2", function(d) { return x(d.target2); })
			.attr("y1", function(d) { return y(d.value1); })
			.attr("y2", function(d) { return y(d.value2); })
		
	};
   
	return me;
}());


$(document).on('opened', '#socialPopup', function () {
	NCI.socialGraph.show();
});

$(document).on('opened', '#nciDetails', function () {
	if (NCI.nciActivities.length > 0)
	    NCI.nciHistogram.show();
});

$(document).on('open', '#collectorsInfo', function () {
	var modal = $(this);
	modal.height(470);
	NCI.collectorsTable.fillData(NCI.collectors);
});

$('body').on('touchend', function(){
	$('.tooltip').hide();
});

