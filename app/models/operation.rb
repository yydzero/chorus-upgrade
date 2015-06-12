class Operation < ActiveRecord::Base

  attr_accessible :name, :description, :sequence, :chorus_class_id

  belongs_to :chorus_class

  validates :name, :presence => true
end
