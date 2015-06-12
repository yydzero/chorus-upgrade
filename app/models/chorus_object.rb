class ChorusObject < ActiveRecord::Base

  attr_accessible :chorus_class_id, :instance_id, :parent_class_id, :parent_class_name, :permission_mask, :owner_id, :parent_id, :scope_id

  belongs_to :chorus_class
  belongs_to :chorus_scope
  belongs_to :owner, :class_name => "User"
  has_many :chorus_object_roles
  has_many :roles, :through => :chorus_object_roles
  has_many :permissions, :through => :roles

  def referenced_object
    actual_class = chorus_class.name.camelize.constantize
    actual_object = actual_class.find(instance_id)
  end

  def has_parent?
    parent_id != nil
  end

  def parent_object
    actual_class = parent_class_name.camelize.constantize
    actual_class.find(parent_id)
  end
end