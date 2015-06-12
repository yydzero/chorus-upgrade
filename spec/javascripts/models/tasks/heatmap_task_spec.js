describe("chorus.models.HeatmapTask", function() {
    beforeEach(function() {
        this.model = new chorus.models.HeatmapTask({
            xAxis: "age",
            yAxis: "height",
            xBins: 5,
            yBins: 6,
            dataset: backboneFixtures.workspaceDataset.datasetTable({objectName: "users"})
        });
    });

    it("extends ChartTask", function() {
        expect(this.model).toBeA(chorus.models.ChartTask);
    });

    it("has the right chart type parameter", function() {
        expect(this.model.get("type")).toBe("heatmap");
    });

    describe("column label translations", function() {
        it("provides translations for the column labels", function() {
            expect(this.model.getColumnLabel("x")).toMatchTranslation("dataset.visualization.heatmap.x");
            expect(this.model.getColumnLabel("y")).toMatchTranslation("dataset.visualization.heatmap.y");
            expect(this.model.getColumnLabel("value")).toMatchTranslation("dataset.visualization.heatmap.value");
            expect(this.model.getColumnLabel("xLabel")).toMatchTranslation("dataset.visualization.heatmap.xLabel");
            expect(this.model.getColumnLabel("yLabel")).toMatchTranslation("dataset.visualization.heatmap.yLabel");
        });

        it("provides reasonable defaults for missing keys", function() {
            expect(this.model.getColumnLabel("foo")).toBe("foo");
        });
    });
});

