class Workfile < ActiveRecord::Base
  include SoftDelete
  include TaggableBehavior
  include Notable

  @@entity_subtypes = Hash.new('ChorusWorkfile').merge!({
     'alpine' => 'AlpineWorkfile'
  })

  attr_accessible :description, :file_name, :as => [:default, :create]
  attr_accessible :owner, :workspace, :as => :create
  attr_accessible :status
  attr_accessor :resolve_name_conflicts

  serialize :additional_data, JsonHashSerializer

  belongs_to :workspace, :touch => true
  belongs_to :owner, :class_name => 'User', :touch => true
  belongs_to :execution_location, :polymorphic => true, :touch => true


  has_many :activities, :as => :entity
  has_many :events, :through => :activities
  has_many :comments, :through => :events
  has_many :most_recent_comments, -> { order("id DESC").limit(1) }, :through => :events, :source => :comments,
           :class_name => "Comment"
  has_many :versions, :class_name => 'WorkfileVersion', :dependent => :destroy

  belongs_to :latest_workfile_version, :class_name => 'WorkfileVersion'

  validates :workspace, presence: true
  validates :owner, presence: true
  validates_presence_of :file_name
  validates_uniqueness_of :file_name, :scope => [:workspace_id, :deleted_at]
  validates_format_of :file_name, :with => /\A[a-zA-Z0-9_ \.\(\)\-]+\z/

  before_validation :init_file_name, :on => :create

  before_update :ensure_proper_content_type
  before_save :delete_cache

  def delete_cache
    #Fix for 87339340. Avoid searching for cache if the record is newly created and does have an ID before saving to database.
    if self.id != nil && current_user != nil
      cache_key = "workspace:workfiles/Users/#{current_user.id}/#{self.class.name}/#{self.id}-#{(self.updated_at.to_f * 1000).round(0)}"
      Chorus.log_debug "-- BEFORE SAVE: Clearing cache for #{self.class.name} with cache key = #{cache_key} --"
      Rails.cache.delete(cache_key)
      # Fix for DEV-8648. Creating a SQL workfile takes a long time. We are not caching workfileVersion objects so there is no need for deleting cache.
      # Fix for DEV-8954 When I rename a myfilename.pmml to myfiletest.pmml, the changes does not take place on the front end
      if self.latest_workfile_version != nil
        Chorus.log_debug "-- BEFORE SAVE: Clearing cache for WorkfileVersion with ID = #{self.latest_workfile_version.id} --"
        self.latest_workfile_version.delete_cache
      end
    end
    return true
  end

  def ensure_proper_content_type
    file_is_an_image = self.content_type == 'image'
    file_name_ends_in_SQL = self.file_name =~ (/^.*\.sql$/i)
    file_name_ends_in_TXT = self.file_name =~ (/^.*\.txt$/i)

    unless file_is_an_image
      self.content_type='sql'  if file_name_ends_in_SQL
      self.content_type='text' if file_name_ends_in_TXT
    end
  end

  after_create :create_workfile_created_event, :if => :current_user
  after_create :update_has_added_workfile_on_workspace
  after_create { touch(:user_modified_at) }


  def refresh_cache
    Chorus.log_debug "-- Refreshing cache for #{self.class.name} with ID = #{self.id} --"
    options = {:workfile_as_latest_version => true, :list_view => true, :cached => true, :namespace => "workspace:workfiles"}
    workfile = Workfile.includes(Workfile.eager_load_associations).where("id = ?", self.id)
    Presenter.present(workfile, nil, options)
  end

  delegate :member_ids, :public, :to => :workspace

  attr_accessor :highlighted_attributes, :search_result_notes
  searchable_model :name_for_sort => :file_name do
    text :file_name, :stored => true, :boost => SOLR_PRIMARY_FIELD_BOOST
    text :description, :stored => true, :boost => SOLR_SECONDARY_FIELD_BOOST
    text :version_comments, :stored => true, :boost => SOLR_SECONDARY_FIELD_BOOST do
      versions.map { |version| version.commit_message }
    end
    integer :workspace_id, :multiple => true
    integer :member_ids, :multiple => true
    boolean :public
  end

  def self.eager_load_associations
    [
        {
            :latest_workfile_version => [
                {
                    :workfile => [
                        :workspace,
                        :owner,
                        :tags,
                        {:most_recent_comments => :author},
                        {:most_recent_notes => :actor}
                    ]
                },
                :owner,
                :modifier
            ]
        }
    ]
  end

  def self.build_for(params)
    klass = @@entity_subtypes[params[:entity_subtype]].constantize
    klass.new(params, :as => :create)
  end

  def self.with_file_type(file_type)
    where(content_type: file_type.downcase)
  end

  def self.order_by(column_name)
    if column_name.blank? || column_name == "file_name"
      order("lower(workfiles.file_name), workfiles.id")
    else
      order("workfiles.user_modified_at desc")
    end
  end

  def self.type_name
    'Workfile'
  end

  def self.add_search_permissions(current_user, search)
    unless current_user.admin?
      search.build do
        any_of do
          without :security_type_name, Workfile.security_type_name
          with :member_ids, current_user.id
          with :public, true
        end
      end
    end
  end

  def entity_type_name
    'workfile'
  end

  def create_new_version(*args)
  end

  def remove_draft(*args)
  end

  def attempt_data_source_connection
  end

  def run_now(user)
  end

  def copy(user, workspace, new_file_name = nil)
    new_workfile = self.class.new
    new_workfile.file_name = new_file_name.nil? ? file_name : new_file_name
    new_workfile.description = description
    new_workfile.workspace = workspace
    new_workfile.owner = user
    new_workfile.additional_data = additional_data
    new_workfile.execution_location = execution_location

    new_workfile
  end

  def copy!(user, workspace, new_file_name=nil)
    new_workfile = self.copy(user, workspace, new_file_name)

    new_workfile.resolve_name_conflicts = new_file_name.nil?
    new_workfile.build_new_version(user, self.latest_workfile_version.contents, '') if new_workfile.respond_to?(:build_new_version)
    new_workfile.save!
    new_workfile
  end

  def create_result_event(result_id)
    event = Events::WorkfileResult.by(current_user).add(:workfile => self, :workspace => workspace)
    event.notes_work_flow_results.create(:result_id => result_id) if result_id
    event
  end

  private

  def init_file_name
    WorkfileName.resolve_name_for!(self) if resolve_name_conflicts
    true
  end

  def create_workfile_created_event
    Events::WorkfileCreated.by(current_user).add(
        :workfile => self,
        :workspace => workspace,
        :commit_message => description
    )
  end

  def update_has_added_workfile_on_workspace
    workspace.has_added_workfile = true
    workspace.save!
  end
end
