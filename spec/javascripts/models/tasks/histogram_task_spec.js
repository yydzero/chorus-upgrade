describe("chorus.models.HistogramTask", function() {
    beforeEach(function() {
        this.model = new chorus.models.HistogramTask({
            bins: 5,
            xAxis: "height",
            dataset: backboneFixtures.workspaceDataset.datasetTable({objectName: "users"})
        });
    });

    it("has the right chart type parameter", function() {
        expect(this.model.get("type")).toBe("histogram");
    });

    it("extends ChartTask", function() {
        expect(this.model).toBeA(chorus.models.ChartTask);
    });

    describe("creating the task", function() {
        beforeEach(function() {
            this.model.save();
        });

        it("renames the 'xAxis' and 'bins' fields as required by the api", function() {
            var request = this.server.lastCreate();
            expect(request.json()['chart_task']['x_axis']).toBe("height");
            expect(request.json()['chart_task']['bins']).toBe(5);
        });
    });
});

