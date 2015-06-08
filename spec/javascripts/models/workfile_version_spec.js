describe("chorus.models.WorkfileVersion", function() {
    beforeEach(function() {
        this.model = backboneFixtures.workfileVersion({
            id: 1,
            versionInfo: {
                id: 123,
                versionNum: 2
            }
        });
    });

    describe("url", function() {
        it("has the right backend URL", function() {
            expect(this.model.url()).toBe("/workfiles/1/versions/123");
        });
    });

    describe("destroy", function() {
        it("notifies the page of workfile_version:deleted event", function() {
            spyOn(chorus.PageEvents, "trigger");
            this.model.destroy();
            this.server.completeDestroyFor(this.model);
            expect(chorus.PageEvents.trigger).toHaveBeenCalledWith("workfile_version:deleted", 2);
        });
    });
});
