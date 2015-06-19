class ChorusClass < ActiveRecord::Base
  attr_accessible :name, :description, :parent_class_id, :parent_class_name

  has_many :chorus_objects
  has_many :operations
  accepts_nested_attributes_for :operations

  #TODO: Prakash. Need to discuss with Andrew. Why is this needed here. The permissions are on the role object Not on chorus_object
  has_many :permissions

  # Finds the first ancestor with permissions
  # Open to new names, this one isn't great
  def self.search_permission_tree(klass, activity_symbol)
    initial_search = find_by_name(klass.name)

    if initial_search.nil?
      Chorus.log_error "Could not find ChorusClass with name #{klass.name}. Make sure you include Permissioner in the model and set the desired permissions"
    end

    if initial_search.permissions.empty?

      superclasses_of(klass).each do |ancestor|
        ancestor_chorus_class = find_by_name(ancestor.to_s)
        return ancestor_chorus_class if ancestor_chorus_class && ancestor::PERMISSIONS.include?(activity_symbol)
      end

    else
      return initial_search
    end

    Chorus.log_error "Couldn't find an ancestor with permissions for the class #{klass}"
    raise Allowy::AccessDenied.new("No permissions found", nil, nil)
    return
  end

  def class_operations
    parray = []
    operations.order(:sequence).each do |operation|
      parray << operation.name.to_sym
    end
    parray
  end

  def permissions_for(role_name)
    chorus_role = Role.find_by_name(role_name.camelize)
    ret = Set.new
    if chorus_role == nil
      #raise exception
      return nil
    else
      perm_obj = chorus_role.permissions.where(:chorus_class_id => id).first
      if perm_obj == nil
        #raise exception
        return nil
      else
        operations = class_operations
        bits = perm_obj.permissions_mask
        bit_length = bits.size * 8
        bit_length.times do |i|
          ret.add(operations[i].to_sym) if bits[i] == 1
        end

      end

    end

    ret.to_a

  end

  private

  # This nifty method returns an array of classes that are direct superclasses of the given class
  def self.superclasses_of(klass)
    klass.ancestors[1..-1].select{|mod| mod.is_a? Class}
  end
end
