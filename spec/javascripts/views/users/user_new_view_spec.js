describe("chorus.views.userNew", function() {
    describe("#render", function() {
        context("as an admin", function() {
            beforeEach(function() {
                spyOn($.fn, "limitMaxlength");
                setLoggedInUser({'admin': true});
                this.user = new chorus.models.User();
                this.view = new chorus.views.UserNew({model : this.user});
                this.view.render();
            });

            it("limits the length of the notes field", function() {
                expect($.fn.limitMaxlength).toHaveBeenCalledOnSelector("textarea");
            });

            it("does not autocomplete password inputs", function(){
                expect(this.view.$("input[type=password]")).toHaveAttr("autocomplete", "off");
            });

            context("submitting the form", function() {
                beforeEach(function() {
                    this.view.$("input[name=firstName]").val("Frankie");
                    this.view.$("input[name=lastName]").val("Knuckles");
                    this.view.$("input[name=username]").val("frankie2002");
                    this.view.$("input[name=email]").val("frankie_knuckles@nyclol.com");
                    this.view.$("input[name=password]").val("whoaomg");
                    this.view.$("input[name=passwordConfirmation]").val("whoaomg");
                    this.view.$("input[name=dept]").val("awesomeness dept");
                    this.view.$("input[name=admin]").prop("checked", true);
                    this.view.$("input[name=developer]").prop("checked", true);
                    this.view.$("textarea[name=notes]").val("some notes");
                });

                it("creates a user with the forms attributes", function() {
                    this.view.$("form").submit();
                    expect(this.user.attributes["firstName"]).toBe("Frankie");
                    expect(this.user.attributes["lastName"]).toBe("Knuckles");
                    expect(this.user.attributes["username"]).toBe("frankie2002");
                    expect(this.user.attributes["email"]).toBe("frankie_knuckles@nyclol.com");
                    expect(this.user.attributes["password"]).toBe("whoaomg");
                    expect(this.user.attributes["passwordConfirmation"]).toBe("whoaomg");
                    expect(this.user.attributes["dept"]).toBe("awesomeness dept");
                    expect(this.user.attributes["admin"]).toBe(true);
                    expect(this.user.attributes["developer"]).toBe(true);
                    expect(this.user.get("notes")).toBe("some notes");
                });

                it("trims text inputs", function() {
                    this.view.$("input[name=username]").val("   foo   ");
                    this.view.$("form").submit();
                    expect(this.user.get("username")).toBe("foo");
                });

                it("does not trim text areas", function() {
                    this.view.$("textarea[name=notes]").val("   foo   ");
                    this.view.$("form").submit();
                    expect(this.user.get("notes")).toBe("   foo   ");
                });

                it("clears the serverErrors", function() {
                    this.user.serverErrors = { fields: { a: { INVALID: { message: "Hi there"}}} };
                    this.view.showErrors();

                    spyOn(this.view, "clearErrors");
                    this.view.$("form").submit();
                    expect(this.user.serverErrors).toBeUndefined();
                    expect(this.view.clearErrors).toHaveBeenCalled();
                });

                context("when the user form has admin unchecked", function() {
                    beforeEach(function() {
                        this.view.$("input[name=admin]").prop("checked", false);
                    });

                    it("sets the user attribute 'admin' to false", function() {
                        this.view.$("form").submit();
                        expect(this.user.attributes["admin"]).toBe(false);
                    });
                });

                context("when the user form has developer unchecked", function() {
                    beforeEach(function() {
                        this.view.$("input[name=developer]").prop("checked", false);
                    });

                    it("sets the user attribute 'developer' to false", function() {
                        this.view.$("form").submit();
                        expect(this.user.attributes["developer"]).toBe(false);
                    });
                });

                context("saving the user with valid data", function() {
                    beforeEach(function() {
                        spyOn(this.user, "save");
                    });

                    it("saves the user", function() {
                        this.view.$("form").submit();
                        expect(this.user.save).toHaveBeenCalled();
                    });

                    context("when user creation is successful", function() {
                        it("redirects to user index", function() {
                            spyOn(chorus.router, "navigate");
                            this.view.model.trigger("saved");
                            expect(chorus.router.navigate).toHaveBeenCalledWith("/users");
                        });
                    });

                    context("when user creation fails on the server", function() {
                        beforeEach(function() {
                            this.view.model.serverErrors = {fields: {a: {BLANK: {}}}};
                            this.view.$("form").submit();
                            this.view.model.trigger("saveFailed");

                            this.view.render();
                        });

                        it("doesn't redirect", function() {
                            expect(this.view.$("form")).toExist();
                        });

                        it("retains the data already entered", function() {
                            expect(this.view.$("input[name=firstName]").val()).toBe("Frankie");
                            expect(this.view.$("input[name=lastName]").val()).toBe("Knuckles");
                            expect(this.view.$("input[name=username]").val()).toBe("frankie2002");
                            expect(this.view.$("input[name=email]").val()).toBe("frankie_knuckles@nyclol.com");
                            expect(this.view.$("input[name=password]").val()).toBe("whoaomg");
                            expect(this.view.$("input[name=passwordConfirmation]").val()).toBe("whoaomg");
                            expect(this.view.$("input[name=dept]").val()).toBe("awesomeness dept");
                            expect(this.view.$("input[name=admin]")).toBeChecked();
                            expect(this.view.$("input[name=developer]")).toBeChecked();

                        });
                    });
                });

                context("saving the user with invalid data", function() {
                    beforeEach(function() {
                        spyOn(Backbone.Model.prototype, 'save');
                        this.view.$("input[name=email]").val("bademail");
                        this.view.$("form").submit();
                    });
                    it("does not save the user", function() {
                        expect(Backbone.Model.prototype.save).not.toHaveBeenCalled();
                    });

                    it("retains the data already entered", function() {
                        expect(this.view.$("input[name=firstName]").val()).toBe("Frankie");
                    });
                });
            });

            context("cancelling", function() {
                beforeEach(function() {
                    spyOn(this.view.$("form")[0], "submit");
                    this.view.$("button.cancel").click();
                });

                it("does not submit the form", function() {
                    expect(this.view.$("form")[0].submit).not.toHaveBeenCalled();
                });

                it("navigates back", function() {
                    expect(window.history.back).toHaveBeenCalled();
                });
            });

        });

        context("as a non admin", function() {
            beforeEach(function() {
                setLoggedInUser({'admin': false});
                this.view = new chorus.views.UserNew();
                this.view.render();
            });


            it("renders the admin-only warning", function() {
                expect(this.view.$(".aint_admin")).toExist();
            });
        });
    });
});
