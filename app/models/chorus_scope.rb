class ChorusScope < ActiveRecord::Base
  attr_accessible :name, :description

  validates :name, :presence => true

  has_many :chorus_objects
  belongs_to :group
  #has_many :users

  def has_object?(chorus_object)
    chorus_objects.where(:instance_id => chorus_object.id).count > 0
  end


  def has_user?(user)
    group.users.where(:username => user.username).count > 0
  end


  def scoped_objects(class_name)
    ret = []
    chorus_class = ChorusClass.find_by_name(class_name.camelize)
    clazz = class_name.camelize.constantize
    if chorus_class == nil
      #raise exception TBD
      return nil
    else
      chorus_objects.where(:chorus_class_id => chorus_class.id).each do |instance|
        ret << clazz.find(instance.instance_id)
      end
    end
    ret
  end

  def data_sources

  end

end