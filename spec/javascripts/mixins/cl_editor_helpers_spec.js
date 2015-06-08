describe("chorus.Mixins.clEditor", function() {
    var controls = ["bold", "italic", "bullets", "numbers", "link", "unlink"];
    
    beforeEach(function() {
        unstubClEditor();
//         this.editorContainer = $("<div class='container'><div class='toolbar'></div><textarea name='summary'></textarea></div>");
        this.editorContainer = $("<div class='container'><textarea name='summary'></textarea></div>");
        $('#jasmine_content').append(this.editorContainer);

        _.each(controls, function(control) {
            // spyOn(chorus.Mixins.ClEditor,  "onClickToolbar"+ _.capitalize(control)).andCallThrough();
        });

    });

    describe("#makeEditor", function() {
        context("without options", function() {
            beforeEach(function() {
                // this.editor = chorus.Mixins.ClEditor.makeEditor(this.editorContainer, ".toolbar", "summary");
                this.editor = chorus.Mixins.ClEditor.makeEditor(this.editorContainer, "summary");
            });

            it("should return a cl editor", function() {
                expect(this.editor).toBeDefined();
                expect(this.editor).toBeA(cleditor);
            });

            it("should have the given controls", function() {
                expect(this.editor.options.controls).toBe("bold italic | bullets numbering | link unlink");
            });

//             _.each(controls, function(control) {
//                 it("should append the " + control + " control to the toolbars", function() {
//                     expect($('.toolbar a.' + control)).toExist();
//                     expect($('.toolbar a.' + control)).toContainTranslation("workspace.settings.toolbar." + control);
//                 });

//                 it("should bind clicking on the " + control + " link to onClickToolBar" + _.capitalize(control), function() {
//                     var methodName = "onClickToolbar" + _.capitalize(control);
//                     $('.toolbar a.' + control).click();
//                     expect(chorus.Mixins.ClEditor[methodName]).toHaveBeenCalled();
//                 });
            });
        });

        context("with options", function() {
            beforeEach(function() {
                var options = { width: 200 };
                // this.editor = chorus.Mixins.ClEditor.makeEditor(this.editorContainer, "toolbar", "summary", options);
                this.editor = chorus.Mixins.ClEditor.makeEditor(this.editorContainer, "summary", options);
            });

            it("should make an editor with the passed options", function() {
                expect(this.editor.options.width).toBe(200);
            });
        });
    });

describe("#getNormalizedText", function() {
    it("does not change text that ends in something besides a 'newline'", function() {
        var $textarea = $("<textarea/>");
        $textarea.val("<div>foo</div>");

        expect(chorus.Mixins.ClEditor.getNormalizedText($textarea)).toBe("<div>foo</div>");
    });

    it("removes a single trailing 'newline'", function() {
        var $textarea = $("<textarea/>");
        $textarea.val("Hello<div><br></div>");

        expect(chorus.Mixins.ClEditor.getNormalizedText($textarea)).toBe("Hello");
    });

    it("removes multiple trailing 'newlines'", function() {
        var $textarea = $("<textarea/>");
        $textarea.val("Hello<div><br></div><div><br></div><div><br></div>");

        expect(chorus.Mixins.ClEditor.getNormalizedText($textarea)).toBe("Hello");
    });

    it("removes single break tags if there is no text", function() {
        var $textarea = $("<textarea/>");
        $textarea.val("<br>");
        expect(chorus.Mixins.ClEditor.getNormalizedText($textarea)).toBe("");
    });
});

//     describe("toolbar helpers", function() {
//         beforeEach(function() {
            // this.editor = chorus.Mixins.ClEditor.makeEditor(this.editorContainer, ".toolbar", "summary");
//             this.editor = chorus.Mixins.ClEditor.makeEditor(this.editorContainer, "summary");
//         });

// TODO: if there is a way to test the graphic images, then revise to use
// else delete when graphic toolbar is final

//         describe("#onClickToolbarBold", function() {
//                 it("should click the corresponding cleditorButton", function() {
//                     spyOnEvent(".cleditorButton[title='Bold']", "click");
//                     $('a.bold').click();
//                     expect("click").toHaveBeenTriggeredOn(".cleditorButton[title='Bold']");
//                 });
//             });
// 
//         describe("#onClickToolbarItalic", function() {
//                 it("should click the corresponding cleditorButton", function() {
//                     spyOnEvent(".cleditorButton[title='Italic']", "click");
//                     $('a.italic').click();
//                     expect("click").toHaveBeenTriggeredOn(".cleditorButton[title='Italic']");
//                 });
//             });
//         describe("#onClickToolbarBullets", function() {
//                 it("should click the corresponding cleditorButton", function() {
//                     spyOnEvent(".cleditorButton[title='Bullets']", "click");
//                     $('a.bullets').click();
//                     expect("click").toHaveBeenTriggeredOn(".cleditorButton[title='Bullets']");
//                 });
//             });
// 
//         describe("#onClickToolbarNumbers", function() {
//                 it("should click the corresponding cleditorButton", function() {
//                     spyOnEvent(".cleditorButton[title='Numbering']", "click");
//                     $('a.numbers').click();
//                     expect("click").toHaveBeenTriggeredOn(".cleditorButton[title='Numbering']");
//                 });
//             });
// 
//         describe("#onClickToolbarLink", function() {
//                 it("should click the corresponding cleditorButton", function() {
//                     spyOnEvent(".cleditorButton[title='Insert Hyperlink']", "click");
//                     $('a.link').click();
//                     expect("click").toHaveBeenTriggeredOn(".cleditorButton[title='Insert Hyperlink']");
//                 });
//             });
// 
//         describe("#onClickToolbarUnlink", function() {
//                 it("should click the corresponding cleditorButton", function() {
//                     spyOnEvent(".cleditorButton[title='Remove Hyperlink']", "click");
//                     $('a.unlink').click();
//                     expect("click").toHaveBeenTriggeredOn(".cleditorButton[title='Remove Hyperlink']");
//                 });
//             });
//     });
// 