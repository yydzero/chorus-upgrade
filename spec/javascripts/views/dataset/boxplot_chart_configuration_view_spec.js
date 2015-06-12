describe("chorus.views.BoxplotChartConfiguration", function() {
    describe("#render", function() {
        context("with valid column data", function() {
            beforeEach(function() {
                this.model = backboneFixtures.workspaceDataset.chorusView({objectName: "Foo"});
                this.columns = backboneFixtures.databaseColumnSet([
                    {typeCategory: "ANIMAL", name: "B Liger"},
                    {typeCategory: "REAL_NUMBER", name: "a Speed"},
                    {typeCategory: "WHOLE_NUMBER", name: "A Milk Duds"}
                ]);

                this.column1 = this.columns.at(0);
                this.column2 = this.columns.at(1);
                this.column3 = this.columns.at(2);

                this.view = new chorus.views.BoxplotChartConfiguration({model: this.model, collection: this.columns});
                spyOn(chorus, 'styleSelect').andCallFake(_.bind(function() {
                    this.styledSelected = this.view.$(".category select").val();
                }, this));
                this.view.render();
                this.view.$(".limiter .selected_value").text("3");
            });

            itBehavesLike.ChartConfigurationRangeChooser();

            describe("#chartOptions", function() {
                it("should return all the chart options for a boxplot", function() {
                    var options = this.view.chartOptions();
                    expect(options.name).toBe("Foo");
                    expect(options.type).toBe("boxplot");
                    expect(options.xAxis).toBe("a Speed");
                    expect(options.yAxis).toBe("A Milk Duds");
                    expect(options.bins).toBe('3');
                });
            });
            
            describe("value select box", function() {
                it("has the right label", function() {
                    expect(this.view.$(".value .label").text()).toMatchTranslation("dataset.visualization.sidebar.value");
                });

                it("has the right hint text", function() {
                    expect(this.view.$(".value .column_hint").text()).toMatchTranslation("dataset.visualization.sidebar.hint.numeric");
                });

                it("populates the select box with only numeric columns", function() {
                    expect(this.view.$(".value select option").length).toBe(2);
                    expect(this.view.$(".value select option:eq(0)").val()).toBe("A Milk Duds");
                    expect(this.view.$(".value select option:eq(1)").val()).toBe("a Speed");
                });

                it("is styled", function() {
                    expect(chorus.styleSelect).toHaveBeenCalled();
                });
            });

            describe("category select box", function() {
                it("has the right label", function() {
                    expect(this.view.$(".category .label").text()).toMatchTranslation("dataset.visualization.sidebar.category");
                });

                it("has the right hint text", function() {
                    expect(this.view.$(".category .column_hint").text()).toMatchTranslation("dataset.visualization.sidebar.hint.category");
                });

                it("populates the select box with all columns", function() {
                    expect(this.view.$(".category select option").length).toBe(this.columns.models.length);
                    expect(this.view.$(".category select option:eq(0)").val()).toBe("A Milk Duds");
                    expect(this.view.$(".category select option:eq(1)").val()).toBe("a Speed");
                    expect(this.view.$(".category select option:eq(2)").val()).toBe("B Liger");
                });

                it("pre-selects the first option that is not in the first select", function() {
                    var selected = this.view.$(".category select option:eq(1)");
                    expect(selected.attr("selected")).toBe("selected");
                });

                it("pre-selected the first option before styleSelect is called", function() {
                    var selected = this.view.$(".category select option:eq(1)");
                    expect(this.styledSelected).toBe(selected.text());
                });
            });

            describe("clicking on cancel button when there's sql errors", function() {
                beforeEach(function() {
                    spyOn(this.view, "clearSqlErrors");
                    this.view.teardown(true);
                });

                it("should clear the sql errors", function() {
                    expect(this.view.clearSqlErrors).toHaveBeenCalled();
                });
            });
        });

        context("with no columns", function() {
            beforeEach(function() {
                this.columns = new chorus.collections.DatabaseColumnSet();
                this.view = new chorus.views.BoxplotChartConfiguration({collection: this.columns});
                spyOn(chorus, 'styleSelect');
                this.view.render();
            });

            it("should display 'No numerical columns' instead of the numerical column selector", function() {
                expect(this.view.$(".value select option")).not.toExist();
                expect(this.view.$(".no_columns").text()).toContainTranslation("dataset.visualization.sidebar.no_columns.numeric");
            });

            it("should display 'No columns' instead of the categorical column selector", function() {
                expect(this.view.$(".category select option")).not.toExist();
                expect(this.view.$(".no_columns").text()).toContainTranslation("dataset.visualization.sidebar.no_columns.all");
            });

            it("should disable the button", function() {
                expect(this.view.$("button.create")).toBeDisabled();
            });
        });

        context("with only one valid column", function() {
            beforeEach(function() {
                this.model = backboneFixtures.workspaceDataset.chorusView({objectName: "Foo"});
                this.columns = backboneFixtures.databaseColumnSet([{typeCategory: "ANIMAL", name: "a Speed"}]);
                this.view = new chorus.views.BoxplotChartConfiguration({model: this.model, collection: this.columns});
                this.view.render();
            });


            it("should disable the button", function() {
                expect(this.view.$("button.create")).toBeDisabled();
            });
        });

        describe("'create chart' button", function() {
            beforeEach(function() {
                this.columns = backboneFixtures.databaseColumnSet([]);
                this.view = new chorus.views.BoxplotChartConfiguration({collection: this.columns});
                spyOn(chorus, 'styleSelect');
                this.view.render();
            });

            it("should have the right caption", function() {
                expect(this.view.$("button.create").text()).toMatchTranslation("dataset.visualization.sidebar.create_chart");
            });
        });

    });
});
