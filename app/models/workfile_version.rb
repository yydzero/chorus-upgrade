class WorkfileVersion < ActiveRecord::Base
  attr_accessible :commit_message, :owner, :modifier, :contents, :version_num, :as => [:default, :create]
  has_attached_file :contents,
                    :styles => {:icon => "50x50>"},
                    :path => ":rails_root/system/:class/:id/:style/:basename.:extension",
                    :url => "/:class/:id/image?style=:style",
                    :restricted_characters => nil #retain original filename
  do_not_validate_attachment_file_type :contents

  belongs_to :workfile, :class_name => 'ChorusWorkfile', :touch => true
  belongs_to :owner, :class_name => 'User',  :touch => true
  belongs_to :modifier, :class_name => 'User', :touch => true
  before_post_process :check_file_type

  before_save :fix_workfile_association, :on => :create
  # Fix for DEV-8648. Creating a SQL workfile takes a long time. We are not caching workfileVersion objects so there is no need for deleting cache.
  before_save :delete_cache
  before_validation :init_version_number, :on => :create

  after_save do
    workfile.solr_index
    workfile.touch(:user_modified_at)
  end


  def delete_cache
     if self.id != nil && current_user != nil
       cache_key = "workspace:workfiles/Users/#{current_user.id}/#{self.class.name}/#{self.id}-#{(self.updated_at.to_f * 1000).round(0)}"
       Chorus.log_debug "-- BEFORE SAVE: Clearing cache for #{self.class.name} with cache key = #{cache_key} --"
       Rails.cache.delete(cache_key)
     end
     return true
  end

  after_validation :clean_content_errors

  validates_attachment_size :contents, :less_than => ChorusConfig.instance['file_sizes_mb']['workfiles'].megabytes, :message => :file_size_exceeded

  after_create do
    workfile.update_attributes!({:latest_workfile_version_id => id}, :without_protection => true)

    if version_num == 1
      workfile.update_attributes!({:content_type => file_type}, :without_protection => true)
    end
  end

  # KT: should be named "attempt_to_resize? or should_post_process?"
  def check_file_type
    image?
  end

  def file_name
    contents.original_filename
  end

  CODE_EXTENSIONS = %w(cpp r rb py js java pig md)

  def extension
    file_name = contents.original_filename || ''
    File.extname(file_name)[1..-1].try(:downcase)
  end

  def file_type
    if image?
      'image'
    elsif code?
      'code'
    elsif sql?
      'sql'
    elsif xml?
      'xml'
    elsif text?
      'text'
    else
      'other'
    end
  end

  def image?
    content_type && content_type.include?('image')
  end

  def text?
    content_type && (content_type.include?('text') || xml? || code?) && !content_type.include?('opendocument')
  end

  def xml?
    content_type && content_type.include?('application/xml')
  end

  def sql?
    extension == 'sql'
  end

  def code?
    CODE_EXTENSIONS.include?(extension)
  end

  def content_type
    contents.content_type
  end

  def update_content(new_content)
    if latest_version?
      File.open(contents.path, 'w') do |file|
        file.write new_content
      end
      workfile.touch(:user_modified_at)
    else
      errors.add(:version, :invalid)
      raise ActiveRecord::RecordInvalid.new(self)
    end
  end

  def get_content(to_offset = nil)
    args = [contents.path]
    args << to_offset if to_offset
    if text? || sql?
      content = File.read(*args)
      content.force_encoding('utf-8') if content
    end
  end

  private

  def latest_version?
    version_num == workfile.latest_workfile_version.version_num
  end

  def clean_content_errors
    if errors[:contents].present?
      errors.delete(:contents)
      errors.add(:contents, :invalid)
    end
  end

  def init_version_number
    self.version_num ||= 1
  end

  def fix_workfile_association
    association = association(:workfile)
    if association.loaded?
      association.loaded! if association.stale_target?
    end
  end
end
