class Group < ActiveRecord::Base

  attr_accessible :name, :description, :users
  # accepts_nested_attributes_for :users


  validates :name, :presence => true

  has_and_belongs_to_many :users
  has_and_belongs_to_many :roles
  has_one :chorus_scope
end