class TypeAheadSearch
  attr_accessor :query, :per_page
  attr_reader :current_user

  MODELS_TO_SEARCH = [
    Attachment,
    User,
    GpdbDataSource,
    OracleDataSource,
    HdfsDataSource,
    GnipDataSource,
    JdbcDataSource,
    PgDataSource,
    Workspace,
    Workfile,
    Tag,
    Dataset,
    HdfsEntry
  ]

  delegate :results, to: :search

  def initialize(current_user, params = {})
    @current_user = current_user
    self.query = params[:query]
    self.per_page = params[:per_page] || 3
  end

  def results
    query_empty? ? [] : search.results
  end

  def search
    return @search if @search

    build_search

    @search.execute
    @search.move_highlighted_attributes_to_results
    @search
  end

  private

  def query_empty?
    query =~ /^[+-]/
  end

  def build_search
    @search = Sunspot.new_search(MODELS_TO_SEARCH) do
      fulltext query, :highlight => true, :fields => [:name, :first_name, :last_name, :file_name]
      with :type_name, MODELS_TO_SEARCH.collect(&:type_name).uniq
      paginate :page => 1, :per_page => per_page
    end

    MODELS_TO_SEARCH.each do |model_to_search|
      model_to_search.add_search_permissions(current_user, @search) if model_to_search.respond_to? :add_search_permissions
    end
  end
end
