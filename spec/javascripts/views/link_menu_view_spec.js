describe("chorus.views.LinkMenu", function() {
    beforeEach(function() {
        this.view = new chorus.views.LinkMenu({
            options : [
                {data : "male", text : "bob"},
                {data : "female", text : "alice"}
            ],
            title: "Link Menu",
            event : "name"
        });
        this.view.render();
    });

    itBehavesLike.PopupMenu("a.popup", ".menu");

    it("should have a hidden menu", function() {
        expect(this.view.$(".menu")).toHaveClass("hidden");
    });

    context("when some options are disabled", function() {
        beforeEach(function() {
            this.view = new chorus.views.LinkMenu({
                options : [
                    {data : "mark", text : "bob"},
                    {data : "joanne", text : "alice"},
                    {data : "tim", text : "belgium", disabled: true },
                    {data : "ofbiz", text : "framework", disabled: true }
                ],
                title: "Link Menu",
                event : "name"
            });
            this.view.render();
        });

        it("renders those options as spans, not links", function() {
            expect(this.view.$(".menu li[data-type=tim] a")).not.toExist();
            expect(this.view.$(".menu li[data-type=tim] span")).toHaveClass("unavailable");
            expect(this.view.$(".menu li[data-type=tim] span")).toHaveText("belgium");

            expect(this.view.$(".menu li[data-type=ofbiz] a")).not.toExist();
            expect(this.view.$(".menu li[data-type=ofbiz] span")).toHaveClass("unavailable");
            expect(this.view.$(".menu li[data-type=ofbiz] span")).toHaveText("framework");
        });
    });

    it("contains a filter menu", function() {
        expect(this.view.$(".menu.popup_filter")).toExist();
        expect(this.view.$(".title")).toHaveText("Link Menu");
    });

    it("should have the correct popup options", function() {
        expect(this.view.$("li[data-type=male] a")).toHaveText("bob");
        expect(this.view.$("li[data-type=female] a")).toHaveText("alice");
    });

    describe("chosen option", function() {
        it("defaults to the first option", function() {
            expect(this.view.$(".chosen")).toHaveText("bob");
            expect(this.view.$(".menu li[data-type=male] .check")).not.toHaveClass("hidden");
            expect(this.view.$(".menu li[data-type=female] .check")).toHaveClass("hidden");

        });

        it("renders the chosen option", function() {
            this.view.options.chosen = "female";
            this.view.render();
            expect(this.view.$(".chosen")).toHaveText("alice");
        });
    });

    describe("clicking the chosen option", function() {
        beforeEach(function() {
            this.view.$("a.popup span").click();
        });

        it("shows the popup menu", function() {
            expect(this.view.$(".menu")).not.toHaveClass("hidden");
        });
    });

    describe("clicking the popup link", function() {
        beforeEach(function() {
            spyOn(chorus.PopupMenu, "toggle").andCallThrough();
            this.view.$("a.popup").click();
        });

        it("shows the popup menu", function() {
            expect(this.view.$(".menu")).not.toHaveClass("hidden");
        });

        it("opens a popup menu with the correct element", function() {
            expect(chorus.PopupMenu.toggle).toHaveBeenCalledWith(this.view, ".menu", jasmine.any(jQuery.Event));
        });
        describe("clicking on the link again", function() {
            beforeEach(function() {
                this.view.$("a.popup").click();
            });

            it("closes the popup menu", function() {
                expect(this.view.$(".menu")).toHaveClass("hidden");
            });
        });

        describe("clicking on an option", function() {
            beforeEach(function() {
                spyOn(chorus.PageEvents, "trigger").andCallThrough();
                this.choiceSpy = jasmine.createSpy("choice");
                this.view.bind("choice", this.choiceSpy);
                this.view.$(".menu li[data-type=female] a").click();
            });

            it("triggers the choice", function(){
                expect(chorus.PageEvents.trigger).toHaveBeenCalledWith("choice:name", "female", this.view);
            });

            it("should trigger a choice event with the data", function() {
                expect(this.choiceSpy).toHaveBeenCalledWith("name", "female");
            });

            it("should set the chosen property", function() {
                expect(this.view.options.chosen).toBe("female");
            });

            it("should display the new choice", function() {
                expect(this.view.$(".popup .chosen")).toHaveText("alice");
            });

            it("shows change what is checked", function() {
                expect(this.view.$(".menu li[data-type=male] .check")).toHaveClass("hidden");
                expect(this.view.$(".menu li[data-type=female] .check")).not.toHaveClass("hidden");
            });
        });
    });
});
