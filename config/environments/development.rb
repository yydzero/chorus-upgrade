Chorus::Application.configure do

  # Custom config options up top:

  # See: https://github.com/Chorus/chorus/commit/79fedf38c1ba72578084786e15b41b233fa417a1
  config.cache_store = :file_store, Rails.root.to_s + "/tmp/cache/chorus"

  # See: https://github.com/Chorus/chorus/commit/17728d81c16aa788d17ed35e2df3f917259a83d0
  config.eager_load_paths += config.autoload_paths

  # See: https://github.com/Chorus/chorus/commit/267732274571bd77f3a66ab197de20751992694e
  if ChorusConfig.instance['mail.enabled']
    config.action_mailer.delivery_method = :smtp
    config.action_mailer.smtp_settings = { :address => 'localhost', :port => 1025 }
    ActionMailer::Base.default ChorusConfig.instance.mail_configuration
  else
    config.action_mailer.perform_deliveries = false
  end


  # DEFAULT RAILS CONFIG OPTIONS below

  # Settings specified here will take precedence over those in config/application.rb

  # In the development environment your application's code is reloaded on
  # every request. This slows down response time but is perfect for development
  # since you don't have to restart the web server when you make code changes.
  config.cache_classes = false

  # Do not eager load code on boot.
  config.eager_load = false

  # Show full error reports and disable caching.
  config.consider_all_requests_local       = true
  config.action_controller.perform_caching = false

  # Don't care if the mailer can't send.
  config.action_mailer.raise_delivery_errors = false

  # Print deprecation notices to the Rails logger.
  config.active_support.deprecation = :log

  # Raise an error on page load if there are pending migrations
  config.active_record.migration_error = :page_load

  # Debug mode disables concatenation and preprocessing of assets.
  # This option may cause significant delays in view rendering with a large
  # number of complex assets.
  config.assets.debug = true

  # Raises error for missing translations
  # config.action_view.raise_on_missing_translations = true
end
