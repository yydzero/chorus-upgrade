describe("chorus.alerts.WorkfileDelete", function() {
    beforeEach(function() {
        this.alert = new chorus.alerts.WorkfileDelete({
            workspaceId: 10,
            workfileId: 100,
            workfileName: 'foo.sql'
        });
    });

    it("does not re-render when the model changes", function() {
        expect(this.alert.persistent).toBeTruthy();
    });

    it("has the correct title", function() {
        expect(this.alert.title).toBe(t("workfile.delete.title", {workfileTitle: "foo.sql"}));
    });

    it("has the correct text", function() {
        expect(this.alert.text).toBe(t("workfile.delete.text"));
    });

    describe("when the workfile deletion is successful", function() {
        beforeEach(function() {
            spyOn(chorus.router, "navigate");
            spyOnEvent($(document), "close.facebox");
            this.alert.model.trigger("destroy", this.alert.model);
        });

        it("navigates to the workfile list page", function() {
            expect(chorus.router.navigate).toHaveBeenCalledWith("#/workspaces/10/workfiles");
        });
    });
});
