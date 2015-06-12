describe("chorus.models.Task", function() {
    var TaskSubclass, task;

    beforeEach(function() {
        TaskSubclass = chorus.models.Task.extend({
            urlTemplateBase: "base"
        });

        task = new TaskSubclass();
    });

    describe("#url", function() {
        context("for delete requests", function() {
            it("appends the task's 'checkId' to the 'urlTemplateBase'", function() {
                task.set({ checkId: "123_4" });
                task.cancel();
                expect(this.server.lastDestroy().url).toBe("/base/123_4");
            });
        });

        context("for creates, updates and reads", function() {
            it("uses the 'urlTemplateBase'", function() {
                task.set({ checkId: "123_4" });
                task.save();
                var request = this.server.lastCreate();
                expect(request.url).toBe("/base");
                expect(request.json()["task"]["check_id"]).toBe("123_4");
            });
        });
    });

    it("has a random checkId", function() {
        spyOn(Math, 'random').andReturn(0.12345678);
        task = new TaskSubclass();
        expect(task.get("checkId")).toBe('12345679');
    });

    describe("cancel", function() {
        function itCreatesCancelRequestAndIgnoreSubsequent() {
            it("creates a cancel request", function() {
                var cancelRequest = this.server.lastDestroy();
                expect(cancelRequest.url).toMatchUrl(task.url({ method: "delete" }));
                expect(task.has('action')).toBeFalsy();
            });

            it("ignores subsequent calls to cancel", function() {
                task.cancel();
                expect(this.server.destroys().length).toBe(1);
            });
        }

        beforeEach(function() {
            task = new TaskSubclass();
            task.save();
            task.cancel();
        });

        itCreatesCancelRequestAndIgnoreSubsequent();

        describe("when the request completes", function() {
            beforeEach(function() {
                spyOnEvent(task, 'canceled');
                this.server.lastDestroy().succeed();
                this.server.lastCreate().fail();
                this.server.reset();
            });

            it("triggers the 'canceled' event on the task", function() {
                expect('canceled').toHaveBeenTriggeredOn(task);
            });

            context("click on cancel again", function() {
                beforeEach(function() {
                    task.save();
                    task.cancel();
                });

                itCreatesCancelRequestAndIgnoreSubsequent();
            });
        });

        it("respects sends destroyParams when set", function() {
            task = new TaskSubclass();
            task.destroyParams = function() {
                return {fooSomething: 'bar'};
            };
            task.cancel();

            var params = this.server.lastDestroy().params();
            expect(params.foo_something).toBe("bar");
        });
    });

    describe("save", function() {
        it("clears the loaded flag when a save begins", function() {
            task.loaded = true;
            task.save();
            expect(task.loaded).toBeFalsy();
        });
    });

    it("won't cancel after the data has loaded", function() {
        task = new TaskSubclass();
        task.loaded = true;
        task.cancel();
        expect(this.server.requests.length).toBe(0);
    });
});
