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
	return NCI.dateString_(date);
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
		collectorsgeneral.html(collectorsArray.length + " collectors at &nbsp;&nbsp;" + NCI.collectorsUpdateDate);
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
	var activityDetails = $('#activityDetails');
	
	var activities = [];
	var histogramGeneral = $("#histogramGeneral");
	var barHeight = 18;
	
	me.show = function(){
		$("#nciHistogram").text('');
		activityDetails.text('');
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
		    .range([0, height - margin.top - margin.bottom]);

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

		var showDetails = function(d){
			activityDetails.text(d.details)
		};

		svg.selectAll('g')
		    .data(activities)
		    .enter().append('rect')
		   // .attr('class', 'bar')
		    .attr('x', function(d) { return   0 })
		    .attr('y', function(d) { return  y(d.size) - barHeight}) //- selfwidth
		    .attr('width', function(d) { return 0})
		    .attr('height', barHeight)
			.on("click", showDetails);
			
		  svg.selectAll('rect').data(activities).transition()
		      .duration(1000)
		      .attr("width", function(d) { return width - margin.left - margin.right -x(d.endpoints)})
			  .attr('x', function(d) { return   x(d.endpoints) });
		
		svg.selectAll('g')
		    .data(activities)
			.enter().append('text')
			.attr('x', function(d) { return  5 + x(d.endpoints) })
			.attr('y', function(d) { return  y(d.size) - 5})
		    .attr('fill', '#fff')
			.on("click", showDetails)
			.text(function(d) { return d.name; });	

		svg.append('g')
		    .attr('class', 'x axis')
		    .attr('transform', 'translate(0, ' + (height - margin.top - margin.bottom) + ')')
		    .call(xAxis);

		svg.append('g')
		    .attr('class', 'y axis')
		    .attr('transform', 'translate(' + (width - margin.right - margin.left) + ')')
		    .call(yAxis);
			
		svg.append('text').text('ENDPOINTS').attr('x', width/2).attr('y', height - 40);
		svg.append('text').text('ACTIVITIES').attr('x', -height/2).attr('y', width - 40)
		.attr('transform', 'rotate(-90)');

	};
	
	return me;
}());

NCI.socialGraph = (function(){
	var me = $('#socialGraph');
	
	var chart = d3.select("#socialGraph"),
    width = 400,
    height = 300,
    margin = {top: 10, right: 10, bottom: 10, left:10};
	
    var interactions = [["10.2.52.255","10.9.11.252"],
                        ["10.5.8.216","10.1.1.58"],
                        ["10.8.14.14","10.5.1.89"],
                        ["10.10.59.73","10.7.66.101"],
                        ["10.2.14.156","10.4.95.149"],
                        ["10.5.1.89","10.5.1.89"],
                        ["10.5.97.73","10.9.11.252"],
                        ["10.7.21.125","10.10.70.236"],
                        ["10.1.26.197","10.9.11.252"],
                        ["10.10.4.134","10.7.66.101"],
                        ["10.8.64.93","10.10.70.236"]];
    
    
	var labelType, useGradients, nativeTextSupport, animate;
	var ua = navigator.userAgent,
    iStuff = ua.match(/iPhone/i) || ua.match(/iPad/i),
    typeOfCanvas = typeof HTMLCanvasElement,
    nativeCanvasSupport = (typeOfCanvas == 'object' || typeOfCanvas == 'function'),
    textSupport = nativeCanvasSupport && (typeof document.createElement('canvas').getContext('2d').fillText == 'function');
    //ExCanvas provides text support for IE
    //and that as of today iPhone/iPad current text support is lame
    labelType = (!nativeCanvasSupport || (textSupport && !iStuff))? 'Native' : 'HTML';
    nativeTextSupport = labelType == 'Native';
    useGradients = nativeCanvasSupport;
    animate = !(iStuff || !nativeCanvasSupport);
    
	me.show = function(){
		$("#socialGraph").text('');
		var json = [];
		var community1Data =
		$.each(interactions, function(index, interacton){
			json.push(
                      {
                          "adjacencies": [
                                          {
                                              "nodeTo": interacton[1],
                                              "nodeFrom": interacton[0]
                                          }
                                          ],
                          "data": { "$color": "#557EAA"},
                          "id": interacton[0]
                      },
                      {
                          "data": { "$color": "#557EAA"},
                          "id": interacton[1]
                      }
                      );
		});
		
		
        // init ForceDirected
        var fd = new $jit.ForceDirected({
            //id of the visualization container
	    injectInto: 'socialGraph',
	    Navigation: {
        enable: true,
        panning: 'avoid nodes',
        zooming: 10 //zoom speed. higher is more sensible
	    },
	    Node: {
        overridable: true
	    },
	    Edge: {
        overridable: true,
        color: 'black',
        lineWidth: 0.4
	    },
            //Native canvas text styling
	    Label: {
        type: labelType, //Native or HTML
        size: 10,
        style: 'bold'
	    },
            //Add Tips
	    Tips: {
        enable: true,
        onShow: function(tip, node) {
	        var count = 0;
	        node.eachAdjacency(function() { count++; });
	        tip.innerHTML = "<div class=\"tip-title\">" + node.id + "</div>"
            + "<div class=\"tip-text\"><b>connections:</b> " + count + "</div>";
        }
	    },
            // Add node events
	    Events: {
        enable: true,
        type: 'Native',
        onMouseEnter: function() {
	        fd.canvas.getElement().style.cursor = 'move';
        },
        onMouseLeave: function() {
	        fd.canvas.getElement().style.cursor = '';
        },
        onDragMove: function(node, eventInfo, e) {
            var pos = eventInfo.getPos();
            node.pos.setc(pos.x, pos.y);
            fd.plot();
        },
        onTouchMove: function(node, eventInfo, e) {
	        $jit.util.event.stop(e); //stop default touchmove event
	        this.onDragMove(node, eventInfo, e);
        },
        onClick: function(node) {
	        if(!node) return;
	        var html = "<h4>" + node.name + "</h4> connections: d",
            list = [];
	        node.eachAdjacency(function(adj){
                list.push(adj.nodeTo.name);
	        });
        }
	    },
	    levelDistance: 130,
	    onCreateLabel: function(domElement, node){
            domElement.innerHTML = node.name;
            var style = domElement.style;
            style.fontSize = "0.8em";
            style.color = "#ddd";
	    }
        });
        
        fd.loadJSON(json);	  
        fd.computeIncremental({
	    onComplete: function(){
            fd.animate({
	        modes: ['linear'],
	        duration: 500
            });
	    }
        });
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

