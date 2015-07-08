# KT: Neither JsonArraySerializer or JsonHashSerializer are necessary, I don't think, because Rails 4 now has a default
# "JSON" serializer:
# http://apidock.com/rails/v4.1.8/ActiveRecord/AttributeMethods/Serialization/ClassMethods/serialize
# ... but, we cannot undo it, because this implementation returns an empty [] or {} when additional_data is nil.
# ... and this is in customers' databases now.  Once the Rails 4 upgrade has been merged to master, we can investigate
# writing a database migration to remove this, and falling back to the inbuilt serializer.

class JsonArraySerializer
  def self.dump(hash)
    ActiveSupport::JSON.encode(hash)
  end

  def self.load(value)
    if value.present?
      ActiveSupport::JSON.decode(value)
    else
      # KT & MS: JsonHashSerializer is identical, except it has a {} here:
      []
    end
  end
end

