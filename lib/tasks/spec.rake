unless Rails.env.production?
  task :default => [:spec]

  # remove default rspec_rails tasks and prereqs to start clean (because it assumes the database is test)
  Rake::Task["spec"].clear
  spec_prereq = if Rails.env.test?
    "db:test:clone_structure"
  else
    :noop
  end
  task :noop

  desc 'Run backend specs'
  RSpec::Core::RakeTask.new(:spec => spec_prereq) do |t|
    t.pattern = 'spec/{concerns,initializers,lib,mailers,mixins,models,presenters,requests,services,validators}/**/*_spec.rb'
  end
end
