chorus.views.UserShow = chorus.views.Base.extend({
    templateName:"user/show",

    additionalContext:function () {
        if (!this._fetchedWorkspaces) {
            this.model.workspaces().fetchAll();
            this._fetchedWorkspaces = true;
        }

        return {
            workspaces:this.model.workspaces(),
            department:this.model.get("dept"),
            imageUrl:this.model.fetchImageUrl()
        };
    }
});
