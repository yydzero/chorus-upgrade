require File.expand_path('../boot', __FILE__)
require_relative '../app/models/chorus_config'

require 'rails/all'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

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

    # Set Time.zone default to the specified zone and make Active Record auto-convert to this zone.
    # Run "rake -D time" for a list of tasks for finding time zone names. Default is UTC.
    # config.time_zone = 'Central Time (US & Canada)'

    # The default locale is :en and all translations from config/locales/*.rb,yml are auto loaded.
    # config.i18n.load_path += Dir[Rails.root.join('my', 'locales', '*.{rb,yml}').to_s]
    # config.i18n.default_locale = :de
  end
end
