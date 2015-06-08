chorus.collections.KaggleUserSet = chorus.collections.Base.extend({
    constructorName: "KaggleUserSet",
    model: chorus.models.KaggleUser,
    urlTemplate: "kaggle/users",

    count: function() {
        return this.models.length;
    }
});
