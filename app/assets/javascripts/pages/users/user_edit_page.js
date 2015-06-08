chorus.pages.UserEditPage = chorus.pages.Base.extend({
    helpId: "user_edit",

    crumbs: function() {
        return [
            { label: t("breadcrumbs.users"), url: "#/users" },
            { label: t("breadcrumbs.user_profile"), url: this.model.showUrl() },
            { label: t("breadcrumbs.user_edit") }
        ];
    },

    setup: function(userId) {
        this.model = new chorus.models.User({id: userId});
        this.model.fetch();
        this.handleFetchErrorsFor(this.model);

        this.mainContent = new chorus.views.MainContentView({
            model: this.model,
            content: new chorus.views.UserEdit({model: this.model}),
            contentHeader: new chorus.views.DisplayNameHeader({ model: this.model }),
        });

        this.sidebar = new chorus.views.UserSidebar({ model: this.model, editMode: true });

        this.breadcrumbs.requiredResources.add(this.model);
    }
});
