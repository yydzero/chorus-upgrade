describe("chorus.dialogs.WorkfileNewVersion", function() {
    beforeEach(function() {
        this.workfile = backboneFixtures.workfile.sql({
            id: 55,
            workspace: { id: 44 },
            versionInfo: { id: 4 },
            latestVersionId: 4
        });
        this.dialog = new chorus.dialogs.WorkfileNewVersion({ pageModel: this.workfile });
        this.dialog.render();
    });

    describe("#render", function() {
        it("has the right title based on the launch element", function() {
            expect(this.dialog.title).toMatchTranslation("workfile.new_version_dialog.title");
        });
    });

    describe("when the form is submitted", function() {
        beforeEach(function() {
            spyOn(Backbone.Model.prototype, "save").andCallThrough();
            this.workfile.set({"content": "new blood"});
            this.dialog.$("[name=commitMessage]").val('<script> "new commit" </script>');
            this.dialog.$("form").submit();
        });

        it("has Workfile as the model", function() {
            expect(this.dialog.model).toBeA(chorus.models.Workfile);
        });

        it("sets the escaped commit message on the model", function() {
            expect(this.dialog.model.get("commitMessage")).toContain('new commit');
            expect(this.dialog.model.get("commitMessage")).toContain('script');
            expect(this.dialog.model.get("commitMessage")).not.toContain('<script>');
        });

        it("saves the model with the fields from the form with the correct post url", function() {
            expect(Backbone.Model.prototype.save).toHaveBeenCalled();
            expect(this.server.lastCreate().url).toBe("/workfiles/55/versions");
        });

        it("sets a spinner", function() {
            expect(this.dialog.$("button.submit")).toContainTranslation("actions.saving");
            expect(this.dialog.$("button.submit").isLoading()).toBeTruthy();
        });

        describe("when the save completes", function() {
            beforeEach(function() {
                spyOn(this.dialog, 'closeModal');
                this.invalidatedSpy = jasmine.createSpy("invalidated");
                this.workfile.bind("invalidated", this.invalidatedSpy);
                this.dialog.model.trigger("saved");
            });

            it("closes the dialog", function() {
                expect(this.dialog.closeModal).toHaveBeenCalled();
            });

            it("invalidates the page model", function() {
                expect(this.invalidatedSpy).toHaveBeenCalled();
            });

            it("sets the versionNum and versionFileId to the page model", function() {
                this.dialog.model.set({ "versionNum": 1000, "versionFileId" : "ID1"});
                this.server.lastCreate().succeed(this.dialog.model);
                expect(this.dialog.pageModel.get("versionNum")).toBe(this.dialog.model.get("versionNum"));
                expect(this.dialog.pageModel.get("versionFileId")).toBe(this.dialog.model.get("versionFileId"));

            });
        });
    });
});
