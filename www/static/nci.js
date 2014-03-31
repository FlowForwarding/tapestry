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

NCI.setNciLatestValue = function (val, time) {
	
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

$(document).on('open', '#collectorsInfo', function () {
	var content = "<div class='row'><table style='margin-left: auto;margin-right: auto;'><thead><tr><th width='150'>Collector</th><th>IP Address</th><th width='150'>Endpoints</th><th width='150'>QPS</th></tr></thead><tbody>";
    $.each(NCI.collectors, function(index, value){
    	content += "<tr><td>" +  value.name + "</td><td>" +  
		value.ip + "</td><td>" +  NCI.parceNumberForView(value.nep) + "</td><td>" +  
		NCI.parceNumberForView(value.qps) + "</td></tr>";
    });
    content += "</tbody></table></div>";
	var modal = $(this).html(content);
	modal.height(400);
	//console.log(modal.height);
});

$('body').on('touchend', function(){
	$('.tooltip').hide();
});

