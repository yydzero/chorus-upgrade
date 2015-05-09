require_relative '../../app/models/chorus_config'

Chorus::Application.configure do
  # Settings specified here will take precedence over those in config/application.rb

  # Code is not reloaded between requests
  config.cache_classes = true

  # Full error reports are disabled and caching is turned on
  config.consider_all_requests_local       = false
  config.action_controller.perform_caching = true

  # Disable Rails's static asset server (Apache or nginx will already do this)
  config.serve_static_assets = false

  # Compress JavaScripts and CSS
  config.assets.compress = true
  config.assets.js_compressor = :uglifier
  config.assets.css_compressor = :yui

  # Don't fallback to assets pipeline if a precompiled asset is missed
  config.assets.compile = false

  # Generate digests for assets URLs
  config.assets.digest = true

  # Defaults to Rails.root.join("public/assets")
  # config.assets.manifest = YOUR_PATH

  # Prepend all log lines with the following tags
  # config.log_tags = [ :subdomain, :uuid ]

  # Use a different logger for distributed setups
  # config.logger = ActiveSupport::TaggedLogging.new(SyslogLogger.new)
  local_chorus_config = ChorusConfig.instance

  # See everything in the log (default is :info)
  config.log_level = local_chorus_config.log_level

  if local_chorus_config.syslog_configured?
    config.logger = ActiveSupport::TaggedLogging.new(Logger::Syslog.new('Chorus'))
  end

  # Use a different cache store in production
  # config.cache_store = :mem_cache_store
  # Enable caching in production. Prakash 12/29/14
  config.cache_store = :file_store, Rails.root.to_s + "/tmp/cache/chorus"
  #config.cache_store = :memory_store, { size: 500.megabytes }

  # Enable serving of images, stylesheets, and JavaScripts from an asset server
  # config.action_controller.asset_host = "http://assets.example.com"

  # Precompile additional assets (application.js, application.css, and all non-JS/CSS are already added)
  # config.assets.precompile += %w( search.js )

  # Enable threaded mode
  if !(defined?($rails_rake_task) && $rails_rake_task)
    config.threadsafe!
  end
  config.eager_load_paths += config.autoload_paths

  # Enable locale fallbacks for I18n (makes lookups for any locale fall back to
  # the I18n.default_locale when a translation can not be found)
  config.i18n.fallbacks = true

  # Send deprecation notices to registered listeners
  config.active_support.deprecation = :notify

  # Force all access to the app over SSL, use Strict-Transport-Security, and use secure cookies.
  config.force_ssl = ChorusConfig.instance["ssl.enabled"]

  if ChorusConfig.instance["mail.enabled"]
    config.action_mailer.delivery_method = :smtp
    config.action_mailer.smtp_settings = ChorusConfig.instance.smtp_configuration
    ActionMailer::Base.default ChorusConfig.instance.mail_configuration
  else
    config.action_mailer.perform_deliveries = false
  end

  # Log the query plan for queries taking more than this (works
  # with SQLite, MySQL, and PostgreSQL)
  # config.active_record.auto_explain_threshold_in_seconds = 0.5
end
