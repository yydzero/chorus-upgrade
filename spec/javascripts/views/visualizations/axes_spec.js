describe("chorus.views.visualizations.Axes", function() {
    var leftX = chorus.svgHelpers.leftX,
        rightX = chorus.svgHelpers.rightX,
        centerX = chorus.svgHelpers.centerX,
        topY = chorus.svgHelpers.topY,
        bottomY = chorus.svgHelpers.bottomY,
        centerY = chorus.svgHelpers.centerY,
        height = chorus.svgHelpers.height,
        width = chorus.svgHelpers.width;

    beforeEach(function() {
        var div = $("<div class='visualization heatmap'></div>")[0];
        this.width = 925;
        this.height = 340;
        this.paddingX = 35;
        this.paddingY = 35;

        this.axisLabelValue = "magic_numbers";
        this.el = d3.select(div)
            .append("svg")
            .attr("width", this.width)
            .attr("height", this.height);
        this.$el = $(this.el[0][0]);
        $("#jasmine_content").append(div);
    });

    beforeEach(function() {
        window.addCompatibilityShimmedMatchers(chorus.svgHelpers.matchers);
    });

    describe("XAxis", function() {
        function itDisplaysNumericalTicksCorrectly() {
            it("generates uniformly spaced ticks in the range of the label values", function() {
                expect(this.ticks.length).toBeGreaterThan(5);
                expect(this.ticks.length).toBeLessThan(25);

                expect(this.ticks).toBeUniformlyHorizontallySpaced();
            });
        }

        function itDisplaysOrdinalLabelsCorrectly() {
            it("divides the width of the chart evenly into bands, " +
                "and places each tick at the center of a band", function() {
                var bandWidth = (this.width - 2 * this.paddingX) / this.labelValues.length;

                _.each(this.ticks, function(tick, i) {
                    var bandCenter = (i + 0.5) * bandWidth + this.paddingX;
                    expect(leftX(tick)).toBeWithinDeltaOf(bandCenter, 10);
                }, this);
            });

            it("includes a tick mark for each label", function() {
                expect(this.ticks.length).toBe(this.labelValues.length);
            });

            it("renders each of the given labels, and formats them", function() {
                expect(this.labels.length).toBe(this.labelValues.length);

                _.each(this.labels, function(label, i) {
                    expect($(label).text()).toBe(this.axis.labelFormat(this.labelValues[i].toString()));
                }, this);
            });
        }

        function itHasAReasonableLayout() {
            describe("the axis line", function() {
                it("is rendered to the chart", function() {
                    expect(this.axisLine).toExist();
                });

                it("is horizontal", function() {
                    expect(this.axisLine).toBeHorizontal();
                });

                it("goes across the bottom of the chart", function() {
                    expect(leftX(this.axisLine)).toEqual(this.paddingX);
                    expect(rightX(this.axisLine)).toEqual(this.width - this.paddingX);
                });
            });

            describe("the axis tick marks", function() {
                it("draws ticks", function() {
                    expect(this.ticks.length).toBeGreaterThan(2);
                });

                it("draws them vertically", function() {
                    _.each(this.ticks, function(tick) {
                        expect(tick).toBeVertical();
                    });
                });

                it("draws the ticks extending down from the main axis line", function() {
                    _.each(this.ticks, function(tick) {
                        expect(topY(tick)).toEqual(topY(this.axisLine));
                        expect(bottomY(tick)).toBeGreaterThan(topY(this.axisLine));
                    }, this);
                });

                it("draws the ticks in order from left to right", function() {
                    expect(this.ticks).toBeOrderedLeftToRight();
                });
            });

            describe("the axis grid lines", function() {
                it("should respect hasGrid option", function() {
                    if (this.hasGridLines) {
                        expect(this.grids.length).toBeGreaterThan(2);
                    } else {
                        expect(this.grids.length).toBe(0);
                    }
                });

                it("should draw grid lines extending from the top of the ticks to the top of the chart", function() {
                    _.each(this.grids, function(gridLine) {
                        expect(bottomY(gridLine)).toEqual(bottomY(this.axisLine));
                        expect(topY(gridLine)).toBeLessThan(bottomY(this.axisLine));
                    }, this);
                });
            });

            describe("the tick labels", function() {
                it("places the labels below the ticks", function() {
                    _.each(this.labels, function(label, i) {
                        expect(topY(label)).toBeGreaterThan(bottomY(this.ticks[i]));
                    }, this);
                });

                it("draws the labels in order from left to right", function() {
                    expect(this.labels).toBeOrderedLeftToRight();
                });
            });

            describe("the axis label", function() {
                it("should have the correct text", function() {
                    expect(this.axisLabel).toHaveText(this.axisLabelValue);
                });

                it("should be centered in the chart", function() {
                    expect(centerX(this.axisLabel)).toBeWithinDeltaOf(centerX(this.axisLine), 5);
                });

                it("is below the tick labels", function() {
                    expect(topY(this.axisLabel)).toBeGreaterThan(bottomY(this.labels[0]));
                });

                it("is above the padding", function() {
                    var innerHeightPlusBoundingBoxError = this.height - this.paddingY + 10;
                    expect(bottomY(this.axisLabel)).toBeLessThanOrEqualTo(innerHeightPlusBoundingBoxError);
                });
            });

            describe("the placement of the axis group", function() {
                beforeEach(function() {
                    this.innerHeight = this.height - this.paddingY;
                });

                it("draws the axis line inside the padding", function() {
                    expect(bottomY(this.axisLine)).toBeLessThanOrEqualTo(this.innerHeight);
                });

                it("draws the ticks inside the padding", function() {
                    expect(bottomY(this.ticks[0])).toBeLessThanOrEqualTo(this.innerHeight);
                });

                it("draws the labels inside the padding", function() {
                    var innerHeightPlusBoundingBoxError = this.innerHeight + 5;
                    expect(bottomY(this.labels[0])).toBeLessThanOrEqualTo(innerHeightPlusBoundingBoxError);
                });
            });
        }

        beforeEach(function() {
            window.addCompatibilityShimmedMatchers({
                toBeUniformlyHorizontallySpaced: function() {
                    var elements = this.actual;
                    var standardDistance = centerX(elements[1]) - centerX(elements[0]);

                    return _.all(elements, function(el, i) {
                        if (i === 0) return true;
                        var previousElement = elements[i - 1];
                        var distance = centerX(el) - centerX(previousElement);
                        return Math.abs(distance - standardDistance) < 10;
                    });
                }
            });
        });

        describe("with an ordinal scale", function() {
            beforeEach(function() {
                this.renderXAxisWithLabels = function(labels) {
                    this.axis = new chorus.views.visualizations.XAxis({
                        el: this.el,
                        labels: labels,
                        axisLabel: this.axisLabelValue,
                        scaleType: "ordinal",
                        ticks: true,
                        paddingX: this.paddingX,
                        paddingY: this.paddingY
                    });
                    this.axis.render();

                    this.axisLine = this.$el.find("line.axis");
                    this.ticks = this.$el.find("line.tick");
                    this.grids = this.$el.find("line.grid");
                    this.axisLabel = this.$el.find(".axis_label");
                    this.labels = this.$el.find(".label");
                };

                this.labelValues = ['one', 'two', 'three', 'four', 'five'];

                this.renderXAxisWithLabels(this.labelValues);
            });

            describe("#requiredBottomSpace (used for drawing the y axis)", function() {
                beforeEach(function() {
                    this.actualHeight = this.height - this.paddingY - topY(this.axisLine);

                    this.newAxis = new chorus.views.visualizations.XAxis({
                        el: this.el,
                        labels: _.shuffle(this.labelValues),
                        axisLabel: this.axisLabelValue,
                        ticks: true,
                        paddingX: this.paddingX,
                        paddingY: this.paddingY
                    });
                });

                it("returns the height required for the labels and ticks", function() {
                    expect(this.newAxis.requiredBottomSpace()).toEqual(this.actualHeight);
                });

                it("does not alter the contents of the container", function() {
                    this.newAxis.requiredBottomSpace();
                    expect(this.$el.find(".label")).toEqual(this.labels);
                });
            });

            describe("#scale", function() {
                it("returns a scale function with the correct domain and range", function() {
                    var scale = this.axis.scale();
                    var s = (this.width - 2 * this.paddingX) / 5;

                    expect(scale("one")).toBe(this.paddingX + 0 * s);
                    expect(scale("two")).toBe(this.paddingX + 1 * s);
                    expect(scale("three")).toBe(this.paddingX + 2 * s);
                    expect(scale("four")).toBe(this.paddingX + 3 * s);
                    expect(scale("five")).toBe(this.paddingX + 4 * s);
                });
            });

            describe("when the tick labels are short", function() {
                itHasAReasonableLayout();
                itDisplaysOrdinalLabelsCorrectly();

                it("centers each label on its corresponding tick mark", function() {
                    expect(leftX(this.ticks[0])).toBeWithinDeltaOf(centerX(this.labels[0]), 5);
                    expect(leftX(this.ticks[1])).toBeWithinDeltaOf(centerX(this.labels[1]), 5);
                    expect(leftX(this.ticks[2])).toBeWithinDeltaOf(centerX(this.labels[2]), 5);
                    expect(leftX(this.ticks[3])).toBeWithinDeltaOf(centerX(this.labels[3]), 5);
                    expect(leftX(this.ticks[4])).toBeWithinDeltaOf(centerX(this.labels[4]), 5);
                });
            });

            describe("when there are too many tick labels to fit horizontally within the width", function() {
                beforeEach(function() {
                    this.labelValues = [
                        'one_long',
                        'two_long',
                        'three_long',
                        'four_long',
                        'five_long',
                        'one hundred and six',
                        'one hundred and seven',
                        'one hundred and eight',
                        'one hundred and nine',
                        'one hundred and ten',
                        'one hundred and eleven'
                    ];
                    this.$el.empty();
                    this.renderXAxisWithLabels(this.labelValues.slice(0,5));

                    this.$unrotatedEl = this.$el;
                    this.unrotatedLabels = this.labels;

                    this.el = d3.select(this.$unrotatedEl.parent()[0])
                        .append("svg")
                        .attr("width", this.width)
                        .attr("height", this.height);
                    this.$el = $(this.el[0][0]);
                    this.axis = new chorus.views.visualizations.XAxis({
                        el: this.el,
                        labels: this.labelValues,
                        axisLabel: this.axisLabelValue,
                        ticks: true,
                        paddingX: this.paddingX,
                        paddingY: this.paddingY
                    });
                    this.axis.render();

                    this.axisLine = this.$el.find("line.axis");
                    this.ticks = this.$el.find("line.tick");
                    this.axisLabel = this.$el.find(".axis_label");
                    this.labels = this.$el.find(".label");
                });

                itHasAReasonableLayout();
                itDisplaysOrdinalLabelsCorrectly();

                it("rotates the labels", function() {
                    _.each(this.labels, function(label, i) {
                        var unrotatedLabel = this.unrotatedLabels[i];
                        if (!unrotatedLabel) return;
                        expect(width(label)).toBeLessThan(width(unrotatedLabel));
                        expect(height(label)).toBeGreaterThan(height(unrotatedLabel));
                    }, this);
                });

                it("aligns the tops of the labels", function() {
                    var firstTopY = topY(this.labels[0]);
                    _.each(this.labels, function(label) {
                        expect(topY(label)).toBeWithinDeltaOf(firstTopY, 6);
                    });
                });
            });
        });

        describe("with a numeric scale", function() {
            beforeEach(function() {
                this.minX = 1;
                this.maxX = 21;
            });

            context("with grid lines", function() {
                beforeEach(function() {
                    this.axis = new chorus.views.visualizations.XAxis({
                        el: this.el,
                        axisLabel: this.axisLabelValue,
                        scaleType: "numeric",
                        minValue: this.minX,
                        maxValue: this.maxX,
                        ticks: true,
                        paddingX: this.paddingX,
                        paddingY: this.paddingY,
                        hasGrids: true
                    });
                    this.axis.render();

                    this.axisLine = this.$el.find("line.axis");
                    this.ticks = this.$el.find("line.tick");
                    this.grids = this.$el.find("line.grid");
                    this.axisLabel = this.$el.find(".axis_label");
                    this.labels = this.$el.find(".label");
                    this.hasGridLines = true;
                });

                itHasAReasonableLayout();
                itDisplaysNumericalTicksCorrectly();
            });

            context("without grid lines", function() {
                beforeEach(function() {
                    this.axis = new chorus.views.visualizations.XAxis({
                        el: this.el,
                        axisLabel: this.axisLabelValue,
                        scaleType: "numeric",
                        minValue: this.minX,
                        maxValue: this.maxX,
                        ticks: true,
                        paddingX: this.paddingX,
                        paddingY: this.paddingY
                    });
                    this.axis.render();

                    this.axisLine = this.$el.find("line.axis");
                    this.ticks = this.$el.find("line.tick");
                    this.grids = this.$el.find("line.grid");
                    this.axisLabel = this.$el.find(".axis_label");
                    this.labels = this.$el.find(".label");
                    this.hasGridLines = false;
                });

                itHasAReasonableLayout();
                itDisplaysNumericalTicksCorrectly();
            });
        });

        describe("with a time scale", function() {
            beforeEach(function() {
                this.minX = "2012-01-01";
                this.maxX = "2012-11-01";
                this.hasGridLines = false;

                this.axis = new chorus.views.visualizations.XAxis({
                    el: this.el,
                    axisLabel: this.axisLabelValue,
                    scaleType: "time",
                    minValue: this.minX,
                    maxValue: this.maxX,
                    ticks: true,
                    paddingX: this.paddingX,
                    paddingY: this.paddingY,
                    hasGrids: this.hasGridLines,
                    timeType: "date",
                    timeFormat: d3.time.format("%Y-%m-%d")
                });
                this.axis.render();

                this.axisLine = this.$el.find("line.axis");
                this.ticks = this.$el.find("line.tick");
                this.grids = this.$el.find("line.grid");
                this.axisLabel = this.$el.find(".axis_label");
                this.labels = this.$el.find(".label");
            });

            it("generates 8-12 uniformly spaced ticks in the range of the label values (unless datetime)", function() {
                expect(this.ticks.length).toBeGreaterThan(5);
                expect(this.ticks.length).toBeLessThan(20);

                expect(this.ticks).toBeUniformlyHorizontallySpaced();
            });

            it("formats the labels correctly", function() {
                expect(this.labels[0].textContent).toBe("2012-01-01");
            });

            itHasAReasonableLayout();
        });
    });

    describe("YAxis", function() {
        function itHasAReasonableLayout() {
            describe("the axis label", function() {
                it("should have the correct text", function() {
                    expect(this.axisLabel).toHaveText(this.axisLabelValue);
                });

                it("should be centered along the axis", function() {
                    expect(centerY(this.axisLabel)).toBeWithinDeltaOf(centerY(this.axisLine), 5);
                });

                it("is to the left of the tick labels", function() {
                    expect(rightX(this.axisLabel)).toBeLessThan(leftX(this.labels[0]));
                });

                it("is oriented vertically", function() {
                    expect(height(this.axisLabel)).toBeGreaterThanOrEqualTo(width(this.axisLabel));
                });

                it("is inside the padding", function() {
                    var leftPaddingMinusBoundingBoxError = this.paddingX - 5;
                    expect(leftX(this.axisLabel)).toBeGreaterThanOrEqualTo(leftPaddingMinusBoundingBoxError);
                });
            });

            describe("the axis line", function() {
                it("is rendered to the chart", function() {
                    expect(this.axisLine).toExist();
                });

                it("is vertical", function() {
                    expect(this.axisLine).toBeVertical();
                });

                it("goes across the left side of the chart", function() {
                    expect(topY(this.axisLine)).toEqual(this.paddingY);
                    expect(bottomY(this.axisLine)).toEqual(this.height - this.paddingY);
                });
            });

            describe("the axis tick marks", function() {
                it("draws the ticks extending left from the main axis line", function() {
                    expect(rightX(this.ticks[0])).toEqual(leftX(this.axisLine));
                    expect(rightX(this.ticks[1])).toEqual(leftX(this.axisLine));
                    expect(rightX(this.ticks[2])).toEqual(leftX(this.axisLine));
                    expect(rightX(this.ticks[3])).toEqual(leftX(this.axisLine));
                    expect(rightX(this.ticks[4])).toEqual(leftX(this.axisLine));

                    expect(leftX(this.ticks[0])).toBeLessThan(leftX(this.axisLine));
                    expect(leftX(this.ticks[1])).toBeLessThan(leftX(this.axisLine));
                    expect(leftX(this.ticks[2])).toBeLessThan(leftX(this.axisLine));
                    expect(leftX(this.ticks[3])).toBeLessThan(leftX(this.axisLine));
                    expect(leftX(this.ticks[4])).toBeLessThan(leftX(this.axisLine));
                });

                it("draws the ticks in order from bottom to top", function() {
                    expect(topY(this.ticks[0])).toBeGreaterThan(topY(this.ticks[1]));
                    expect(topY(this.ticks[1])).toBeGreaterThan(topY(this.ticks[2]));
                    expect(topY(this.ticks[2])).toBeGreaterThan(topY(this.ticks[3]));
                    expect(topY(this.ticks[3])).toBeGreaterThan(topY(this.ticks[4]));
                });

            });

            describe("the tick labels", function() {
                it("places the labels to the left of the ticks", function() {
                    expect(rightX(this.labels[0])).toBeLessThan(leftX(this.ticks[0]));
                    expect(rightX(this.labels[1])).toBeLessThan(leftX(this.ticks[1]));
                    expect(rightX(this.labels[2])).toBeLessThan(leftX(this.ticks[2]));
                    expect(rightX(this.labels[3])).toBeLessThan(leftX(this.ticks[3]));
                    expect(rightX(this.labels[4])).toBeLessThan(leftX(this.ticks[4]));
                });

                it("draws the labels in order from bottom to top", function() {
                    expect(topY(this.labels[0])).toBeGreaterThan(topY(this.labels[1]));
                    expect(topY(this.labels[1])).toBeGreaterThan(topY(this.labels[2]));
                    expect(topY(this.labels[2])).toBeGreaterThan(topY(this.labels[3]));
                    expect(topY(this.labels[3])).toBeGreaterThan(topY(this.labels[4]));
                });

                it("centers each label on its corresponding tick mark", function() {
                    expect(centerY(this.labels[0])).toBeWithinDeltaOf(topY(this.ticks[0]), 5);
                    expect(centerY(this.labels[1])).toBeWithinDeltaOf(topY(this.ticks[1]), 5);
                    expect(centerY(this.labels[2])).toBeWithinDeltaOf(topY(this.ticks[2]), 5);
                    expect(centerY(this.labels[3])).toBeWithinDeltaOf(topY(this.ticks[3]), 5);
                    expect(centerY(this.labels[4])).toBeWithinDeltaOf(topY(this.ticks[4]), 5);
                });
            });

            describe("the placement of the axis group", function() {
                beforeEach(function() {
                    this.innerHeight = this.height - this.paddingY;
                });

                it("draws the axis line inside the padding", function() {
                    expect(leftX(this.axisLine)).toBeGreaterThanOrEqualTo(this.paddingX);
                });

                it("draws the ticks inside the padding", function() {
                    expect(leftX(this.ticks[0])).toBeGreaterThanOrEqualTo(this.paddingX);
                });

                it("draws the labels inside the padding", function() {
                    var paddingMinusBoundingBoxError = this.paddingX - 5;
                    expect(leftX(this.labels[0])).toBeGreaterThanOrEqualTo(paddingMinusBoundingBoxError);
                });
            });
        }

        describe("with an ordinal scale", function() {
            beforeEach(function() {
                this.labelValues = ['one', 'two', 'three', 'four', 'fivefivefivefivefivefive'];

                this.axis = new chorus.views.visualizations.YAxis({
                    el: this.el,
                    labels: this.labelValues,
                    axisLabel: this.axisLabelValue,
                    ticks: true,
                    paddingX: this.paddingX,
                    paddingY: this.paddingY
                });
                this.axis.render();

                this.axisLine = this.$el.find("line.axis");
                this.ticks = this.$el.find("line.tick");
                this.axisLabel = this.$el.find(".axis_label");
                this.labels = this.$el.find(".label");
            });

            describe("#requiredLeftSpace (used for drawing the x axis)", function() {
                beforeEach(function() {
                    this.actualWidth = leftX(this.axisLine) - this.paddingX;

                    this.newAxis = new chorus.views.visualizations.YAxis({
                        el: this.el,
                        labels: _.shuffle(this.labelValues),
                        axisLabel: this.axisLabelValue,
                        ticks: true,
                        paddingX: this.paddingX,
                        paddingY: this.paddingY
                    });
                });

                it("returns the horizontal space required for the labels and ticks", function() {
                    expect(this.newAxis.requiredLeftSpace()).toEqual(this.actualWidth);
                });

                it("does not alter the contents of the container", function() {
                    this.newAxis.requiredLeftSpace();
                    expect(this.$el.find(".label")).toEqual(this.labels);
                });
            });

            describe("#scale", function() {
                it("returns a scale function with the correct domain and range", function() {
                    var scale = this.axis.scale();
                    var s = (this.height - 2 * this.paddingY) / 5;
                    var innerHeight = this.height - this.paddingY;

                    _.each(this.labelValues, function(label, i) {
                        expect(scale(label)).toBe(innerHeight - i * s);
                    });
                });
            });

            it("does not interfere with other elements in the svg container", function() {
                this.$el.empty();

                this.otherTick = $("<line class='tick'></line>")
                    .attr("x1", 101)
                    .attr("x2", 102)
                    .attr("y1", 103)
                    .attr("y2", 104);
                this.otherLabel = $("<text class='label'></text>")
                    .attr("x", 201)
                    .attr("y", 203)
                    .text("other labels need to stay");
                this.otherAxisLine = $("<line class='axis'></line>")
                    .attr("x1", 301)
                    .attr("x2", 302)
                    .attr("y1", 303)
                    .attr("y2", 304);

                this.$el.append(this.otherTick);
                this.$el.append(this.otherLabel);
                this.$el.append(this.otherAxisLine);

                this.axis.render();

                expect(this.otherTick).toHaveAttr("x1", '101');
                expect(this.otherLabel).toHaveAttr("x", '201');
                expect(this.otherAxisLine).toHaveAttr("x1", '301');
            });

            itHasAReasonableLayout();

            it("includes a horizontal tick mark for each label", function() {
                expect(this.ticks.length).toBe(this.labelValues.length);

                _.each(this.ticks, function(tick) {
                    expect(tick).toBeHorizontal();
                });
            });

            it("renders each of the given labels and formats them", function() {
                expect(this.labels.length).toBe(this.labelValues.length);

                _.each(this.labels, function(label, i) {
                    expect($(label).text()).toBe(this.axis.labelFormat(this.labelValues[i].toString()));
                }, this);
            });

            it("divides the height of the chart evenly into bands, " +
                "and places each tick at the center of a band", function() {
                var bandHeight = (this.height - 2 * this.paddingY) / 5;
                var bandCenters = _.map([0, 1, 2, 3, 4], function(i) {
                    return this.height - this.paddingY - ((i + 0.5) * bandHeight);
                }, this);

                expect(topY(this.ticks[0])).toBeWithinDeltaOf(bandCenters[0], 10);
                expect(topY(this.ticks[1])).toBeWithinDeltaOf(bandCenters[1], 10);
                expect(topY(this.ticks[2])).toBeWithinDeltaOf(bandCenters[2], 10);
                expect(topY(this.ticks[3])).toBeWithinDeltaOf(bandCenters[3], 10);
                expect(topY(this.ticks[4])).toBeWithinDeltaOf(bandCenters[4], 10);
            });

            it("spaces the ticks evenly along the height of the chart area", function() {
                var ys = this.ticks.map(function(i, tick) { return topY(tick); });

                var distance = Math.abs(ys[1] - ys[0]);
                var innerHeight = this.height - (2 * this.paddingY);

                expect(Math.abs(ys[2] - ys[1])).toBeCloseTo(distance);
                expect(Math.abs(ys[3] - ys[2])).toBeCloseTo(distance);
                expect(Math.abs(ys[4] - ys[3])).toBeCloseTo(distance);

                expect(distance).toBeBetween(innerHeight / 6, innerHeight / 5);
            });
        });

        describe("with a numeric scale", function() {
            beforeEach(function() {
                this.labelValues = ['one', 'two', 'three', 'four', 'five'];

                this.minValue = 34;
                this.maxValue = 111;

                this.axis = new chorus.views.visualizations.YAxis({
                    el: this.el,
                    minValue: this.minValue,
                    maxValue: this.maxValue,
                    axisLabel: this.axisLabelValue,
                    ticks: true,
                    scaleType: "numeric",
                    paddingX: this.paddingX,
                    paddingY: this.paddingY
                });
                this.axis.render();

                this.axisLine = this.$el.find("line.axis");
                this.ticks = this.$el.find("line.tick");
                this.axisLabel = this.$el.find(".axis_label");
                this.labels = this.$el.find(".label");
            });

            itHasAReasonableLayout();
        });

        describe("with grid lines", function() {
            beforeEach(function() {
                this.labelValues = ['one', 'two', 'three', 'four', 'five'];

                this.axis = new chorus.views.visualizations.YAxis({
                    el: this.el,
                    labels: this.labelValues,
                    axisLabel: this.axisLabelValue,
                    ticks: true,
                    paddingX: this.paddingX,
                    paddingY: this.paddingY,
                    hasGrids: true
                });
                this.axis.render();

                this.axisLine = this.$el.find("line.axis");
                this.ticks = this.$el.find("line.tick");
                this.axisLabel = this.$el.find(".axis_label");
                this.labels = this.$el.find(".label");
                this.grids = this.$el.find("line.grid");
            });


            it("should draw a grid line for every tick mark", function() {
                expect(this.grids.length).toEqual(this.ticks.length);

                _.each(this.grids, function(grid, i) {
                    expect(grid).toBeHorizontal();
                    expect(centerY(grid)).toEqual(centerY(this.ticks[i]));
                }, this);
            });

            it("should draw grid lines extending horizontally across the chart", function() {
                _.each(this.grids, function(grid, i) {
                    expect(leftX(grid)).toEqual(leftX(this.axisLine));
                    expect(rightX(grid)).toBeCloseTo(this.width - this.paddingX);
                }, this);
            });
        });
    });

    describe("Axes", function() {
        beforeEach(function() {
            this.xLabelValues = ['one', 'two', 'three', 'four', 'five'];
            this.yLabelValues = ['january', 'february', 'march', 'april', 'may'];

            this.axes = new chorus.views.visualizations.Axes({
                el: this.el,
                ticks: true,
                xLabels: this.xLabelValues,
                yLabels: this.yLabelValues,
                paddingX: this.paddingX,
                paddingY: this.paddingY
            });

            this.axes.render();

            this.xAxisLine = this.$el.find("g.xaxis line.axis");
            this.yAxisLine = this.$el.find("g.yaxis line.axis");
            this.xTicks = this.$el.find("g.xaxis line.tick");
            this.xTicks = this.$el.find("g.yaxis line.tick");
            this.xLabels = this.$el.find("g.xaxis .label");
            this.yLabels = this.$el.find("g.yaxis .label");
        });

        describe("axis positioning", function() {
            it("positions the x and y axes so that they meet at the origin", function() {
                expect(leftX(this.xAxisLine)).toBeWithinDeltaOf(leftX(this.yAxisLine), 5);
                expect(bottomY(this.yAxisLine)).toBeWithinDeltaOf(bottomY(this.xAxisLine), 5);
            });

            it("keeps labels inside the padding", function() {
                expect(leftX(this.xLabels[0])).toBeGreaterThanOrEqualTo(this.paddingX);
                expect(leftX(this.xLabels[1])).toBeGreaterThanOrEqualTo(this.paddingX);
                expect(leftX(this.xLabels[2])).toBeGreaterThanOrEqualTo(this.paddingX);
                expect(leftX(this.xLabels[3])).toBeGreaterThanOrEqualTo(this.paddingX);
                expect(leftX(this.xLabels[4])).toBeGreaterThanOrEqualTo(this.paddingX);

                expect(bottomY(this.yLabels[0])).toBeLessThanOrEqualTo(this.height - this.paddingY);
                expect(bottomY(this.yLabels[1])).toBeLessThanOrEqualTo(this.height - this.paddingY);
                expect(bottomY(this.yLabels[2])).toBeLessThanOrEqualTo(this.height - this.paddingY);
                expect(bottomY(this.yLabels[3])).toBeLessThanOrEqualTo(this.height - this.paddingY);
                expect(bottomY(this.yLabels[4])).toBeLessThanOrEqualTo(this.height - this.paddingY);
            });
        });

        describe("#scales", function() {
            it("returns a scales hash", function() {
                var scales = this.axes.scales();
                expect(scales.x).toBeA("function");
                expect(scales.y).toBeA("function");

                expect(scales.x("three")).toEqual(this.axes.xAxis.scale()("three"));
                expect(scales.y("february")).toEqual(this.axes.yAxis.scale()("february"));
            });
        });

        it("passes the axis options through to the axis objects", function() {
            var timeFormat = d3.time.format("%H:%M:%S");

            var axes = new chorus.views.visualizations.Axes({
                el: this.el,
                xScaleType: "numeric",
                minXValue: 5,
                maxXValue: 15,
                yScaleType: "ordinal",
                yLabels: ["bucket 1", "bucket 2", "bucket 3"],
                paddingX: 30,
                paddingY: 10,
                timeType: "date",
                timeFormat: timeFormat
            });

            expect(axes.xAxis.scaleType).toBe("numeric");
            expect(axes.yAxis.scaleType).toBe("ordinal");
            expect(axes.xAxis.minValue).toBe(5);
            expect(axes.xAxis.maxValue).toBe(15);
            expect(axes.yAxis.labels()).toEqual(["bucket 1", "bucket 2", "bucket 3"]);
            expect(axes.xAxis.paddingX).toBe(30);
            expect(axes.xAxis.paddingY).toBe(10);
            expect(axes.xAxis.timeType).toBe("date");
            expect(axes.xAxis.timeFormat).toEqual(timeFormat);
        });

        it("has one label for a singular value domain", function() {
            var axis = new chorus.views.visualizations.YAxis({
                el: this.el,
                minValue: 1,
                maxValue: 1,
                scaleType: "numeric"
            });
            expect(axis.labels().length).toBe(1);
        });

        it("shows the visualization overlay string", function(){
            chorus.models.Config.instance().set("visualizationOverlayString", "arbitrary text");
            this.axes.render();
            expect(this.$el.find(".visualization_overlay_string")).toContainText("arbitrary text");
        });
    });
});
