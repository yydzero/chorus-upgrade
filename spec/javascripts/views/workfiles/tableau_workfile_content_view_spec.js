describe("chorus.views.TableauWorkfileContent", function() {
    beforeEach(function() {
        this.model = backboneFixtures.workfile.tableau();
        this.view = new chorus.views.TableauWorkfileContent({ model : this.model });
    });
});
