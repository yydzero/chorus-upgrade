require 'events/base'

module Events
  class WorkFlowUpgradedVersion < Base
    has_targets :workfile, :workspace
    has_activities :actor, :workfile, :workspace
    has_additional_data :commit_message
  end
end