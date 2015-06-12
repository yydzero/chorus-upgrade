describe("chorus.views.TypeAheadSearch", function() {
    beforeEach(function() {
        this.result = backboneFixtures.typeAheadSearchResult();
        this.query = "test";
        this.result.set({query: this.query});
        this.view = new chorus.views.TypeAheadSearch();
        this.view.searchFor("test");
    });

    it("should fetch the search result", function() {
        expect(this.result).toHaveBeenFetched();
    });

    describe("when the fetch completes with results", function() {
        function resultForEntityType(results, type) {
            return _.find(results, function(result) {
                return result.get("entityType") === type;
            });
        }

        beforeEach(function() {
            this.view.resultLimit = 100;
            this.server.completeFetchFor(this.result);
            this.results = this.result.results();
        });

        it("should have one entry for each item in the result", function() {
            expect(this.view.$("li.result").length).toBe(this.result.results().length);
        });

        it("should show the link to show all search result", function() {
            var text = this.view.$("li:eq(0)").text().trim();
            var link = this.view.$("li:eq(0) a").attr("href");
            
            expect(text).toContainTranslation("type_ahead.show_all_results");
            expect(link).toBe("#/search/test");
        });

        it("emphasizes the search term in the first item", function () {
            var text = this.view.$("li:eq(0) em").text().trim();
            
            expect(text).toBe(this.query);
        });

        context("when limit_search is true", function() {
            beforeEach(function() {
                spyOn(chorus.models.Config.instance().license(), "limitSearch").andReturn(true);
                this.view.render();
            });

            it("should not show the link to show all search result", function() {
                expect(this.view.$(".search_all")).not.toExist();
                expect(this.view.$el).not.toContainTranslation('type_ahead.show_all_results');
            });
        });

        it("should display the correct name and type for hdfs", function() {
            var hdfs = resultForEntityType(this.results, 'hdfs_file');
            var resultIndex = this.results.indexOf(hdfs);
            var result = this.view.$("li.result:eq(" + resultIndex + ")");
            expect(result.find(".name").html()).toBe(hdfs.get("highlightedAttributes").name[0]);
            expect(result.find("a").attr("href")).toBe(hdfs.showUrl());
            expect(result.find(".type").text()).toMatchTranslation("type_ahead.entity.hdfs_file");
        });

        it("should display nothing for hdfs binary file", function() {
            _.each(this.result.get("typeAhead").results, function(entry) {
                if(entry.entityType === "hdfs_file") {
                    entry.isBinary = true;
                }
            });
            this.view.model = this.result;
            this.view.render();
            expect(this.view.$("span.type")).not.toContainTranslation("type_ahead.entity.hdfs_file");
        });

        it("should display the correct name and type for workspace", function() {
            var workspace = resultForEntityType(this.results, 'workspace');
            var resultIndex = this.results.indexOf(workspace);
            var result = this.view.$("li.result:eq(" + resultIndex + ")");
            expect(result.find(".name").html()).toBe(workspace.get("highlightedAttributes").name[0]);
            expect(result.find("a").attr("href")).toBe(workspace.showUrl());
            expect(result.find(".type").text()).toMatchTranslation("type_ahead.entity.workspace");
        });

        it("should display the correct name and type for gpdb_data_source", function() {
            var dataSource = resultForEntityType(this.results, 'gpdb_data_source');
            var resultIndex = this.results.indexOf(dataSource);
            var result = this.view.$("li.result:eq(" + resultIndex + ")");
            expect(result.find(".name").html()).toBe(dataSource.get("highlightedAttributes").name[0]);
            expect(result.find("a").attr("href")).toBe(dataSource.showUrl());
            expect(result.find(".type").text()).toMatchTranslation("type_ahead.entity.gpdb_data_source");
        });

        it("should display the correct name and type for hdfs_data_source", function() {
            var dataSource = resultForEntityType(this.results, 'hdfs_data_source');
            var resultIndex = this.results.indexOf(dataSource);
            var result = this.view.$("li.result:eq(" + resultIndex + ")");
            expect(result.find(".name").html()).toBe(dataSource.get("highlightedAttributes").name[0]);
            expect(result.find("a").attr("href")).toBe(dataSource.showUrl());
            expect(result.find(".type").text()).toMatchTranslation("type_ahead.entity.hdfs_data_source");
        });

        it("should display the correct name and type for jdbc_data_source", function() {
            var dataSource = resultForEntityType(this.results, 'jdbc_data_source');
            var resultIndex = this.results.indexOf(dataSource);
            var result = this.view.$("li.result:eq(" + resultIndex + ")");
            expect(result.find(".name").html()).toBe(dataSource.get("highlightedAttributes").name[0]);
            expect(result.find("a").attr("href")).toBe(dataSource.showUrl());
            expect(result.find(".type").text()).toMatchTranslation("type_ahead.entity.jdbc_data_source");
        });

        it("should display the correct name and type for user", function() {
            var user = resultForEntityType(this.results, 'user');
            var resultIndex = this.results.indexOf(user);
            var result = this.view.$("li.result:eq(" + resultIndex + ")");
            expect(result.find(".name").html()).toBe((user.get("highlightedAttributes").firstName[0] + ' ' + user.get("lastName")));
            expect(result.find("a").attr("href")).toBe(user.showUrl());
            expect(result.find(".type").text()).toMatchTranslation("type_ahead.entity.user");
        });

        it("should display the correct name and type for workfile", function() {
            var workfile = resultForEntityType(this.results, 'workfile');
            var resultIndex = this.results.indexOf(workfile);
            var result = this.view.$("li.result:eq(" + resultIndex + ")");
            expect(result.find(".name").html()).toBe(workfile.get("highlightedAttributes").fileName[0]);
            expect(result.find("a").attr("href")).toBe(workfile.showUrl());
            expect(result.find(".type").text()).toMatchTranslation("type_ahead.entity.workfile");
        });

        it("should display the correct name and type for dataset", function() {
            var dataset = resultForEntityType(this.results, 'dataset');
            var resultIndex = this.results.indexOf(dataset);
            var result = this.view.$("li.result:eq(" + resultIndex + ")");
            expect(result.find(".name").html()).toBe(dataset.get("highlightedAttributes").objectName[0]);
            expect(result.find("a").attr("href")).toBe(dataset.showUrl());
            expect(result.find(".type").text()).toMatchTranslation("type_ahead.entity.dataset");
        });

        it("should display the correct name and type for chorusView", function() {
            var chorusView = _.find(this.results, function(result) {
                return result.get("entityType") === 'dataset' && result.get("entitySubtype") === 'CHORUS_VIEW';
            });
            var resultIndex = this.results.indexOf(chorusView);
            var result = this.view.$("li.result:eq(" + resultIndex + ")");
            expect(result.find(".name").html()).toBe(chorusView.get("highlightedAttributes").objectName[0]);
            expect(result.find("a").attr("href")).toBe(chorusView.showUrl());
            expect(result.find(".type").text()).toMatchTranslation("type_ahead.entity.chorusView");
        });

        it("should display the correct name and type for attachment", function() {
            var attachment = resultForEntityType(this.results, 'attachment');
            var resultIndex = this.results.indexOf(attachment);
            var result = this.view.$("li.result:eq(" + resultIndex + ")");
            expect(result.find(".name").html()).toBe(attachment.get("highlightedAttributes").name[0]);
            expect(result.find("a").attr("href")).toBe(attachment.showUrl());
            expect(result.find(".type").text()).toMatchTranslation("type_ahead.entity.attachment");
        });

        describe("keyboard navigation", function() {
            var view;

            function expectSelectedIndex(index) {
                expect(view.$("li").eq(index)).toHaveClass("selected");
                expect(view.$("li.selected").length).toBe(1);
            }

            function expectNothingSelected() {
                expect(view.$("li.selected").length).toBe(0);
            }

            beforeEach(function() {
                view = this.view;
                view.resultLimit = 7;
                view.render();
            });

            it("selects no item by default", function() {
                expectNothingSelected();
            });

            describe("#downArrow", function() {
                context("when no item is selected", function() {
                    it("selects the first item", function() {
                        this.view.downArrow();
                        expectSelectedIndex(0);
                    });
                });

                context("when the last item is selected", function() {
                    beforeEach(function() {
                        this.view.downArrow();
                        this.view.downArrow();
                        this.view.downArrow();
                        this.view.downArrow();
                        this.view.downArrow();
                        expectSelectedIndex(4);
                        this.view.downArrow();
                        expectSelectedIndex(5);
                        this.view.downArrow();
                        this.view.downArrow();
                        expectSelectedIndex(7);
                    });

                    it("does nothing", function() {
                        this.view.downArrow();
                        expectSelectedIndex(7);
                    });
                });
            });

            describe("#upArrow", function() {
                context("when no item is selected", function() {
                    beforeEach(function() {
                        this.view.upArrow();
                    });

                    it("does nothing", function() {
                        expectNothingSelected();
                    });
                });

                context("when the first item is selected", function() {
                    beforeEach(function() {
                        this.view.downArrow();
                        expectSelectedIndex(0);
                    });

                    it("removes the selection", function() {
                        this.view.upArrow();
                        expectNothingSelected();
                    });
                });

                context("when some intermediate item is selected", function() {
                    beforeEach(function() {
                        this.view.downArrow();
                        this.view.downArrow();
                        this.view.downArrow();
                        expectSelectedIndex(2);
                    });

                    it("selects the previous item", function() {
                        this.view.upArrow();
                        expectSelectedIndex(1);
                    });
                });
            });

            describe("#enter", function() {
                beforeEach(function() {
                    spyOn(chorus.router, 'navigate');
                    this.view.downArrow();
                });

                it("navigates to the page for the selected search result", function() {
                    this.view.enterKey();
                    var href = this.view.$("li.selected a").attr("href");
                    expect(chorus.router.navigate).toHaveBeenCalledWith(href);
                });
            });
        });

        describe("#handleKeyEvent", function() {
            describe("when down arrow key is pressed", function() {
                beforeEach(function() {
                    spyOn(this.view, "downArrow");
                    var event = jQuery.Event("keydown", { keyCode: 40 });
                    this.view.handleKeyEvent(event);
                });

                it("calls #downArrow", function() {
                    expect(this.view.downArrow).toHaveBeenCalled();
                });
            });

            describe("when up arrow key is pressed", function() {
                beforeEach(function() {
                    spyOn(this.view, "upArrow");
                    var event = jQuery.Event("keydown", { keyCode: 38 });
                    this.view.handleKeyEvent(event);
                });

                it("calls #upArrow on the type-ahead view", function() {
                    expect(this.view.upArrow).toHaveBeenCalled();
                });
            });

            describe("when the enter key is pressed", function() {
                beforeEach(function() {
                    spyOn(this.view, "enterKey");
                    this.event = jQuery.Event("keydown", { keyCode: 13 });
                });

                it("calls #enterKey on the type-ahead view", function() {
                    this.view.handleKeyEvent(this.event);
                    expect(this.view.enterKey).toHaveBeenCalled();
                });

                context("when nothing is selected", function() {
                    it("does NOT prevent the event's default (to allow the search to submit)", function() {
                        this.view.handleKeyEvent(this.event);
                        expect(this.event.isDefaultPrevented()).toBeFalsy();
                    });
                });

                context("when an item is selected", function() {
                    beforeEach(function() {
                        this.view.downArrow();
                        this.view.handleKeyEvent(this.event);
                    });

                    it("prevents the event's default (to prevent the search from submitting)", function() {
                        expect(this.event.isDefaultPrevented()).toBeTruthy();
                    });
                });

                context("when search is disabled and an item is selected", function() {
                    beforeEach(function() {
                        spyOn(chorus.router, "navigate");
                        this.view.disableSearch();
                        this.view.downArrow();
                        this.view.handleKeyEvent(this.event);
                    });

                    it("should not navigate away if search is disabled", function() {
                        expect(chorus.router.navigate).not.toHaveBeenCalled();
                    });
                });
            });
        });

        context("when search results return more than 5 rows", function() {
            beforeEach(function() {
                this.view.resultLimit = 5;
                this.view.render();
            });

            it("should only display maximum 5 rows", function() {
                expect(this.view.$('li.result').length).toBe(5);
            });
        });

        context("when a second search happens with no results", function() {
            beforeEach(function() {
                this.view.searchFor('test');
                this.server.completeFetchFor(this.view.model, {typeAhead: { results: []}});
            });

            it("should be empty", function() {
                expect(this.view.$("li.result").length).toBe(0);
            });
        });
    });

    describe("when the fetch completes and there are no results", function() {
        beforeEach(function() {
            this.result.get("typeAhead").results = [];
            this.result.get("typeAhead").numFound = 0;

            this.server.completeFetchFor(this.result);
        });

        it("should have no result entries", function() {
            expect(this.view.$("li.result").length).toBe(0);
        });

        it("should show the link to show all search result", function() {
            expect(this.view.$("li:eq(0)").text().trim()).toContainTranslation("type_ahead.show_all_results");
            expect(this.view.$("li:eq(0) a").attr("href")).toBe("#/search/test");
        });
    });

    describe("when the query is a blank string", function() {
        beforeEach(function() {
            this.view = new chorus.views.TypeAheadSearch();
            this.view.searchFor(' ');
            spyOn(this.view.model, "fetch").andCallThrough();
        });

        it("should not fetch any", function() {
            expect(this.view.model.fetch).not.toHaveBeenCalled();
        });
    });
});
