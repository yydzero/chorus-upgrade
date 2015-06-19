# Module for dealing with permission bitmasks. It adds class methods
# that generate bitmasks or permission bits using the PERMISSIONS
# constant on the class

module Permissioner
  extend ActiveSupport::Concern

  included do
    after_create :initialize_default_roles, :if => Proc.new { |obj| obj.class.const_defined? 'OBJECT_LEVEL_ROLES' }
    after_create :create_chorus_object
    after_destroy :destroy_chorus_object
  end

  def initialize_default_roles
    default_roles = self.class::OBJECT_LEVEL_ROLES.map do |role_symbol|
      Role.create(:name => role_symbol.to_s)
    end
    object_roles << default_roles
  end

  # Returns true if current user has assigned scope. False otherwise
  def self.user_in_scope?(user)

    if self.is_admin?(user)
      return false
    end
    if user == nil
      # log error and raise exception TBD
      return nil
    else
      groups = user.groups
      groups.each do |group|
        if group.chorus_scope != nil
          return true
        end
      end
    end
    return false
  end

  # Returns true if user has site wide admin role.
  def self.is_admin?(user)
    admin_roles = %w(Admin SiteAdministrator)
    roles = user.roles
    roles.each do |role|
      if admin_roles.include?(role.name)
        return true
      end
    end
    return false
  end

  # Returns True if the object is within the scope of current user. False otherwise
   def in_scope?(user)
     groups = user.groups
     groups.each do |group|
       if group.chorus_scope == self.chorus_scope
         return true
       end
     end
     return false
   end

  # returns Scope object if the object belongs a scope. Returns nil otherwise.
  def chorus_scope
     chorus_class = ChorusClass.find_by_name(self.class.name)
     if chorus_class == nil
       #raise exception
       return nil
     end
     chorus_object = ChorusObject.where(:instance_id => self.id, :chorus_class_id => chorus_class.id).first
     if chorus_object == nil
       #raise exception T
       return nil
     else
       if chorus_object.chorus_scope == nil
          if chorus_object.parent_object != nil
            return chorus_object.parent_object.chorus_scope
          end
       else
         return chorus_object.chorus_scope
       end
     end
    return nil
   end

  # Called after model object is created. Created corresponding entry in chorus_objects table
  def create_chorus_object
    #chorus_class = ChorusClass.find_or_create_by_name(self.class.name)
    chorus_class = ChorusClass.where(:name => self.name).first
    if chorus_class == nil
      chorus_class = ChorusClass.create!(:name => self.name)
    end
    #ChorusObject.find_or_create_by_chorus_class_id_and_instance_id(chorus_class.id, self.id)
    chorus_object = ChorusObject.where(:instance_id => self.id, :chorus_class_id => chorus_class.id).first
    if chorus_object == nil
      ChorusObject.create!(:instance_id => self.id, :chorus_class_id => chorus_class.id)
    end
  end

  # Called after a model object is destroyed. Removes corresponding entry from chorus_objects table
  def destroy_chorus_object
    #chorus_class = ChorusClass.find_or_create_by_name(self.class.name)
    chorus_class = ChorusClass.where(:name => self.class.name).first
    if chorus_class != nil
      chorus_object = ChorusObject.where(:instance_id => self.id, :chorus_class_id => chorus_class.id).first
      chorus_object.destroy if chorus_object.nil? == false
    end
  end

  # Ex: Workspace.first.create_permisisons_for(roles, [:edit, :destroy])
  def set_permissions_for(roles, activity_symbol_array)
    permissions = self.class.generate_permissions_for roles, activity_symbol_array
    permissions.each(&:save!)
  end

  def object_roles(name=nil)
    self.save! if new_record?

    if name.nil? then self.chorus_object.roles else self.chorus_object.roles.find_by_name(name) end
  end

  def chorus_object
    chorus_class = ChorusClass.where(:name => self.class.name).first
    if chorus_class == nil
      chorus_class = ChorusClass.create!(:name => self.class.name)
    end
    #chorus_class = ChorusClass.find_or_create_by_name(self.name)
    ChorusObject.where(:chorus_class_id => chorus_class.id, :instance_id => self.id).first
    #chorus_object = ChorusObject.find_or_create_by_chorus_class_id_and_instance_id(chorus_class.id, self.id)
  end

  # returns a parent object if exists. Nil otherwise
  def parent_object
    chorus_object = ChorusObject.where(:instance_id => self.id, :chorus_class_id => ChorusClass.find_by_name(self.class.name)).first
    return chorus_object.parent_object if chorus_object != nil

    return nil

  end

  # Class-level methods invlove setting class-level permissions/roles (vs object-level)
  module ClassMethods


    # Given an collection of objects, returns a collection filterd by user's scope. Removes objects that are not in user's current scope.
    def filter_by_scope(user, objects)
      ret = []
      groups = user.groups
      groups.each do |group|
        chorus_scope = group.chorus_scope
        if chorus_scope == nil
          continue
        end
        #TODO Prakash : Can user belong to more than one scope?
        objects.each do |objectz|
          if objectz.chorus_scope == chorus_scope
            puts "Adding object id = #{objectz.id} to filtered list"
            ret << objectz
          end
        end
      end

      ret

    end

    # returns total # of objects of current class type in scope for current_user
    def count_in_scope(user)
      total = 0
      groups = user.groups
      groups.each do |group|
        chorus_scope = group.chorus_scope
        if chorus_scope == nil
          total = total + count
        else
          chorus_scope = group.chorus_scope
          #TODO: RPG Need to figure out how to handle special cases of sub classes.
          case name
            when 'Workfile'
              total = total + chorus_scope.scoped_objects('ChorusWorkfile').count + chorus_scope.scoped_objects('AlpineWorkfile').count
            else
              total = total + chorus_scope.scoped_objects(name).count
          end
        end
      end
      return total
    end

    # returns permissions for a given role and chorus _clas as an array of symbols
    # role = role name as string
    # chorus_class = chorus class name as string
    def permissions_for_role(role_name)
      chorus_class = ChorusClass.find_by_name(self.name)
      if chorus_class == nil
        return []
      end
      role = Role.find_by_name(role_name)
      operations = Operation.where(:chorus_class_id => chorus_class.id).order(:sequence).pluck('name')
      activity_symbols = Set.new
      permission = role.permissions.where(:chorus_class_id => chorus_class.id).first
      if permission == nil
        return []
      end
      bits = permission.permissions_mask
      bit_length = bits.size * 8
      bit_length.times do |i|
        activity_symbols.add(operations[i].to_sym) if bits[i] == 1
      end

      activity_symbols.to_a
    end

    def permission_symbols_for(user)
      chorus_class = ChorusClass.find_by_name(self.name)
      permissions = user.roles.map(&:permissions).flatten.select{|permission| permission.chorus_class == chorus_class}

      activity_symbols = Set.new
      permissions.each do |permission|
        bits = permission.permissions_mask
        bit_length = bits.size * 8
        bit_length.times do |i|
          activity_symbols.add(self::PERMISSIONS[i]) if bits[i] == 1
        end
      end

      activity_symbols.to_a
    end

    # Given an activity, this method returns an integer with that
    # bit set
    # TODO: consider deleting
    def bitmask_for(activity_symbol)
      with_permissions_defined do
        index = self::PERMISSIONS.index(activity_symbol)
        raise Allowy::AccessDenied.new("Activity not found", nil, nil) if index.nil?
        return 1 << index
      end
    end

    # Given an array of permission symbols, this function
    # returns an integer with the proper permission bits set
    def create_permission_bits_for(activity_symbol_array)
      chorus_class = ChorusClass.where(:name => self.name).first
      if chorus_class == nil
        chorus_class = ChorusClass.create!(:name => self.name)
      end
      operations = Operation.where(:chorus_class_id => chorus_class.id).order(:sequence).pluck('name')
        bits = 0
        return bits if activity_symbol_array.nil?

        activity_symbol_array.each do |activity_symbol|
          index = operations.index(activity_symbol.to_s)
          puts "activity symbol #{activity_symbol} not found" if index.nil?
          bits |= ( 1 << index ) if index.nil? == false
        end
        return bits
    end

    # DataSource.create_permissions_for dev_role, [:edit]
    def generate_permissions_for(roles, activity_symbol_array)
      klass = self
      roles, activities = Array.wrap(roles), Array.wrap(activity_symbol_array)
      #chorus_class = ChorusClass.find_or_create_by_name(self.name)
      chorus_class = ChorusClass.where(:name => self.name).first
      if chorus_class == nil
        chorus_class = ChorusClass.create!(:name => self.name)
      end
      permissions = roles.map do |role|
        #permission = Permission.find_or_initialize_by_role_id_and_chorus_class_id(role.id, chorus_class.id)
        permission = Permission.where(:role_id => role.id, :chorus_class_id => chorus_class.id).first
        if permission == nil
          permission = Permission.new(:role_id => role.id, :chorus_class_id => chorus_class.id)
        end
        # NOTE: This currently over-writes the permissions mask. It would be useful to have
        # (create, add, remove), or, (create, modify) with options
        permission.permissions_mask = klass.create_permission_bits_for(activities)
        permission.role = role
        permission.save!
        permission
      end

      permissions
    end

    def set_permissions_for(roles, activity_symbol_array)
      #chorus_class = ChorusClass.find_or_create_by_name(self.name)
      chorus_class = ChorusClass.where(:name => self.name).first
      if chorus_class == nil
        chorus_class = ChorusClass.create!(:name => self.name)
      end

      chorus_class.permissions << generate_permissions_for(roles, activity_symbol_array)
    end

    # Figure out how to make these private
    def with_permissions_defined
      if const_defined? 'PERMISSIONS'
        yield
      else
        permissions_not_defined
      end
    end

    def permissions_not_defined
      Chorus.log_debug("PERMISSIONS are not defined on #{self.name} model")
      puts "PERMISSIONS are not defined on #{self.name} model"
      # raise different error, this one doesn't really make sense
      raise Allowy::AccessDenied.new("PERMISSIONS are not defined on #{self.name} model", nil, nil)
    end

  end # ClassMethods
end