chorus.views.visualizations.Boxplot = chorus.views.Base.include(
    chorus.Mixins.VisHelpers
).extend({
    constructorName: "BoxplotVisualizationView",
    render: function() {
        var $el = $(this.el);
        $el.html("");
        $el.addClass("visualization");
        var data = new chorus.presenters.visualizations.Boxplot(this.model).present();
        this.postRender();

        var svg = d3.select(this.el)
            .append("svg")
            .attr("class", "chart boxplot")
            .attr("width", 925)
            .attr("height", 340);


        var buckets = _.pluck(data, "bucket");
        var percentages = _.pluck(data, "percentage");
        percentages = _.map(percentages, function(percent){
            return parseInt(percent, 10) + '%';
        });

        var xLabels = _.map(buckets, function(bucket, i){
            return this.labelFormat(bucket, 6) + " (" + percentages[i]+ ")";
        }, this);

        var xLongLabels = _.map(buckets, function(bucket, i){
            return this.labelFormat(bucket, 1000) + " (" + percentages[i]+ ")";
        }, this);

        this.axes = new chorus.views.visualizations.Axes({
            el: svg,
            yScaleType: "numeric",
            xScaleType: "ordinal",
            maxYValue: data.maxY,
            minYValue: data.minY,
            xLabels: xLabels,
            xLongLabels: xLongLabels,
            xAxisLabel: this.model.get("xAxis"),
            yAxisLabel: this.model.get("yAxis"),
            hasYGrids: true,
            paddingX: 35,
            paddingY: 35
        });

        if (!$el.isOnDom()) return;

        this.axes.render();

        var boxes = svg.selectAll("g.box")
            .data(data).enter()
            .append("g")
            .attr("class", "box");

        var scales = this.axes.scales();
        var boxWidth = 0.4 * scales.x.rangeBand();
        var centerScale = function(d) { return scales.x(d) + scales.x.rangeBand() / 2; };

        function quartileRectangles(boxes) {
            boxes.append("rect")
                .attr("width", boxWidth)
                .attr("class", "quartile")
                .attr("height", function(d) {
                    return Math.abs(scales.y(d.thirdQuartile) - scales.y(d.firstQuartile));
                })
                .attr("x", function(d) {
                    return centerScale(d.bucket) - boxWidth / 2;
                })
                .attr("y", function(d) {
                    return scales.y(d.thirdQuartile);
                });
        }

        function midline(boxes) {
            boxes
                .append("svg:line")
                .attr("class", "midline")
                .attr("x1", function(d) {
                    return centerScale(d.bucket);
                })
                .attr("x2", function(d) {
                    return centerScale(d.bucket);
                })
                .attr("y1", function(d) {
                    return scales.y(d.max);
                })
                .attr("y2", function(d) {
                    return scales.y(d.min);
                });
        }

        function medianline(boxes) {
            boxes
                .append("svg:line")
                .attr("class", "median")
                .attr("x1", function(d) {
                    return centerScale(d.bucket) - boxWidth / 2;
                })
                .attr("x2", function(d) {
                    return centerScale(d.bucket) + boxWidth / 2;
                })
                .attr("y1", function(d) {
                    return scales.y(d.median);
                })
                .attr("y2", function(d) {
                    return scales.y(d.median);
                });
        }

        function whiskers(boxes) {
            boxes
                .append("svg:line")
                .attr("class", "whisker max")
                .attr("x1", function(d) {
                    return centerScale(d.bucket) - boxWidth / 4;
                })
                .attr("x2", function(d) {
                    return centerScale(d.bucket) + boxWidth / 4;
                })
                .attr("y1", function(d) {
                    return scales.y(d.max);
                })
                .attr("y2", function(d) {
                    return scales.y(d.max);
                });

            boxes
                .append("svg:line")
                .attr("class", "whisker min")
                .attr("x1", function(d) {
                    return centerScale(d.bucket) - boxWidth / 4;
                })
                .attr("x2", function(d) {
                    return centerScale(d.bucket) + boxWidth / 4;
                })
                .attr("y1", function(d) {
                    return scales.y(d.min);
                })
                .attr("y2", function(d) {
                    return scales.y(d.min);
                });
        }

        quartileRectangles(boxes);
        medianline(boxes);
        midline(boxes);
        whiskers(boxes);
    }
});

