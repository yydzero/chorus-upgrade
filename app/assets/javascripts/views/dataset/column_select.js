chorus.views.ColumnSelect = chorus.views.Base.extend({
    constructorName: "ColumnSelectView",
    persistent: true,
    templateName: "column_select",

    events: {
        "change select": "columnSelected"
    },

    setup: function() {
        if(this.collection) {
            this.listenTo(this.collection, "join:added", this.render);
        }
    },

    postRender: function() {
        var selectEl = this.$("select");
        var showAliasedName = this.options.showAliasedName;
        _.defer(function() {
            chorus.styleSelect(selectEl, {format: function(text, option) {
                var aliasedName = $(option).data('aliasedName');
                if (aliasedName && showAliasedName) {
                    return '<span class="aliased_name"><span class="letter">' + aliasedName + '</span></span>' + text;
                } else {
                    return text;
                }
            } });
        });
    },

    collectionModelContext: function(model) {
        return {
            quotedName: (model.quotedName && model.quotedName()) || model.get('name'),
            disable: model.get("typeCategory") === "OTHER" && this.options.disableOtherTypeCategory,
            selected: model === this.selectedColumn
        };
    },

    getSelectedColumn: function() {
        var selectedCid = this.$('select option:selected').data('cid');
        return this.collection.get(selectedCid);
    },

    selectColumn: function(column) {
        if(column) {
            this.$("select option[data-cid="+column.cid+"]").prop('selected', true).change();
        } else {
            this.$("select option:eq(0)").prop('selected', true).change();
        }

        this.refresh();
    },

    refresh: function() {
        this.$('select').selectmenu();
        this.trigger("refresh"); // require otherwise it won't render the first filter comparator in kaggle filter view
    },

    columnSelected: function() {
        this.selectedColumn = this.getSelectedColumn();
        this.trigger("columnSelected", this.selectedColumn);
    },

    valid: function() {
        if(!this.selectedColumn) {
            return true;
        }
        return this.collection.include(this.selectedColumn);
    }
});
