describe("chorus.dialogs.DataSourcePermissions", function() {
    // this shared example assumes that
    // - #launchSubModal is spied on
    // - this.newOwner is set
    function itLaunchesTheConfirmChangeOwnerDialog(options) {
        beforeEach(function() {
            expect(this.dialog.launchSubModal).toHaveBeenCalled();
            this.submodal = this.dialog.launchSubModal.lastCall().args[0];
        });

        it("launches the change owner confirmation dialog", function() {
            expect(this.submodal).toBeA(chorus.alerts.DataSourceChangedOwner);
        });

        it("passes the selected user to the confirmation dialog, as the model", function() {
            expect(this.submodal.model.get("id")).toBe(this.newOwner.get("id"));
            expect(this.submodal.model.displayName()).toBe(this.newOwner.displayName());
        });

        describe("confirming the new owner", function() {
            beforeEach(function() {
                expect(this.dialog.launchSubModal).toHaveBeenCalled();
                var submodal = this.dialog.launchSubModal.lastCall().args[0];
                spyOn(this.dialog.ownership, 'save').andCallThrough();
                submodal.trigger("confirmChangeOwner", this.newOwner);
            });

            it("saves the data source", function() {
                expect(this.dialog.ownership.save).toHaveBeenCalled();
            });

            describe("when the save succeeds", function() {
                beforeEach(function() {
                    spyOn(chorus, 'toast');
                    spyOn(this.dialog, 'closeModal').andCallThrough();
                    spyOnEvent(this.dataSource, 'invalidated');
                    this.dialog.ownership.trigger("saved");
                });

                it("shows a toast message", function() {
                    expect(chorus.toast).toHaveBeenCalledWith("data_sources.confirm_change_owner.toast", {displayName: this.newOwner.displayName(), toastOpts: {type: "success"}});
                });

                describe("after re-fetching the accounts", function() {
                    beforeEach(function() {
                        this.dataSourceAccount = backboneFixtures.dataSourceAccount({owner: { id: this.newOwner.get("id")}});
                        this.server.completeFetchFor(this.dialog.collection, [this.dataSourceAccount]);
                    });

                    it("closes the dialog", function() {
                        expect(this.dialog.closeModal).toHaveBeenCalled();
                    });

                    it("triggers the 'invalidated' event on the data source", function() {
                        expect('invalidated').toHaveBeenTriggeredOn(this.dataSource);
                    });

                    it("sets the owner id on the data source", function() {
                        expect(this.dataSource.get("owner").id).toBe(this.newOwner.get("id"));
                    });

                    it("can render the data source's shared db username", function() {
                        expect(this.dataSource.accountForOwner().get("dbUsername")).toBe(this.dataSourceAccount.get("dbUsername"));
                    });
                });
            });

            describe("when the save fails", function() {
                beforeEach(function() {
                    this.dialog.ownership.serverErrors = { fields: { a: { BLANK: {} } } };
                    this.dialog.ownership.trigger("saveFailed");
                });

                it("displays the server errors in the errors div", function() {
                    expect(this.dialog.$(".errors li").length).toBe(1);
                });
            });
        });
    }

    beforeEach(function() {
        spyOn(chorus, 'styleSelect');
        this.modalSpy = stubModals();
    });

    describe("#setup", function() {
        beforeEach(function() {
            spyOn(chorus.collections.UserSet.prototype, 'fetchAll');
            this.dataSource = backboneFixtures.gpdbDataSource({shared: true, id: "5"});
            this.dialog = new chorus.dialogs.DataSourcePermissions({ dataSource: this.dataSource });
        });

        it("does not re-render on model changes", function() {
            expect(this.dialog.persistent).toBeTruthy();
        });

        it("fetches all chorus users", function() {
            expect(this.dialog.users).toBeA(chorus.collections.UserSet);
            expect(this.dialog.users.fetchAll).toHaveBeenCalled();
        });
    });

    context('when the data source is a shared account', function() {
        beforeEach(function() {
            this.dataSource = backboneFixtures.gpdbDataSource({"shared":true});
            var account = backboneFixtures.dataSourceAccount({
                dbUsername: 'some_db_username',
                dataSourceId: this.dataSource.id
            });
            this.dataSource.set({ owner: {id: account.user().get("id"), firstName: "rabold", lastName: "glorp"} });
            this.dataSource.accounts().reset(account);

            this.dialog = new chorus.dialogs.DataSourcePermissions({ dataSource: this.dataSource });
        });

        describe("#render", function() {
            beforeEach(function() {
                this.dialog.launchModal();
            });

            it("does not autocomplete password inputs", function(){
                expect(this.dialog.$("input[type=password]")).toHaveAttr("autocomplete", "off");
            });

            it("displays the shared account subheader", function() {

                var subhead = this.dialog.$(".shared_accounts").text();
                expect(subhead).toMatchTranslation("data_sources.shared_account");
            });

            it("displays the account owner information", function() {
                var li = this.dialog.$("li");
                var sharedAccountUser = this.dataSource.accounts().at(0).user();
                expect(li).toExist();
                expect(li.find("img.profile")).toHaveAttr("src", sharedAccountUser.fetchImageUrl());
                expect(li.find(".name").text()).toBe(sharedAccountUser.displayName());
            });

            it("displays an edit link", function() {
                expect(this.dialog.$("a.edit")).toExist();
            });

            it("displays the change owner link", function() {
                expect(this.dialog.$("a.change_owner")).toExist();
            });

            describe("clicking the 'change owner' link", function() {
                beforeEach(function() {
                    this.dialog.$("a.change_owner").click();
                });

                it("shows the user select", function() {
                    expect(this.dialog.$("select.name")).toExist();
                    expect(this.dialog.$(".select_container")).not.toHaveClass("hidden");
                });

                it("hides the non-editable user name", function() {
                    expect(this.dialog.$("div.name")).toHaveClass("hidden");
                });

                describe("> when the user fetch completes", function() {
                    beforeEach(function() {
                        this.dialog.users.reset([
                            backboneFixtures.user({ firstName: "jim", lastName: "aardvark", id: '222' }),
                            this.dataSource.owner(),
                            backboneFixtures.user({ firstName: "harold", lastName: "four", id: '444' }),
                            backboneFixtures.user({ firstName: "suzie", lastName: "three", id: '333' }),
                            backboneFixtures.user({ firstName: "bob", lastName: "zzap", id: '111' })
                        ]);
                    });

                    it("includes every user's name  in the owner select", function() {
                        expect(this.dialog.$("select.name option").length).toBe(5);

                        expect(this.dialog.$("select.name option").eq(0)).toHaveText(this.dialog.users.get('222').displayName());
                        expect(this.dialog.$("select.name option").eq(1)).toHaveText(this.dataSource.owner().displayName());
                        expect(this.dialog.$("select.name option").eq(2)).toHaveText(this.dialog.users.get('444').displayName());
                        expect(this.dialog.$("select.name option").eq(3)).toHaveText(this.dialog.users.get('333').displayName());
                        expect(this.dialog.$("select.name option").eq(4)).toHaveText(this.dialog.users.get('111').displayName());
                    });

                    it("selects the current owner by default", function() {
                        expect(this.dialog.$("select.name").val()).toBe(this.dataSource.owner().get("id") + "");
                    });

                    it("displays the save owner options", function() {
                        expect(this.dialog.$("a.save_owner")).toExist();
                        expect(this.dialog.$("a.save_owner")).not.toHaveClass("hidden");
                    });

                    it("hides the 'edit' and 'change owner' links", function() {
                        expect(this.dialog.$("a.change_owner")).toHaveClass("hidden");
                        expect(this.dialog.$("a.edit")).toHaveClass("hidden");
                    });

                    it("hides the 'owner' text", function() {
                        expect(this.dialog.$("span.owner")).toHaveClass("hidden");
                    });

                    describe("clicking the cancel link", function() {
                        beforeEach(function() {
                            this.dialog.$("a.cancel_change_owner").click();
                        });

                        it("shows the 'edit' and 'change owner' links", function() {
                            expect(this.dialog.$("a.change_owner")).not.toHaveClass("hidden");
                            expect(this.dialog.$("a.edit")).not.toHaveClass("hidden");
                        });

                        it("shows the 'owner' text", function() {
                            expect(this.dialog.$("span.owner")).not.toHaveClass("hidden");
                        });
                    });

                    describe("choosing a new owner", function() {
                        beforeEach(function() {
                            spyOn(this.dialog, 'launchSubModal');
                            this.newOwner = this.dialog.users.get("222");
                            this.dialog.$("select.name").val("222");
                            this.dialog.$("a.save_owner").click();
                        });

                        itLaunchesTheConfirmChangeOwnerDialog();
                    });
                });
            });

            it("populates the dbUsername text field from the account map", function() {
                expect(this.dialog.$("input[name=dbUsername]").val()).toBe('some_db_username');
            });

            it("displays a 'switch to individual account' link", function() {
                expect(this.dialog.$("a.remove_shared_account").text().trim()).toMatchTranslation("data_sources.permissions_dialog.switch_to_individual");
            });

            context("clicking the switch to individual account link", function() {
                beforeEach(function() {
                    spyOn(this.dialog, "launchSubModal").andCallThrough();
                    this.dialog.$("a.remove_shared_account").click();
                });

                it("launches the Remove Shared Account dialog", function() {
                    expect(this.dialog.launchSubModal).toHaveBeenCalled();
                    expect(this.dialog.launchSubModal.nthCall(0).args[0] instanceof chorus.alerts.RemoveSharedAccount).toBeTruthy();
                });

                context("when the alert is confirmed", function() {
                    beforeEach(function() {
                        this.dialog.launchSubModal.nthCall(0).args[0].confirmAlert();
                    });

                    it("destroys the sharing", function() {
                        expect(this.server.lastDestroy().url).toBe("/data_sources/" + this.dataSource.id + "/sharing");
                    });

                    context("when the destroy succeeds", function() {
                        beforeEach(function() {
                            spyOn(chorus, 'toast');
                            spyOn(this.dialog, "postRender").andCallThrough();
                            expect(this.dialog.dataSource.isShared()).toBeTruthy();
                            this.server.lastDestroy().succeed();
                        });

                        it("displays a toast message", function() {
                            expect(chorus.toast).toHaveBeenCalledWith("data_sources.shared_account_removed.toast", {toastOpts: {type: "deletion"}});
                        });

                        it("clears shared account information from the data source model in the dialog", function() {
                            expect(this.dialog.dataSource.isShared()).toBeFalsy();
                        });

                        it("re-renders the dialog in the new individual account state", function() {
                            expect(this.dialog.postRender).toHaveBeenCalled();
                        });

                        context("if the user replaces the sharing", function() {
                            beforeEach(function() {
                                this.dialog.$("a.add_shared_account").click();
                                this.dialog.launchSubModal.nthCall(1).args[0].confirmAlert();
                            });

                            it("sends a create to the server", function() {
                                expect(this.server.lastCreate().url).toBe("/data_sources/" + this.dataSource.id + "/sharing");
                            });
                        });
                    });

                    context("when the destroy fails", function() {
                        beforeEach(function() {
                            spyOn(chorus, 'toast');
                            this.server.lastDestroy().failUnprocessableEntity({a: {BLANK: {}}});
                        });

                        it("displays a save failed toast message", function() {
                            expect(chorus.toast).toHaveBeenCalledWith("data_sources.shared_account_remove_failed.toast", {toastOpts: {type: "error"}});
                        });
                    });
                });
            });
        });
    });

    context('when the data source has individual accounts', function() {
        beforeEach(function() {
            spyOn(chorus.collections.UserSet.prototype, 'fetchAll').andCallThrough();
            this.owner = backboneFixtures.user({firstName: 'EDC', lastName: 'Admin'});
            this.dataSource = backboneFixtures.gpdbDataSource({owner: {
                id: this.owner.get("id"),
                username: this.owner.get("username"),
                firstName: this.owner.get("firstName"),
                lastName: this.owner.get("lastName")
            }
            });
            this.accounts = this.dataSource.accounts();
            this.accounts.add([
                backboneFixtures.dataSourceAccount({id: '1', dataSourceId: this.dataSource.id, owner: { firstName: "bob", lastName: "zzap", id: '111' } }),
                backboneFixtures.dataSourceAccount({id: '2', dataSourceId: this.dataSource.id, owner: { firstName: "jim", lastName: "aardvark", id: '222' } }),
                backboneFixtures.dataSourceAccount({id: '3', dataSourceId: this.dataSource.id, owner: this.owner.attributes })
            ]);
            this.dialog = new chorus.dialogs.DataSourcePermissions({ dataSource: this.dataSource });
            this.dialog.launchModal();

            var ownerAccountId = this.dataSource.accountForOwner().get('id');
            this.ownerLi = this.dialog.$("li[data-id=" + ownerAccountId + "]");
            this.otherLis = this.dialog.$(".collection_list li[data-id!=" + ownerAccountId + "]");

            $('#jasmine_content').append(this.dialog.el);
        });

        it("does not autocomplete password inputs", function(){
            expect(this.dialog.$("input[type=password]")).toHaveAttr("autocomplete", "off");
        });

        it("only shows 'owner' in the row corresponding to the owner", function() {
            expect(this.ownerLi).toContain("span.owner");
            expect(this.otherLis).not.toContain("span.owner");
        });

        it("does not have any 'change owner' links", function() {
            expect(this.dialog.$("li")).not.toContainTranslation("data_sources.permissions.change_owner");
        });

        it("only shows the 'make owner' links for users that aren't already the owner", function() {
            expect(this.ownerLi).not.toContain("a.make_owner");
            expect(_.all(this.otherLis, function(li) { return $(li).find("a.make_owner").length; })).toBeTruthy();
        });

        it("only shows the 'remove credentials' links for users that aren't already the owner", function() {
            expect(this.ownerLi).not.toContain("a.remove_credentials");
            expect(_.all(this.otherLis, function(li) { return $(li).find("a.remove_credentials").length; })).toBeTruthy();
        });

        it("does not display the 'switch to individual accounts' link", function() {
            expect(this.dialog.$("a.remove_shared_account")).not.toExist();
        });

        it("displays the 'switch to shared account' link", function() {
            expect(this.dialog.$("a.add_shared_account").text()).toMatchTranslation("data_sources.permissions_dialog.switch_to_shared");
        });

        it("shows the number of individual accounts", function() {
            expect(this.dialog.$(".sub_header .individual_accounts_count").text()).toMatchTranslation('data_sources.sidebar.x_individual_accounts', {count: 3});
        });

        it("shows the 'add an account' button", function() {
            expect(this.dialog.$(".sub_header button.add_account")).toExist();
        });

        it("displays the name of each account's user", function() {
            expect(this.dialog.$("li[data-id=1] .name")).toHaveText("bob zzap");
            expect(this.dialog.$("li[data-id=2] .name")).toHaveText("jim aardvark");
        });

        describe("editing a user's account credentials", function() {
            beforeEach(function() {
                this.accountBeingEdited = this.accounts.get(2);
                this.otherAccount = this.accounts.get(1);
                this.liBeingEdited = this.dialog.$("li[data-id=2]");
                this.otherLi = this.dialog.$("li[data-id=1]");
                this.liBeingEdited.find("a.edit").click();
                this.liBeingEdited.find("input[name=dbUsername]").val("jughead");
                this.liBeingEdited.find("input[name=dbPassword]").val("gogogo");
            });

            it("adds the 'editing' class to the parent li", function() {
                expect(this.liBeingEdited).toHaveClass("editing");
                expect(this.dialog.$('li.editing').length).toBe(1);
            });

            describe("saving the credentials with valid data", function() {
                beforeEach(function() {
                    spyOn(this.otherAccount, "save");
                    spyOn(this.accountBeingEdited, "save").andCallThrough();
                    this.liBeingEdited.find("a.save").click();
                });

                it("populates the account map from the form", function() {
                    expect(this.accountBeingEdited.get("dbUsername")).toBe("jughead");
                    expect(this.accountBeingEdited.get("dbPassword")).toBe("gogogo");
                });

                it("saves the acccount map", function() {
                    expect(this.accountBeingEdited.save).toHaveBeenCalled();
                    expect(this.otherAccount.save).not.toHaveBeenCalled();
                });

                it("shows a spinner", function() {
                    expect(this.liBeingEdited.find("a.save").isLoading()).toBeTruthy();
                    expect(this.otherLi.find("a.save").isLoading()).toBeFalsy();
                });

                describe("when the save succeeds", function() {
                    beforeEach(function() {
                        spyOn(this.dialog.dataSource, "fetch");
                        this.accountBeingEdited.trigger('saved');
                    });

                    it("removes the 'editing' class from the parent li", function() {
                        expect(this.dialog.$('li[data-id=2]')).not.toHaveClass("editing");
                    });

                    it("stops the spinner", function() {
                        expect(this.liBeingEdited.find("a.save").isLoading()).toBeFalsy();
                    });

                    it("re-fetches the data source", function() {
                        expect(this.dialog.dataSource.fetch).toHaveBeenCalled();
                    });
                });

                describe("> when the save fails", function() {
                    beforeEach(function() {
                        this.accountBeingEdited.serverErrors = { fields: { a: { BLANK: {} } } };
                        this.accountBeingEdited.trigger('saveFailed');
                    });

                    it("does not remove the 'editing' class from the parent li", function() {
                        expect(this.liBeingEdited).toHaveClass("editing");
                    });

                    it("> displays error messages", function() {
                        expect(this.dialog.$(".errors li:first-child").text().trim()).toBe("A can't be blank");
                    });

                    it("stops the spinner", function() {
                        expect(this.liBeingEdited.find("a.save").isLoading()).toBeFalsy();
                    });
                });

                describe("when validation fails", function() {
                    beforeEach(function() {
                        this.accountBeingEdited.trigger("validationFailed");
                    });

                    it("removes the spinner from the link", function() {
                        expect(this.liBeingEdited.find("a.save").isLoading()).toBeFalsy();
                    });
                });
            });

            describe("cancelling the credential editing", function() {
                beforeEach(function() {
                    spyOn(this.accountBeingEdited, "save");
                    this.liBeingEdited.find("a.cancel").click();
                });

                it("does not populate the account from the form", function() {
                    expect(this.accountBeingEdited.get("dbUsername")).not.toBe("jughead");
                    expect(this.accountBeingEdited.get("dbPassword")).not.toBe("gogogo");
                });

                it("does not save the account", function() {
                    expect(this.accountBeingEdited.save).not.toHaveBeenCalled();
                });

                it("removes the 'editing' class from the parent li", function() {
                    expect(this.liBeingEdited).not.toHaveClass("editing");
                });
            });

            describe("when clicking edit for another user", function() {
                beforeEach(function() {
                    spyOn(this.dialog, 'clearErrors');
                    this.otherLi.find('a.edit').click();
                });

                it("closes the first edit area while opening the new one", function() {
                    expect(this.liBeingEdited).not.toHaveClass('editing');
                    expect(this.otherLi).toHaveClass('editing');
                });

                it("clears the errors", function() {
                    expect(this.dialog.clearErrors).toHaveBeenCalled();
                });
            });
        });

        describe("removing a user's account credentials", function() {
            beforeEach(function() {
                this.dataSource.set({"name": "myDataSource"});
                this.accountBeingRemoved = this.accounts.get(2);
                this.otherAccount = this.accounts.get(1);
                this.liBeingRemoved = this.dialog.$("li[data-id=2]");
                this.otherLi = this.dialog.$("li[data-id=1]");
                spyOn(chorus, "toast");
                this.liBeingRemoved.find("a.remove_credentials").click();
            });

            it("should open a confirmation dialog", function() {
                expect(this.modalSpy).toHaveModal(chorus.alerts.RemoveIndividualAccount);
            });

            context("when removeIndividualAccount is triggered", function() {
                beforeEach(function() {
                    this.modalSpy.lastModal().trigger("removeIndividualAccount");
                });

                it("should call delete on the accounts", function() {
                    expect(this.server.lastDestroy().url).toBe("/data_sources/" + this.dataSource.get("id") + "/members/" + this.accountBeingRemoved.id);
                });

                context("when the delete succeeds", function() {
                    beforeEach(function() {
                        var destroy = this.server.lastDestroy();
                        this.server.reset();
                        destroy.succeed();
                    });

                    it("shows a toast message", function() {
                        expect(chorus.toast).toHaveBeenCalledWith("data_sources.remove_individual_account.toast", {
                            dataSourceName: "myDataSource",
                            userName: "jim aardvark"
                        });
                    });

                    it("refreshes the account list", function() {
                        expect(this.server.lastFetchFor(this.accounts)).toBeDefined();
                    });
                });

                context("when the delete fails", function() {
                    beforeEach(function() {
                        this.server.lastDestroy().failUnprocessableEntity({ fields: { a: { BLANK: {} } } });
                    });
                    it("displays the error", function() {
                        expect(this.dialog.$(".errors")).toContainText("A can't be blank");
                    });
                });
            });
        });

        describe("when the chorus users are fetched", function() {
            beforeEach(function() {
                this.dialog.users.reset([
                    backboneFixtures.user({ firstName: "jim", lastName: "aardvark", id: '222' }),
                    this.dataSource.owner(),
                    backboneFixtures.user({ firstName: "harold", lastName: "four", id: '444' }),
                    backboneFixtures.user({ firstName: "suzie", lastName: "three", id: '333' }),
                    backboneFixtures.user({ firstName: "bob", lastName: "zzap", id: '111' })
                ]);
            });

            describe("when a 'make owner' link is clicked", function() {
                beforeEach(function() {
                    spyOn(this.dialog, 'launchSubModal');
                    this.newOwner = this.dialog.users.get("222");
                    this.liForNewOwner = this.dialog.$("li[data-id=2]"); // account for user with id 222
                    this.liForNewOwner.find("a.make_owner").click();
                });

                itLaunchesTheConfirmChangeOwnerDialog();
            });

            describe("when the 'add account' button is clicked", function() {
                beforeEach(function() {
                    this.dialog.$("button.add_account").click();
                    this.newLi = this.dialog.$("li:last");
                });

                it("adds an option in the user select, sorted, for each chorus user who does not already have permissions", function() {
                    expect(this.dialog.$("select.name option").eq(0)).toHaveText(this.dialog.users.get('444').displayName());
                    expect(this.dialog.$("select.name option").eq(1)).toHaveText(this.dialog.users.get('333').displayName());
                    expect(this.dialog.$("select.name option").length).toBe(2);
                });

                it("shows the user select", function() {
                    expect(this.newLi.find(".select_container")).not.toHaveClass("hidden");
                });

                it("adds a new item to the accounts list", function() {
                    expect(this.dialog.$(".collection_list li").length).toBe(4);
                });

                it("puts the new item into edit mode", function() {
                    expect(this.newLi).toHaveClass("editing");
                });

                it("adds the 'new' class to the new li", function() {
                    expect(this.dialog.$("li:last")).toHaveClass("new");
                });

                it("does not reflect the user in the count at the top", function() {
                    expect(this.dialog.$('.individual_accounts_count')).toContainText(3);
                });

                it("disables the 'add account' button", function() {
                    expect(this.dialog.$("button.add_account")).toBeDisabled();
                    this.dialog.$("button.add_account").click();
                    expect(this.dialog.$(".collection_list li").length).toBe(4);
                });

                it("displays the image for the selected user", function() {
                    var selectedUser = this.dialog.users.get(this.dialog.$('li[data-id=new] select').val());
                    expect(this.dialog.$('li[data-id=new] img.profile').attr('src')).toBe(selectedUser.fetchImageUrl());
                });

                describe("selecting a new user", function() {
                    beforeEach(function() {
                        this.dialog.$('select').val('444');
                        this.dialog.$('select').trigger("change");
                    });

                    it("updates the image for that user", function() {
                        var selectedUser = this.dialog.users.get(this.dialog.$('li[data-id=new] select').val());
                        expect(this.dialog.$('li[data-id=new] img.profile').attr('src')).toBe(selectedUser.fetchImageUrl());
                    });
                });

                describe("cancelling the new account", function() {
                    beforeEach(function() {
                        this.dialog.$("li.new a.cancel").click();
                    });

                    it("enables the 'add account' button", function() {
                        expect(this.dialog.$("button.add_account")).not.toBeDisabled();
                    });

                    it("removes the new row", function() {
                        expect(this.dialog.$('.collection_list li').length).toBe(3);
                    });

                    it("removes the model from the collection", function() {
                        expect(this.dialog.collection.length).toBe(3);
                    });
                });

                describe("saving the new account", function() {
                    context("with errors", function() {
                        beforeEach(function() {
                            this.dialog.$('a.save').click();
                        });

                        it("shows errors", function() {
                            expect(this.dialog.$('input[name=dbUsername]')).toHaveClass('has_error');
                            expect(this.dialog.$('input[name=dbPassword]')).toHaveClass('has_error');
                        });
                    });

                    context("with valid form data", function() {
                        beforeEach(function() {
                            spyOn(this.dialog, "render").andCallThrough();
                            spyOn(this.dialog.account, "save").andCallThrough();
                            this.dialog.$('input[name=dbUsername]').val('badUser!');
                            this.dialog.$('input[name=dbPassword]').val('badPassword!');
                            this.dialog.$('li[data-id=new] input[name=dbUsername]').val('user!');
                            this.dialog.$('li[data-id=new] input[name=dbPassword]').val('password!');
                            this.dialog.$('li select').val('111');
                        });
                        context("clicking save", function() {
                            beforeEach(function() {
                                this.dialog.$('a.save').click();
                            });

                            it("saves the correct fields", function() {
                                expect(this.dialog.account.save).toHaveBeenCalledWith({
                                    ownerId: '444',
                                    dbUsername: 'user!',
                                    dbPassword: 'password!'
                                });
                            });

                            it("has the correct dataSourceId", function() {
                                expect(this.dialog.account.get('dataSourceId')).toBe(this.dialog.dataSource.get('id'));
                            });

                            it("has the selected ownerId", function() {
                                expect(this.dialog.account.get('ownerId')).toBe('444');
                            });

                            context("after the save returns successfully", function() {
                                beforeEach(function() {
                                    this.server.completeCreateFor(this.dialog.account);
                                });

                                it("re-renders the dialog", function() {
                                    expect(this.dialog.render).toHaveBeenCalled();
                                });
                            });

                            describe("when the save fails", function() {
                                beforeEach(function() {
                                    this.dialog.account.serverErrors = { fields: { a: { BLANK: {} } } };
                                    this.dialog.account.trigger("saveFailed");
                                });

                                it("only shows one copy of the server error", function() {
                                    expect(this.dialog.$(".errors li").length).toBe(1);
                                });
                            });
                        });

                        context("pressing enter", function() {
                            beforeEach(function() {
                                this.dialog.$('a.save').closest('form').submit();
                            });

                            it("saves the model", function() {
                                expect(this.dialog.account.save).toHaveBeenCalled();
                            });
                        });
                    });
                });

                describe("when clicking edit for another user", function() {
                    beforeEach(function() {
                        this.otherLi = this.dialog.$("li[data-id=1]");
                        this.otherLi.find('a.edit').click();
                    });
                    it("enables the 'add account' button", function() {
                        expect(this.dialog.$("button.add_account")).not.toBeDisabled();
                    });

                    it("removes the new row", function() {
                        expect(this.dialog.$('.collection_list li').length).toBe(3);
                    });

                    it("removes the model from the collection", function() {
                        expect(this.dialog.collection.length).toBe(3);
                    });
                });

                describe("when the modal is closed", function() {
                    beforeEach(function() {
                        this.dialog.modalClosed();
                    });

                    it("removes the new model from the collection", function() {
                        expect(this.dialog.collection.length).toBe(3);
                    });
                });
            });
        });

        describe("when the 'add account' button is clicked (before the users are fetched)", function() {
            beforeEach(function() {
                expect(this.dialog.$(".collection_list li").length).toBe(3);
                this.dialog.$("button.add_account").click();
            });

            describe("when the fetch for all chorus users completes", function() {
                beforeEach(function() {
                    this.dialog.users.reset([
                        backboneFixtures.user({ firstName: "<script>alert('hi')</script>", lastName: "cannon" }),
                        backboneFixtures.user({ firstName: "ben", lastName: "maulden" })
                    ]);
                });

                it("shows a select for each user with their names escaped", function() {
                    expect(this.dialog.$("select.name option").eq(0)).toHaveText(Handlebars.Utils.escapeExpression("<script>alert('hi')</script> cannon"));
                    expect(this.dialog.$("select.name option").eq(1)).toHaveText(Handlebars.Utils.escapeExpression("ben maulden"));
                });
            });
        });

        context("clicking the switch to shared account link", function() {
            beforeEach(function() {
                spyOn(this.dialog, "launchSubModal").andCallThrough();
                this.dialog.$("a.add_shared_account").click();
            });

            it("launches the Add Shared Account dialog", function() {
                expect(this.dialog.launchSubModal).toHaveBeenCalled();
                expect(this.dialog.launchSubModal.nthCall(0).args[0] instanceof chorus.alerts.AddSharedAccount).toBeTruthy();
            });

            context("when the alert is confirmed", function() {
                beforeEach(function() {
                    this.dialog.launchSubModal.nthCall(0).args[0].confirmAlert();
                });

                it("asks the server to add sharing", function() {
                    expect(this.server.lastCreate().url).toBe("/data_sources/" + this.dataSource.id + "/sharing");
                });

                context("when the create succeeds", function() {
                    beforeEach(function() {
                        spyOn(chorus, 'toast');
                        spyOn(this.dialog, "populateOwnerSelect").andCallThrough();
                        spyOn(this.dialog.collection, "fetch");
                        this.otherSavedSpy = jasmine.createSpy();
                        spyOn(this.dialog, "postRender").andCallThrough();
                        this.dataSource.sharing().bind("saved", this.otherSavedSpy);
                        expect(this.dialog.dataSource.isShared()).toBeFalsy();
                        this.server.lastCreate().succeed();
                    });

                    it("displays a toast message", function() {
                        expect(chorus.toast).toHaveBeenCalledWith("data_sources.shared_account_added.toast", {toastOpts: {type: "success"}});
                        expect(this.otherSavedSpy).toHaveBeenCalled();
                    });

                    it("clears shared account information from the data source", function() {
                        expect(this.dialog.dataSource.isShared()).toBeTruthy();
                    });

                    it("re-renders the dialog in the new individual account state", function() {
                        expect(this.dialog.postRender).toHaveBeenCalled();
                    });

                    it("should populate the Owner Select", function () {
                        expect(this.dialog.populateOwnerSelect).toHaveBeenCalled();
                    });

                    it("should re-fetch the data source accounts", function() {
                        expect(this.dialog.collection.fetch).toHaveBeenCalled();
                    });

                    context("then clicking on the change owner link", function () {
                        beforeEach(function () {
                            this.dialog.$(".change_owner").click();
                        });

                        it("should populates the select options", function () {
                            expect(this.dialog.$("select.name").length).toBeGreaterThan(0);
                        });
                    });

                    context("and the same model saves again", function() {
                        it("doesn't display a toast message", function() {
                            chorus.toast.reset();
                            this.otherSavedSpy.reset();
                            this.dataSource.sharing().trigger("saved");

                            expect(chorus.toast).not.toHaveBeenCalled();
                            expect(this.otherSavedSpy).toHaveBeenCalled();
                        });
                    });
                });

                context("when the create fails", function() {
                    beforeEach(function() {
                        spyOn(chorus, 'toast');
                        this.server.lastCreate().failUnprocessableEntity({a: {BLANK: {}}});
                    });

                    it("displays a save failed toast message", function() {
                        expect(chorus.toast).toHaveBeenCalledWith("data_sources.shared_account_add_failed.toast", {toastOpts: {type: "error"}});
                    });

                    context("and then a save succeeds", function() {
                        beforeEach(function() {
                            chorus.toast.reset();
                            this.dataSource.trigger("saved");
                        });

                        it("doesn't display the saved toast message", function() {
                            expect(chorus.toast).not.toHaveBeenCalledWith("data_sources.shared_account_added.toast", {toastOpts: {type: "success"}});
                        });
                    });
                });
            });
        });
    });
});
