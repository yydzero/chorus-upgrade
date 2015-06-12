chorus.dialogs.KaggleInsertDatasetSchema = chorus.dialogs.DatasetsPicker.extend({
    title: t("kaggle.pick_datasets"),
    constructorName: "KaggleInsertDatasetSchemaPickerDialog",
    additionalClass: "with_sub_header pick_dataset_with_action",
    submitButtonTranslationKey: "kaggle.datasets_select",
    multiSelection: true,

    makeModel: function() {
        this._super("makeModel", arguments);
        this.collection = new chorus.collections.WorkspaceDatasetSet([], {
            workspaceId: this.options.workspaceId
        });
        this.collection.sortAsc("objectName");
        this.collection.fetch();
    }
});
