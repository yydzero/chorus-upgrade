describe("chorus.views.TruncatedText", function() {
    beforeEach(function() {
        this.text = '<span style="font-weight: normal; ">This is&nbsp;</span><div><span style="font-weight: normal;"><br></span>' +
            '</div><div><span style="font-weight: normal;"><br></span></div><div><span style="font-weight: normal; "><br></span>' +
            '</div><div><span style="font-weight: normal; ">some </span><b>great</b> stuff <div style="font-weight: normal; "><ul>' +
            '<li><span style="font-size: 10pt; ">one</span></li><li><span style="font-size: 10pt; ">two</span></li><li>' +
            '<span style="font-size: 10pt;">three</span> </li></ul><a href="http://example.com">hi</a></div></div>';
        this.model = backboneFixtures.workspace({ summary: this.text });

        this.view = new chorus.views.TruncatedText({model: this.model, attribute: "summary", attributeIsHtmlSafe: true});

        this.parent = $("<div/>")
            .css("width", "200px")
            .append(this.view.el);
        $('#jasmine_content').append(this.parent);
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view.render();
        });

        it("renders the text", function() {
            expect(this.view.$(".original").html()).toBe(this.text);
        });

        context("when the text height is greater than two lines", function() {
            it("marks the view as expandable", function() {
                expect($(this.view.el)).toHaveClass('expandable');
            });

            describe("clicking 'read more'", function() {
                beforeEach(function() {
                    spyOn(this.view, "recalculateScrolling");
                    this.view.$("a.more").click();
                });

                it("adds the 'expanded' class to the .truncated_text element", function() {
                    expect($(this.view.el)).toHaveClass('expanded');
                });

                it("recalculates scrolling on the parent custom scroll object", function() {
                    expect(this.view.recalculateScrolling).toHaveBeenCalled();
                });

                describe("when the view is re-rendered", function() {
                    beforeEach(function() {
                        this.view.render();
                    });

                    it("still has the 'expandable' class", function() {
                        expect($(this.view.el)).toHaveClass('expandable');
                    });
                });

                describe("clicking 'read less'", function() {
                    beforeEach(function() {
                        this.view.$("a.less").click();
                    });

                    it("removes the 'expanded' class to the .truncated_text element", function() {
                        expect($(this.view.el)).not.toHaveClass('expanded');
                    });
                });
            });
        });

        context("when the text height is less than or equal to two lines", function() {
            beforeEach(function() {
                this.model.set({ summary: "This is <br/>a test"});
            });

            it("marks the view as not expandable", function() {
                expect($(this.view.el)).not.toHaveClass('expandable');
            });
        });

        context("when attributeIsHtmlSafe is false", function() {
            beforeEach(function() {
                this.view.options.attributeIsHtmlSafe = false;
                this.view.render();
            });

            it("escapes the HTML", function() {
                expect(this.view.$('span')).not.toExist();
            });
        });

        context("when given an extraLine option", function() {
            beforeEach(function() {
                this.text = "This is <br>a test <br> more";
                this.model.set({ summary: this.text});
                this.view.options.extraLine = true;
                this.view.render();
            });

            it("renders the text", function() {
                expect(this.view.$(".original").html()).toBe(this.text);
            });

            it("marks the view as not expandable", function() {
                expect($(this.view.el)).not.toHaveClass('expandable');
            });

            it("adds class extra_line to the .styled_text", function() {
                expect(this.view.$(".styled_text")).toHaveClass("extra_line");
            });
        });

        it("renders 'read more' and 'read less' links", function() {
            expect(this.view.$(".links a.more").text().trim()).toMatchTranslation("truncated_text.more");
            expect(this.view.$(".links a.less").text().trim()).toMatchTranslation("truncated_text.less");
        });

        it("is not expanded", function() {
            expect($(this.view.el)).not.toHaveClass('expanded');
        });

        describe("clicking links in the text", function() {
            beforeEach(function() {
                spyOn(window, "open");
                this.view.$(".original a").click();
            });

            it("opens the link in a new window", function() {
                expect(window.open).toHaveBeenCalledWith("http://example.com");
            });
        });
    });
});
