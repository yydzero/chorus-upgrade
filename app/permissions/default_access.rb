require 'allowy'

class DefaultAccess
  include Allowy::AccessControl

  #delegate :current_user, :to => :context

  # Prakash. User the 'send' method to call private current_user method so that it can be called by Specs.
  def current_user
    context.send(:current_user)
  end

  def access_for(model)
    context.current_allowy.access_control_for(model) || DefaultAccess.new(context)
  end

  def create_note_on?(model)
    true
  end

  def owner?(model)
    model.owner == current_user
  end
end
