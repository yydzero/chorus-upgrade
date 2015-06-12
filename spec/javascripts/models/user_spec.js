describe("chorus.models.User", function() {
    beforeEach(function() {
        chorus.models.Config.instance().set({fileSizesMbUserIcon: 3});
        this.model = new chorus.models.User();
    });

    it("has the correct showUrlTemplate", function() {
        expect(this.model.showUrlTemplate).toBe("users/{{id}}");
    });

    it("has the correct urlTemplate", function() {
        expect(this.model.urlTemplate).toBe("users/{{id}}");
    });

    it("has the correct entityType", function() {
        expect(this.model.entityType).toBe("user");
    });

    describe("#currentUserCanEdit", function() {
        beforeEach(function() {
            this.model.set({ username: "chris" });
        });

        it("returns true if the current user is an admin", function() {
            setLoggedInUser({ admin: true, username: "fog" });
            expect(this.model.currentUserCanEdit()).toBeTruthy();
        });

        it("returns true if the current user is the same user", function() {
            setLoggedInUser({ admin: false, username: "chris" });
            expect(this.model.currentUserCanEdit()).toBeTruthy();
        });

        it("returns false otherwise", function() {
            setLoggedInUser({ admin: false, username: "joe" });
            expect(this.model.currentUserCanEdit()).toBeFalsy();
        });
    });

    describe("#currentUserCanDelete", function() {
        beforeEach(function() {
            this.model.set({ username: "chris" });
        });

        it("returns true if the current user is an admin and not the same user", function() {
            setLoggedInUser({ admin: true, username: "fog" });
            expect(this.model.currentUserCanDelete()).toBeTruthy();
        });

        it("returns false if the current user is admin and the same user", function() {
            setLoggedInUser({ admin: true, username: "chris" });
            expect(this.model.currentUserCanDelete()).toBeFalsy();
        });

        it("returns false otherwise", function() {
            setLoggedInUser({ admin: false, username: "joe" });
            expect(this.model.currentUserCanDelete()).toBeFalsy();
        });
    });

    describe("#workspaces", function() {
        beforeEach(function() {
            this.user = backboneFixtures.user({username: "dr_charlzz", id: "457"});
            this.workspaces = this.user.workspaces();
        });

        it("returns an instance of WorkspaceSet", function() {
            expect(this.workspaces instanceof chorus.collections.WorkspaceSet).toBeTruthy();
        });

        it("returns the same instance every time", function() {
            expect(this.user.workspaces()).toBe(this.workspaces);
        });

        context("when the workspaces instance raises its reset event", function() {
            it("raises the changed event on the user instance", function() {
                spyOnEvent(this.user, "change");
                this.workspaces.trigger("reset");
                expect("change").toHaveBeenTriggeredOn(this.user);
            });

            it("only fires the change event once, even if the method was called multiple times", function() {
                this.user.workspaces();
                this.user.workspaces();
                var spy = jasmine.createSpy("changeHandler");
                this.user.bind("change", spy);
                this.workspaces.trigger("reset");
                expect(spy.calls.count()).toBe(1);
            });
        });

        context("when fetched", function() {
            beforeEach(function() {
                this.workspaces.fetch();
            });

            it("hits the right url for that user", function() {
                var expectedUrl = "/workspaces/?user_id=457&page=1&per_page=50";
                expect(this.server.requests[0].url).toBe(expectedUrl);
            });
        });
    });

    describe("#activeWorkspaces", function() {
        beforeEach(function() {
            this.user = backboneFixtures.user({username: "dr_charlzz", id: "457"});
            this.workspaces = this.user.activeWorkspaces();
        });

        it("returns an instance of WorkspaceSet", function() {
            expect(this.workspaces instanceof chorus.collections.WorkspaceSet).toBeTruthy();
        });

        it("returns the same instance every time", function() {
            expect(this.user.activeWorkspaces()).toBe(this.workspaces);
        });

        context("when fetched", function() {
            beforeEach(function() {
                this.workspaces.fetch();
            });

            it("hits the right url for that user", function() {
                var expectedUrl = "/workspaces/?user_id=457&page=1&per_page=50&active=true";
                expect(this.server.requests[0].url).toMatchUrl(expectedUrl);
            });
        });
    });

    describe("#destroy", function() {
        it("should make a delete request", function() {
            //testing that the idAttribute is set properly
            this.model.set({ id: "27" });
            this.model.destroy();
            expect(this.server.requests[0].url).toBe(this.model.url());
        });
    });

    describe("validation", function() {
        beforeEach(function() {
            spyOn(this.model, "require").andCallThrough();
            spyOn(this.model, "requirePattern").andCallThrough();
            spyOn(this.model, "requireConfirmation").andCallThrough();
        });

        it("should return a truthy value for a valid user", function() {
            var model = backboneFixtures.user();
            model.set({ password: "foo", passwordConfirmation: "foo" });
            expect(model.performValidation()).toBeTruthy();
        });

        _.each(["firstName", "lastName", "username", "password"], function(attr) {
            it("requires " + attr, function() {
                this.model.performValidation();
                expect(this.model.require).toHaveBeenCalledWith(attr, undefined);
            });
        });

        it("requires email", function() {
            this.model.performValidation();
            expect(this.model.requirePattern).toHaveBeenCalledWith("email", /[\w\.\-]+(\+[\w\-]*)?@([\w\-]+\.)+[\w\-]+/, undefined, undefined);
        });

        context("when the user is new", function() {
            beforeEach(function() {
                this.model = new chorus.models.User({
                    firstName: "bob",
                    lastName: "jenkins",
                    username: "bobjenk",
                    email: "bobj@raisetheroof.us"
                });
            });

            context("when there is a password confirmation", function() {
                it("returns true", function() {
                    this.model.set({ password: "secret", passwordConfirmation: "secret" });
                    expect(this.model.performValidation()).toBeTruthy();
                });
            });

            context("when there is no password confirmation", function() {
                it("returns false", function() {
                    this.model.set({ password: "secret" });
                    expect(this.model.performValidation()).toBeFalsy();
                });
            });
        });

        context("when the user is in LDAP", function() {
            beforeEach(function() {
                this.model = backboneFixtures.user({
                    firstName: "bob",
                    lastName: "jenkins",
                    username: "bobjenk",
                    email: "bobj@raisetheroof.us"
                });
                this.model.ldap = true;
            });

            it("does not require the password", function() {
                expect(this.model.performValidation()).toBeTruthy();
            });

            it("does still require the other stuff", function() {
                this.model.set({
                    firstName: null,
                    lastName: "",
                    username: "",
                    email: "bob@bob.com"
                });
                expect(this.model.performValidation()).toBeFalsy();
            });

        });

        context("when the user is already saved", function() {
            beforeEach(function() {
                this.model = backboneFixtures.user({
                    id: "5",
                    firstName: "bob",
                    lastName: "jenkins",
                    username: "bobjenk",
                    email: "bobj@raisetheroof.us"
                });
                this.model.save({
                    password: "original_password",
                    passwordConfirmation: "original_password"
                });
                this.model.trigger('change');
            });

            context("when the password has not changed", function() {
                it("returns true", function() {
                    expect(this.model.performValidation({ email: "bobjanky@coolpalace.us" })).toBeTruthy();
                });
            });

            context("when the password has changed and no confirmation is specified", function() {
                it("returns false", function() {
                    expect(this.model.performValidation({password: "new_password", passwordConfirmation: ""})).toBeFalsy();
                });
            });
        });
    });

    describe("#fetchImageUrl", function() {
        var user;

        beforeEach(function() {
            spyOn(chorus, "cachebuster").andReturn(12345);
            user = backboneFixtures.user({
                username: 'foo',
                id: "bar",
                image: {
                    icon: "/system/users/images/000/000/005/icon/retro.jpg",
                    original: "/system/users/images/000/000/005/original/retro.jpg"
                }
            });
        });

        it("returns undefined when the user does not have an image", function() {
            user.unset("image");
            expect(user.fetchImageUrl()).toBeUndefined();
        });

        it("appends a cache-busting query param", function() {
            expect(user.fetchImageUrl()).toContainQueryParams({ iebuster: 12345 });
        });

        it("uses the URL for the original-sized image by default", function() {
            expect(user.fetchImageUrl()).toHaveUrlPath("/system/users/images/000/000/005/original/retro.jpg");
        });

        it("uses the icon url if the 'size' option is set to 'icon'", function() {
            expect(user.fetchImageUrl({ size: "icon" })).toHaveUrlPath("/system/users/images/000/000/005/icon/retro.jpg");
        });
    });

    describe("#createImageUrl", function() {
        it("gives the right url back", function() {
            var user = backboneFixtures.user({
                username: 'elephant',
                id: "55"
            });
            expect(user.createImageUrl()).toHaveUrlPath("/users/55/image");
            expect(user.createImageUrl()).toBeA("string");
        });
    });

    describe("#picklistImageUrl", function() {
        it("uses the right URL", function() {
            var user = backboneFixtures.user({username: 'foo', id: "bar"});
            expect(user.picklistImageUrl()).toBe(user.fetchImageUrl({ size: "original" }));
        });
    });

    describe("#displayName", function() {
        beforeEach(function() {
            this.model.set({ firstName: "Danny", lastName: "Burkes" });
        });

        it("returns the full name", function() {
            expect(this.model.displayName()).toBe("Danny Burkes");
        });

        context("when firstName and lastName are blank, but fullName exists", function() {
            it("uses fullName", function() {
                var user = backboneFixtures.user({
                    firstName: '',
                    lastName: ''
                });
                user.set({fullName: "SomeGuy"});
                expect(user.displayName()).toBe('SomeGuy');
            });
        });
    });

    describe("#displayShortName", function() {
        context("with a short user name", function() {
            beforeEach(function() {
                this.model.set({firstName: "Party", lastName: "Man"});
            });
            it("displays the normal display name", function() {
                expect(this.model.displayShortName(20)).toBe(this.model.displayName());
            });
        });

        context("where the full name is longer than the allowed length", function() {
            beforeEach(function() {
                this.model.set({firstName: "Party", lastName: "ManiManiManiManiManiManiMani"});
            });
            it("displays the normal display name", function() {
                expect(this.model.displayShortName(20)).toBe("Party M.");
            });
        });
    });

    describe("#maxImageSize", function() {
        it("returns the max file size for user icons from the config", function() {
            var maxImgSize = chorus.models.Config.instance().get("fileSizesMbUserIcon");
            expect(maxImgSize).toBeDefined();
            expect(this.model.maxImageSize()).toBe(maxImgSize);
        });
    });
});
