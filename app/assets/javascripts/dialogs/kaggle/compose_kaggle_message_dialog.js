chorus.dialogs.ComposeKaggleMessage = chorus.dialogs.Base.extend({
    constructorName: "ComposeKaggleMessage",
    templateName: "kaggle/compose_kaggle_message_dialog",
    title: t("kaggle.compose.title"),
    persistent: true,

    events: {
        "click button.submit": 'save',
        "click .showMore": 'showMore',
        "click .showLess": 'showLess',
        "click .insert_dataset_schema": 'launchDatasetPickerDialog',
        "click a.close_errors": "clearServerErrors",
        "click button.cancel": "clearServerErrors"
    },

    postRender: function() {
        this.$(".more-info").qtip({
            content: ["<h1>", t('kaggle.compose.tooltip.title'), "</h1>",
                "<dl>",
                    "<dt>", t('kaggle.compose.tooltip.section_1.title'), "</dt><dd>", t('kaggle.compose.tooltip.section_1.description'), "</dd>",
                    "<dt>", t('kaggle.compose.tooltip.section_2.title'), "</dt><dd>", t('kaggle.compose.tooltip.section_2.description'), "</dd>",
                    "<dt>", t('kaggle.compose.tooltip.section_3.title'), "</dt><dd>", t('kaggle.compose.tooltip.section_3.description'), "</dd>",
                 "</dl>"].join(''),
            style: {
                classes: "tooltip-tips tooltip-modal",
                tip: {
                    def: false,
                    height: 5,
                    classes: 'hidden'
                }
            }
        });
    },

    setup: function(options) {
        this.recipients = options.collection;
        this.workspace = options.pageModel;
        this.maxRecipientCharacters = options.maxRecipientCharacters || 70;
        this.requiredDatasets = new chorus.RequiredResources();
        this.listenTo(this.model, "saveFailed", this.saveFailed);
        this.listenTo(this.model, "validationFailed", this.saveFailed);
        this._super('setup', arguments);
    },

    save: function (e) {
        e.preventDefault();
        this.$("button.submit").startLoading("kaggle.compose.saving");
        this.model.save({
            replyTo: this.$('input[name=replyTo]').val(),
            htmlBody: this.$('textarea[name=htmlBody]').val(),
            subject: this.$('input[name=subject]').val()
        });
    },

    clearServerErrors : function() {
        this.model.serverErrors = {};
    },

    additionalContext: function () {
        var combinedNames = this.combineNames(this.model.get("recipients").models);
        return {
            replyTo: chorus.session.user().get('email'),
            recipientNames: combinedNames,
            hasMoreRecipients: (combinedNames.full.length !== combinedNames.short.length)
        };
    },

    makeModel: function (options) {
        this.model = new chorus.models.KaggleMessage({
            recipients: options.collection
        });
        this.listenTo(this.model, "saved", this.saved);
    },

    combineNames: function(recipients){
        var maxChars = this.maxRecipientCharacters;
        var short = "";
        var moreCount = 0;
        var recipientNames = _.reduce(recipients, function(result, recipient) {
            var fullNamesList = result + recipient.get("fullName") + ", ";
            if(fullNamesList.length <= maxChars + 2) {
                short = fullNamesList;
            }
           else {
                moreCount += 1;
            }
            return fullNamesList;
        }, "");
        return ( { short: short.substring(0, short.length - 2),
           full: recipientNames.substring(0, recipientNames.length - 2),
           moreCount: moreCount } );
    },

    saved: function () {
        this.closeModal();
        chorus.toast("kaggle.compose.success.toast", {toastOpts: {type: "success"}});
    },

    showMore: function(e) {
        this.$('.kaggle_recipient.full').removeClass("hidden");
        this.$('.kaggle_recipient.short').addClass("hidden");
        return false;
    },

    showLess: function(e) {
        this.$('.kaggle_recipient.short').removeClass("hidden");
        this.$('.kaggle_recipient.full').addClass("hidden");
        return false;
    },

    launchDatasetPickerDialog: function(e) {
        e.preventDefault();
        if (!this.saving) {
            var datasetDialog = new chorus.dialogs.KaggleInsertDatasetSchema({
                workspaceId: this.workspace.get('id')
            });
            this.listenTo(datasetDialog, "datasets:selected", this.datasetsChosen);
            this.launchSubModal(datasetDialog);
        }
    },

    datasetsChosen: function(datasets){
        this.datasets = datasets;
        this.requiredDatasets.cleanUp();

        _.each(datasets, function (dataset) {
            var collection = dataset.columns();
            var statistic = dataset.statistics();

            this.listenTo(collection, 'loaded', this.columnsLoaded);
            this.listenTo(statistic, 'loaded', this.columnsLoaded);

            this.requiredDatasets.push(statistic);
            this.requiredDatasets.push(collection);
        }, this);

        _.each(datasets, function (dataset) {
            dataset.columns().fetchAll();
            dataset.statistics().fetch();
        });
    },

    columnsLoaded: function() {
        if (!this.requiredDatasets.allResponded()) {
            return;
        }

        var linebreak = "\n";
        var $message = this.$("textarea[name=htmlBody]");
        var message = $message.val() + linebreak + linebreak;

        _.each(this.datasets, function(dataset) {
            var statistic = "# of columns: " + dataset.columns().size() + ", # of rows: " + dataset.statistics().get("rows");
            var name = dataset.get("objectName");
            var title =  name + " " + statistic;
            message += (title + linebreak);

            _.each(dataset.columns().models, function(column) {
                var columnName = column.get("name");
                var columnType = column.get("typeClass");
                message += columnName + "  " + columnType + linebreak;
            }, this);
            message += linebreak;
        }, this);

        $message.val(message);
    }
});
