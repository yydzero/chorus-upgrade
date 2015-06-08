describe("chorus.dialogs.ChangePassword", function() {
    beforeEach(function() {
        this.user = new chorus.models.User({
            username: "john",
            firstName: "John",
            lastName: "Doe",
            email: "jdoe@emc.com",
            id: 12
        });
        this.view = new chorus.dialogs.ChangePassword({ pageModel : this.user });
        this.view.render();
    });

    it("does not autocomplete password inputs", function(){
        var passwordField = this.view.$("input[type=password]");
        expect(passwordField).toHaveAttr("autocomplete", "off");
    });

    describe("when the user clicks submit with mis-matched passwords", function() {
        beforeEach(function() {
            this.user.set({password: "abc", passwordConfirmation: "abc"});
            spyOn(this.user, "save").andCallThrough();
            this.view.$("input[name=password]").val("my_cool_password");
            this.view.$("input[name=passwordConfirmation]").val("my_cool_password_conf");
            this.view.$("form").submit();
        });

        it("calls #save and does not change the passwords", function() {
            expect(this.user.get("password")).toBe("abc");
            expect(this.user.get("passwordConfirmation")).toBe("abc");
            expect(this.user.save).toHaveBeenCalled();
        });
    });

    describe("when the user clicks submit with matching passwords", function() {
        beforeEach(function() {
            this.user.set({password: "abc", passwordConfirmation: "abc"});
            this.view.$("input[name=password]").val("newpass");
            this.view.$("input[name=passwordConfirmation]").val("newpass");
            this.view.$("form").submit();
        });

        it("makes the correct API request", function() {
            expect(this.server.lastUpdate().url).toBe("/users/12");
            expect(this.server.lastUpdate().json()["user"]["password"]).toBe("newpass");
        });

        describe("when the save request completes", function() {
            beforeEach(function() {
                spyOn(chorus, "toast");
                spyOnEvent($(document), "close.facebox");
                this.user.trigger("saved");
            });
            
            it("displays a success message", function() {
                expect(chorus.toast).toHaveBeenCalled();
            });
            
            it("closes the dialog box", function() {
                expect("close.facebox").toHaveBeenTriggeredOn($(document));
            });
        });
    });
});
