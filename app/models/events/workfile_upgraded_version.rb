require 'events/base'

module Events
  class WorkfileUpgradedVersion < Base
    has_targets :workfile, :workspace
    has_activities :actor, :workfile, :workspace
    has_additional_data :version_num, :commit_message, :version_id

    def self.presenter_class
      WorkfileUpgradedVersionPresenter
    end

    def version_is_deleted?
      !WorkfileVersion.find_by_id(version_id)
    end
  end
end