chorus.pages.Error = chorus.pages.Bare.extend({
    templateName: "error",
    additionalClass: "logged_in_layout",

    events: {
        "click .link_home": "navigateToHome",
        // "click .link_backwards": "navigateBack"
    },

    subviews: {
        "#header": "header"
    },

    setupSubviews: function() {
        this.header = new chorus.views.Header();
    },

    navigateToHome: function() {
        chorus.router.navigate("#");
    },
    
    //TODO: find a way to fix the navigate back
    navigateBack: function() {
        history.go(-1);
    },
    
    context: function() {
        return _.extend({
            title: this.title,
            text: this.text
        }, this.pageOptions);
    }
});
