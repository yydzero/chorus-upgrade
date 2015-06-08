chorus.pages.UserNewPage = chorus.pages.Base.extend({
    crumbs:[
        { label:t("breadcrumbs.users"), url:"#/users" },
        { label:t("breadcrumbs.new_user") }
    ],
    helpId: "user_new",

    setup:function () {
        this.model = new chorus.models.User();

        var content = (chorus.models.Config.instance().isExternalAuth()) ?
            new chorus.views.UserNewLdap({model: this.model}) : new chorus.views.UserNew({model: this.model});

        this.mainContent = new chorus.views.MainContentView({
            model:this.model,
            content: content,
            contentHeader:new chorus.views.StaticTemplate("default_content_header", {title:t("users.new_user")}),
        });
    }
});
