class Notification < ActiveRecord::Base
  include SoftDelete
  attr_accessible :event_id, :recipient_id, :comment_id, :event, :recipient

  belongs_to :recipient, :class_name => 'User', :foreign_key => 'recipient_id', :touch => true
  belongs_to :event, :class_name => 'Events::Base', :foreign_key => 'event_id', :touch => true #change name?
  belongs_to :comment, :touch => true

  validates_presence_of :recipient_id, :event_id

  scope :unread, where(:read => false)
end