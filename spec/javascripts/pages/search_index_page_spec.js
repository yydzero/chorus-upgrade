describe("chorus.pages.SearchIndexPage", function() {
    function smallSearchResult () {
        var searchResult = backboneFixtures.searchResult();
        var attributeKeys = _.keys(searchResult.attributes);
        _.each(attributeKeys, function (attribute) {
            if (attribute === 'completeJson') { return; }

            var truncatedLength = (attribute === 'datasets') ? 3 : 2;

            var value = searchResult.get(attribute);
            value.numFound = Math.min(value.results.length, truncatedLength);
            value.results = value.results.splice(0, truncatedLength);
        });
        return searchResult;
    }

    beforeEach(function() {
        this.query = "50/50";
        this.modalSpy = stubModals();
    });

    it("has a helpId", function() {
        this.page = new chorus.pages.SearchIndexPage(this.query);
        expect(this.page.helpId).toBe("search");
    });

    context("when the search returns with unprocessableEntity", function() {
        beforeEach(function() {
            this.page = new chorus.pages.SearchIndexPage(this.query);
            spyOn(Backbone.history, 'loadUrl');
            this.server.lastFetchFor(this.page.model).failUnprocessableEntity();
        });

        it("shows a nice error popup", function() {
            expect(Backbone.history.loadUrl).toHaveBeenCalledWith('/unprocessableEntity');
            expect(chorus.pageOptions.title).toMatchTranslation('search.bad_entity_type.title');
            expect(chorus.pageOptions.text).toMatchTranslation('search.bad_entity_type.text');
        });
    });

    describe("when searching for all items, across all of chorus", function() {
        beforeEach(function() {
            this.page = new chorus.pages.SearchIndexPage(this.query);
        });

        it("fetches the search results for the given query", function() {
            expect(this.page.search.entityType()).toBe("all");
            expect(this.page.search.searchIn()).toBe("all");
            expect(this.page.search).toHaveBeenFetched();
        });

        describe("when the search result fetch completes", function() {
            beforeEach(function() {
                this.server.completeFetchFor(this.page.search, smallSearchResult());
            });

            it("doesn't display the list content details", function() {
                expect(this.page.mainContent.contentDetails).toBeUndefined();
            });

            it("has the right title", function() {
                expect(this.page.$(".default_content_header h1")).toContainTranslation("search.index.title", {query: "50/50"});
            });

            it("has a 'Show All Results' link", function() {
                expect(this.page.$('.default_content_header .type .title')).toContainTranslation("search.show");
                expect(this.page.$('.default_content_header .type a')).toContainTranslation("search.type.all");
            });

            it("has filtered result links", function() {
                expect(this.page.$('.default_content_header .type a')).toContainTranslation("search.type.workfile");
                expect(this.page.$('.default_content_header .type a')).toContainTranslation("search.type.hdfs_entry");
                expect(this.page.$('.default_content_header .type a')).toContainTranslation("search.type.dataset");
                expect(this.page.$('.default_content_header .type a')).toContainTranslation("search.type.workspace");
                expect(this.page.$('.default_content_header .type a')).toContainTranslation("search.type.user");
                expect(this.page.$('.default_content_header .type a')).toContainTranslation("search.type.data_source");
            });

            describe("filtering by result type", function() {
                beforeEach(function() {
                    spyOn(chorus.router, "navigate");
                    this.page.$('.default_content_header li[data-type="workspace"] a').click();
                });

                it("should navigate to the filtered result type page", function() {
                    expect(this.page.search.entityType()).toBe("workspace");
                    expect(this.page.search.searchIn()).toBe("all");
                    expect(chorus.router.navigate).toHaveBeenCalledWith(this.page.search.showUrl());
                });
            });

            it("has a 'Search in' filter link", function() {
                var searchInMenu = this.page.$(".default_content_header .search_in");
                var searchInOptions = searchInMenu.find(".menu a");
                expect(searchInMenu.find(".chosen")).toContainTranslation("search.in.all");
                expect(searchInMenu.find(".title")).toContainTranslation("search.search_in");
                expect(searchInOptions.length).toBe(2);
                expect(searchInOptions).toContainTranslation("search.in.all");
                expect(searchInOptions).toContainTranslation("search.in.my_workspaces");
            });

            it("navigates to the right page when 'my workspaces' is selected from the 'search in' menu", function() {
                spyOn(chorus.router, "navigate");
                chorus.PageEvents.trigger("choice:search_in", "my_workspaces");
                expect(this.page.search.entityType()).toBe("all");
                expect(this.page.search.searchIn()).toBe("my_workspaces");
                expect(chorus.router.navigate).toHaveBeenCalledWith(this.page.search.showUrl());
            });

            describe("the workfile section", function() {
                beforeEach(function() {
                    this.workfileLIs = this.page.$(".workfile_list li");
                });

                it("shows a list of search results", function() {
                    expect(this.workfileLIs.length).toBeGreaterThan(0);
                });
                
                describe("clicking on a workfile search result", function() {
                    beforeEach(function() {
                        this.searchedWorkfile = this.workfileLIs.eq(1);
                        this.searchedWorkfile.trigger("click");
                    });

                    it("selects that workfile", function() {
                        expect(this.searchedWorkfile).toHaveClass("checked");
                    });

                    it('shows the right links', function(){
                        expect(this.page.sidebar.$('.actions')).toContainTranslation('actions.copy_workfile');
                        expect(this.page.sidebar.$('.actions')).toContainTranslation('actions.download');
                        expect(this.page.sidebar.$('.actions')).not.toContainTranslation('actions.add_note');
                        expect(this.page.sidebar.$('.actions')).not.toContainTranslation('workfile.delete.button');
                    });

                    it("sets the workfile as the selectedItem on the search result", function() {
                        expect(this.page.search.selectedItem).toBe(this.page.search.workfiles().at(1));
                    });
                });
            });

            describe("the workspace section", function() {
                beforeEach(function() {
                    this.workspaceLIs = this.page.$(".workspace_list li");
                });

                it("shows a list of search results", function() {
                    expect(this.workspaceLIs.length).toBeGreaterThan(0);
                });

                describe("clicking on a workspace search result", function() {
                    var selectedIndex;

                    beforeEach(function() {
                        selectedIndex = 1;
                        this.workspaceLIs.eq(selectedIndex).trigger("click");
                    });

                    it("selects that workspace", function() {
                        expect(this.workspaceLIs.eq(selectedIndex)).toHaveClass("checked");
                    });

                    it("show the 'add a note' link in the sidebar", function() {
                        expect(this.page.sidebar.$("a.new_note")).toExist();
                    });

                    it("show the 'add an insight' link in the sidebar", function() {
                        expect(this.page.sidebar.$("a.new_insight")).toExist();
                    });
                });
            });

            describe("the dataset section", function() {
                beforeEach(function() {
                    this.datasetLIs = this.page.$(".dataset_list li");
                });

                it("shows a list of search results", function() {
                    expect(this.datasetLIs.length).toBeGreaterThan(0);
                });

                describe("clicking on a tabular data search result", function() {
                    beforeEach(function() {
                        this.dataset = this.page.model.datasets().find(function (dataset) {
                            return dataset.get('objectName') === 'searchquery_shared_table';
                        });
                        this.datasetResult = this.datasetLIs.find('.name:contains("' + this.dataset.name() + '")').closest('li');
                        this.datasetResult.trigger("click");
                        //The sidebar requires extra setup for a chorus view
                        expect(this.dataset.isChorusView()).toBeFalsy();
                    });

                    it("selects that tabular data item", function() {
                        expect(this.datasetResult).toHaveClass("checked");
                    });

                    it("shows the associate-with-workspace link in the sidebar", function() {
                        expect(this.page.sidebar.$('a.associate')).toExist();
                    });
                });
            });

            describe('the data source section', function() {
                beforeEach(function() {
                    this.dataSourceLIs = this.page.$(".data_source_list li");
                });

                it("shows a list of search results", function() {
                    expect(this.dataSourceLIs.length).toBeGreaterThan(0);
                });

                describe('clicking on a data source search result', function() {
                    beforeEach(function() {
                        spyOn(this.page.sidebars.dataSource, "setDataSource");
                        this.dataSourceLIs.eq(0).trigger("click");
                    });

                    it('selects that data source', function() {
                        expect(this.dataSourceLIs.eq(0)).toHaveClass("checked");
                    });
                });
            });

            describe("the user section", function() {
                beforeEach(function() {
                    this.users = this.page.search.users();
                    this.userLis = this.page.$(".user_list li");
                });

                it("shows a list of search results", function() {
                    expect(this.userLis.length).toBeGreaterThan(0);
                });

                describe("clicking on a user search result", function() {
                    beforeEach(function() {
                        this.clickedUser = this.users.at(0);
                        this.userLis.eq(0).trigger("click");
                    });

                    it("selects that user", function() {
                        expect(this.userLis.eq(0)).toHaveClass("checked");
                    });

                    it("fetches the user's activities'", function() {
                        expect(this.clickedUser.activities()).toHaveBeenFetched();
                    });
                });
            });

            describe("the hdfs section", function() {
                beforeEach(function() {
                    this.files = this.page.search.hdfs_entries();
                    this.fileLis = this.page.$(".hdfs_list li");
                });

                it("shows a list of search results", function() {
                    expect(this.fileLis.length).toBe(2);
                });

                describe("clicking on a file search result", function() {
                    beforeEach(function() {
                        this.clickedFile = this.files.at(0);
                        this.fileLis.eq(0).trigger("click");
                    });

                    it("selects that file", function() {
                        expect(this.fileLis.eq(0)).toHaveClass("checked");
                    });

                    it("fetches the file's activities'", function() {
                        expect(this.clickedFile.activities()).toHaveBeenFetched();
                    });
                });
            });

            describe("the other files section", function() {
                beforeEach(function() {
                    this.attachments = this.page.search.attachments();
                    this.attachmentLis = this.page.$(".attachment_list li");
                });

                it("shows a list of search results", function() {
                    expect(this.attachmentLis.length).toBeGreaterThan(0);
                });

                describe("clicking on a search result", function() {
                    beforeEach(function() {
                        this.clickedFile = this.attachments.at(0);
                        this.attachmentLis.eq(0).trigger("click");
                    });

                    it("selects that file", function() {
                        expect(this.attachmentLis.eq(0)).toHaveClass("checked");
                    });
                });
            });
        });
    });

    describe("when searching for only workspaces, across all of chorus", function() {
        beforeEach(function() {
            this.page = new chorus.pages.SearchIndexPage("all", "workspace", this.query);
        });

        it("fetches from the right search url", function() {
            expect(this.page.search.entityType()).toBe("workspace");
            expect(this.page.search.searchIn()).toBe("all");
            expect(this.page.search).toHaveBeenFetched();
        });

        describe("when the search result is fetched", function() {
            beforeEach(function() {
                this.server.completeFetchFor(this.page.search, smallSearchResult());
            });

            it("selects the 'all of chorus' option in the 'search in' menu", function() {
                expect(this.page.$(".default_content_header .search_in .chosen")).toContainTranslation("search.in.all");
            });

            it("selects the search result type in the menu", function() {
                expect(this.page.$(".default_content_header .type .chosen")).toContainTranslation("search.type.workspace");
            });

            it("has a content details and footer with pagination controls", function() {
                expect(this.page.mainContent.contentDetails).toBeA(chorus.views.ListContentDetails);
                expect(this.page.mainContent.contentDetails.collection).toBe(this.page.search.workspaces());
                expect(this.page.mainContent.contentDetails.options.modelClass).toBe("SearchResult");

                expect(this.page.mainContent.contentFooter).toBeA(chorus.views.ListContentDetails);
                expect(this.page.mainContent.contentFooter.collection).toBe(this.page.search.workspaces());
                expect(this.page.mainContent.contentFooter.options.hideCounts).toBeTruthy();
                expect(this.page.mainContent.contentFooter.options.hideIfNoPagination).toBeTruthy();
                expect(this.page.mainContent.contentFooter.options.modelClass).toBe("SearchResult");
            });
        });
    });

    describe("when searching for all items in the current user's workspaces", function() {
        beforeEach(function() {
            this.page = new chorus.pages.SearchIndexPage("my_workspaces", "all", this.query);
            this.search = this.page.search;
        });

        it("fetches the right search result", function() {
            expect(this.search.searchIn()).toBe("my_workspaces");
            expect(this.search.entityType()).toBe('all');
            expect(this.search).toHaveBeenFetched();
        });

        describe("when the search result is fetched", function() {
            beforeEach(function() {
                this.server.completeFetchFor(this.page.search, smallSearchResult());
            });

            it("selects the 'my workspaces' option in the 'search in' menu", function() {
                expect(this.page.$(".default_content_header .search_in .chosen")).toContainTranslation("search.in.my_workspaces");
            });

            it("selects the search result type in the menu", function() {
                expect(this.page.$(".default_content_header .type .chosen")).toContainTranslation("search.type.all");
            });
        });
    });

    describe("when searching only for workfiles in the current user's workspaces", function() {
        beforeEach(function() {
            this.page = new chorus.pages.SearchIndexPage("my_workspaces", "workfile", this.query);
            this.search = this.page.search;
            spyOn(this.search, "workspace").andReturn(backboneFixtures.workspace());
        });

        it("fetches the right search result", function() {
            expect(this.search.searchIn()).toBe("my_workspaces");
            expect(this.search.entityType()).toBe("workfile");
            expect(this.search).toHaveBeenFetched();
        });

        describe("when the search result is fetched", function() {
            beforeEach(function() {
                this.server.completeFetchFor(this.page.search, smallSearchResult());
            });

            it("selects the 'my workspaces' option in the 'search in' menu", function() {
                expect(this.page.$(".default_content_header .search_in .chosen")).toContainTranslation("search.in.my_workspaces");
            });

            it("selects the search result type in the menu", function() {
                expect(this.page.$(".default_content_header .type .chosen")).toContainTranslation("search.type.workfile");
            });

            it("doesn't display the list content details", function() {
                expect(this.page.mainContent.contentDetails).toBeUndefined();
            });
        });
    });

    describe(".resourcesLoaded", function() {
        beforeEach(function() {
            this.page = new chorus.pages.SearchIndexPage(this.query);
            this.page.resourcesLoaded();
        });

        it("sets the searchPage option for DatasetSidebar to true", function() {
            expect(this.page.sidebars.dataset.options.searchPage).toEqual(true);
        });

        it("sets the searchPage option for DataSourceSidebar to true", function() {
            expect(this.page.sidebars.dataSource.options.searchPage).toEqual(true);
        });
    });
});
