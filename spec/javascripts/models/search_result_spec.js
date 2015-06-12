describe("chorus.models.SearchResult", function() {
    beforeEach(function() {
        this.model = new chorus.models.SearchResult({ query: "jackson5" });
    });

    describe("#url and #showUrl", function() {
        function expectUrl(url, paramsToIgnore) {
            it("has the right url", function() {
                if (!paramsToIgnore) paramsToIgnore = [ "per_page", "page", "per_type" ];
                expect(this.model.url()).toMatchUrl(url, { paramsToIgnore: paramsToIgnore });
            });
        }

        function expectPaginatedUrl(url) {
            it("respects page numbers", function() {
                this.model.set({ page: 3 });
                expect(this.model.url()).toMatchUrl(url + "&per_page=50&page=3");
            });
        }

        function expectShowUrl(url) {
            it("has the right show url", function() {
                expect(this.model.showUrl()).toMatchUrl(url);
            });
        }

        context("when only searching for items in a single workspace", function() {
            beforeEach(function() {
                this.model.set({ workspaceId: "5", searchIn: "this_workspace" });
            });

            expectPaginatedUrl("/workspaces/5/search/?workspace_id=5&query=jackson5");
            expectShowUrl("#/workspaces/5/search/this_workspace/all/jackson5");
        });

        context("when prioritizing a particular workspace", function() {
            beforeEach(function() {
                this.model.set({ workspaceId: "5" });
            });

            context("when searching only the current user's workspaces", function() {
                beforeEach(function() {
                    this.model.set({ searchIn: "my_workspaces" });
                });

                context("when searching for a particular entity type", function() {
                    beforeEach(function() {
                        this.model.set({ entityType: "workfile" });
                    });

                    expectPaginatedUrl("/search/workspaces/?query=jackson5&entity_type=workfile&workspace_id=5");
                    expectShowUrl("#/workspaces/5/search/my_workspaces/workfile/jackson5");
                });

                context("when searching for any entity type", function() {
                    beforeEach(function() {
                        this.model.set({ entityType: "all" });
                    });

                    expectUrl("/search/workspaces/?query=jackson5&workspace_id=5&per_page=50&page=1");
                    expectShowUrl("#/workspaces/5/search/my_workspaces/all/jackson5");
                });
            });

            context("when searching all of chorus", function() {
                beforeEach(function() {
                    this.model.set({ searchIn: "all" });
                });

                context("when searching for a particular entity type", function() {
                    beforeEach(function() {
                        this.model.set({ entityType: "workfile" });
                    });

                    expectPaginatedUrl("/search/?query=jackson5&entity_type=workfile&workspace_id=5");
                    expectShowUrl("#/workspaces/5/search/all/workfile/jackson5");
                });

                context("when searching for any entity type", function() {
                    beforeEach(function() {
                        this.model.set({ entityType: "all" });
                    });

                    expectUrl("/search/?query=jackson5&workspace_id=5");
                    expectShowUrl("#/workspaces/5/search/jackson5");
                });
            });

            describe("searching for tags", function() {
                beforeEach(function() {
                    this.model.set({ isTag: true });
                });

                context("when searching all of chorus", function() {
                    beforeEach(function() {
                        this.model.set({ searchIn: "all" });
                    });

                    context("when searching for a particular entity type", function() {
                        beforeEach(function() {
                            this.model.set({ entityType: "workfile" });
                        });

                        expectPaginatedUrl("/search/?tag=true&query=jackson5&entity_type=workfile&workspace_id=5");
                        expectShowUrl("#/workspaces/5/tags/all/workfile/jackson5");
                    });

                    context("when searching for any entity type", function() {
                        beforeEach(function() {
                            this.model.set({ entityType: "all" });
                        });

                        expectUrl("/search/?tag=true&query=jackson5&workspace_id=5");
                        expectShowUrl("#/workspaces/5/tags/jackson5");
                    });
                });
            });
        });

        context("when not prioritizing a particular workspace", function() {
            beforeEach(function() {
                this.model.unset("workspaceId");
            });

            context("when searching only the current user's workspaces", function() {
                beforeEach(function() {
                    this.model.set({ searchIn: "my_workspaces" });
                });

                context("when searching for a particular entity type", function() {
                    beforeEach(function() {
                        this.model.set({ entityType: "workfile" });
                    });

                    expectPaginatedUrl("/search/workspaces/?query=jackson5&entity_type=workfile");
                    expectShowUrl("#/search/my_workspaces/workfile/jackson5");
                });

                context("when searching for any entity type", function() {
                    beforeEach(function() {
                        this.model.set({ entityType: "all" });
                    });

                    expectUrl("/search/workspaces/?query=jackson5");
                    expectShowUrl("#/search/my_workspaces/all/jackson5");
                });
            });

            context("when searching all of chorus", function() {
                beforeEach(function() {
                    this.model.set({ searchIn: "all" });
                });

                context("when searching for a particular entity type", function() {
                    beforeEach(function() {
                        this.model.set({ entityType: "workfile" });
                    });

                    expectPaginatedUrl("/search/?query=jackson5&entity_type=workfile");
                    expectShowUrl("#/search/all/workfile/jackson5");
                });

                context("when searching for any entity type", function() {
                    beforeEach(function() {
                        this.model.set({ entityType: "all" });
                    });

                    expectUrl("/search/?query=jackson5");
                    expectShowUrl("#/search/jackson5");
                });
            });
        });

        context("when query has % character", function() {
            beforeEach(function() {
                this.model = new chorus.models.SearchResult({ query: "%%%"});
            });

            it("has the right url", function() {
                expect(this.model.url()).toContain("/search/?query=%25%25%25");
            });
            expectShowUrl("#/search/%25%25%25");
        });

        context("when performing a global search", function() {
            beforeEach(function() {
                this.model = new chorus.models.SearchResult({ query: "sandwich"});
            });

            it("has the right url", function() {
                expect(this.model.url()).toContain("per_type=3");
            });
        });
    });

    describe("#shortName", function() {
        it("returns a short name", function() {
            this.model.set({ query: "the longest query in the world" });
            expect(this.model.displayShortName()).toBe("the longest query in…");
        });
    });

    describe("#workspace", function() {
        context("when the model has a workspace id", function() {
            beforeEach(function() {
                this.model.set({ workspaceId: "123" });
            });

            it("returns a workspace model with the right id", function() {
                var workspace = this.model.workspace();
                expect(workspace).toBeA(chorus.models.Workspace);
                expect(workspace.get("id")).toBe("123");
            });

            it("memoizes", function() {
                expect(this.model.workspace()).toBe(this.model.workspace());
            });
        });

        context("when the model does NOT have a workspace id", function() {
            it("returns undefined", function() {
                expect(this.model.workspace()).toBeUndefined();
            });
        });
    });

    describe("#getResults", function() {
        context("when the search result is scoped to a single workspace", function() {
            it("returns the collection of items in that workspace", function() {
                this.model = backboneFixtures.searchResultInWorkspace();
                this.model.set({ workspaceId: "101", searchIn: "this_workspace" });
                expect(this.model.getResults()).toBeDefined();
                expect(this.model.getResults()).toBe(this.model.workspaceItems());
            });
        });

        context("when the search results is filtered to a single entity type", function() {
            it("returns the results collection for that entity type", function() {
                this.model = backboneFixtures.searchResultWithEntityTypeUser();
                this.model.set({ entityType: "user" });
                expect(this.model.getResults()).toBeDefined();
                expect(this.model.getResults()).toBe(this.model.users());
            });
        });

        context("when the search result is filtered by workspace AND by entity type", function() {
            it("returns the collection for its entity type", function() {
                this.model = backboneFixtures.searchResultInWorkspaceWithEntityTypeWorkfile();
                this.model.set({ entityType: "workfile", searchIn: "this_workspace", workspaceId: "101" });
                this.model.unset("thisWorkspace");
                expect(this.model.getResults()).toBeDefined();
                expect(this.model.getResults()).toBe(this.model.workspaceItems());
            });
        });

        context("when the search result is filtered by attachment", function() {
            beforeEach(function() {
                this.model = backboneFixtures.emptySearchResult();
                this.model.set({ entityType: "attachment" });
            });

            it("defines a collection", function() {
                expect(this.model.getResults()).toBeDefined();
                expect(this.model.getResults()).toBeA(chorus.collections.Search.AttachmentSet);
            });
        });

        context("when the search result has no entity type and is not scoped to a single workspace", function() {
            it("returns undefined", function() {
                this.model = backboneFixtures.searchResult();
                expect(this.model.getResults()).toBeUndefined();
            });
        });
    });

    describe("child collection methods", function() {
        beforeEach(function() {
            this.model = backboneFixtures.searchResultInWorkspace({
                thisWorkspace: {
                    numFound: 171,
                    results: []
                }
            });
            this.model.workspaceItems().reset([
                backboneFixtures.workfile.sql(),
                backboneFixtures.dataset(),
                backboneFixtures.workspaceDataset.chorusView(),
                backboneFixtures.workspace()
            ]);
        });

        describe("#workspaceItems", function() {
            context("when there are workspace items", function() {
                beforeEach(function() {
                    this.workspaceItems = this.model.workspaceItems();
                });

                it("returns a Search WorkspaceItemSet", function() {
                    expect(this.workspaceItems).toBeA(chorus.collections.Search.WorkspaceItemSet);
                });

                it("instantiates the right type of model for each entry in the collection", function() {
                    expect(this.workspaceItems.at(0)).toBeA(chorus.models.Workfile);
                    expect(this.workspaceItems.at(1)).toBeA(chorus.models.Dataset);
                    expect(this.workspaceItems.at(2)).toBeA(chorus.models.WorkspaceDataset);
                    expect(this.workspaceItems.at(3)).toBeA(chorus.models.Workspace);
                });

                it("memoizes", function() {
                    expect(this.workspaceItems).toBe(this.model.workspaceItems());
                });

                it("sets the collection's 'loaded' flag", function() {
                    expect(this.workspaceItems.loaded).toBeTruthy();
                });
            });
        });

        describe("#workfiles", function() {
            it("returns a Search WorkfileSet", function() {
                this.model = backboneFixtures.searchResult();
                this.workfiles = this.model.workfiles();
                expect(this.workfiles).toBeA(chorus.collections.Search.WorkfileSet);
            });
        });

        describe("#dataset", function() {
            it("returns a collection of tabular data", function() {
                this.model = backboneFixtures.searchResult();
                expect(this.model.datasets()).toBeA(chorus.collections.Search.DatasetSet);
            });
        });

        describe("#users", function() {
            it("returns a Search UserSet", function() {
                expect(this.model.users()).toBeA(chorus.collections.UserSet);
            });
        });

        describe("#workspaces", function() {
            it("returns a Search WorkspaceSet", function() {
                expect(this.model.workspaces()).toBeA(chorus.collections.Search.WorkspaceSet);
            });
        });

        describe("#hdfs_entries", function() {
            it("returns a Search HdfsEntrySet", function() {
                expect(this.model.hdfs_entries()).toBeA(chorus.collections.Search.HdfsEntrySet);
            });
        });

        describe("#dataSources", function() {
            it("returns a Search DataSourceSet", function() {
                expect(this.model.dataSources()).toBeA(chorus.collections.Search.DataSourceSet);
            });
        });

        describe("#attachments", function() {
            it("returns a Search AttachmentSet", function() {
                expect(this.model.attachments()).toBeA(chorus.collections.Search.AttachmentSet);
            });
        });

        describe("when the model is empty (because the server returns an empty response)", function() {
            it("returns an empty collection for each child collection method", function() {
                var emptyModel = new chorus.models.SearchResult();

                var methodCollectionPairs = {
                    hdfs_entries: "HdfsEntrySet",
                    datasets: "DatasetSet",
                    workfiles: "WorkfileSet",
                    workspaces: "WorkspaceSet",
                    workspaceItems: "WorkspaceItemSet",
                    dataSources: "DataSourceSet",
                    users: "UserSet",
                    attachments: "AttachmentSet"
                };

                _.each(methodCollectionPairs, function(collectionClass, funcName) {
                    var result = emptyModel[funcName]();
                    expect(result).toBeA(chorus.collections.Search[collectionClass]);
                    expect(result.length).toBe(0);
                });
            });
        });
    });

    describe("#searchIn", function() {
        it("defaults to 'all'", function() {
            expect(this.model.searchIn()).toBe("all");
        });

        it("returns the 'searchIn' attribute, when one is set", function() {
            this.model.set({ searchIn: "my_workspaces" });
            expect(this.model.searchIn()).toBe("my_workspaces");
        });
    });

    describe("#entityType", function() {
        it("defaults to 'all'", function() {
            expect(this.model.entityType()).toBe('all');
        });

        context("when an entity type is set", function() {
            beforeEach(function() {
                this.model.set({entityType: "foo"});
            });

            it("gives back any set entity type", function() {
                expect(this.model.entityType()).toBe("foo");
            });

            it("is preserved through fetches", function() {
                this.model.fetch();
                this.server.completeFetchFor(this.model, backboneFixtures.searchResult());
                expect(this.model.entityType()).toBe("foo");
            });
        });
    });

    describe("#currentPageNumber", function() {
        it("defaults to 1", function() {
            expect(this.model.currentPageNumber()).toBe(1);
        });

        context("when a page is set", function() {
            beforeEach(function() {
                this.model.set({page: 5});
            });

            it("gives back any set page", function() {
                expect(this.model.currentPageNumber()).toBe(5);
            });

            it("is preserved through fetches", function() {
                this.model.fetch();
                this.server.completeFetchFor(this.model, backboneFixtures.searchResult());
                expect(this.model.currentPageNumber()).toBe(5);
            });
        });
    });

    describe("#total", function() {
        context("when there are results", function() {
            beforeEach(function() {
                this.model = backboneFixtures.emptySearchResult();
                this.model.set({
                    thisWorkspace: {
                        numFound: 3
                    },
                    attachment: {
                        numFound: 4
                    }
                });
            });

            it("returns the sum of numFound", function() {
                expect(this.model.total()).toBe(7);
            });
        });

        context("when there are no results", function() {
            beforeEach(function() {
                this.model = backboneFixtures.emptySearchResult();
            });

            it("returns 0", function() {
                expect(this.model.total()).toBe(0);
            });
        });
    });

    describe("#isConstrained", function() {
        beforeEach(function() {
            this.model = backboneFixtures.searchResult();
        });

        context("when isScoped returns true", function() {
            beforeEach(function() {
                spyOn(this.model, "isScoped").andReturn(true);
                spyOn(this.model, "hasSpecificEntityType").andReturn(false);
            });

            it("return true", function() {
                expect(this.model.isConstrained()).toBeTruthy();
            });
        });

        context("when hasSpecificEntityType returns true", function() {
            beforeEach(function() {
                spyOn(this.model, "isScoped").andReturn(false);
                spyOn(this.model, "hasSpecificEntityType").andReturn(true);
            });

            it("return true", function() {
                expect(this.model.isConstrained()).toBeTruthy();
            });
        });

        context("when isScoped and hasSpecificEntityType return false", function() {
            beforeEach(function() {
                spyOn(this.model, "isScoped").andReturn(false);
                spyOn(this.model, "hasSpecificEntityType").andReturn(false);
            });

            it("return false", function() {
                expect(this.model.isConstrained()).toBeFalsy();
            });
        });
    });

    describe("triggering invalidated", function() {
        beforeEach(function() {
            var search = backboneFixtures.searchResult();
            this.model = search;
            this.model.selectedItem = search.users().at(0);
            spyOnEvent(this.model.selectedItem, 'invalidated');
            this.model.trigger("invalidated");
        });

        it("should trigger invalidated on the currently selected item", function() {
            expect("invalidated").toHaveBeenTriggeredOn(this.model.selectedItem);
        });
    });

    describe("#download", function() {
        var searchResult;
        beforeEach(function() {
            searchResult = backboneFixtures.searchResult();

            this.model.selectedItem = searchResult.datasets().at(0);
            spyOn(this.model.selectedItem, "download");
            this.model.download({ "theOption": "isTrue" });
        });

        it("delegates to selectedItem's #download method'", function() {
            expect(this.model.selectedItem.download).toHaveBeenCalledWith({ "theOption": "isTrue" });
        });
    });

    describe("#name", function() {
        var searchResult;
        beforeEach(function() {
            searchResult = backboneFixtures.searchResult();

            this.model.selectedItem = searchResult.datasets().at(0);
            this.model.selectedItem.set({"objectName": "the_name"});
        });

        it("delegates to selectedItem's #name", function() {
            expect(this.model.name()).toEqual("the_name");
        });
    });
});
