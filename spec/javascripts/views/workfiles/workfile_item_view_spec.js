describe("chorus.views.WorkfileItem", function() {
    beforeEach(function() {
        this.model = backboneFixtures.workfile.sql({ id: "24" });
        this.view = new chorus.views.WorkfileItem({ model: this.model });
        this.view.render();
    });

    it("includes the data-id", function() {
        expect($(this.view.el).data("id")).toBe(24);
    });

    it("links the workfile's name to its show page", function() {
        expect(this.view.$("a.name")).toHaveText(this.model.get("fileName"));
        expect(this.view.$("a.name")).toHaveHref(this.model.showUrl());
    });

    it("includes the correct workfile icon (non-image)", function() {
        expect(this.view.$("img")).toHaveAttr("src", "/images/workfiles/large/sql.png");
    });

    context("when the workfile is a linked tableau workbook", function () {
        beforeEach(function () {
            this.model.set({fileType: 'tableau_workbook', workbookUrl: 'http://tableau/hi', workbookName: 'Hi'});
        });

        it("shows a link to the tableau workbook", function () {
            expect(this.view.$('a.tableau')).toHaveHref(this.model.get('workbookUrl'));
            expect(this.view.$('a.tableau')).toHaveText(this.model.get('workbookUrl'));
        });
    });

    itBehavesLike.ItPresentsModelWithTags();

    context("when the workfile has one comment", function() {
        beforeEach(function() {
            this.model.get("recentComments")[0].timestamp = "2012-11-08T18:06:51Z";
            this.view.render();
        });

        it("includes the most recent comment body", function() {
            expect(this.view.$(".comment .body")).toContainText(this.model.lastComment().get("body"));
        });

        it("includes the full name of the most recent commenter", function() {
            expect(this.view.$(".comment .user")).toHaveText(this.model.lastComment().author().displayName());
        });

        it("does not display the 'other comments' text", function() {
            expect(this.view.$(".comment")).not.toContainText(t("workfiles.other_comments", {count: 0}));
        });

        it("displays the abbreviated date of the most recent comment", function() {
            expect(this.view.$(".comment_info .on").text().trim()).toBe("Nov 8");
        });
    });

    context("when the workfile has more than one comment", function() {
        beforeEach(function() {
            this.model.set({ commentCount: 3 });
        });

        it("displays the 'other comments' text", function() {
            expect(this.view.$(".comment")).toContainText(t("workfiles.other_comments", { count: 2 }));
        });
    });

    context("when the workfile has no comments", function() {
        beforeEach(function() {
            this.model.unset("recentComments");
        });

        it("does not display the most recent comment", function() {
            expect(this.view.$(".comment")).not.toExist();
        });
    });

    describe("when the model received an 'invalidated' trigger", function() {
        beforeEach(function() {
            spyOn(this.model, "fetch");
        });

        it("reloads the model", function() {
            this.model.trigger("invalidated");
            expect(this.model.fetch).toHaveBeenCalled();
        });
    });
});
