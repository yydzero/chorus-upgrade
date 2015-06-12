chorus.views.Filter = chorus.views.Base.extend({
    templateName: "dataset_filter",
    constructorName: "FilterView",

    tagName: "li",
    persistent: true,

    subviews: {
        '.column_filter': 'columnFilter'
    },

    events: {
        "click .remove": "removeSelf",
        "change select.comparator": "comparatorSelected",
        "paste input.validatable": "updateInput",
        "keyup input.validatable": "updateInput",
        "blur input.validatable": "updateInput",
        "change select.validatable": "updateInputSelect"
    },

    setup: function() {
        this.columnFilter = new chorus.views.ColumnSelect({
            collection: this.collection,
            showAliasedName: this.options.showAliasedName,
            disableOtherTypeCategory: false
        });

        this.listenTo(this.columnFilter, "columnSelected", this.columnSelected);
        this.listenTo(this.collection, "remove", this.render);
    },

    postRender: function() {
        if (!this.collection.length) {
            return;
        }

        this.columnFilter.selectColumn(this.model.get("column"));
    },

    columnSelected: function() {
        var selectedColumn = this.columnFilter.getSelectedColumn();
        this.model.setColumn(selectedColumn);

        var $comparator = this.$("select.comparator");
        $comparator.empty();

        this.map = this.model.getFilterMap();
        var className = this.className.split("_")[0];

        _.each(this.map.comparators, function(value, key) {
            var el = $("<option/>").text(t(className + ".filter." + key)).attr("value", key);
            $comparator.append(el);
        }, this);

        _.defer(function() {
            chorus.styleSelect($comparator, {menuWidth: 240});
        });

        this.selectComparator();
    },

    removeSelf: function(e) {
        e && e.preventDefault();
        this.trigger("deleted");
    },

    comparatorSelected: function() {
        var comparatorName = this.$("select.comparator option:selected").val();
        this.model.setComparator(comparatorName);
        if (!this.map) { return; }

        var comparator = this.map.comparators[comparatorName];
        this.$(".filter.default").toggleClass("hidden", !comparator.usesInput);
        this.$(".filter.time").toggleClass("hidden", !comparator.usesTimeInput);
        this.$(".filter.date").toggleClass("hidden", !comparator.usesDateInput);
        this.$(".filter.select_type").toggleClass("hidden", !comparator.usesSelect);

        this.fillInput();
        this.validateInput();

        if(comparator.usesSelect) {
            this.updateInputSelect();
        }
    },

    selectComparator: function() {
        var name = this.model.get("comparator");
        if (name) {
            this.$("select.comparator option[value=" + name + "]").prop('selected', true).change();
        } else {
            this.$("select.comparator option:eq(0)").prop('selected', true).change();
        }
        this.$("select.comparator").selectmenu();
    },

    fillInput: function() {
        var comparator = this.map.comparators[this.model.get("comparator")];
        var $filters = this.filtersForComparator(comparator);
        var input = this.model.get("input");
        if (_.isEmpty($filters)) {
            return;
        }
        if (!input) {
            input = { value: '' };
        }

        if (this.model.get("column") && (this.model.get("column").get("typeCategory") === "DATE")) {
            $filters.find("input[name='day']").val(input.day);
            $filters.find("input[name='month']").val(input.month);
            $filters.find("input[name='year']").val(input.year);
        } else {
            $filters.eq(0).find("input").val(input.value);
        }
    },

    updateInput: function() {
        this.model.setInput(this.fieldValues());
        this.validateInput();
    },

    updateInputSelect:function () {
        this.model.setInput(this.fieldSelectValues());
        this.validateInput();
    },

    validateInput: function() {
        if (!this.map) { return; }
        if (this.map.performValidation(this.fieldValues())) {
            this.clearErrors();
        } else {
            this.showErrors(this.map);
        }
    },

    fieldValues: function() {
        return { value: this.$(".filter.default input").val() };
    },

    fieldSelectValues: function() {
        return { value: this.$(".filter.select_type select").val() };
    },

    filtersForComparator: function(comparator) {
        if (comparator.usesInput) {
            return this.$('.filter.default');
        }
        if (comparator.usesTimeInput) {
            return this.$('.filter.time');
        }
        if (comparator.usesDateInput) {
            return this.$('.filter.date');
        }
    }

});