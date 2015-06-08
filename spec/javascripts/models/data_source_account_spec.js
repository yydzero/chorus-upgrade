describe("chorus.models.DataSourceAccount", function() {
    beforeEach(function() {
        this.model = backboneFixtures.dataSourceAccount({ id: '72', dataSourceId: '1045' });
    });

    it("wraps parameters in 'account'", function() {
        expect(this.model.parameterWrapper).toBe("account");
    });

    describe("#url", function() {
        it("has the right url for modifying own account", function() {
            this.model.set({userId: chorus.session.user().id});
            expect(this.model.url({ method: 'update' })).toMatchUrl("/data_sources/1045/account");
            expect(this.model.url({ method: 'delete' })).toMatchUrl("/data_sources/1045/account");
            expect(this.model.url({ method: 'create' })).toMatchUrl("/data_sources/1045/account");
            expect(this.model.url({ method: 'read' })).toMatchUrl("/data_sources/1045/account");
        });

        it("has the right url for modifying members's accounts", function() {
            expect(this.model.url({ method: 'update' })).toMatchUrl("/data_sources/1045/members/72");
            expect(this.model.url({ method: 'delete' })).toMatchUrl("/data_sources/1045/members/72");
            expect(this.model.url({ method: 'create' })).toMatchUrl("/data_sources/1045/members");
        });
    });

    describe("#user", function() {
        beforeEach(function() {
            this.model.set({"owner": {
                firstName: "Ricardo",
                lastName: "Henderson",
                id: "45",
                userId: "45"
            }});
        });

        it("returns a user", function() {
            expect(this.model.user()).toBeA(chorus.models.User);
        });

        it("sets the name and id fields based on the account's information", function() {
            expect(this.model.user().get("firstName")).toBe("Ricardo");
            expect(this.model.user().get("lastName")).toBe("Henderson");
            expect(this.model.user().get("id")).toBe("45");
            expect(this.model.user().get("userId")).toBe("45");
        });

        context("when the account doesn't have an owner", function() {
            beforeEach(function() {
                this.model.unset("owner");
            });

            it("returns undefined", function() {
                expect(this.model.user()).toBeUndefined();
            });
        });
    });

    describe("#fetchBydataSourceId", function() {
        it("hits the correct url", function() {
            chorus.models.DataSourceAccount.findBydataSourceId("4");
            expect(this.server.requests[0].url).toMatchUrl("/data_sources/4/members");
        });

        it("returns an DataSourceAccount", function() {
            var model = chorus.models.DataSourceAccount.findBydataSourceId("4");
            expect(model instanceof chorus.models.DataSourceAccount).toBeTruthy();
        });
    });

    describe("validations", function() {
        beforeEach(function() {
            spyOn(this.model, "require").andCallThrough();
        });

        it("requires dbUsername", function() {
            this.model.unset("dbUsername");
            this.model.performValidation();
            expect(this.model.require).toHaveBeenCalledWith("dbUsername", undefined);
        });

        context("when the account already exists and the password is NOT being changed", function() {
            it("does not require a dbPassword", function() {
                this.model.unset("dbPassword");
                this.model.performValidation();
                expect(this.model.isValid()).toBeTruthy();
            });
        });

        context("when the account is being created", function() {
            it("requires a dbPassword", function() {
                this.model = new chorus.models.DataSourceAccount({ dbUsername: "ilikecoffee" });
                this.model.performValidation();
                expect(this.model.isValid()).toBeFalsy();
            });
        });

        context("when the account already exists and the password is being changed", function() {
            it("requires a dbPassword", function() {
                this.model.performValidation({ dbPassword: "" });
                expect(this.model.isValid()).toBeFalsy();
            });
        });
    });

    describe("toJSON", function() {
        it("does not return unnecessary attributes", function() {
            var json = this.model.toJSON()['account'];
            expect(json.hasOwnProperty('owner')).toBe(false);
        });
    });
});
