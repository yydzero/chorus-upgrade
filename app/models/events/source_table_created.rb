require 'events/base'

module Events
  class SourceTableCreated < Base
    has_targets :dataset, :workspace
    has_activities :actor, :dataset, :workspace
  end
end