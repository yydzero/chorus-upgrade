describe("translation", function() {
    describe("#parseProperties", function() {
        beforeEach(function() {
            this.translationString =
                "quux=Non-nested\n" +
                "test.foo=Bar\n" +
                "test.bar.baz=Stuff\n" +
                "\n" +
                "#I am a comment\n" +
                "#2+2=4\n" +
                "multiline=\\\n" +
                "    line2\\ \n" +
                "    line3\n" +
                "value_with_equal_sign=1+1=2";
            this.topLevelKeys = ['quux', 'test', 'multiline', 'value_with_equal_sign'];
            this.result = chorus.translation.parseProperties(this.translationString);
        });

        it("handles non-nested keys", function() {
            expect(this.result.quux).toEqual('Non-nested');
        });

        it("handles nested keys", function() {
            expect(this.result.test.foo).toEqual('Bar');
            expect(this.result.test.bar.baz).toEqual('Stuff');
        });

        it("handles comments, and blank lines", function() {
            expect(_.keys(this.result).sort()).toEqual(this.topLevelKeys.sort());
        });

        it("handles equals signs in Properties", function() {
            expect(this.result["value_with_equal_sign"]).toBe("1+1=2");
        });

        it("handles multi line translations", function() {
            expect(this.result.multiline).toMatch('line2');
            expect(this.result.multiline).toMatch('line3');
            expect(this.result.multiline).not.toMatch(/\\/);
        });

        context("overriding an existing key", function() {
            it("raises an alert when base key is defined first", function() {
                spyOn(window, 'alert');

                this.translationString =
                    "quux=Non-nested\n" +
                    "quux.foo=Bar\n";
                chorus.translation.parseProperties(this.translationString);

                expect(window.alert).toHaveBeenCalled();
            });

            it("raises an alert when nested key is defined first", function() {
                spyOn(window, 'alert');

                this.translationString =
                    "quux.foo=Bar\n" +
                    "quux=Non-nested\n";
                chorus.translation.parseProperties(this.translationString);

                expect(window.alert).toHaveBeenCalled();
            });
        });
    });

    describe("#getMessageFileUrl", function() {
        it("has the correct basename", function() {
            expect(chorus.translation.getMessageFileUrl()).toContain("/messages/Messages_");
        });

        it("contains the current locale", function() {
            expect(chorus.translation.getMessageFileUrl()).toContain("_en.");
        });

        it ("contains a cache-busting Url", function(){
            expect (chorus.translation.getMessageFileUrl()).toMatch(/\?iebuster\=[0-9]+/);
        });
    });
});
