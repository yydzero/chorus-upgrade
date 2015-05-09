module FakeRelations
  def fake_relation(models)
    models.each { |model| model.save! }
    base_class = models.first.class.base_class
    base_class.where("id in (#{models.map(&:id).join(',')})")
  end
end
