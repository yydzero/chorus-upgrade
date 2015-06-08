describe("chorus.views.DashboardActivityStream", function() {
    beforeEach(function() {
        this.view = new chorus.views.DashboardActivityStream({content: "ActivityStream"});
        this.activities = new chorus.collections.ActivitySet([]);
    });

    describe("#setup", function() {
        it("fetches the activities", function() {
            expect(this.activities).toHaveBeenFetched();
        });

        it("does not re-fetch the activity list if a comment is added", function() {
            this.server.reset();
            chorus.PageEvents.trigger("comment:added", backboneFixtures.comment());
            expect(this.activities).not.toHaveBeenFetched();
        });

        it("does not re-fetch the activity list if a comment is deleted", function() {
            this.server.reset();
            chorus.PageEvents.trigger("comment:deleted", backboneFixtures.comment());
            expect(this.activities).not.toHaveBeenFetched();
        });
    });

    describe("the header", function() {
        beforeEach(function() {
            this.headerView = this.view.contentHeader;
        });

        it("is a DashboardModuleActivityListHeader view", function() {
            expect(this.headerView).toBeA(chorus.views.DashboardModuleActivityListHeader);
        });

        it("has the right title", function() {
            expect(this.headerView.options.allTitle).toMatchTranslation("dashboard.title.activity");
        });
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
        });

        it("has an activity list", function() {
            expect(this.view.$(".dashboard_activity_list")).toExist();
        });
    });
});
