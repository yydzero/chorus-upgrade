describe("chorus.views.visualizations.FrequencyView", function() {
    var width = chorus.svgHelpers.width,
        height = chorus.svgHelpers.height,
        topY = chorus.svgHelpers.topY,
        bottomY = chorus.svgHelpers.bottomY,
        centerY = chorus.svgHelpers.centerY;

    beforeEach(function() {
        var dataset = backboneFixtures.dataset();
        this.task = dataset.makeFrequencyTask({"bins": 3, "yAxis": "fruits"});
        this.task.save();
        this.server.lastCreate().succeed(backboneFixtures.frequencyTaskJson({response: {"bins": 3, "y_axis": "fruits"}}).response);

        this.view = new chorus.views.visualizations.Frequency({ model: this.task });
        window.addCompatibilityShimmedMatchers(chorus.svgHelpers.matchers);
    });

    describe("changing model", function() {
        it("does not cause render to be called", function() {
            spyOn(chorus.views.visualizations.Frequency.prototype, 'render');
            var task = backboneFixtures.dataset().makeFrequencyTask({"bins": 3, "yAxis": "fruits"});
            var view = new chorus.views.visualizations.Frequency({ model: task });

            task.set({rows: []});

            expect(view.render).not.toHaveBeenCalled();
        });
    });

    describe("#render", function() {
        beforeEach(function() {
            $("#jasmine_content").append(this.view.el);
            this.view.render();
            this.boxes = this.view.$("rect");
        });

        it("has the correct axis labels", function() {
            expect(this.view.$('.xaxis .axis_label').text()).toBe("count");
            expect(this.view.$('.yaxis .axis_label').text()).toBe("fruits");
        });

        describe("re-rendering", function() {
            beforeEach(function() {
                this.originalAttributes = JSON.parse(JSON.stringify(this.task.attributes));
                this.view.render();
            });

            it("does not create multiple charts", function() {
                expect(this.view.$("svg.chart").length).toBe(1);
            });

            it("does not mutate the model's attributes", function() {
                expect(this.task.attributes).toEqual(this.originalAttributes);
            });
        });

        describe("the frequency rectangles", function() {
            it("has one for each bucket", function() {
                expect(this.boxes.length).toBe(3);
            });

            it("draws them in order from top to bottom", function() {
                expect(this.boxes).toBeOrderedTopToBottom();
            });

            it("have the wider boxes at the top", function() {
                expect(width(this.boxes[2])).toBeGreaterThan(width(this.boxes[1]));
                expect(width(this.boxes[1])).toBeGreaterThan(width(this.boxes[0]));
            });

            it("have the same heights", function() {
                expect(height(this.boxes[2])).toEqual(height(this.boxes[1]));
                expect(height(this.boxes[1])).toEqual(height(this.boxes[0]));
            });

            it("draws them with some padding in between", function() {
                _.each(this.boxes, function(rect, i) {
                    if (i === 0) return;
                    expect(bottomY(rect)).toBeLessThan(topY(this.boxes[i - 1]) + 5);
                }, this);
            });

            it("centers the rectangles on the y axis ticks", function() {
                var yTicks = this.view.$(".yaxis .tick");
                _.each(this.boxes, function(rect, i) {
                    expect(centerY(rect)).toBeCloseTo(centerY(yTicks[i]), 1);
                }, this);
            });
        });

        it("draws vertical grid lines", function() {
            expect(this.view.$(".xaxis line.grid").length).toBeGreaterThan(1);
        });

        it("does not draw horizontal grid lines", function() {
            expect(this.view.$(".yaxis line.grid").length).toBe(0);
        });

        it("draws the grid lines after the rectangles", function() {
            var gridRect = this.view.$(".plot rect, line.grid");
            expect($(gridRect[0]).attr("class")).not.toBe("grid");
            expect($(gridRect[gridRect.length-1]).attr("class")).toBe("grid");
        });
    });
});
