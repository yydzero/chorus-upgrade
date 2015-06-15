module SoftDelete
  extend ActiveSupport::Concern

  included do
    default_scope { where deleted_at: nil }
  end

  def destroy
    @being_destroyed = true
    run_callbacks(:destroy) do
      self.deleted_at = Time.current.utc
      save(:validate => false)
    end
    self
  end

  def deleted?
    deleted_at.present? || being_destroyed?
  end

  def being_destroyed?
    @being_destroyed
  end

  module ClassMethods
    def find_with_destroyed *args
      self.unscoped { find(*args) }
    end
  end
end
