class ViewPresenter < DatasetPresenter
  def to_hash
    super.merge(
        :object_type => 'VIEW'
    )
  end
end
