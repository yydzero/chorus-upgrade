class Milestone < ActiveRecord::Base
  STATES = ['planned', 'achieved']

  belongs_to :workspace, :touch => true

  attr_accessible :name, :state, :target_date

  validates_presence_of :name, :state, :target_date, :workspace
  validates_inclusion_of :state, :in => STATES

  after_save :project_hooks
  after_destroy :project_hooks

  before_validation :set_state_planned, :on => :create

  private

  def project_hooks
    update_counter_cache
    update_workspace_target_date
  end

  def update_workspace_target_date

    # Prakash. using order on ActiveRecord_AssociationProxy does not load the objects in memory and resulting in exception.
    # Had to force loading the milestones in memory before using order clause. (Rails 4 upgrade)
    #date = workspace.milestones.any? ? workspace.milestones.order('milestones.target_date').last.target_date : nil
    milestones = workspace.milestones
    # using true will force a database query instead of using cache.
    if workspace.milestones(true).size != 0
      date = milestones.order('target_date').last.target_date
      workspace.update_attribute(:project_target_date, date)
    end

  end

  def update_counter_cache
    workspace.update_column(:milestones_count, workspace.milestones.count)
    workspace.update_column(:milestones_achieved_count, workspace.milestones.where(state: 'achieved').count)
  end

  def set_state_planned
    self.state = 'planned'
  end
end
