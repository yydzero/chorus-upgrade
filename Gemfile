source 'https://rubygems.org'

gem 'rails', '4.1.10'
gem 'activeresource'

# KT TODO: "Rails 4.0 has removed attr_accessible and attr_protected feature in favor of Strong Parameters. You can use the
# Protected Attributes gem for a smooth upgrade path."
# Due to config/initializers/additional_data.rb it's not trivial to delete all the attr_accessible pieces from the
# models.  This gem should be removed via refactoring after the Rails 4 upgrades are merged into master.
gem 'protected_attributes'

gem 'will_paginate', '3.0.4'
gem 'net-ldap', '0.11', :require => false
gem 'paperclip', '4.2.0'
gem 'queue_classic', :github => 'Chorus/queue_classic'
gem 'clockwork', :require => false
gem 'allowy', '0.4.0'
gem 'jetpack', :github => 'Chorus/jetpack', :branch => '6c9253195b+chorus', :require => false
gem 'nokogiri'
gem 'sequel', '~> 4.0', :require => 'sequel/no_core_ext'
gem 'attr_encrypted' #if you load attr_encrypted before sequel, it blows up saying 'sequel::model' is undefined
gem 'chorusgnip', :github => 'Chorus/gnip'
gem 'logger-syslog'
gem 'newrelic_rpm'
gem 'premailer-rails'
gem 'messengerjs-rails'
gem 'codemirror-rails', '3.23'
gem 'honor_codes', '~> 0.1.0'
# Gem to generate JSON data output using Rails View
gem 'jbuilder'
# Gem that allows you to call view renders from anywhere (model, lib, rake, etc.)
gem 'render_anywhere'

# Need to install 0.99.4 version of mustache gem. Latest version is not compatible with Jruby 1.7
gem 'mustache', '0.99.4'

# KT: Group all Solr related together ..
gem 'sunspot_rails', '2.1.0'
group :development, :test do
  gem 'sunspot_matchers', '2.1.0'
  gem 'sunspot_solr', '2.1.0'
  gem 'rsolr', '1.0.10' # block deprecation notices, delete this when upgrading Sunspot to 2.2.0
end

platform :jruby do
  gem 'jruby-openssl', :require => false
  gem 'activerecord-jdbcpostgresql-adapter'
end

# assets
gem 'sass-rails'
gem 'compass-rails'
gem 'handlebars_assets'
gem 'therubyrhino'
gem 'uglifier'
gem 'yui-compressor', '0.12.0'
gem 'jquery-rails', '2.1.4'

group :integration do
  gem 'capybara', "~> 2.0.0", :require => false
  gem 'headless'
  gem 'capybara-screenshot'
end

group :test, :integration, :packaging, :ci_jasmine, :ci_legacy, :ci_next do
  gem 'minitest'
  gem 'rr', :require => false
  gem 'fuubar'
  gem 'factory_girl'
  gem 'shoulda-matchers'
  gem 'rspec-rails'
  gem 'journey'
  gem 'timecop'
  gem 'hashie'
  gem 'vcr', '~> 2.3.0'
  gem 'fakefs', :require => false
  gem 'chunky_png'
  gem 'database_cleaner', :require => false
  gem 'poltergeist'
end

group :development, :test, :integration, :packaging, :ci_jasmine, :ci_legacy, :ci_next do
  gem 'foreman', '>= 0.62', :require => false
  gem 'rake', :require => false
  gem 'rspec', '2.14.1', :require => 'rspec/core/rake_task'
  gem 'jasmine', :github => 'pivotal/jasmine-gem'
  gem 'jasmine-core', :github => 'pivotal/jasmine'
  gem 'fixture_builder'
  gem 'ci_reporter', '>= 1.8.2'
  gem 'faker'
  gem 'fakeweb'
  gem 'quiet_assets'

  # Needed for api-controller testing
  gem 'backbone_fixtures_rails', :github => 'charleshansen/backbone_fixtures_rails'
  gem 'rspec_api_documentation', :github => 'Chorus/rspec_api_documentation', :require => false
  gem 'pry' # Drop in to an extended Rails console by creating a 'binding.pry' breakpoint
  gem 'pry-nav' # Adds debugger functionality to Pry
  gem 'ladle'
end

group :development do
  # gem 'tabcmd_gem', :path => "~/alpine/chorus-tableau" # otherwise is set in Gemfile-packaging
  gem 'license_finder', '~> 0.8.1', :require => false
  gem 'mizuno'
  gem 'bullet'
  gem 'capistrano', '2.15.5'
end
