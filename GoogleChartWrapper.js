//Load required Google Chart scripts
google.load("visualization", "1", { packages: ["corechart"] });
google.setOnLoadCallback(SetInitialize);

var eventQueue = []; // {id: '', eventName: ''}
var push = 0;
var _initialized = false;

function SetInitialize() {
//    log("Initialized = true");
    _initialized = true;
    ExecuteCallBackQueue();
}

function AddToCallBackQueue(obj, func, args) {
    eventQueue[push] = { func: func, obj: obj, args: args };
    push++;
//    log("Added to Queue");
}

function ExecuteCallBackQueue() {
//    log("Executing the Queue: Length = " + eventQueue.length);
    for (var i = 0; i < push; i++) {
        var func = eventQueue[i].func;
        var args = eventQueue[i].args;
        var obj = eventQueue[i].obj;

        func.apply(obj, args);
    }

    //reset the queue
    push = 0;
    eventQueue = [];
//    log("Queue Execution Completed: Length = " + eventQueue.length);
}

function IsApiInitialized() {
//    log("returning " + _initialized);
    return _initialized;
}

DxChart2 = {
    Init: function (debug) {
        this.isInitialized = false;
        this.debug = debug || false;

        this.DefaultColors =
        [
            "#1f77b4",
            "#ff7f0e",
            "#2ca02c",
            "#d62728",
            "#9467bd",
            "#8c564b",
            "#e377c2",
            "#7f7f7f",
            "#bcbd22",
            "#17becf",
            "#aec7e8",
            "#ffbb78",
            "#98df8a",
            "#ff9896",
            "#c5b0d5",
            "#c49c94",
            "#f7b6d2",
            "#c7c7c7",
            "#dbdb8d",
            "#9edae5"
        ];

        this.dxChartCollection = [];
    },

    DrawBarChart: function (barData, barChartOptions, placeHolderId) {

        if (!IsApiInitialized()) {
            AddToCallBackQueue(this, this.DrawBarChart, [barData, barChartOptions, placeHolderId]);
            return;
        }

        if (!this.isInitialized) this.Init();

        if (!placeHolderId && placeHolderId === "") {
            if (this.debug) alert("Place Holder Id is null or empty");
            return;
        }

        //var data = new google.visualization.DataTable();
        var cols = [];
        var rows = [];
        var comboChart = false;
        var comboChartOptions = {};
        var data = null;

        if (!((barData instanceof google.visualization.DataView) || (barData instanceof google.visualization.DataTable))) {
            try {
                cols.push({ label: "", type: "string" });
                for (var b = 0; b < barData.length; b++) {
                    var bar = barData[b];
                    var tempRow = [];
                    tempRow[0] = { v: bar.name };
                    if (bar.type && bar.type == "line") {
                        comboChart == true;
                        comboChartOptions[b] = { type: "line", targetAxisIndex: 1, pointSize: 5, curveType: "function" };
                    }
                    for (var i = 0; i < bar.data.length; i++) {
                        //Add the major axis labels (column 0) only in the first iteration TODO: See how to avoid duplicates
                        if (b == 0) {
                            cols.push({ label: bar.data[i].label, type: "number" });
                        }
                        tempRow[i + 1] = { v: bar.data[i].value };
                    }
                    rows.push({ c: tempRow });
                }
            }
            catch (ex) {
                log(ex.message);
            }

            data = new google.visualization.DataTable({ cols: cols, rows: rows });
        }
        else {
            if (barChartOptions.ComboOptions) {
                comboChart = true;
                comboChartOptions = barChartOptions.ComboOptions;
            }
            data = barData;
        }

        // Option configuration starts (this should be after the data is formed, because of combo chart support)
        var orientation = barChartOptions.orientation ? barChartOptions.orientation : "vertical";
        var animationConfig = barChartOptions.animate ? { duration: 1000, easing: 'out'} : null;

        var axisX = orientation == "vertical" ? (barChartOptions.axes && barChartOptions.axes.X ? { title: barChartOptions.axes.X.title, textStyle: { fontSize: 11 }, slantedText: barChartOptions.axes.X.angle && barChartOptions.axes.X.angle > 0 ? "true" : "auto", slantedTextAngle: barChartOptions.axes.X.angle && barChartOptions.axes.X.angle > 0 ? barChartOptions.axes.X.angle : 30, format: barChartOptions.axes.X.format} : { textStyle: { fontSize: 11} }) : (barChartOptions.axes && barChartOptions.axes.Y1 ? { title: barChartOptions.axes.Y1.title, format: barChartOptions.axes.Y1.format} : { textStyle: { fontSize: 11} });
        var axisY1 = orientation == "vertical" ? (barChartOptions.axes && barChartOptions.axes.Y1 ? { title: barChartOptions.axes.Y1.title, textStyle: { fontSize: 11 }, format: barChartOptions.axes.Y1.format, viewWindowMode: barChartOptions.axes.Y1.minValue != null ? "explicit" : "pretty", viewWindow: { min: barChartOptions.axes.Y1.minValue != null ? barChartOptions.axes.Y1.minValue : 0}} : { textStyle: { fontSize: 11} }) : (barChartOptions.axes && barChartOptions.axes.X ? { title: barChartOptions.axes.X.title, format: barChartOptions.axes.X.format} : { textStyle: { fontSize: 11} });
        var axisY2 = orientation == "vertical" && barChartOptions.axes && barChartOptions.axes.Y2 ? { title: barChartOptions.axes.Y2.title, textStyle: { fontSize: 11 }, format: barChartOptions.axes.Y2.format, viewWindowMode: barChartOptions.axes.Y2.minValue != null ? "explicit" : "pretty", viewWindow: { min: barChartOptions.axes.Y2.minValue != null ? barChartOptions.axes.Y2.minValue : 0}} : { textStyle: { fontSize: 11} };

        var defaultOptions =
        {
            animation: animationConfig,
            colors: this.DefaultColors,
            hAxis: axisX,
            vAxes: { 0: axisY1, 1: axisY2 },
            isStacked: barChartOptions.isStacked,
            title: barChartOptions.name ? barChartOptions.name : null,
            titleTextStyle: barChartOptions.name ? { color: "#333333", fontName: "Trebuchet MS, Calibri", fontSize: 16} : null,
            width: barChartOptions.width ? barChartOptions.width : 475,
            height: barChartOptions.height ? barChartOptions.height : 250,
            seriesType: "bars",
            bar: { groupWidth: barChartOptions.useGoldenRatio && barChartOptions.useGoldenRatio == true ? "61.9%" : "40%" },
            legend: { position: barChartOptions.legend && barChartOptions.legend.position ? barChartOptions.legend.position : "right", textStyle: { fontSize: 12} },
            series: comboChartOptions//{ 1: { type: 'line'} }           
        }
        // Option configuration ends

        var chart = null;
        if (!comboChart) {
            if (barChartOptions.orientation == "horizontal")
                chart = new google.visualization.BarChart(document.getElementById(placeHolderId));
            else
                chart = new google.visualization.ColumnChart(document.getElementById(placeHolderId));
        }
        else {
            chart = new google.visualization.ComboChart(document.getElementById(placeHolderId));
        }

        return chart.draw(data, defaultOptions);
    },

    DrawPieChart: function (pieData, pieChartOptions, placeHolderId) {

        if (!IsApiInitialized()) {
            AddToCallBackQueue(this, this.DrawPieChart, [pieData, pieChartOptions, placeHolderId]);
            return;
        }

        if (!this.isInitialized) this.Init();

        if (!placeHolderId && placeHolderId === "") {
            if (this.debug) alert("Place Holder Id is null or empty");
            return;
        }

        var cols = [], rows = [];
        
        var pieChartLegendPosition;
        pieChartLegendPosition = pieChartOptions.showLegend ? (pieChartOptions.legendPosition != null ? pieChartOptions.legendPosition : 'right') : 'none';
        if (typeof pieChartOptions.showLegend == "undefined")
            pieChartLegendPosition = 'right';
        
        // pieSliceTextLabel - defines what to show on the Pie : 'label', 'percentage', 'value', 'none'
        var pieSliceTextLabel;
        if (pieChartOptions.pieSliceTextLabel != null && typeof pieChartOptions.pieSliceTextLabel != "undefined") {
            pieSliceTextLabel = pieChartOptions.pieSliceTextLabel;
        }
        else
            pieSliceTextLabel = 'percentage';

        // Any values below 5% will go into "Other"
        var sliceVisibilityThreshold;
        if (pieChartOptions.sliceVisibilityThreshold != null && typeof pieChartOptions.sliceVisibilityThreshold != "undefined") {
            sliceVisibilityThreshold = pieChartOptions.sliceVisibilityThreshold;
        }
        else
            sliceVisibilityThreshold = 0.05;
        
        //default chart options.
        var defaultOptions =
            {
                height: pieChartOptions.height ? pieChartOptions.height : 400,
                width: pieChartOptions.width ? pieChartOptions.width : 475,
                colors: this.DefaultColors,
                is3D: false,
                sliceVisibilityThreshold: sliceVisibilityThreshold,
                pieSliceText: pieSliceTextLabel.toString(), //TODO: see if can do some customization here - Done : pieSliceTextLabel:'<value>'
                tooltip: { showColorCode: true },
                title: pieChartOptions.name,
                titleTextStyle: { color: "#333333", fontName: "Trebuchet MS, Calibri", fontSize: 16 },
                legend: { position: pieChartLegendPosition }
            };

        var data = null;

        if (!((pieData instanceof google.visualization.DataView) || (pieData instanceof google.visualization.DataTable))) {
            //Iterate over object and construct a datatable only if it is not already a Google object
            try {
                //push two columns with blank header
                cols.push({ label: "Label", type: "string" });
                cols.push({ label: "Data", type: "number" });

                for (var i = 0; i < pieData.length; i++) {
                    var pie = pieData[i];
                    rows.push({ c: [{ v: pie.label }, { v: pie.data}] });
                }
            }
            catch (ex) {
                log(ex.message);
            }

            data = new google.visualization.DataTable({ cols: cols, rows: rows });
        }
        else {
            data = pieData;
        }

        var chart = null;
        chart = new google.visualization.PieChart(document.getElementById(placeHolderId));
        return chart.draw(data, defaultOptions);

    },

    DrawLineChart: function (lineData, lineChartOptions, placeHolderId) {

        if (!IsApiInitialized()) {
            AddToCallBackQueue(this, this.DrawLineChart, [lineData, lineChartOptions, placeHolderId]);
            return;
        }

        if (!this.isInitialized) this.Init();

        if (!placeHolderId && placeHolderId === "") {
            if (this.debug) alert("Place Holder Id is null or empty");
            return;
        }

        //var data = new google.visualization.DataTable();
        var cols = [];
        var rows = [];

        // Option configuration starts
        var animationConfig = lineChartOptions.animate ? { duration: 1000, easing: 'out'} : null;

        var axisX = lineChartOptions.axes && lineChartOptions.axes.X ? { title: lineChartOptions.axes.X.title, textStyle: { fontSize: 11 }, slantedText: lineChartOptions.axes.X.angle && lineChartOptions.axes.X.angle > 0 ? "true" : "auto", slantedTextAngle: lineChartOptions.axes.X.angle && lineChartOptions.axes.X.angle > 0 ? lineChartOptions.axes.X.angle : 30, format: lineChartOptions.axes.X.format} : { textStyle: { fontSize: 11} };
        var axisY1 = lineChartOptions.axes && lineChartOptions.axes.Y1 ? { title: lineChartOptions.axes.Y1.title, textStyle: { fontSize: 11 }, format: lineChartOptions.axes.Y1.format, viewWindowMode: lineChartOptions.axes.Y1.minValue != null ? "explicit" : "pretty", viewWindow: { min: lineChartOptions.axes.Y1.minValue != null ? lineChartOptions.axes.Y1.minValue : 0}} : { textStyle: { fontSize: 11} };
        var axisY2 = lineChartOptions.axes && lineChartOptions.axes.Y2 ? { title: lineChartOptions.axes.Y2.title, textStyle: { fontSize: 11 }, format: lineChartOptions.axes.Y2.format, viewWindowMode: lineChartOptions.axes.Y2.minValue != null ? "explicit" : "pretty", viewWindow: { min: lineChartOptions.axes.Y2.minValue != null ? lineChartOptions.axes.Y2.minValue : 0}} : { textStyle: { fontSize: 11} };

        var defaultOptions =
        {
            animation: animationConfig,
            colors: this.DefaultColors,
            title: lineChartOptions.name,
            hAxis: axisX,
            vAxes: { 0: axisY1, 1: axisY2 },
            width: lineChartOptions.width ? lineChartOptions.width : 475,
            height: lineChartOptions.height ? lineChartOptions.height : 250,
            focusTarget: lineChartOptions.OnfocusHighlight && lineChartOptions.OnfocusHighlight == "all" ? 'category' : 'datum',
            pointSize: lineChartOptions.dataPointsVisible ? 5 : 0,
            curveType: lineChartOptions.curve ? "function" : "none",
            series: lineChartOptions.seriesOptions,
            titleTextStyle: { color: "#333333", fontName: "Trebuchet MS, Calibri", fontSize: 16 }
        }
        // Option configuration ends 

        var data = null;

        if (!((lineData instanceof google.visualization.DataView) || (lineData instanceof google.visualization.DataTable))) {
            try {
                cols.push({ label: "", type: "string" });
                for (var l = 0; l < lineData.length; l++) {
                    var line = lineData[l];
                    var tempRow = [];
                    tempRow[0] = { v: line.name };
                    for (var i = 0; i < line.data.length; i++) {
                        //Add the major axis labels (column 0) only in the first iteration TODO: See how to avoid duplicates
                        if (l == 0) {
                            cols.push({ label: line.data[i].label, type: "number" });
                        }
                        tempRow[i + 1] = { v: line.data[i].value };
                    }
                    rows.push({ c: tempRow });
                }
            }
            catch (ex) {
                log(ex.message);
            }

            data = new google.visualization.DataTable({ cols: cols, rows: rows });
        }
        else {
            data = lineData;
        }

        var chart = null;
        chart = new google.visualization.LineChart(document.getElementById(placeHolderId));

        return chart.draw(data, defaultOptions);
    },

    DrawTable: function (data, tableOptions, placeHolderId) {
        if (!IsApiInitialized()) {
            AddToCallBackQueue(this, this.DrawTable, [data, tableOptions, placeHolderId]);
            return;
        }

        if (!this.isInitialized) this.Init();

        if (!placeHolderId && placeHolderId === "") {
            if (this.debug) alert("Place Holder Id is null or empty");
            return;
        }

        var defaultOptions =
        {
            showRowNumber: false,
            rtlTable: false,
            sort: 'disable'
        }

        var table = new google.visualization.Table(document.getElementById(placeHolderId));
        table.draw(data, defaultOptions);
    }
}

function log(message) {
    if (window.console && console.log) {
        console.log(message);
    }
}

//function shuffle(o){ //v1.0
//    for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
//    return o;
//}