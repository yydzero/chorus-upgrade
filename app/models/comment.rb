class Comment < ActiveRecord::Base
  include SoftDelete
  include Recent
  include SearchableHtml
  include SharedSearch

  attr_accessible :author_id, :body, :event_id

  belongs_to :event, :class_name => 'Events::Base', :touch => true
  belongs_to :author, :class_name => 'User', :touch => true
  belongs_to :dataset, :touch => true


  validates_presence_of :author_id, :body, :event_id

  searchable_model
  searchable_html :body

  delegate :grouping_id, :type_name, :to => :event
  delegate_search_permissions_for :workspace, :dataset, :to => :event

  def author
    User.unscoped.find(author_id)
  end

  def actor
    author
  end

end
