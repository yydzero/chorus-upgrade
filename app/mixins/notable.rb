module Notable
  extend ActiveSupport::Concern

  included do
    has_many :notes, -> { where "events.action ILIKE 'Events::Note%'" }, :through => :activities,
             :source => :event, :class_name => "Events::Note"
    has_many :most_recent_notes, -> { where("events.action ILIKE 'Events::Note%'").order("events.id DESC").limit(1) },
             :through => :activities, :source => :event, :class_name => "Events::Note"
    after_destroy :remove_notes_from_solr_index

    private

    def remove_notes_from_solr_index
      notes.each {|note|
        note.solr_remove_from_index
      }
    end
  end
end