describe("chorus.models.DatasetAnalyze", function() {
    beforeEach(function() {
        this.analyze = new chorus.models.DatasetAnalyze({
            tableId: 2234
        });
    });

    it("should have the correct url template", function() {
        expect(this.analyze.url()).toContain("/tables/2234/analyze");
    });
});