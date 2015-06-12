require File.expand_path('../boot', __FILE__)
require_relative '../app/models/chorus_config'

require 'rails/all'

if defined?(Bundler)
  # If you precompile assets before deploying to production, use this line
  Bundler.require(*Rails.groups(:assets => %w(development test)))
  # If you want your assets lazily compiled in production, use this line
  # Bundler.require(:default, :assets, Rails.env)
end

module Chorus
  class Application < Rails::Application

    # Custom config options up top:

    config.generators do |g|
      g.test_framework false
      g.helper false
      g.assets false
      g.stylesheets false
      g.views false
    end

    # Log UUIDs for all requests. This is also in the X-Request-Id header response.
    # To facilitate support staff tracking web requests.
    # See: https://github.com/Chorus/chorus/commit/f72864921d6b6b059a891a6604f0e348c44c88df
    config.log_tags = [:uuid]

    # See: https://github.com/Chorus/chorus/commit/1a99c1ee34d1aff6ef384011450b3df44a7805ca
    config.action_controller.include_all_helpers = true

    # See: https://github.com/Chorus/chorus/commit/58a32eb6a3bb2d3d3313c66d7e29c6bf5bc74f75
    config.action_dispatch.x_sendfile_header = 'X-Accel-Redirect'

    # See: https://github.com/Chorus/chorus/commit/40f90e513855d9aa2e7879698b395580a3c3bfa1
    config.middleware.use Rack::Sendfile

    # See: https://github.com/Chorus/chorus/commit/fa1c2c20cf03873723dcb36a8e77ffb6f78b9237
    config.middleware.delete(::ActionDispatch::RemoteIp)
    config.middleware.insert_before(::Rails::Rack::Logger, ::ActionDispatch::RemoteIp)

    # See: https://github.com/Chorus/chorus/commit/6f47ab650b05a762e585cc93b763c12997cd2dc9
    config.middleware.delete(ActionDispatch::Cookies)
    config.middleware.delete(ActionDispatch::Session::CookieStore)
    config.middleware.insert_before(Rails::Rack::Logger, ActionDispatch::Session::CookieStore)
    config.middleware.insert_before(ActionDispatch::Session::CookieStore, ActionDispatch::Cookies)
    config.log_tags += [
      lambda do |req|
        session_id = req.session[:chorus_session_id]
        if session_id
          session = Session.find_by_session_id(session_id)
          return "user_id:#{session.user_id}" if session
        end
        "not_logged_in"
      end
    ]

    # See: https://github.com/Chorus/chorus/commit/5d60300984f318f829d71b4283344360bf9195e1
    I18n.config.enforce_available_locales = false


    # DEFAULT RAILS CONFIG OPTIONS below

    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.

    # Custom directories with classes and modules you want to be autoloadable.
    config.autoload_paths += Dir["#{config.root}/lib", "#{config.root}/lib/**/", "#{config.root}/app/concerns", "#{config.root}/app/validators"]

    # Only load the plugins named here, in the order given (default is alphabetical).
    # :all can be used as a placeholder for all plugins not explicitly named.
    # config.plugins = [ :exception_notification, :ssl_requirement, :all ]

    # Activate observers that should always be running.
    # config.active_record.observers = :cacher, :garbage_collector, :forum_observer

    # Set Time.zone default to the specified zone and make Active Record auto-convert to this zone.
    # Run "rake -D time" for a list of tasks for finding time zone names. Default is UTC.
    # config.time_zone = 'Central Time (US & Canada)'

    # The default locale is :en and all translations from config/locales/*.rb,yml are auto loaded.
    # config.i18n.load_path += Dir[Rails.root.join('my', 'locales', '*.{rb,yml}').to_s]
    # config.i18n.default_locale = :de

    # Configure the default encoding used in templates for Ruby 1.9.
    config.encoding = "utf-8"

    # Configure sensitive parameters which will be filtered from the log file.
    config.filter_parameters += [:password]

    # Enable escaping HTML in JSON.
    config.active_support.escape_html_entities_in_json = true

    # Use SQL instead of Active Record's schema dumper when creating the database.
    # This is necessary if your schema can't be completely dumped by the schema dumper,
    # like if you have constraints or database-specific column types
    config.active_record.schema_format = :sql

    # Enforce whitelist mode for mass assignment.
    # This will create an empty whitelist of attributes available for mass-assignment for all models
    # in your app. As such, your models will need to explicitly whitelist or blacklist accessible
    # parameters by using an attr_accessible or attr_protected declaration.
    config.active_record.whitelist_attributes = true

    # Enable the asset pipeline
    config.assets.enabled = true
    config.assets.initialize_on_precompile = false
    config.assets.precompile += %w{visualizations.css import_console/import_console.css}

    # Version of your assets, change this if you want to expire all your assets
    config.assets.version = '1.0'
  end
end
