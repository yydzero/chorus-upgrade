chorus.pages.WorkspaceIndexPage = chorus.pages.Base.extend({
    helpId: "workspaces",

    setup:function () {
        this.collection = new chorus.collections.WorkspaceSet();

        this.multiSelectSidebarMenu = new chorus.views.MultipleSelectionSidebarMenu({
            selectEvent: "workspace:checked",
            actionProvider: [{name: "edit_tags", target: chorus.dialogs.EditTags}]
        });

        this.mainContent = new chorus.views.MainContentList({
            modelClass:"Workspace",
            collection:this.collection,
            linkMenus:{
                type:{
                    title:t("filter.show"),
                    options:[
                        {data:"active", text:t("filter.active_workspaces")},
                        {data:"all", text:t("filter.all_workspaces")}
                    ],
                    event:"filter"
                }
            },
            contentDetailsOptions: { multiSelect: true }
        });

        this.buildPrimaryActions();
        this.sidebar = new chorus.views.WorkspaceListSidebar();
        this.subscribePageEvent("workspace:selected", this.setModel);

        this.mainContent.contentHeader.bind("choice:filter", this.choose, this);
        this.choose("active");
    },

    choose:function (choice) {
        this.collection.attributes.active = (choice === "active");
        this.collection.fetch();
    },

    setModel: function(workspace) {
        this.model = workspace;
    },

    buildPrimaryActions: function() {
        var actions = [{name: 'create_workspace', target: chorus.dialogs.WorkspaceNew}];
        this.primaryActionPanel = new chorus.views.PrimaryActionPanel({actions: actions});
    }
});