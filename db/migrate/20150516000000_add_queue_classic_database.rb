require 'queue_classic'

# NB: Database preparation includes creating a table and **loading PL/pgSQL functions.**
# https://github.com/QueueClassic/queue_classic#setup
class AddQueueClassicTableAndFunctions < ActiveRecord::Migration
  def self.up
    unless tables.include?("queue_classic_jobs")
      QC::Setup.create
    end
  end

  def self.down
    QC::Setup.drop
  end
end