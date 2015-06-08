chorus.models.Note = chorus.models.Activity.extend({
    constructorName: "Note",
    entityType: "note",

    urlTemplate:function (options) {
        if (options && options.isFile) {
            return "notes/{{id}}/attachments";
        } else {
            return "notes/{{id}}";
        }
    },

    declareValidations:function (newAttrs) {
        this.require('body', newAttrs);
    },

    attrToLabel:{
        "body":"notes.body"
    },

    initialize:function () {
        this._super('initialize', arguments);
        this.files = [];
    },

    addFileUpload:function (uploadModel) {
        this.files.push(uploadModel);
    },

    removeFileUpload:function (uploadModel) {
        this.files.splice(this.files.indexOf(uploadModel), 1);
    },

    uploadSuccess:function (file, response) {
        this.filesToBeSaved--;
        this.uploadComplete();
    },

    uploadFailed:function (file, e, response) {
        this.filesToBeSaved--;
        this.fileUploadErrors++;
        if (response === "abort") {
            this.message = this.message || t('notes.new_dialog.upload_cancelled');
            this.serverErrors = {fields: {file_upload: {GENERIC: {message: this.message}}}};
        } else {
            var errors = JSON.parse(e.responseText).errors;
            var count = errors.fields.contents_file_size.LESS_THAN.count;
            errors.fields.contents_file_size.LESS_THAN.count = count.split(" ")[0]/1024/1024 + " MB";
            this.serverErrors = errors;
            file.serverErrors = errors;
        }
        this.uploadComplete();
    },

    uploadComplete:function () {
        if (this.filesToBeSaved === 0) {
            if (this.fileUploadErrors > 0) {
                this.trigger('fileUploadFailed');
            } else {
                this.trigger('fileUploadSuccess');
            }
            this.trigger('fileUploadDone');
        }
    },

    saveFiles:function () {
        this.fileUploadErrors = 0;
        this.filesToBeSaved = this.files.length;
        _.each(this.files, function(file) {
            file.data.url = this.url({ isFile:true });
            file.data.submit()
                .done(_.bind(this.uploadSuccess, this, file))
                .fail(_.bind(this.uploadFailed, this, file));
        }, this);
    },
    beforeSave:function () {
        if (this.datasets) {
            this.set({ datasetIds:this.datasets.pluck('id') }, { silent:true });
        }
        if (this.workfiles) {
            this.set({ workfileIds:this.workfiles.pluck('id') }, { silent:true });
        }
    }
});