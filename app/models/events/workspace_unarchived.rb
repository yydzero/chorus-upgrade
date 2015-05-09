require 'events/base'

module Events
  class WorkspaceUnarchived < Base
    has_targets :workspace
    has_activities :actor, :workspace
  end
end