chorus.alerts.NotificationDeleteAlert = chorus.alerts.ModelDelete.extend({
    constructorName: "NotificationDeleteAlert",

    ok: t("notification.delete.ok"),
    title: t("notification.delete.title"),
    text: t("notification.delete.text"),
    deleteMessage: "notification.delete.success",

    makeModel: function() {
        this._super("makeModel", arguments);
        this.model = new chorus.models.Notification({id: this.options.activity.get("id")});
    },

    modelDeleted: function() {
        this._super("modelDeleted");
        chorus.PageEvents.trigger("notification:deleted");
    }
});
