describe("chorus.alerts.ImportFailed", function() {
    beforeEach(function() {
        this.alert = new chorus.alerts.ImportFailed({ activityId: 123 });
    });

    describe("initialization", function() {
        it("should have the correct title", function() {
            expect(this.alert.title).toMatchTranslation("import.failed.alert.title");
        });

        it("fetches the task with the given id", function() {
            var task = new chorus.models.Activity({id: "123"});
            expect(task).toHaveBeenFetched();
        });

        it("declares the task as a required resource", function() {
            expect(this.alert.requiredResources.length).toBe(1);
            expect(this.alert.requiredResources.at(0)).toBeA(chorus.models.Activity);
            expect(this.alert.requiredResources.at(0).id).toBe(123);
        });

        context("when the error is an errors object", function() {
            describe("when the task is fetched", function() {
                beforeEach(function() {
                    this.server.lastFetch().succeed(backboneFixtures.activity.datasetImportFailedWithModelErrors());
                });

                it("renders the error details", function() {
                    var errorText = chorus.Mixins.ServerErrors.serverErrorMessages.call({serverErrors: {fields: this.alert.model.get("errorObjects")}});
                    expect(this.alert.$(".body").text()).toMatch(errorText);
                });
            });
        });

        context("when the error is a string", function() {
            describe("when the task is fetched", function() {
                beforeEach(function() {
                    this.server.lastFetch().succeed(new chorus.models.Activity({
                        errorMessage: "some error message"
                    }));
                });

                it("renders the error details", function() {
                    expect(this.alert.$(".body").text()).toMatch("some error message");
                });
            });
        });
    });
});
