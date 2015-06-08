chorus.alerts.RemoveJoinConfirmAlert = chorus.alerts.Confirm.extend({
    constructorName: "RemoveJoinConfirmAlert",

    title: t("dataset.join.remove.title"),
    ok: t("dataset.join.remove.ok"),

    setup: function() {
        this.text = t("dataset.join.remove.text", {tableName: this.options.dataset.get("objectName")});
    },

    confirmAlert: function() {
        this.options.chorusView.removeJoin(this.options.dataset);
        this.closeModal();
    }
});
