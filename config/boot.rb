# See: https://github.com/Chorus/chorus/commit/64771fa6e4d2507842d3f2a0f8d4c5dd96d43705
if ENV['RAILS_ENV'] == 'production' && File.exists?(File.expand_path('../../Gemfile-packaging', __FILE__))
  ENV['BUNDLE_GEMFILE'] = File.expand_path('../../Gemfile-packaging', __FILE__)
end

# Set up gems listed in the Gemfile.
ENV['BUNDLE_GEMFILE'] ||= File.expand_path('../../Gemfile', __FILE__)

require 'bundler/setup' if File.exist?(ENV['BUNDLE_GEMFILE'])