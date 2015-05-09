require 'events/base'

module Events
  class WorkspaceImportSuccess < Base
    has_targets :source_dataset, :dataset, :workspace
    has_activities :actor, :workspace, :dataset, :source_dataset
  end
end