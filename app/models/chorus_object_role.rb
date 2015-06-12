class ChorusObjectRole < ActiveRecord::Base
  include Permissioner

  belongs_to :user
  belongs_to :chorus_object
  belongs_to :role
end