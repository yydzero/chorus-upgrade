chorus.views.PaginatedJoinTablesList = chorus.views.Base.extend({
    constructorName: "PaginatedJoinTablesList",

    templateName: "paginated_join_tables",

    subviews: {
        '.join_pagination': 'joinTablePaginator'
    },

    setup: function() {
        this.joinTablePaginator = new chorus.views.ListContentDetails({
            collection: this.collection,
            modelClass: "WorkspaceDataset",
            hideIfNoPagination: true
        });

        this.listenTo(this.collection, 'searched', this.render);
    },

    collectionModelContext: function(model) {
        return {
            columns: model.has("columns") && model.get("columns"),
            isView: model.metaType() === "view",
            iconUrl: model.iconUrl({ size: "icon" })
        };
    }
});
