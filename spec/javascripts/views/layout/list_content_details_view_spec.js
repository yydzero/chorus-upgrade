describe("chorus.views.ListContentDetails", function() {
    beforeEach(function() {
        this.collection = backboneFixtures.userSet();
        this.collection.pagination = {
            "total": 2,
            "page": 1,
            "records": 22
        };
        this.collection.loaded = true;
        this.view = new chorus.views.ListContentDetails({ collection: this.collection, modelClass: "User" });
    });

    describe("#render", function() {
        describe("buttons", function() {
            beforeEach(function() {
                this.view.render();
            });

            it("creates a buttons subview", function(){
                expect(this.view.buttonView).toBeA(chorus.views.ListContentDetailsButtonView);
                expect(this.view.buttonView.options).toBe(this.view.options);
            });

            it("contains a div to hold the buttons", function(){
                expect(this.view.$("div.button_holder")).toExist();
            });
        });

        context("when the multiSelect is falsy", function() {
            beforeEach(function() {
                this.view.options.multiSelect = false;
                this.view.render();
            });

            it("does not show the multi-select section", function() {
                expect(this.view.$(".multiselect")).not.toExist();
            });
        });

        context("when the multiSelect option is true", function() {
            beforeEach(function() {
                this.view.options.search = true;
                this.view.options.multiSelect = true;
                this.view.render();
                spyOn(chorus.PageEvents, "trigger");
            });

            it("does not show the 'explore' text", function() {
                expect(this.view.$("span.explore")).not.toExist();
            });

            describe("when the 'select all' checkbox is checked", function() {
                it("triggers the 'selectAll' page event", function() {
                    this.view.$(".multiselect .select_all").prop("checked", true);
                    this.view.$(".multiselect .select_all").change();
                    expect(chorus.PageEvents.trigger).toHaveBeenCalledWith("selectAll");
                });
            });

            describe("when the 'select all' checkbox is unchecked", function() {
                it("triggers the 'selectNone' page event", function() {
                    this.view.$(".multiselect .select_all").prop("checked", false);
                    this.view.$(".multiselect .select_all").change();
                    expect(chorus.PageEvents.trigger).toHaveBeenCalledWith("selectNone");
                });
            });

            it("renders the checked state", function () {
                this.view.$(".select_all").prop("checked", true).change();
                this.view.render();
                expect(this.view.$(".select_all").prop("checked")).toBeTruthy();
            });
        });

        context("when the collection is loaded", function() {
            context("and the hideCounts option is falsy", function() {
                beforeEach(function() {
                    this.view.options.hideCounts = false;
                    this.view.render();
                });

                it("renders the total number of items in the collection", function() {
                    expect(this.view.$(".count")).toContainText("22");
                });
            });

            context("and the hideCounts option is truthy", function() {
                beforeEach(function() {
                    this.view.options.hideCounts = true;
                    this.view.render();
                });

                it("does not render the total number of items in the collection", function() {
                    expect(this.view.$(".count")).not.toExist();
                });

                it("does not render the current page or total page count", function() {
                    expect(this.view.$(".pagination .page")).not.toExist();
                });
            });

            context("and there is only one page of items", function() {
                beforeEach(function() {
                    this.collection.pagination.page = "1";
                    this.collection.pagination.total = "1";
                    this.view.render();
                });

                it("does not display the pagination controls", function() {
                    expect(this.view.$(".pagination")).toHaveClass("hidden");
                });

                context("and the hideIfNoPagination option is falsy", function() {
                    beforeEach(function() {
                        this.view.options.hideIfNoPagination = false;
                        this.view.render();
                    });

                    it("does not add the hidden class to the container", function() {
                        expect($(this.view.el)).not.toHaveClass("hidden");
                    });
                });

                context("and the hideIfNoPagination option is truthy", function() {
                    beforeEach(function() {
                        this.view.options.hideIfNoPagination = true;
                        this.view.render();
                    });

                    it("adds the hidden class to the container", function() {
                        expect($(this.view.el)).toHaveClass("hidden");
                    });
                });
            });

            context("and there is more than one page of items", function() {
                beforeEach(function() {
                    this.collection.pagination.page = "1";
                    this.collection.pagination.total = "2";
                    this.view.render();
                });

                it("displays the pagination controls", function() {
                    expect(this.view.$(".pagination")).not.toHaveClass("hidden");
                });

                it("displays the page number of the collection", function() {
                    expect(this.view.$(".pagination .page .current").text().trim()).toBe(this.collection.pagination.page);
                });

                it("displays the total number of pages in the collection", function() {
                    expect(this.view.$(".pagination .page .total").text().trim()).toBe(this.collection.pagination.total);
                });

                it("does not add the hidden class to the container", function() {
                    expect($(this.view.el)).not.toHaveClass("hidden");
                });

                context("when there is a next page", function() {
                    beforeEach(function() {
                        this.collection.pagination.page = "1";
                        this.collection.pagination.total = "2";
                        this.view.render();
                    });

                    it("renders the next page link", function() {
                        expect(this.view.$(".pagination .links a.next")).not.toHaveClass("hidden");
                        expect(this.view.$(".pagination .links span.next")).toHaveClass("hidden");
                    });
                });

                context("when there is NO next page", function() {
                    beforeEach(function() {
                        this.collection.pagination.page = "2";
                        this.collection.pagination.total = "2";
                        this.view.render();
                    });

                    it("renders the next page link, but not as a link", function() {
                        expect(this.view.$(".pagination .links a.next")).toHaveClass("hidden");
                        expect(this.view.$(".pagination .links span.next")).not.toHaveClass("hidden");
                    });
                });

                context("when there is a previous page", function() {
                    beforeEach(function() {
                        this.collection.pagination.page = "2";
                        this.collection.pagination.total = "2";
                        this.view.render();
                    });

                    it("renders the previous page link", function() {
                        expect(this.view.$(".pagination .links a.previous")).not.toHaveClass("hidden");
                        expect(this.view.$(".pagination .links span.previous")).toHaveClass("hidden");
                    });
                });

                context("when there is NO previous page", function() {
                    beforeEach(function() {
                        this.collection.pagination.page = "1";
                        this.collection.pagination.total = "2";
                        this.view.render();
                    });

                    it("renders the previous page link, but not as a link", function() {
                        expect(this.view.$(".pagination .links a.previous")).toHaveClass("hidden");
                        expect(this.view.$(".pagination .links span.previous")).not.toHaveClass("hidden");
                    });
                });
            });

            context("and the collection is empty", function() {
                beforeEach(function() {
                    this.view.collection = new chorus.collections.UserSet();
                    this.view.collection.loaded = true;
                    this.view.render();
                });

                it("does not display the pagination controls", function() {
                    expect(this.view.$(".pagination")).toHaveClass("hidden");
                });

                context("and the hideIfNoPagination option is falsy", function() {
                    beforeEach(function() {
                        this.view.options.hideIfNoPagination = false;
                        this.view.render();
                    });

                    it("does not add the hidden class to the container", function() {
                        expect($(this.view.el)).not.toHaveClass("hidden");
                    });
                });

                context("and the hideIfNoPagination option is truthy", function() {
                    beforeEach(function() {
                        this.view.options.hideIfNoPagination = true;
                        this.view.render();
                    });

                    it("adds the hidden class to the container", function() {
                        expect($(this.view.el)).toHaveClass("hidden");
                    });
                });
            });
        });

        context("when the collection is not loaded", function() {
            beforeEach(function() {
                this.collection.loaded = undefined;
                this.view.render();
            });

            it("displays 'loading'", function() {
                expect(this.view.$(".loading_section")).toExist();
            });
        });
    });

    describe("multiSelect", function() {
        beforeEach(function() {
            spyOnEvent(chorus.PageEvents, "selectNone");
        });

        context("when the multiSelect option is true", function() {
            beforeEach(function() {
                this.view.options.multiSelect = true;
                this.view.setup();
            });

            it("deselects all after a search", function() {
                this.collection.trigger('searched');
                expect("selectNone").toHaveBeenTriggeredOn(chorus.PageEvents);
            });

            it("deselects all after paginating", function() {
                this.collection.trigger('paginate');
                expect("selectNone").toHaveBeenTriggeredOn(chorus.PageEvents);
            });

            it("deselects all after filtering", function() {
                chorus.PageEvents.trigger('choice:filter');
                expect("selectNone").toHaveBeenTriggeredOn(chorus.PageEvents);
            });

            it("deselects all after sorting", function() {
                chorus.PageEvents.trigger('choice:sort');
                expect("selectNone").toHaveBeenTriggeredOn(chorus.PageEvents);
            });
        });

        context("when multiSelect is false", function() {
            beforeEach(function() {
                this.view.options.multiSelect = false;
                this.view.setup();
            });

            it("does not deselect all after a search", function() {
                this.collection.trigger('searched');
                expect("selectNone").not.toHaveBeenTriggeredOn(chorus.PageEvents);
            });

            it("does not deselect all after paginating", function() {
                this.collection.trigger('paginate');
                expect("selectNone").not.toHaveBeenTriggeredOn(chorus.PageEvents);
            });

            it("does not deselect all after filtering", function() {
                chorus.PageEvents.trigger('choice:filter');
                expect("selectNone").not.toHaveBeenTriggeredOn(chorus.PageEvents);
            });

            it("does not deselect all after sorting", function() {
                chorus.PageEvents.trigger('choice:sort');
                expect("selectNone").not.toHaveBeenTriggeredOn(chorus.PageEvents);
            });
        });
    });

    describe("changing the collection", function() {
        it("renders the view", function() {
            this.collection.remove(this.collection.first());
            expect(this.view.$(".count")).toContainText(this.collection.totalRecordCount());
        });
    });

    describe("clicking the pagination links", function() {
        beforeEach(function() {
            this.collection.pagination.page = "2";
            this.collection.pagination.total = "3";
            spyOn(window, 'scroll');
            this.view.render();
        });

        describe("when the 'next' link is clicked", function() {
            beforeEach(function() {
                spyOn(this.collection, "fetchPage");
                this.view.$("a.next").click();
            });

            it("fetches the next page of the collection", function() {
                expect(this.collection.fetchPage).toHaveBeenCalledWith(3);
            });

            it("scrolls the viewport to the top of the page", function() {
                expect(window.scroll).toHaveBeenCalledWith(0, 0);
            });
        });

        describe("when the 'previous' link is clicked", function() {
            beforeEach(function() {
                spyOn(this.collection, "fetchPage");
                this.view.$("a.previous").click();
            });

            it("fetches the previous page of the collection", function() {
                expect(this.collection.fetchPage).toHaveBeenCalledWith(1);
            });

            it("scrolls the viewport to the top of the page", function() {
                expect(window.scroll).toHaveBeenCalledWith(0, 0);
            });
        });
    });

    describe("search", function() {
        beforeEach(function() {
            this.$list = $("<ul/>");
            spyOn(chorus, "search");
            this.view.options.search = {
                list: this.$list,
                placeholder: "SearchPlaceholder"
            };
            this.view.render();
        });

        it("calls chorus.search on the input field", function() {
            expect(chorus.search).toHaveBeenCalledWith(_.extend({
                    input: this.view.$("input.search:text"),
                    afterFilter: jasmine.any(Function)
                },
                this.view.options.search));
        });

        it("doesn't render a search bar if the placeholder key is not present in the search hash", function() {
            delete this.view.options.search.placeholder;
            this.view.render();

            expect(this.view.$("input.search:text")).not.toExist();
        });

        context("when the collection already has a value for its searchAttr", function() {
            beforeEach(function() {
                this.collection.searchAttr = "namePattern";
                this.collection.attributes.namePattern = "foo";
                this.view.render();
            });

            it("sets the value in the search input", function() {
                expect(this.view.$("input.search:text").val()).toEqual('foo');
            });
        });
    });

    describe("#startLoading", function() {
        beforeEach(function() {
            this.view.render();
        });
        it("shows the loading text in the right place", function() {
            expect(this.view.$(".count")).not.toContainTranslation("loading");
            this.view.startLoading(".count");
            expect(this.view.$(".count")).toContainTranslation("loading");
        });
    });

    context("when it's a dataset list content details view", function() {
        beforeEach(function() {
            this.modalSpy = stubModals();
            this.collection = new chorus.collections.WorkspaceDatasetSet();
            this.collection.attributes.workspaceId = 44;
            this.collection.loaded = true;
            this.view = new chorus.views.ListContentDetails({ collection: this.collection, modelClass: "WorkspaceDataset" });
            $("#jasmine_content").append(this.view.el);
        });
    });

    context("when initialized with a buttons subview", function(){
        beforeEach(function() {
            this.buttonView = new chorus.views.Base();
            this.view = new chorus.views.ListContentDetails({
                collection: this.collection,
                modelClass: "User",
                buttonView: this.buttonView
            });
        });
        it("has a buttons subview", function(){
            expect(this.view.buttonView).toBe(this.buttonView);
        });
    });
});
