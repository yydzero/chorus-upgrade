describe("chorus.views.DatasetContentDetails", function() {
    describe("#render", function() {
        beforeEach(function() {
            this.$columnList = $("<ul/>");
            this.qtipMenu = stubQtip();
            this.dataset = backboneFixtures.workspaceDataset.datasetTable();
            this.collection = this.dataset.columns([backboneFixtures.databaseColumn(), backboneFixtures.databaseColumn()]);

            this.view = new chorus.views.DatasetContentDetails({
                dataset: this.dataset,
                collection: this.collection,
                $columnList: this.$columnList
            });
            spyOn(this.view, "scrollHandler");
            spyOn(this.view.filterWizardView, 'resetFilters').andCallThrough();
            spyOn(chorus, "search");
            this.server.completeFetchFor(this.dataset.statistics(), backboneFixtures.datasetStatisticsView());
            this.view.render();
            $("#jasmine_content").append(this.view.el);
        });

        it("puts the dataset filter subview in the filters div", function() {
            expect($(this.view.el).find(this.view.filterWizardView.el)).toBeTruthy();
        });

        it("renders the title", function() {
            expect(this.view.$(".data_preview h1").text().trim()).toMatchTranslation("dataset.data_preview");
        });

        it("renders the 'Preview Data' button", function() {
            expect(this.view.$(".column_count .preview").text().trim()).toMatchTranslation("dataset.data_preview");
        });

        it("sets up the result console to show the dataset download dialog", function() {
            var console = this.view.resultsConsole;
            expect(console.dataset).toBe(this.dataset);
            expect(console.options.showDownloadDialog).toBeTruthy();
        });

        it("hides the filters div", function() {
            expect(this.view.$(".filters")).toHaveClass("hidden");
        });

        it("hides the edit chorus view info bar", function() {
            expect(this.view.$(".edit_chorus_view_info")).toHaveClass("hidden");
        });

        it("has a search field in the content details that filters the column list", function() {
            var searchInput = this.view.$("input.search:visible");

            expect(searchInput).toExist();
            expect(chorus.search).toHaveBeenCalled();
            var searchOptions = chorus.search.lastCall().args[0];

            expect(searchOptions.input).toBe(searchInput);
            expect(searchOptions.list).toBe(this.$columnList);
        });

        context("when in Edit Chorus View mode", function() {
            beforeEach(function() {
                this.view.options.inEditChorusView = true;
                this.view.render();
            });

            it("shows the definition and informational bar for Edit Chorus View", function() {
                expect(this.view.$(".edit_chorus_view")).not.toHaveClass("hidden");
                expect(this.view.$(".edit_chorus_view_info")).not.toHaveClass("hidden");
            });
        });

        it("subscribes to the action:closePreview trigger", function() {
            expect(this.view).toHaveSubscription("action:closePreview", this.view.closeDataPreview);
        });

        describe("sql definition", function() {
            context("when the object is a dataset", function() {
                it("shows the SQL definition in the header", function() {
                    expect(this.view.$(".sql_content")).toExist();
                    expect(this.view.$(".definition")).toContainText(this.dataset.statistics().get("definition"));
                });

                context("when there is no sql", function() {
                    beforeEach(function() {
                        var dataset = backboneFixtures.workspaceDataset.datasetTable();
                        this.view = new chorus.views.DatasetContentDetails({dataset: dataset, collection: this.collection});
                        this.server.completeFetchFor(dataset.statistics(), backboneFixtures.datasetStatisticsTable());
                        this.view.render();
                    });

                    it("does not show the SQL definition", function() {
                        expect(this.view.$(".sql_content")).not.toExist();
                    });
                });
            });

            context("when the object is a CHORUS VIEW", function() {
                beforeEach(function() {
                    var dataset = backboneFixtures.workspaceDataset.chorusView();
                    this.view = new chorus.views.DatasetContentDetails({dataset: dataset, collection: this.collection});
                    this.server.completeFetchFor(dataset.statistics());
                    this.view.render();

                });
                it("shows the SQL definition in the header", function() {
                    expect(this.view.$(".sql_content")).toExist();
                    expect(this.view.$(".definition")).toContainText(this.view.dataset.get("query"));
                });
            });
        });

        context("when 'Preview Data'/'Run' is clicked", function() {
            context("when in default dataset page", function() {
                beforeEach(function() {
                    this.view.$(".column_count .preview").click();
                });

                it("should hide the column count bar", function() {
                    expect(this.view.$(".column_count")).toHaveClass("hidden");
                });

                it("should display the data preview bar", function() {
                    expect(this.view.$(".data_preview")).not.toHaveClass("hidden");
                });

                describe("data preview bar", function() {
                    it("should display a close button", function() {
                        expect(this.view.$(".data_preview .close")).toExist();
                    });

                    it("should display an expander", function() {
                        expect(this.view.$(".data_preview .expander_button")).toExist();
                    });

                    it("should display a resize area", function() {
                        expect(this.view.$(".data_preview .minimize")).toExist();
                    });

                    context("when the close button is clicked", function() {
                        beforeEach(function() {
                            this.view.$(".data_preview .close").click();
                        });

                        it("should hide the data preview bar", function() {
                            expect(this.view.$(".data_preview")).toHaveClass("hidden");
                        });

                        it("should show the column count bar", function() {
                            expect(this.view.$(".column_count")).not.toHaveClass("hidden");
                        });
                    });

                    context("when the preview data button is clicked", function() {
                        beforeEach(function() {
                            spyOn(this.view.resultsConsole, "execute");
                            this.view.$(".preview").click();
                        });

                        it("should execute database preview model", function() {
                            expect(this.view.resultsConsole.execute).toHaveBeenCalledWithSorta(this.view.dataset.preview(), ["checkId"]);
                        });

                        context("when the close button is clicked and the 'Derive a Chorus View' is already open", function() {
                            beforeEach(function() {
                                this.view.$('button.derive').click();
                                this.view.$('.data_preview .close').click();
                            });

                            it("should not display '.column_count' ", function() {
                                expect(this.view.$(".column_count")).toHaveClass("hidden");
                                expect(this.view.$(".data_preview")).toHaveClass("hidden");
                            });
                        });
                    });
                });
            });

            context("when in editChorusView page", function() {
                beforeEach(function() {
                    this.view.options.inEditChorusView = true;
                    this.view.render();
                    this.view.$(".preview").click();
                });

                it("should hide the edit chorus view bar", function() {
                    expect(this.view.$(".edit_chorus_view_info")).toHaveClass("hidden");
                });

                it("should display the data preview bar", function() {
                    expect(this.view.$(".data_preview")).not.toHaveClass("hidden");
                });
                describe("data preview bar", function() {
                    it("should display a close button", function() {
                        expect(this.view.$(".data_preview .close")).toExist();
                    });

                    context("when the close button is clicked", function() {
                        beforeEach(function() {
                            this.view.$(".data_preview .close").click();
                        });

                        it("should hide the data preview bar", function() {
                            expect(this.view.$(".data_preview")).toHaveClass("hidden");
                        });

                        it("should show the column count bar", function() {
                            expect(this.view.$(".edit_chorus_view_info")).not.toHaveClass("hidden");
                        });
                    });

                    context("when the preview data button is clicked", function() {
                        beforeEach(function() {
                            spyOn(this.view.resultsConsole, "execute");
                            this.view.$("button.preview").click();
                        });

                        it("should execute database preview model", function() {
                            expect(this.view.resultsConsole.execute).toHaveBeenCalledWithSorta(this.view.dataset.preview(), ["checkId"]);
                        });
                    });
                });
            });
        });

        describe("action bar", function() {
            it("renders", function() {
                expect(this.view.$(".definition")).toExist();
            });

            context("when dataset is oracle", function() {
                beforeEach(function() {
                    spyOn(this.dataset, "isOracle").andReturn(true);
                    this.view.render();
                });

                it("renders the 'Visualize' button", function() {
                    expect(this.view.$("button.visualize")).toExist();
                });

                it("does not render the 'Derive' button", function() {
                    expect(this.view.$("button.derive")).not.toExist();
                });

                context("with tableau configured", function () {
                    beforeEach(function () {
                        chorus.models.Config.instance().set({ tableauConfigured: true });
                        this.view.render();
                    });

                    it("does not render the 'Publish to Tableau' button", function() {
                        expect(this.view.$("button.publish")).not.toExist();
                    });
                });

            });

            context("when dataset is jdbc", function() {
                beforeEach(function() {
                    spyOn(this.dataset, "isJdbc").andReturn(true);
                    this.view.render();
                });

                it("renders the 'Visualize' button", function() {
                    expect(this.view.$("button.visualize")).toExist();
                });

                it("does not render the 'Derive' button", function() {
                    expect(this.view.$("button.derive")).not.toExist();
                });

                context("with tableau configured", function () {
                    beforeEach(function () {
                        chorus.models.Config.instance().set({ tableauConfigured: true });
                        this.view.render();
                    });

                    it("does not render the 'Publish to Tableau' button", function() {
                        expect(this.view.$("button.publish")).not.toExist();
                    });
                });

            });

            context("when dataset is not oracle", function() {
                it("renders the 'Visualize' button", function() {
                    expect(this.view.$("button.visualize")).toExist();
                    expect(this.view.$("button.visualize").text()).toMatchTranslation("dataset.content_details.visualize");
                });
            });

            it("doesn't render the chorus view info bar", function() {
                expect(this.view.$(".chorus_view_info")).toHaveClass("hidden");
            });

            describe("clicking the publish button", function() {
                beforeEach(function() {
                    this.modalSpy = stubModals();
                    chorus.models.Config.instance().set({ tableauConfigured: true });
                    this.view.render();
                    this.view.$("button.publish").click();
                });

                it("opens the publish to tableau modal", function() {
                    var modal = this.modalSpy.lastModal();
                    expect(modal).toBeA(chorus.dialogs.PublishToTableau);
                    expect(modal.model).toBeA(chorus.models.TableauWorkbook);
                });
            });

            context("and the visualize button is clicked", function() {
                beforeEach(function() {
                    spyOn(this.view, 'showVisualizationConfig');
                    spyOn(this.view.resultsConsole, 'clickClose');
                    spyOn(chorus.PageEvents, 'trigger').andCallThrough();
                    this.view.filterWizardView.resetFilters.reset();
                    this.view.$("button.visualize").click();
                });

                it("selects the first chart type", function() {
                    expect(this.view.$('.create_chart .chart_icon:eq(0)')).toHaveClass('selected');
                });

                it("calls 'showVisualizationConfig' with the first chart type", function() {
                    var chartType = this.view.$('.create_chart .chart_icon:eq(0)').data('chart_type');
                    expect(this.view.showVisualizationConfig).toHaveBeenCalledWith(chartType);
                });

                it("hides the definition bar and shows the create_chart bar", function() {
                    expect(this.view.$('.definition')).toHaveClass('hidden');
                    expect(this.view.$('.create_chart')).not.toHaveClass('hidden');
                });

                it("hides column_count and shows info_bar", function() {
                    expect(this.view.$('.column_count')).toHaveClass('hidden');
                    expect(this.view.$('.info_bar')).not.toHaveClass('hidden');
                });

                it("shows the filters div", function() {
                    expect(this.view.$(".filters")).not.toHaveClass("hidden");
                });

                it("disables datasetNumbers on the filter wizard", function() {
                    expect(this.view.filterWizardView.options.showAliasedName).toBeFalsy();
                });

                it("resets filter wizard", function() {
                    expect(this.view.filterWizardView.resetFilters).toHaveBeenCalled();
                });

                it("triggers start:visualization", function() {
                    expect(chorus.PageEvents.trigger).toHaveBeenCalledWith("start:visualization");
                });

                it("closes the results console", function() {
                    expect(this.view.resultsConsole.clickClose).toHaveBeenCalled();
                });

                context("and cancel is clicked", function() {
                    beforeEach(function() {
                        this.view.$('.create_chart .cancel').click();
                    });

                    it("shows the definition bar and hides the create_chart bar", function() {
                        expect(this.view.$('.definition')).not.toHaveClass('hidden');
                        expect(this.view.$('.create_chart')).toHaveClass('hidden');
                    });

                    it("hides the filters div", function() {
                        expect(this.view.$(".filters")).toHaveClass("hidden");
                    });

                    it("shows the column_count and hides info_bar", function() {
                        expect(this.view.$('.column_count')).not.toHaveClass('hidden');
                        expect(this.view.$('.info_bar')).toHaveClass('hidden');
                    });

                    it("hides the chart config view", function() {
                        expect(this.view.$(".chart_config")).toHaveClass("hidden");
                    });

                    it("triggers cancel:visualization", function() {
                        expect(chorus.PageEvents.trigger).toHaveBeenCalledWith("cancel:visualization");
                    });
                });

                context("and a chart type is clicked", function() {
                    beforeEach(function() {
                        var chartIcon = this.view.$('.create_chart .chart_icon:eq(3)').click();
                        this.firstChartType = chartIcon.data('chart_type');
                    });

                    it("selects that icon", function() {
                        expect(this.view.$('.create_chart .chart_icon.' + this.firstChartType)).toHaveClass('selected');
                    });

                    it("calls #showVisualizationConfig with that chart type", function() {
                        expect(this.view.showVisualizationConfig).toHaveBeenCalledWith(this.firstChartType);
                    });

                    it("shows the title for that chart type", function() {
                        expect(this.view.$('.chart_type_title.' + this.firstChartType)).not.toHaveClass('hidden');
                    });

                    context("and a different chart type is hovered over", function() {
                        beforeEach(function() {
                            var chartIcon = this.view.$('.create_chart .chart_icon:eq(2)');
                            this.hoverChartType = chartIcon.data('chart_type');
                            chartIcon.mouseenter();
                        });

                        it("shows the title for the hovered icon and hides the selected title", function() {
                            expect(this.view.$('.chart_type_title.' + this.hoverChartType)).not.toHaveClass('hidden');
                            expect(this.view.$('.chart_type_title.' + this.firstChartType)).toHaveClass('hidden');
                        });

                        context("and we stop hovering", function() {
                            beforeEach(function() {
                                var chartIcon = this.view.$('.create_chart .chart_icon:eq(2)');
                                chartIcon.mouseleave();
                            });

                            it("shows the selected title for the hovered icon and hides the hovered title", function() {
                                expect(this.view.$('.chart_type_title.' + this.hoverChartType)).toHaveClass('hidden');
                                expect(this.view.$('.chart_type_title.' + this.firstChartType)).not.toHaveClass('hidden');
                            });
                        });
                    });

                    context("and a different chart type is clicked", function() {
                        beforeEach(function() {
                            var chartIcon = this.view.$('.create_chart .chart_icon:eq(1)').click();
                            this.secondChartType = chartIcon.data('chart_type');
                        });

                        it("selects that icon", function() {
                            expect(this.view.$('.create_chart .chart_icon:eq(0)')).not.toHaveClass('selected');
                            expect(this.view.$('.create_chart .chart_icon:eq(1)')).toHaveClass('selected');
                        });

                        it("shows that title and hides the other visible ones", function() {
                            expect(this.view.$('.chart_type_title.' + this.secondChartType)).not.toHaveClass('hidden');
                            expect(this.view.$('.chart_type_title.' + this.firstChartType)).toHaveClass('hidden');
                        });
                    });
                });
            });

            context("and the 'derive a chorus view button' is clicked", function() {
                beforeEach(function() {
                    this.view.filterWizardView.resetFilters.reset();
                    this.chorusViewSpy = spyOnEvent(this.view, "transform:sidebar");
                    spyOnEvent(".column_count input.search", "textchange");
                    spyOnEvent(".chorus_view_info input.search", "textchange");

                    this.view.$('button.derive').click();
                });

                it("swap the green definition bar to Create Bar", function() {
                    expect(this.view.$(".create_chorus_view")).not.toHaveClass("hidden");
                    expect(this.view.$(".create_chart")).toHaveClass("hidden");
                    expect(this.view.$(".definition")).toHaveClass("hidden");
                });

                it("shows the chorus view info bar", function() {
                    expect(this.view.$(".chorus_view_info")).not.toHaveClass("hidden");
                    expect(this.view.$(".info_bar")).toHaveClass("hidden");
                    expect(this.view.$(".column_count")).toHaveClass("hidden");
                    expect(this.view.$(".chorus_view_info")).toContainTranslation("actions.select");
                    expect(this.view.$(".chorus_view_info a.select_all")).toContainTranslation("actions.select_all");
                    expect(this.view.$(".chorus_view_info a.select_none")).toContainTranslation("actions.select_none");
                });

                it("triggers the 'textchange' event on the newly visible search input", function() {
                    expect("textchange").not.toHaveBeenTriggeredOn(".column_count input.search");
                    expect("textchange").toHaveBeenTriggeredOn(".chorus_view_info input.search");
                });

                it("has a search field in the content details that filters the column list", function() {
                    var searchInput = this.view.$("input.search:visible");

                    expect(searchInput).toExist();
                    expect(chorus.search).toHaveBeenCalled();
                    var searchOptions = chorus.search.lastCall().args[0];

                    expect(searchOptions.input).toBe(searchInput);
                    expect(searchOptions.list).toBe(this.$columnList);
                });

                it("should select the chorus view icon", function() {
                    expect(this.view.$('.create_chorus_view .chorusview')).toHaveClass("selected");
                });

                it("shows the filter section", function() {
                    expect(this.view.$(".filters")).not.toHaveClass("hidden");
                });

                it("triggers transform:sidebar", function() {
                    expect(this.chorusViewSpy).toHaveBeenCalled();
                });

                it("enables datasetNumbers on the filter wizard", function() {
                    expect(this.view.filterWizardView.options.showAliasedName).toBeTruthy();
                });

                it("resets filter wizard", function() {
                    expect(this.view.filterWizardView.resetFilters).toHaveBeenCalled();
                });

                describe("clicking 'Select All'", function() {
                    beforeEach(function() {
                        spyOn(chorus.PageEvents, "trigger");
                        this.view.$(".select_all").click();
                    });

                    it("triggers the column:select_all page event", function() {
                        expect(chorus.PageEvents.trigger).toHaveBeenCalledWith("column:select_all");
                    });
                });

                describe("clicking 'Select None'", function() {
                    beforeEach(function() {
                        spyOn(chorus.PageEvents, "trigger");
                        this.view.$(".select_none").click();
                    });

                    it("triggers the column:select_none page event", function() {
                        expect(chorus.PageEvents.trigger).toHaveBeenCalledWith("column:select_none");
                    });
                });

                describe("and the cancel link is clicked", function() {
                    beforeEach(function() {
                        spyOn(chorus.PageEvents, "trigger").andCallThrough();
                        jasmine.JQuery.events.cleanUp();
                        spyOnEvent(".column_count input.search", "textchange");
                        spyOnEvent(".chorus_view_info input.search", "textchange");

                        this.cancelSpy = spyOnEvent(this.view, "cancel:sidebar");
                        this.view.$(".create_chorus_view .cancel").click();
                    });

                    it("subscribes to the action:closePreview trigger", function() {
                        expect(this.view).toHaveSubscription("action:closePreview", this.view.closeDataPreview);
                    });

                    it("swap the Create Bar to green definition bar", function() {
                        expect(this.view.$(".create_chorus_view")).toHaveClass("hidden");
                        expect(this.view.$(".definition")).not.toHaveClass("hidden");
                    });

                    it("hides the filters section", function() {
                        expect(this.view.$(".filters")).toHaveClass("hidden");
                    });

                    it("shows the chorus view info bar", function() {
                        expect(this.view.$(".chorus_view_info")).toHaveClass("hidden");
                        expect(this.view.$(".column_count")).not.toHaveClass("hidden");
                    });

                    it("triggers the 'textchange' event on the newly visible search input", function() {
                        expect("textchange").toHaveBeenTriggeredOn(".column_count input.search");
                        expect("textchange").not.toHaveBeenTriggeredOn(".chorus_view_info input.search");
                    });

                    it("triggers 'cancel:sidebar'", function() {
                        expect(chorus.PageEvents.trigger).toHaveBeenCalledWith('cancel:sidebar', 'chorus_view');
                    });

                    context("and click on data preview close button when data preview was opened", function() {
                        it("shows the search column count bar", function() {
                            this.view.$(".column_count .preview").click();
                            this.view.$(".data_preview .close").click();
                            expect(this.view.$(".column_count")).not.toHaveClass("hidden");
                        });
                    });
                });
            });

            context("when the dataset is not a chorus view", function() {
                it("should not display the edit chorus view button", function() {
                    expect(this.view.$("button.edit")).not.toExist();
                });

                context("when the workspace is archived", function() {
                    beforeEach(function() {
                        var dataset = backboneFixtures.workspaceDataset.datasetTable();
                        var workspace = backboneFixtures.workspace({ archivedAt: "2012-05-08 21:40:14"});
                        dataset.initialQuery = "select * from abc";
                        this.view = new chorus.views.DatasetContentDetails({dataset: dataset, collection: this.collection, workspace: workspace});
                        this.server.completeFetchFor(dataset.statistics());
                        this.view.render();
                    });

                    it("should not display the derive chorus view button", function() {
                        expect(this.view.$("button.derive")).not.toExist();
                    });

                    context("when tableau is configured", function() {
                        it("does not display the publish to tableau button", function() {
                            chorus.models.Config.instance().set({ tableauConfigured: true });
                            this.view.render();
                            expect(this.view.$("button.publish")).not.toExist();
                        });
                    });
                });

                context("when the workspace is active", function() {
                    beforeEach(function() {
                        var dataset = backboneFixtures.workspaceDataset.datasetTable();
                        this.dataset = dataset;
                        var workspace = dataset.workspace();
                        dataset.initialQuery = "select * from abc";
                        this.view = new chorus.views.DatasetContentDetails({dataset: dataset, collection: this.collection, workspace: workspace});
                        this.server.completeFetchFor(dataset.statistics());
                        this.view.render();
                    });
                    it("should display the derive chorus view button", function() {
                        expect(this.view.$("button.derive")).toExist();
                    });

                    context("when tableau is configured", function() {
                        beforeEach(function() {
                            chorus.models.Config.instance().set({ tableauConfigured: true });
                        });
                        it("displays the publish to tableau button", function() {
                            this.view.render();
                            expect(this.view.$("button.publish")).toExist();
                        });

                        context("when the user has update permissions", function() {
                            it("displays the publish to tableau button", function() {
                                this.dataset.workspace().set({permission: ['read', 'commenting', 'update']});
                                this.view.render();
                                expect(this.view.$("button.publish")).toExist();
                            });
                        });

                        context("when the user does not have update permissions", function() {
                            it("does not display the publish to tableau button", function() {
                                this.dataset.workspace().set({permission: ['read', 'commenting']});
                                this.view.render();
                                expect(this.view.$("button.publish")).not.toExist();
                            });
                        });
                    });

                    context("when tableau isnt configured", function() {
                        it("doesnt display the publish to tableau button", function() {
                            chorus.models.Config.instance().set({ tableauConfigured: false });
                            this.view.render();
                            expect(this.view.$("button.publish")).not.toExist();
                        });
                    });
                });
            });

            context("when the dataset is a chorus view", function() {

                context("when the workspace is archived", function() {
                    beforeEach(function() {
                        var dataset = backboneFixtures.workspaceDataset.chorusView();
                        var workspace = backboneFixtures.workspace({ archivedAt: "2012-05-08 21:40:14" });
                        dataset.initialQuery = "select * from abc";
                        this.view = new chorus.views.DatasetContentDetails({dataset: dataset, collection: this.collection, workspace: workspace});
                        this.server.completeFetchFor(dataset.statistics());
                        this.view.render();
                    });

                    it("does not display the derive chorus view button", function() {
                        expect(this.view.$("button.derive")).not.toExist();
                    });

                    it("does not display the edit button", function() {
                        expect(this.view.$("button.edit")).not.toExist();
                    });
                });

                context("when the workspace is not archived", function() {
                    beforeEach(function() {
                        var dataset = backboneFixtures.workspaceDataset.chorusView();
                        dataset.initialQuery = "select * from abc";
                        var workspace = dataset.workspace();
                        this.view = new chorus.views.DatasetContentDetails({dataset: dataset, collection: this.collection, workspace: workspace});
                        this.server.completeFetchFor(dataset.statistics());
                        this.view.render();
                    });
                    it("does not display the derive chorus view button", function() {
                        expect(this.view.$("button.derive")).not.toExist();
                    });

                    context("when tableau is configured", function() {
                        it("displays the publish to tableau button", function() {
                            chorus.models.Config.instance().set({ tableauConfigured: true });
                            this.view.render();
                            expect(this.view.$("button.publish")).toExist();
                        });
                    });

                    context("and the edit button is clicked", function() {
                        beforeEach(function() {
                            this.chorusViewSpy = spyOnEvent(this.view, "transform:sidebar");
                            spyOnEvent(this.view, "dataset:edit");
                            this.view.$("button.edit").click();
                        });
                        it("swap the green definition bar to Edit chorus view bar", function() {
                            expect(this.view.$(".edit_chorus_view")).not.toHaveClass("hidden");
                            expect(this.view.$(".create_chorus_view")).toHaveClass("hidden");
                            expect(this.view.$(".create_chart")).toHaveClass("hidden");
                            expect(this.view.$(".definition")).toHaveClass("hidden");
                            expect(this.view.$(".edit_chorus_view").find("button.save")).toExist();
                        });
                        it("shows the edit chorus view info bar", function() {
                            expect(this.view.$(".edit_chorus_view_info")).not.toHaveClass("hidden");
                            expect(this.view.$(".info_bar")).toHaveClass("hidden");
                            expect(this.view.$(".column_count")).toHaveClass("hidden");
                            expect(this.view.$(".edit_chorus_view_info .left").text()).toContainTranslation("dataset.content_details.edit_chorus_view.info");
                            expect(this.view.$(".edit_chorus_view button.preview").text()).toContainTranslation("dataset.run_sql");
                        });
                        it("triggers dataset:edit", function() {
                            expect("dataset:edit").toHaveBeenTriggeredOn(this.view);
                        });
                        it("triggers transform:sidebar", function() {
                            expect(this.chorusViewSpy).toHaveBeenCalledWith("edit_chorus_view");
                        });
                        context("and cancel is clicked", function() {
                            var cancelButton;
                            beforeEach(function() {
                                spyOn(chorus.PageEvents, 'trigger').andCallThrough();
                                cancelButton = this.view.$('.edit_chorus_view .cancel');
                            });
                            it("shows the definition bar and hides the create_chart bar", function() {
                                cancelButton.click();
                                expect(this.view.$('.definition')).not.toHaveClass('hidden');
                                expect(this.view.$('.edit_chorus_view')).toHaveClass('hidden');
                            });
                            it("shows the column_count and hides info_bar", function() {
                                cancelButton.click();
                                expect(this.view.$('.column_count')).not.toHaveClass('hidden');
                                expect(this.view.$('.edit_chorus_view_info')).toHaveClass('hidden');
                            });
                            it("triggers 'cancel:sidebar'", function() {
                                cancelButton.click();
                                expect(chorus.PageEvents.trigger).toHaveBeenCalledWith('cancel:sidebar', 'chorus_view');
                            });
                            it("triggers dataset:cancelEdit", function() {
                                cancelButton.click();
                                expect(chorus.PageEvents.trigger).toHaveBeenCalledWith("dataset:cancelEdit");
                            });
                            it("resets the query to the initial query before triggering events", function() {
                                chorus.PageEvents.on("dataset:cancelEdit", function() {
                                    expect(this.view.dataset.get("query")).toBe("select * from abc");
                                }, this);
                                chorus.PageEvents.on("cancel:sidebar", function() {
                                    expect(this.view.dataset.get("query")).toBe("select * from abc");
                                }, this);
                                cancelButton.click();
                            });
                        });
                        context("and 'Save and Return' is clicked", function() {
                            beforeEach(function() {
                                spyOn(chorus.PageEvents, "trigger");
                                this.view.$(".save").click();
                            });
                            it("triggers dataset:saveEdit", function() {
                                expect(chorus.PageEvents.trigger).toHaveBeenCalledWith("dataset:saveEdit");
                            });
                        });
                    });
                });
            });
        });

        describe("column count bar", function() {
            beforeEach(function() {
                this.column = backboneFixtures.databaseColumn();
            });

            it("renders", function() {
                expect(this.view.$(".column_count")).toExist();
            });

            it("renders the column count", function() {
                expect(this.view.$(".column_count .count").text().trim()).toMatchTranslation("dataset.column_count", { count: this.collection.models.length });
            });

            it("re-renders the column count when a column is added", function() {
                var count = this.view.collection.length;
                this.view.collection.add(this.column);
                expect(this.view.$(".column_count .count").text().trim()).toMatchTranslation("dataset.column_count", { count: count + 1 });
            });

            it("re-renders the column count when a column is removed", function() {
                this.view.collection.add(this.column);
                var count = this.view.collection.length;
                this.view.collection.remove(this.column);
                expect(this.view.$(".column_count .count").text().trim()).toMatchTranslation("dataset.column_count", { count: count - 1 });
            });
        });

        describe("column errors", function() {
            beforeEach(function() {
                spyOn(this.view, "showErrorWithDetailsLink");
                this.collection.serverErrors = {fields: {a: {BLANK: {}}}};
                this.view.render();
            });

            it("shows errors in the main content area", function() {
                expect(this.view.showErrorWithDetailsLink).toHaveBeenCalledWith(this.collection, chorus.alerts.Error);
            });
        });

        describe("sql errors bar", function() {
            it("renders, hidden", function() {
                expect(this.view.$(".sql_errors")).toHaveClass("hidden");
            });

            it("isn't cleared by clearErrors", function() {
                this.view.clearErrors();
                expect(this.view.$(".sql_errors").html()).not.toBe("");
            });

            describe("showErrorWithDetailsLink", function() {
                beforeEach(function() {
                    this.errorsource = backboneFixtures.dataPreviewTaskResults();
                    this.alertClass = chorus.alerts.VisualizationError;
                    this.view.showErrorWithDetailsLink(this.errorsource, this.alertClass);
                });

                it("unhides .dataset_errors", function() {
                    expect(this.view.$(".dataset_errors")).not.toHaveClass('hidden');
                });

                it("sets the alertClass correctly", function() {
                    expect(this.view.alertClass).toBe(this.alertClass);
                });

                it("sets the task correctly", function() {
                    expect(this.view.errorSource).toBe(this.errorsource);
                });

                describe("clicking view_error_details", function() {
                    beforeEach(function() {
                        this.modalSpy = stubModals();
                        this.view.$('.view_error_details').click();
                    });

                    it("launches the alertClass with the task as the model", function() {
                        var modal = this.modalSpy.lastModal();
                        expect(modal).toBeA(this.alertClass);
                        expect(modal.model).toBe(this.errorsource);
                    });
                });

                describe("closeErrorWithDetailsLink", function() {
                    beforeEach(function() {
                        this.view.closeErrorWithDetailsLink();
                    });

                    it("hides the .sql_errors", function() {
                        expect(this.view.$(".sql_errors")).toHaveClass('hidden');
                    });
                });
            });
        });

        describe("#showVisualizationConfig(type)", function() {
            beforeEach(function() {
                this.type = "frequency";
                var renderSpy = spyOn(
                    chorus.views.ChartConfiguration.prototype, 'postRender'
                ).andCallThrough();
                this.view.chartConfig = stubView();

                this.teardownSpy = spyOn(this.view.chartConfig, "teardown");

                this.view.showVisualizationConfig(this.type);

                expect(renderSpy).toHaveBeenCalled();
                this.configView = renderSpy.lastCall().object;
            });

            it("tears down the old chartConfig, but keeps the container", function() {
                expect(this.teardownSpy).toHaveBeenCalledWith(true);
            });

            it("renders a visualization configuration view for the given chart type", function() {
                expect(this.configView).toBeA(chorus.views.FrequencyChartConfiguration);
                expect(this.view.$(".chart_config")).not.toHaveClass('hidden');
            });

            it("passes the tabular data, column set and filter set to the config view", function() {
                expect(this.configView.model).toBe(this.view.dataset);
                expect(this.configView.collection).toBe(this.view.collection);
                expect(this.configView.filters).toBe(this.view.filterWizardView.collection);
            });

            it("passes a reference to itself as the config view's 'error container'", function() {
                expect(this.configView.options.errorContainer).toBe(this.view);
            });
        });

        describe("custom scrolling", function() {
            it("handles scrolling (to anchor content details to the top of the window when scrolling down)", function() {
                $(window).trigger("scroll");
                expect(this.view.scrollHandler).toHaveBeenCalled();
            });

            it("only binds scroll handling once", function() {
                this.view.render();
                $(window).trigger("scroll");
                expect(this.view.scrollHandler.calls.count()).toBe(1);
            });
        });
    });

    describe('when the statistics have not loaded', function() {
        beforeEach(function() {
            this.$columnList = $("<ul/>");
            this.qtipMenu = stubQtip();
            this.dataset = backboneFixtures.workspaceDataset.datasetTable();
            this.collection = this.dataset.columns([backboneFixtures.databaseColumn(), backboneFixtures.databaseColumn()]);

            this.view = new chorus.views.DatasetContentDetails({
                dataset: this.dataset,
                collection: this.collection,
                $columnList: this.$columnList
            });
            this.view.render();
        });
    });

    describe('when the statistics have loaded', function() {
        beforeEach(function() {
            this.$columnList = $("<ul/>");
            this.qtipMenu = stubQtip();
            this.dataset = backboneFixtures.workspaceDataset.datasetTable();
            this.collection = this.dataset.columns([backboneFixtures.databaseColumn(), backboneFixtures.databaseColumn()]);

            this.view = new chorus.views.DatasetContentDetails({
                dataset: this.dataset,
                collection: this.collection,
                $columnList: this.$columnList
            });

            this.statistics = backboneFixtures.datasetStatisticsView();
            this.server.completeFetchFor(this.dataset.statistics(), this.statistics);
        });

        it("renders the page with the view's query", function() {
            expect(this.view.$('.definition')).toContainText(this.statistics.get('definition'));
        });
    });

    describe("when initialized with a dataset with errors", function() {
        beforeEach(function() {
            this.dataset = backboneFixtures.workspaceDataset.datasetTable();
            this.dataset.serverErrors = {record: "MISSING_DB_OBJECT"};
            this.collection = this.dataset.columns();
            this.$columnList = $("<ul/>");

            this.view = new chorus.views.DatasetContentDetails({
                dataset: this.dataset,
                collection: this.collection,
                $columnList: this.$columnList
            });
            this.view.render();
        });

        it("displays the errors", function() {
            expect(this.view.$(".errors")).toContainTranslation("record_error.MISSING_DB_OBJECT.text");
        });

        it("doesn't break the definition bar", function() {
            expect(this.view.$(".definition")).toExist();
        });
    });
});
