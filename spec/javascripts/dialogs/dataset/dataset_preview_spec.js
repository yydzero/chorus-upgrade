describe("chorus.dialogs.DatasetPreview", function() {
    beforeEach(function() {
        this.dataset = backboneFixtures.workspaceDataset.datasetTable();
        spyOn(chorus.views.ResultsConsole.prototype, 'execute').andCallThrough();
        spyOn(chorus.dialogs.DatasetPreview.prototype, "closeModal");
        this.view = new chorus.dialogs.DatasetPreview({
            pageModel: this.dataset
        });
        stubModals();
        this.view.launchModal();
    });

    it('should have a close link', function() {
        expect(this.view.$('.form_controls .cancel')).toContainTranslation("actions.close_window");
    });

    it("should pass the dataset to execute on the results console", function() {
        expect(this.view.resultsConsole.execute).toHaveBeenCalledWithSorta(this.dataset.preview(), ["checkId"]);
        expect(this.view.resultsConsole.el).toBe(this.view.$('.results_console').get(0));
    });

    it("puts the objectName in the title", function() {
        expect(this.view.$('.dialog_header h1')).toContainTranslation('dataset.data_preview_title', {name: this.dataset.get('objectName')});
    });

    it("sets the resultsConsole option 'showDownloadDialog' to true", function() {
        expect(this.view.resultsConsole.showDownloadDialog).toBeTruthy();
        expect(this.view.resultsConsole.dataset).toBe(this.dataset);
    });

    it("shows the resize area in the results console", function() {
        expect(this.view.resultsConsole.options.enableResize).toBeTruthy();
    });

    it("shows the expander in the results console", function() {
        expect(this.view.resultsConsole.options.enableExpander).toBeTruthy();
    });

    describe("event handling", function() {
        beforeEach(function() {
            spyOn(this.view.task, "cancel");
        });

        describe("action:closePreview", function() {
            beforeEach(function() {
                this.view.$("button.cancel").click();
            });

            it("dismisses the dialog", function() {
                expect(this.view.closeModal).toHaveBeenCalled();
            });

            it("cancels the task", function() {
                expect(this.view.task.cancel).toHaveBeenCalled();
            });
        });

        describe("closing the window any other way", function() {
            beforeEach(function() {
                this.view.modalClosed();
            });

            it("cancels the task", function() {
                expect(this.view.task.cancel).toHaveBeenCalled();
            });
        });
    });
});
