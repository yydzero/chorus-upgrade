describe("chorus.dialogs.MemoNewDialog", function() {
    beforeEach(function() {
        unstubClEditor();
        loadConfig();
        this.model = new chorus.models.Note({
            entityType: 'workfile',
            entityId: 1,
            workspaceId: 22
        });

        this.dialog = new chorus.dialogs.MemoNew({
            allowWorkspaceAttachments: true,
            entityType: 'workfile',
            entityId: 1,
            pageModel : new chorus.models.Workfile(),
            model: this.model
        });
        $('#jasmine_content').append(this.dialog.el);
        this.fakeFileUpload = stubFileUpload();
        spyOn(this.dialog, "launchSubModal");
        spyOn(this.dialog, "makeEditor").andCallThrough();
        this.qtip = stubQtip();
        this.dialog.render();
    });

    afterEach(function() {
        //prevent submodal test pollution
        $(document).unbind("close.facebox");
    });

    it("does not re-render when the model changes", function() {
        expect(this.dialog.persistent).toBeTruthy();
    });

    describe("#render", function() {
        it("renders the body", function() {
            this.dialog.model.set({body : "cats"});
            this.dialog.render();
            expect(this.dialog.$("textarea[name=body]").val()).toBe("cats");
        });

        it("has the 'Show options' link", function() {
            expect(this.dialog.$('a.show_options').length).toBe(1);
            expect(this.dialog.$('a.show_options').text()).toMatchTranslation('notes.new_dialog.show_options');
        });

        it("should have a notification recipients subview", function() {
            expect(this.dialog.$(this.dialog.notifications.el)).toExist();
            expect(this.dialog.notifications).toBeA(chorus.views.NotificationRecipient);
        });

        it("has a 'Send Notifications To' link", function() {
            expect(this.dialog.$(".recipients_menu")).not.toHaveClass("hidden");
        });

        it("hides the notification content area by default", function() {
            expect(this.dialog.$(".notification_recipients")).toHaveClass("hidden");
        });

        it("makes a cl editor with toolbar", function() {
            // expect(this.dialog.makeEditor).toHaveBeenCalledWith($(this.dialog.el), ".toolbar", "body", { width : 'auto', height: 150, controls : 'bold italic | bullets numbering | link unlink' } );
            expect(this.dialog.makeEditor).toHaveBeenCalledWith($(this.dialog.el), "body", { width : 'auto', height: 200, controls : 'bold italic | bullets numbering | link unlink' } );
//             expect(this.dialog.$('.toolbar')).toExist();
        });

        describe("selecting recipients menu", function() {
            it("has 'Nobody' checked by default", function() {
                this.dialog.$("a.recipients_menu").click();
                expect(this.qtip.find("li:eq(0)")).toHaveClass("selected");
            });
        });

        describe("selecting recipients", function() {
            beforeEach(function() {
                this.dialog.onSelectRecipients("some");
                this.dialog.$("textarea[name=body]").val("blah");
            });

            it("should say 'Selected Recipients' in the link", function() {
                expect(this.dialog.$(".recipients_menu .chosen")).toContainTranslation("notification_recipient.some");
            });

            it("should display the notification content area", function() {
                expect(this.dialog.$(".notification_recipients")).not.toHaveClass("hidden");
            });

            context("with selected recipients", function() {
                beforeEach(function() {
                    spyOn(this.dialog.notifications, "getPickedUsers").andReturn(["1", "2"]);
                    this.dialog.save();
                });

                it("should include the recipients in the save request", function() {
                    expect(this.server.lastCreate().json()["note"]["recipients"]).toEqual(["1", "2"]);
                });
            });

            describe("selecting 'Nobody'", function() {
                beforeEach(function() {
                    this.dialog.onSelectRecipients("none");
                });

                it("should say 'Nobody' in the link", function() {
                    expect(this.dialog.$(".recipients_menu .chosen")).toContainTranslation("notification_recipient.none");
                });

                it("should hide the notification content area", function() {
                    expect(this.dialog.$(".notification_recipients")).toHaveClass("hidden");
                });

                context("with a selected user", function() {
                    beforeEach(function() {
                        spyOn(this.dialog.notifications, "getPickedUsers").andReturn(["1", "2"]);
                        this.dialog.save();
                    });

                    it("should not include the recipients in the save request", function() {
                        expect(this.server.lastCreate().params().recipients).toBeFalsy();
                    });
                });
            });
        });
    });

    describe("show_options", function() {
        it("shows the options area and hides the options_text when clicked", function() {
            expect(this.dialog.$('.options_area')).toBeHidden();
            expect(this.dialog.$('.options_text')).not.toHaveClass('hidden');
            this.dialog.$("a.show_options").click();
            expect(this.dialog.$('.options_text')).toBeHidden();
            expect(this.dialog.$('.options_area')).not.toHaveClass('hidden');
        });

        it("renders the attachment links when the allowWorkspaceAttachments option is truthy", function() {
            expect(this.dialog.$("a.add_workfile")).toExist();
            expect(this.dialog.$("a.add_dataset")).toExist();
        });

        it("doesn't render the attachment links when the allowWorkspaceAttachments option is falsy", function() {
            this.dialog.options.allowWorkspaceAttachments = false;
            this.dialog.render();
            expect(this.dialog.$("a.add_workfile")).not.toExist();
            expect(this.dialog.$("a.add_dataset")).not.toExist();
        });

        it("prevents default on click", function() {
            var eventSpy = jasmine.createSpyObj("event", ['preventDefault']);
            this.dialog.showOptions(eventSpy);
            expect(eventSpy.preventDefault).toHaveBeenCalled();
        });

        describe("> when the 'attach workfile' link is clicked", function() {
            beforeEach(function() {
                this.dialog.$('.show_options').click();
                this.modalSpy = stubModals();
                this.dialog.launchSubModal.andCallThrough();
                this.dialog.$("a.add_workfile").click();
            });

            it("> launches the workfile picker dialog", function() {
                expect(this.modalSpy).toHaveModal(chorus.dialogs.WorkfilesAttach);
                expect(this.modalSpy.lastModal().options.workspaceId).toBe(22);
            });

            describe("> when workfiles are selected", function() {
                beforeEach(function() {
                    this.workfile1 = backboneFixtures.workfile.sql({ id: 1, fileName: "greed.sql", fileType: "sql" });
                    this.workfile2 = backboneFixtures.workfile.text({ id: 2, fileName: "generosity.cpp", fileType: "cpp" });
                    this.workfile3 = backboneFixtures.workfile.binary({ id: 3, fileName: "sloth", fileType: "N/A" });

                    this.modalSpy.lastModal().trigger("files:selected", [this.workfile1, this.workfile2, this.workfile3]);
                });

                it("displays the names of the workfiles", function() {
                    var fileNames = this.dialog.$(".file_details .name");
                    expect(fileNames.eq(0).text()).toBe("greed.sql");
                    expect(fileNames.eq(1).text()).toBe("generosity.cpp");
                });

                it("displays the appropriate file icons", function() {
                    var fileIcons = this.dialog.$(".file_details img.icon");
                    expect(fileIcons.eq(0).attr("src")).toBe(chorus.urlHelpers.fileIconUrl("sql", "icon"));
                    expect(fileIcons.eq(1).attr("src")).toBe(chorus.urlHelpers.fileIconUrl("cpp", "icon"));
                    expect(fileIcons.eq(2).attr("src")).toBe(chorus.urlHelpers.fileIconUrl("plain", "icon"));
                });

                it("stores the collection", function() {
                    expect(this.dialog.model.workfiles.length).toBe(3);
                    expect(this.dialog.model.workfiles.at(0)).toBe(this.workfile1);
                    expect(this.dialog.model.workfiles.at(1)).toBe(this.workfile2);
                    expect(this.dialog.model.workfiles.at(2)).toBe(this.workfile3);
                });

                context("> when the 'attach workfile' link is clicked again", function() {
                    beforeEach(function() {
                        this.dialog.$(".add_workfile").click();
                    });

                    it("does not pre-select any of the workfiles", function() {
                        expect(this.modalSpy.lastModal().options.defaultSelection).toBeUndefined();
                    });

                    context("when additional workfiles are selected", function() {
                        beforeEach(function() {
                            this.newWorkfile1 = backboneFixtures.workfile.text({id: 4});
                            this.newWorkfile2 = backboneFixtures.workfile.text({id: 1});
                            this.modalSpy.lastModal().trigger("files:selected", [this.newWorkfile1, this.newWorkfile2]);
                        });

                        it("appends the new workfiles to the existing ones", function() {
                            expect(this.dialog.model.workfiles.length).toBe(4);
                            expect(this.dialog.model.workfiles.at(0)).toBe(this.workfile1);
                            expect(this.dialog.model.workfiles.at(1)).toBe(this.workfile2);
                            expect(this.dialog.model.workfiles.at(2)).toBe(this.workfile3);
                            expect(this.dialog.model.workfiles.at(3)).toBe(this.newWorkfile1);
                        });
                    });
                });

                describe("> when a workfile remove link is clicked", function() {
                    it("> removes only that workfile", function() {
                        var sqlRow = this.dialog.$(".file_details:not('.hidden'):contains('sql')");
                        var cppRow = this.dialog.$(".file_details:contains('cpp')");

                        expect(sqlRow).toExist();
                        expect(cppRow).toExist();

                        sqlRow.find(".remove").click();

                        sqlRow = this.dialog.$(".file_details:contains('sql')");
                        cppRow = this.dialog.$(".file_details:contains('cpp')");
                        expect(sqlRow).not.toExist();
                        expect(cppRow).toExist();
                    });

                    it("> removes only that workfile from the collection", function() {
                        var sqlRow = this.dialog.$(".file_details:contains('sql')");
                        sqlRow.find(".remove").click();
                        expect(this.dialog.model.workfiles.get("1")).toBeUndefined();
                        expect(this.dialog.model.workfiles.get("2")).not.toBeUndefined();
                    });

                    context("when a desktop file has already been chosen", function() {
                        beforeEach(function() {
                            this.uploadObj = jasmine.createSpyObj("uploadObj", ["submit"]);
                            this.dialog.model.uploadObj = this.uploadObj;
                        });

                        it("does not remove the desktop file", function() {
                            var sqlRow = this.dialog.$(".file_details:contains('sql')");
                            sqlRow.find(".remove").click();

                            expect(this.dialog.model.uploadObj).toBe(this.uploadObj);
                        });
                    });
                });
            });
        });

        describe("when the 'attach dataset' link is clicked", function() {
            beforeEach(function() {
                this.modalSpy = stubModals();
                this.dialog.$('.show_options').click();
                this.dialog.$("a.add_dataset").click();
            });

            it("launches the dataset picker dialog", function() {
                expect(this.modalSpy).toHaveModal(chorus.dialogs.DatasetsAttach);
                expect(this.modalSpy.lastModal().options.workspaceId).toBe(22);
            });

            describe("when datasets are selected", function() {
                beforeEach(function() {
                    this.datasets = [
                        backboneFixtures.workspaceDataset.datasetTable({objectName: 'table1', id: '1'}),
                        backboneFixtures.workspaceDataset.datasetTable({objectName: 'table2', id: '2'})
                    ];
                    this.modalSpy.lastModal().trigger("datasets:selected", this.datasets);
                });

                it("displays the names of the datasets", function() {
                    var datasetNames = this.dialog.$(".dataset_details .name");
                    expect(datasetNames.eq(0).text()).toBe("table1");
                    expect(datasetNames.eq(1).text()).toBe("table2");
                });

                it("displays the appropriate icons", function() {
                    var datasetIcons = this.dialog.$(".dataset_details img.icon");
                    expect(datasetIcons.eq(0).attr("src")).toBe(this.datasets[0].iconUrl({size: 'icon'}));
                });

                it("stores the collection", function() {
                    expect(this.dialog.model.datasets.length).toBe(2);
                    expect(this.dialog.model.datasets.at(0)).toBe(this.datasets[0]);
                    expect(this.dialog.model.datasets.at(1)).toBe(this.datasets[1]);
                });

                context("when the 'attach dataset' link is clicked again", function() {
                    beforeEach(function() {
                        this.dialog.$(".add_dataset").click();
                    });

                    it("does not pre-select any of the datasets", function() {
                        expect(this.modalSpy.lastModal().options.defaultSelection).toBeUndefined();
                    });

                    context("when additional datasets are selected", function() {
                        beforeEach(function() {
                            this.newDatasets = [
                                backboneFixtures.workspaceDataset.datasetTable({objectName: 'table1', id: '1'}),
                                backboneFixtures.workspaceDataset.datasetTable({objectName: 'table4', id: '4'})
                            ];
                            this.modalSpy.lastModal().trigger("datasets:selected", this.newDatasets);
                        });

                        it("appends the new datasets to the existing ones", function() {
                            expect(this.dialog.$(".dataset_details").length).toBe(3);
                            expect(this.dialog.model.datasets.at(0)).toBe(this.datasets[0]);
                            expect(this.dialog.model.datasets.at(1)).toBe(this.datasets[1]);
                            expect(this.dialog.model.datasets.at(2)).toBe(this.newDatasets[1]);
                        });
                    });
                });

                describe("when a dataset remove link is clicked", function() {
                    it("removes only that dataset", function() {
                        var table1Row = this.dialog.$(".dataset_details:contains('table1')");
                        var table2Row = this.dialog.$(".dataset_details:contains('table2')");

                        expect(table1Row).toExist();
                        expect(table2Row).toExist();

                        table2Row.find(".remove").click();

                        table1Row = this.dialog.$(".dataset_details:contains('table1')");
                        table2Row = this.dialog.$(".dataset_details:contains('table2')");
                        expect(table1Row).toExist();
                        expect(table2Row).not.toExist();
                    });

                    it("removes only that dataset from the collection", function() {
                        var table1Row = this.dialog.$(".dataset_details:contains('table1')");
                        table1Row.find(".remove").click();
                        expect(this.dialog.model.datasets.get("1")).toBeUndefined();
                        expect(this.dialog.model.datasets.get("2")).not.toBeUndefined();
                    });
                });
            });
        });

        context("when desktop files have been chosen", function() {
            beforeEach(function() {
                spyOn(this.dialog, "validateFileSize").andCallThrough();
                this.dialog.$('.show_options').click();
                this.dialog.$("a.show_options").click();
                this.fileList = [
                    {
                        name: 'foo.bar'
                    },
                    {
                        name: 'baz.sql'
                    }
                ];
                expect($.fn.fileupload).toHaveBeenCalled();
                expect($.fn.fileupload).toHaveBeenCalledOnSelector('input[type=file]');
                spyOn(this.dialog.model, 'addFileUpload').andCallThrough();
                this.request = jasmine.createSpyObj('request', ['abort']);
                _.each(this.fileList, _.bind(function(file) {
                    this.fakeFileUpload.add([file]);
                }, this));
            });

            it("validates the file size", function() {
                expect(this.dialog.validateFileSize).toHaveBeenCalled();
            });

            it("has a dataType of 'json'", function() {
                expect(this.fakeFileUpload.dataType).toBe('json');
            });

            it("uses updateProgressBar as a progress function", function() {
                expect(this.fakeFileUpload.progress).toBe(this.dialog.updateProgressBar);
            });

            it("points the dropzone to the file input to avoid insanity", function() {
                expect(this.fakeFileUpload.dropZone).toBe(this.dialog.$("input[type=file]"));
            });

            it("unhides the file_details area", function() {
                expect(this.dialog.$('.file_details')).not.toHaveClass('hidden');
            });

            it("displays the chosen filenames", function() {
                expect(this.dialog.$(".file_details .name:eq(0)").text()).toBe("foo.bar");
                expect(this.dialog.$(".file_details .name:eq(1)").text()).toBe("baz.sql");
            });

            it("displays the appropriate file icons", function() {
                expect(this.dialog.$(".file_details img.icon:eq(0)").attr("src")).toBe(chorus.urlHelpers.fileIconUrl("bar", "icon"));
                expect(this.dialog.$(".file_details img.icon:eq(1)").attr("src")).toBe(chorus.urlHelpers.fileIconUrl("sql", "icon"));
            });

            it("creates dependent commentFileUpload object for each upload", function() {
                expect(this.dialog.model.addFileUpload.calls.count()).toBe(this.fileList.length);
            });

            it("attaches the rendered file_details element to the file data element", function() {
                expect(this.dialog.model.files[0].data.fileDetailsElement.get(0)).toEqual(this.dialog.$('.file_details:eq(0)').get(0));
            });

            describe("updateProgressBar", function() {
                beforeEach(function() {
                    var data = {
                        fileDetailsElement: this.dialog.$('.file_details:eq(0)'),
                        total: 100,
                        loaded: 25
                    };
                    this.dialog.initProgressBars();
                    this.dialog.updateProgressBar("", data);
                });

                it("adjusts the visibility of the progress bar", function() {
                    var loadingBar = this.dialog.$('.file_details:eq(0) .progress_bar span');
                    expect(loadingBar.css('right')).toBe('75px');
                });

                context("when the upload has finished", function() {
                    beforeEach(function() {
                        var data = {
                            fileDetailsElement: this.dialog.$('.file_details:eq(0)'),
                            total: 100,
                            loaded: 100
                        };
                        this.dialog.updateProgressBar("", data);
                    });

                    it("shows upload_finished and hides the progress bar", function() {
                        var fileRow = this.dialog.$('.file_details:eq(0)');
                        expect(fileRow.find('.progress_bar')).toHaveClass('hidden');
                        expect(fileRow.find('.upload_finished')).not.toHaveClass('hidden');
                    });
                });
            });

            context("when a selected file is removed", function() {
                beforeEach(function() {
                    spyOn(this.dialog.model, 'removeFileUpload');
                    this.uploadModelToRemove = this.dialog.model.files[1];
                    this.dialog.$(".file_details .remove:eq(1)").click();
                });

                it("removes the file details", function() {
                    expect(this.dialog.$('.file_details').length).toBe(1);
                });

                it("removes the commentFileUpload from the model", function() {
                    expect(this.dialog.model.removeFileUpload).toHaveBeenCalledWith(this.uploadModelToRemove);
                });
            });

            describe("when a workfile is selected later", function() {
                beforeEach(function() {
                    this.workfiles = [
                        new chorus.models.Workfile({ id: 1, fileName: "greed.sql", fileType: "sql" }),
                        new chorus.models.Workfile({ id: 2, fileName: "generosity.cpp", fileType: "cpp" })
                    ];
                    this.dialog.workfileChosen(this.workfiles);
                });

                it("does not remove the desktop files from the view", function() {
                    expect(this.dialog.$(".file_details .name:eq(0)").text()).toBe("foo.bar");
                    expect(this.dialog.$(".file_details .name:eq(1)").text()).toBe("baz.sql");
                });

                describe("initProgressBars", function() {
                    context("with fileProgress support", function() {
                        beforeEach(function() {
                            chorus.features.fileProgress = true;
                            this.dialog.initProgressBars();
                        });
                        it("shows the progress bar for desktopfiles", function() {
                            this.dialog.$(".file_details.desktopfile").each(function() {
                                expect($(this).find('.progress_bar')).not.toHaveClass('hidden');
                                expect($(this).find('.progress_text')).toHaveClass('hidden');
                                expect($(this).find('.remove')).toHaveClass('hidden');
                                expect($(this).find('.upload_finished')).toHaveClass('hidden');
                            });
                        });

                        it("shows the upload_finished for workfiles", function() {
                            this.dialog.$(".file_details.workfile").each(function() {
                                expect($(this).find('.progress_bar')).toHaveClass('hidden');
                                expect($(this).find('.remove')).toHaveClass('hidden');
                                expect($(this).find('.upload_finished')).not.toHaveClass('hidden');
                            });
                        });
                    });
                    context("without fileProgress support", function() {
                        beforeEach(function() {
                            chorus.features.fileProgress = false;
                            this.dialog.initProgressBars();
                        });
                        afterEach(function() {
                            chorus.features.fileProgress = true;
                        });
                        it("shows the progress text for desktopfiles", function() {
                            this.dialog.$(".file_details.desktopfile").each(function() {
                                expect($(this).find('.progress_text')).not.toHaveClass('hidden');
                                expect($(this).find('.progress_bar')).toHaveClass('hidden');
                                expect($(this).find('.remove')).toHaveClass('hidden');
                                expect($(this).find('.upload_finished')).toHaveClass('hidden');
                            });
                        });
                    });

                });
            });

            describe("submit", function() {
                beforeEach(function() {
                    spyOn(this.dialog, "closeModal");
                    this.dialog.$("textarea[name=body]").val("The body of a note");
                    spyOnEvent(this.dialog.pageModel, "invalidated");
                    spyOn(this.dialog.model, 'saveFiles');
                    spyOn(this.dialog, 'initProgressBars').andCallThrough();
                    spyOn($.fn, "stopLoading").andCallThrough();
                    this.dialog.saving = true;
                });

                describe("when the model save succeeds", function() {
                    beforeEach(function() {
                        this.dialog.model.trigger("saved");
                    });

                    it("does triggers a file upload", function() {
                        expect(this.dialog.model.saveFiles).toHaveBeenCalled();
                    });

                    it("does trigger the progress bar initialization", function() {
                        expect(this.dialog.initProgressBars).toHaveBeenCalled();
                    });

                    context("when the file upload succeeds", function() {
                        beforeEach(function() {
                            this.dialog.model.trigger("fileUploadSuccess");
                        });

                        it("closes the dialog box", function() {
                            expect(this.dialog.closeModal).toHaveBeenCalled();
                        });

                        it("triggers the 'invalidated' event on the model", function() {
                            expect("invalidated").toHaveBeenTriggeredOn(this.dialog.pageModel);
                        });

                        it("removes the spinner from the button", function() {
                            expect($.fn.stopLoading).toHaveBeenCalledOnSelector("button.submit");
                        });
                    });

                    context("when the file upload fails", function() {
                        beforeEach(function() {
                            this.dialog.model.serverErrors = { fields: { contents_file_size: { LESS_THAN: { message: "file_size_exceeded", count: "5 MB"}}}};
                            this.dialog.model.trigger("fileUploadFailed");
                        });

                        it("does not close the dialog box", function() {
                            expect(this.dialog.closeModal).not.toHaveBeenCalled();
                        });

                        it("does not trigger the 'invalidated' event on the model", function() {
                            expect("invalidated").not.toHaveBeenTriggeredOn(this.dialog.pageModel);
                        });

                        it("displays the server errors on the model", function() {
                            expect(this.dialog.$('.errors')).toContainText("Contents file size must be less than 5 MB");
                        });

                        it("removes the spinner from the button", function() {
                            expect($.fn.stopLoading).toHaveBeenCalledOnSelector("button.submit");
                        });

                        it("displays the remove button and hides progress bar", function() {
                            this.dialog.$(".file_details").each(function() {
                                expect($(this).find('.progress_bar')).toHaveClass('hidden');
                                expect($(this).find('.upload_finished')).toHaveClass('hidden');
                                expect($(this).find('.remove')).not.toHaveClass('hidden');
                            });
                        });

                        it("enables the attachment_links", function() {
                            expect(this.dialog.$('.attachment_links')).not.toHaveClass('disabled');
                        });

                        it("enables the workfile attachment", function() {
                            this.dialog.$(".add_workfile").click();
                            expect(this.dialog.launchSubModal).toHaveBeenCalled();
                        });
                    });

                    context("when the file size exceeds the maximum allowed size", function() {
                        beforeEach(function() {
                            expect(chorus.models.Config.instance().get("fileSizesMbAttachment")*1024*1024).toBeLessThan(999999999999999999);
                            this.numFilesStart = this.dialog.model.files.length;
                            this.fileList = [
                                { name: 'foo Bar Baz.csv', size: 1 },
                                { name: 'foo Bar Baz2.csv', size: 999999999999999999 }
                            ];
                            var self = this;
                            _.each(this.fileList, function(file) {
                                self.fakeFileUpload.add([file]);
                            });
                        });

                        it("shows an error", function() {
                            expect(this.dialog.$('.errors')).toContainText("file exceeds");
                        });

                        it("does not add the file to model or UI", function() {
                            expect(this.dialog.model.files.length).toEqual(this.numFilesStart + 1);
                            expect(this.dialog.$(".row.desktopfile").length).toEqual(this.numFilesStart + 1);
                        });

                        it("removes the error when a valid file is then selected", function() {
                            this.fileList = [{ name: 'foo Bar Baz.csv', size: 10 * 1024 * 1024 - 1 }];
                            this.fakeFileUpload.add(this.fileList);
                            this.dialog.launchDesktopFileDialog();
                            this.dialog.desktopFileChosen({}, {files: this.fileList});
                            expect(this.dialog.$('.errors')).not.toContainText("file exceeds");
                            expect(this.dialog.$('button.submit')).toBeEnabled();
                        });
                    });

                    context("when the upload is cancelled by clicking 'cancel upload button'", function() {
                        beforeEach(function() {
                            _.each(this.dialog.model.files, function(fileModel) {
                                spyOn(fileModel, 'cancelUpload');
                            });
                            this.dialog.$('.cancel_upload').click();
                        });

                        it("calls cancelUpload on the file models", function() {
                            _.each(this.dialog.model.files, function(fileModel) {
                                expect(fileModel.cancelUpload).toHaveBeenCalled();
                            });
                        });
                    });

                    context("when the upload is cancelled by pressing escape key", function() {
                        beforeEach(function() {
                            spyOn(this.dialog, 'cancelUpload');
                            this.dialog.escapePressed();
                        });

                        it("calls cancelUpload on the file models", function() {
                            expect(this.dialog.cancelUpload).toHaveBeenCalled();
                        });
                    });
                });
                describe("when the model save fails", function() {
                    beforeEach(function() {
                        this.dialog.model.trigger("saveFailed");
                    });

                    it("does not close the dialog box", function() {
                        expect(this.dialog.closeModal).not.toHaveBeenCalled();
                    });

                    it("does not trigger the 'invalidated' event on the model", function() {
                        expect("invalidated").not.toHaveBeenTriggeredOn(this.dialog.pageModel);
                    });

                    it("removes the spinner from the button", function() {
                        expect($.fn.stopLoading).toHaveBeenCalledOnSelector("button.submit");
                    });

                    it("does not trigger a file upload", function() {
                        expect(this.dialog.model.saveFiles).not.toHaveBeenCalled();
                    });
                });

                describe("when the validation fails", function() {
                    beforeEach(function() {
                        this.dialog.$("textarea[name=body]").val("");
                        this.dialog.$('button.submit').click();
                    });

                    it("removes the spinner from the button", function() {
                        expect(this.dialog.$("button.submit").isLoading()).toBeFalsy();
                    });

                    it("shows the error at the correct position", function() {
                        expect(this.dialog.$(".cleditorMain")).toHaveClass("has_error");
                    });
                });
            });
        });
    });

    describe("submit", function() {
        beforeEach(function() {
            spyOn(this.dialog.model, "save").andCallThrough();
            spyOn(this.dialog, "closeModal");
            this.dialog.$("textarea[name=body]").val("The body of a note");
            this.dialog.notifications.pickedUsers = ['1', '2'];
            this.dialog.$("form").trigger("submit");
        });

        it("saves the data", function() {
            expect(this.dialog.model.get("body")).toBe("The body of a note");
            expect(this.dialog.model.get("workspaceId")).toBe(22);
            expect(this.dialog.model.save).toHaveBeenCalled();
        });

        it("starts a spinner", function() {
            expect(this.dialog.$("button.submit").isLoading()).toBeTruthy();
        });

        it("closes the dialog box if saved successfully", function() {
            this.dialog.model.trigger("saved");
            expect(this.dialog.closeModal).toHaveBeenCalled();
        });

        it("doesn't close the dialog box if it not saved successfully", function() {
            this.dialog.model.trigger("savedFailed");
            expect(this.dialog.closeModal).not.toHaveBeenCalled();
        });

        it("triggers the 'invalidated' event on the model", function() {
            spyOnEvent(this.dialog.pageModel, "invalidated");
            this.dialog.model.trigger("saved");
            expect("invalidated").toHaveBeenTriggeredOn(this.dialog.pageModel);
        });

        it("disables the attachment_links", function() {
            expect(this.dialog.$('.attachment_links')).toHaveClass('disabled');
        });

        it("prevents workfiles from being selected", function() {
            this.dialog.$(".add_workfile").click();
            expect(this.dialog.launchSubModal).not.toHaveBeenCalled();
        });

        it("prevents datasets from being selected", function() {
            this.dialog.$(".add_dataset").click();
            expect(this.dialog.launchSubModal).not.toHaveBeenCalled();
        });
    });

    describe("saveFailed", function() {
        beforeEach(function() {
            spyOn(this.dialog, 'showErrors');
            spyOn(this.dialog.model, 'destroy');
        });

        context("the model was saved", function() {
            beforeEach(function() {
                this.dialog.model.set({'id': _.uniqueId().toString()});
                this.dialog.saveFailed();
            });

            it("destroys the comment", function() {
                expect(this.dialog.model.destroy).toHaveBeenCalled();
            });

            it("clears the id", function() {
                expect(this.dialog.model.get('id')).toBeUndefined();
            });

            it("calls showErrors", function() {
                expect(this.dialog.showErrors).toHaveBeenCalled();
            });
        });

        context("the model was not saved", function() {
            beforeEach(function() {
                expect(this.dialog.model.get('id')).not.toBeDefined();
                this.dialog.saveFailed();
            });

            it("does not destroy the comment", function() {
                expect(this.dialog.model.destroy).not.toHaveBeenCalled();
            });

            it("calls showErrors", function() {
                expect(this.dialog.showErrors).toHaveBeenCalled();
            });
        });
    });

    describe("Cancel", function() {
        context("while uploading is going on", function() {
            beforeEach(function() {
                spyOn(this.dialog.model, 'saveFiles');
                this.dialog.model.files = [{}];
                this.dialog.modelSaved();
            });

            it("cancel should be replaced by cancel upload button", function() {
                expect(this.dialog.$('.form_controls .cancel')).toHaveClass('hidden');
                expect(this.dialog.$('.form_controls .cancel_upload')).not.toHaveClass('hidden');
            });

            context("when the upload has failed", function() {
                beforeEach(function() {
                    this.dialog.model.trigger('fileUploadFailed');
                });

                it("should hide the cancel upload button again", function() {
                    expect(this.dialog.$('.form_controls .cancel')).not.toHaveClass('hidden');
                    expect(this.dialog.$('.form_controls .cancel_upload')).toHaveClass('hidden');
                });

            });
        });
    });
});
